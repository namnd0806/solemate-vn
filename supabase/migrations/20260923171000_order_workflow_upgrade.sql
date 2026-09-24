ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('PENDING','CONFIRMED','PACKING','SHIPPING','DELIVERED','CANCELLED'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS internal_note TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS order_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  actor       TEXT NOT NULL DEFAULT 'SYSTEM',
  event_type  TEXT NOT NULL,
  from_status TEXT,
  to_status   TEXT,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE order_events FROM anon, authenticated;

DROP FUNCTION IF EXISTS cancel_order(TEXT);
DROP FUNCTION IF EXISTS cancel_order(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION cancel_order(p_order_id TEXT, p_reason TEXT DEFAULT '', p_actor TEXT DEFAULT 'SYSTEM')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order   orders%ROWTYPE;
  v_item    order_items%ROWTYPE;
  v_before  INTEGER;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Không tìm thấy đơn hàng.');
  END IF;

  IF v_order.status NOT IN ('PENDING','CONFIRMED','PACKING') THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Đơn hàng không còn đủ điều kiện hủy.');
  END IF;

  IF v_order.stock_restored THEN
    RETURN jsonb_build_object('ok', FALSE, 'message', 'Tồn kho của đơn này đã được hoàn trước đó.');
  END IF;

  FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id
  LOOP
    SELECT stock INTO v_before FROM variants WHERE sku = v_item.sku;

    UPDATE variants SET stock = stock + v_item.qty, updated_at = NOW()
    WHERE sku = v_item.sku;

    INSERT INTO stock_movements (sku, product_id, product_name, type, delta, before, after, ref, note)
    VALUES (
      v_item.sku, v_item.product_id, v_item.name,
      'CANCEL_RETURN', v_item.qty,
      v_before, v_before + v_item.qty,
      p_order_id, 'Hoàn kho do hủy đơn'
    );
  END LOOP;

  UPDATE orders
  SET status = 'CANCELLED',
      stock_restored = TRUE,
      cancel_reason = COALESCE(p_reason, ''),
      cancelled_at = NOW(),
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO order_events (order_id, actor, event_type, from_status, to_status, note)
  VALUES (p_order_id, COALESCE(p_actor, 'SYSTEM'), 'CANCEL', v_order.status, 'CANCELLED', COALESCE(p_reason, ''));

  RETURN jsonb_build_object('ok', TRUE, 'order_id', p_order_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', FALSE, 'message', SQLERRM);
END;
$$;

REVOKE ALL ON FUNCTION cancel_order(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cancel_order(TEXT, TEXT, TEXT) TO service_role;
