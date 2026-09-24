CREATE OR REPLACE VIEW product_sales_stats WITH (security_invoker = true) AS
SELECT p.id AS product_id,
       COALESCE(SUM(oi.qty) FILTER (WHERE o.status IN ('CONFIRMED','PACKING','SHIPPING','DELIVERED')), 0)::BIGINT AS sales_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
GROUP BY p.id;

REVOKE ALL ON product_sales_stats FROM PUBLIC, anon, authenticated;
GRANT SELECT ON product_sales_stats TO service_role;
