BEGIN;

-- Preserve historical order_items, but remove child products from the live catalog.
DELETE FROM wishlists WHERE product_id IN (SELECT id FROM products WHERE gender = 'TRẺ EM');
DELETE FROM variants WHERE product_id IN (SELECT id FROM products WHERE gender = 'TRẺ EM');
DELETE FROM products WHERE gender = 'TRẺ EM';

-- The storefront now has two explicit customer collections.
UPDATE products SET gender = 'NAM', updated_at = NOW() WHERE id = 'P004';
UPDATE products SET gender = 'NỮ', updated_at = NOW() WHERE id = 'P009';

-- Use curated, normalized local product photography.
UPDATE products
SET image_url = CASE id
    WHEN 'P001' THEN '/products/P001.webp'
    WHEN 'P002' THEN '/products/P002.webp'
    WHEN 'P003' THEN '/products/P003.webp'
    WHEN 'P004' THEN '/products/P004.webp'
    WHEN 'P005' THEN '/products/P005.webp'
    WHEN 'P006' THEN '/products/P006.webp'
    WHEN 'P007' THEN '/products/P007.webp'
    WHEN 'P008' THEN '/products/P008.webp'
    WHEN 'P009' THEN '/products/P009.webp'
    WHEN 'P010' THEN '/products/P010.webp'
    WHEN 'P015' THEN '/products/P015.webp'
    WHEN 'P016' THEN '/products/P016.webp'
    WHEN 'P017' THEN '/products/P017.webp'
    WHEN 'P018' THEN '/products/P018.webp'
    WHEN 'P019' THEN '/products/P019.webp'
    WHEN 'P020' THEN '/products/P020.webp'
    WHEN 'P021' THEN '/products/P021.webp'
    WHEN 'P022' THEN '/products/P022.webp'
    WHEN 'P023' THEN '/products/P023.webp'
    WHEN 'P024' THEN '/products/P024.webp'
    WHEN 'P025' THEN '/products/P025.webp'
    WHEN 'P026' THEN '/products/P026.webp'
    WHEN 'P027' THEN '/products/P027.webp'
    WHEN 'P028' THEN '/products/P028.webp'
    WHEN 'P029' THEN '/products/P029.webp'
    WHEN 'P030' THEN '/products/P030.webp'
    ELSE image_url
  END,
  updated_at = NOW()
WHERE id IN ('P001','P002','P003','P004','P005','P006','P007','P008','P009','P010','P015','P016','P017','P018','P019','P020','P021','P022','P023','P024','P025','P026','P027','P028','P029','P030');

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_gender_check;
ALTER TABLE products ADD CONSTRAINT products_gender_check CHECK (gender IN ('NAM','NỮ'));

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check CHECK (category IN ('LIFESTYLE','RUNNING'));

COMMIT;
