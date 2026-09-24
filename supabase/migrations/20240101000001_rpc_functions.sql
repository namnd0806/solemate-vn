-- Migration: RPC Functions
-- Tạo 2 PostgreSQL functions cho atomic transactions

-- RPC: create_order
CREATE OR REPLACE FUNCTION create_order(payload JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_order_id TEXT; v_item JSONB; v_variant variants%ROWTYPE;
  v_promo promotions%ROWTYPE; v_discount INTEGER := 0;
  v_subtotal INTEGER := 0; v_shipping INTEGER := 0;
  v_total INTEGER := 0; v_settings settings%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM settings WHERE id = 1;
  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT * INTO v_variant FROM variants WHERE sku = v_item->>'sku' AND status = 'ACTIVE' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'SKU % không còn khả dụng', v_item->>'sku'; END IF;
    IF v_variant.stock < (v_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'SKU % chỉ còn % sản phẩm', v_variant.sku, v_variant.stock; END IF;
    v_subtotal := v_subtotal + (v_item->>'line_total')::INTEGER;
  END LOOP;
  IF payload->>'promo_code' IS NOT NULL AND payload->>'promo_code' != '' THEN
    SELECT * INTO v_promo FROM promotions WHERE UPPER(code) = UPPER(payload->>'promo_code')
      AND enabled = TRUE AND start_at <= NOW() AND end_at >= NOW()
      AND usage_count < usage_limit AND v_subtotal >= min_spend FOR UPDATE;
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
  INSERT INTO orders (id, customer_id, guest, status, payment_method, payment_status,
    shipping_method, subtotal, discount, shipping_fee, total, promo_code, stock_restored, contact, note)
  VALUES (v_order_id, NULLIF(payload->>'customer_id', ''), (payload->>'guest')::BOOLEAN, 'PENDING',
    payload->>'payment_method',
    CASE WHEN payload->>'payment_method' = 'COD' THEN 'UNPAID'
         WHEN (payload->>'payment_confirmed')::BOOLEAN THEN 'PAID' ELSE 'PENDING' END,
    COALESCE(payload->>'shipping_method', 'STANDARD'),
    v_subtotal, v_discount, v_shipping, v_total,
    NULLIF(payload->>'promo_code', ''), FALSE, payload->'contact', COALESCE(payload->>'note', ''));
  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    INSERT INTO order_items (order_id, product_id, slug, name, brand, sku, color, size, qty, unit_price, line_total)
    VALUES (v_order_id, v_item->>'product_id', v_item->>'slug', v_item->>'name', v_item->>'brand',
      v_item->>'sku', v_item->>'color', v_item->>'size',
      (v_item->>'qty')::INTEGER, (v_item->>'unit_price')::INTEGER, (v_item->>'line_total')::INTEGER);
    UPDATE variants SET stock = stock - (v_item->>'qty')::INTEGER, updated_at = NOW() WHERE sku = v_item->>'sku';
    INSERT INTO stock_movements (sku, product_id, product_name, type, delta, before, after, ref, note)
    SELECT v_item->>'sku', v_item->>'product_id', v_item->>'name', 'SALE', -(v_item->>'qty')::INTEGER,
      (SELECT stock + (v_item->>'qty')::INTEGER FROM variants WHERE sku = v_item->>'sku'),
      (SELECT stock FROM variants WHERE sku = v_item->>'sku'),
      v_order_id, 'Trừ kho khi đặt hàng thành công';
  END LOOP;
  IF v_promo.id IS NOT NULL THEN
    UPDATE promotions SET usage_count = usage_count + 1, updated_at = NOW() WHERE id = v_promo.id;
  END IF;
  RETURN jsonb_build_object('ok', TRUE, 'order_id', v_order_id);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok', FALSE, 'message', SQLERRM); END; $$;

REVOKE ALL ON FUNCTION create_order(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order(JSONB) TO service_role;

-- RPC: cancel_order
CREATE OR REPLACE FUNCTION cancel_order(p_order_id TEXT, p_reason TEXT DEFAULT '', p_actor TEXT DEFAULT 'SYSTEM')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_order orders%ROWTYPE; v_item order_items%ROWTYPE; v_before INTEGER;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', FALSE, 'message', 'Không tìm thấy đơn hàng.'); END IF;
  IF v_order.status NOT IN ('PENDING','CONFIRMED','PACKING') THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Đơn hàng không còn đủ điều kiện hủy.'); END IF;
  IF v_order.stock_restored THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Tồn kho của đơn này đã được hoàn trước đó.'); END IF;
  FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
    SELECT stock INTO v_before FROM variants WHERE sku = v_item.sku;
    UPDATE variants SET stock = stock + v_item.qty, updated_at = NOW() WHERE sku = v_item.sku;
    INSERT INTO stock_movements (sku, product_id, product_name, type, delta, before, after, ref, note)
    VALUES (v_item.sku, v_item.product_id, v_item.name, 'CANCEL_RETURN', v_item.qty,
      v_before, v_before + v_item.qty, p_order_id, 'Hoàn kho do hủy đơn');
  END LOOP;
  UPDATE orders SET status = 'CANCELLED', stock_restored = TRUE,
    cancel_reason = COALESCE(p_reason, ''),
    cancelled_at = NOW(), updated_at = NOW() WHERE id = p_order_id;
  INSERT INTO order_events (order_id, actor, event_type, from_status, to_status, note)
  VALUES (p_order_id, COALESCE(p_actor, 'SYSTEM'), 'CANCEL', v_order.status, 'CANCELLED', COALESCE(p_reason, ''));
  RETURN jsonb_build_object('ok', TRUE, 'order_id', p_order_id);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok', FALSE, 'message', SQLERRM); END; $$;

REVOKE ALL ON FUNCTION cancel_order(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cancel_order(TEXT, TEXT, TEXT) TO service_role;
