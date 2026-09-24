ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sale_end_at TIMESTAMPTZ;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sale_dates_check;
ALTER TABLE products ADD CONSTRAINT products_sale_dates_check
  CHECK (sale_end_at IS NULL OR sale_start_at IS NULL OR sale_end_at > sale_start_at);

ALTER TABLE stock_movements
  ADD COLUMN IF NOT EXISTS actor TEXT NOT NULL DEFAULT 'SYSTEM';

CREATE OR REPLACE FUNCTION adjust_stock_atomic(p_sku TEXT, p_delta INTEGER, p_note TEXT DEFAULT '', p_actor TEXT DEFAULT 'ADMIN')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_variant variants%ROWTYPE;
  v_product products%ROWTYPE;
  v_after INTEGER;
BEGIN
  IF p_delta = 0 THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Số lượng điều chỉnh phải khác 0.');
  END IF;

  SELECT * INTO v_variant FROM variants WHERE sku = p_sku FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'SKU không tồn tại.');
  END IF;

  v_after := v_variant.stock + p_delta;
  IF v_after < 0 THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Tồn kho không thể âm.');
  END IF;

  SELECT * INTO v_product FROM products WHERE id = v_variant.product_id;
  UPDATE variants SET stock = v_after, updated_at = NOW() WHERE id = v_variant.id;

  INSERT INTO stock_movements (sku, product_id, product_name, type, delta, before, after, ref, note, actor)
  VALUES (v_variant.sku, v_variant.product_id, v_product.name, 'ADJUST', p_delta, v_variant.stock, v_after, NULL, COALESCE(p_note, ''), COALESCE(p_actor, 'ADMIN'));

  RETURN jsonb_build_object('ok', TRUE, 'sku', p_sku, 'before', v_variant.stock, 'after', v_after, 'delta', p_delta);
END;
$$;

REVOKE ALL ON FUNCTION adjust_stock_atomic(TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION adjust_stock_atomic(TEXT, INTEGER, TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION create_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id TEXT; v_item JSONB; v_variant variants%ROWTYPE; v_product products%ROWTYPE;
  v_promo promotions%ROWTYPE; v_discount INTEGER := 0; v_subtotal INTEGER := 0;
  v_shipping INTEGER := 0; v_total INTEGER := 0; v_unit_price INTEGER;
  v_settings settings%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM settings WHERE id = 1;

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT * INTO v_variant FROM variants
    WHERE sku = v_item->>'sku' AND status = 'ACTIVE' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'SKU % không còn khả dụng', v_item->>'sku'; END IF;

    SELECT * INTO v_product FROM products
    WHERE id = v_variant.product_id AND status = 'ACTIVE';
    IF NOT FOUND THEN RAISE EXCEPTION 'Sản phẩm của SKU % đang tạm ẩn', v_variant.sku; END IF;

    IF (v_item->>'qty')::INTEGER <= 0 OR v_variant.stock < (v_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'SKU % không đủ tồn kho', v_variant.sku;
    END IF;

    v_unit_price := COALESCE(
      v_variant.sale_price,
      v_variant.price,
      CASE WHEN v_product.sale_price IS NOT NULL
             AND (v_product.sale_start_at IS NULL OR v_product.sale_start_at <= NOW())
             AND (v_product.sale_end_at IS NULL OR v_product.sale_end_at >= NOW())
           THEN v_product.sale_price END,
      v_product.price
    );
    v_subtotal := v_subtotal + v_unit_price * (v_item->>'qty')::INTEGER;
  END LOOP;

  IF COALESCE(payload->>'promo_code', '') <> '' THEN
    SELECT * INTO v_promo FROM promotions
    WHERE UPPER(code) = UPPER(payload->>'promo_code') AND enabled = TRUE
      AND start_at <= NOW() AND end_at >= NOW() AND usage_count < usage_limit
      AND v_subtotal >= min_spend FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Mã giảm giá không hợp lệ hoặc đã hết hạn'; END IF;
    IF v_promo.type = 'PERCENT' THEN
      v_discount := LEAST((v_subtotal * v_promo.value / 100)::INTEGER, COALESCE(v_promo.max_discount, v_subtotal), v_subtotal);
    ELSE v_discount := LEAST(v_promo.value, v_subtotal); END IF;
  END IF;

  IF payload->>'shipping_method' = 'EXPRESS' THEN v_shipping := v_settings.express_shipping_fee;
  ELSIF (v_subtotal - v_discount) >= v_settings.free_shipping_threshold THEN v_shipping := 0;
  ELSE v_shipping := v_settings.standard_shipping_fee; END IF;

  v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);
  v_order_id := payload->>'order_id';
  INSERT INTO orders (id, customer_id, guest, status, payment_method, payment_status, shipping_method, subtotal, discount, shipping_fee, total, promo_code, stock_restored, contact, note)
  VALUES (v_order_id, NULLIF(payload->>'customer_id',''), (payload->>'guest')::BOOLEAN, 'PENDING', payload->>'payment_method',
    CASE WHEN payload->>'payment_method'='COD' THEN 'UNPAID' WHEN (payload->>'payment_confirmed')::BOOLEAN THEN 'PAID' ELSE 'PENDING' END,
    COALESCE(payload->>'shipping_method','STANDARD'), v_subtotal, v_discount, v_shipping, v_total,
    NULLIF(payload->>'promo_code',''), FALSE, payload->'contact', COALESCE(payload->>'note',''));

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT * INTO v_variant FROM variants WHERE sku = v_item->>'sku';
    SELECT * INTO v_product FROM products WHERE id = v_variant.product_id;
    v_unit_price := COALESCE(v_variant.sale_price, v_variant.price,
      CASE WHEN v_product.sale_price IS NOT NULL
             AND (v_product.sale_start_at IS NULL OR v_product.sale_start_at <= NOW())
             AND (v_product.sale_end_at IS NULL OR v_product.sale_end_at >= NOW())
           THEN v_product.sale_price END, v_product.price);

    INSERT INTO order_items (order_id, product_id, slug, name, brand, sku, color, size, qty, unit_price, line_total)
    VALUES (v_order_id, v_product.id, v_product.slug, v_product.name, v_product.brand, v_variant.sku, v_variant.color, v_variant.size,
      (v_item->>'qty')::INTEGER, v_unit_price, v_unit_price * (v_item->>'qty')::INTEGER);

    UPDATE variants SET stock = stock - (v_item->>'qty')::INTEGER, updated_at = NOW() WHERE id = v_variant.id;
    INSERT INTO stock_movements (sku, product_id, product_name, type, delta, before, after, ref, note, actor)
    SELECT v_variant.sku, v_product.id, v_product.name, 'SALE', -(v_item->>'qty')::INTEGER,
      stock + (v_item->>'qty')::INTEGER, stock, v_order_id, 'Trừ kho khi đặt hàng thành công', 'SYSTEM'
    FROM variants WHERE id = v_variant.id;
  END LOOP;

  IF v_promo.id IS NOT NULL THEN UPDATE promotions SET usage_count=usage_count+1, updated_at=NOW() WHERE id=v_promo.id; END IF;
  RETURN jsonb_build_object('ok', TRUE, 'order_id', v_order_id);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok', FALSE, 'message', SQLERRM); END;
$$;

REVOKE ALL ON FUNCTION create_order(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order(JSONB) TO service_role;
