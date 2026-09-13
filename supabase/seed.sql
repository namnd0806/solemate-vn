-- SoleMate VN – Seed Data (used by Supabase CLI: supabase db reset)
-- This file is run automatically after migrations when using local dev or db reset

-- Settings
INSERT INTO settings (id, free_shipping_threshold, standard_shipping_fee, express_shipping_fee, low_stock_threshold)
VALUES (1, 499000, 30000, 50000, 3) ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (id, role, first_name, last_name, email, phone, password_hash, active, created_at) VALUES
  ('U001','CUSTOMER','Nam','Nguyễn','nam@solemate.vn','0912345678',
   '$2a$10$YmCKDEfbfSKPLMZLFAjvuOqOXFpFBTBhTDzI2HSTFh0a8.iRuuFXa',TRUE, NOW() - INTERVAL '90 days'),
  ('A001','ADMIN','Admin','SoleMate','admin@solemate.vn','0900000000',
   '$2a$10$wJ8aMbS5I./n3.FpL0MgFOHRoRrTdOmX3r/1u47dDCBHDZ3VCk8Hy',TRUE, NOW() - INTERVAL '180 days')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id,slug,brand,name,gender,category,price,sale_price,accent,description,status,featured,best_seller,created_at,updated_at) VALUES
('P001','nike-air-max-270','NIKE','Nike Air Max 270','NAM','LIFESTYLE',4590000,3990000,'#171717','Thiết kế lifestyle nổi bật với đệm Air lớn.','ACTIVE',TRUE,TRUE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P002','nike-pegasus-41','NIKE','Nike Pegasus 41','NAM','RUNNING',3990000,3590000,'#5d7ea8','Giày chạy bộ hằng ngày với đệm êm.','ACTIVE',TRUE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P003','adidas-ultraboost-light','ADIDAS','Adidas Ultraboost Light','NỮ','RUNNING',5200000,4490000,'#ff5a1f','Upper knit ôm chân kết hợp đệm Boost nhẹ.','ACTIVE',TRUE,TRUE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P004','adidas-samba-og','ADIDAS','Adidas Samba OG','UNISEX','LIFESTYLE',3290000,NULL,'#eeeeea','Biểu tượng terrace cổ điển với dáng thấp.','ACTIVE',TRUE,TRUE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P005','new-balance-530-classic','NEW BALANCE','New Balance 530 Classic','NỮ','LIFESTYLE',3190000,NULL,'#b6c0d2','Phong cách runner retro với mesh thoáng.','ACTIVE',TRUE,TRUE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P006','new-balance-9060','NEW BALANCE','New Balance 9060','NAM','LIFESTYLE',4290000,3990000,'#c7b99d','Form chunky hiện đại, đệm dày.','ACTIVE',FALSE,TRUE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P007','asics-gel-kayano-31','ASICS','ASICS Gel-Kayano 31','NAM','RUNNING',4350000,NULL,'#e56342','Ổn định và êm ái cho chạy đường dài.','ACTIVE',FALSE,TRUE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P008','asics-gel-nyc','ASICS','ASICS Gel-NYC','NỮ','LIFESTYLE',3790000,3490000,'#7d8d86','Dáng technical runner pha trộn chi tiết archive.','ACTIVE',FALSE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P009','converse-chuck-70-high','CONVERSE','Converse Chuck 70 High','UNISEX','LIFESTYLE',2190000,NULL,'#202020','Canvas cao cấp, form high-top biểu tượng.','ACTIVE',FALSE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P010','converse-run-star-hike','CONVERSE','Converse Run Star Hike','NỮ','LIFESTYLE',2890000,2490000,'#e8e4dc','Đế platform cá tính, outsole răng cưa.','ACTIVE',FALSE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P011','nike-court-borough-kids','NIKE','Nike Court Borough Low Kids','TRẺ EM','KIDS',1690000,1490000,'#ff6a20','Giày trẻ em lấy cảm hứng bóng rổ.','ACTIVE',FALSE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P012','adidas-superstar-kids','ADIDAS','Adidas Superstar Kids','TRẺ EM','KIDS',1890000,NULL,'#dddcd7','Shell-toe cổ điển cho trẻ em.','INACTIVE',FALSE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P013','new-balance-327-kids','NEW BALANCE','New Balance 327 Kids','TRẺ EM','KIDS',1790000,1590000,'#9fb0c2','Phiên bản 327 dành cho trẻ em.','ACTIVE',TRUE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P014','asics-contend-9-kids','ASICS','ASICS Contend 9 Kids','TRẺ EM','KIDS',1650000,NULL,'#5278a8','Giày vận động trẻ em êm thoáng.','ACTIVE',FALSE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P015','adidas-gazelle-bold-women','ADIDAS','Adidas Gazelle Bold','NỮ','LIFESTYLE',3490000,3190000,'#b17862','Gazelle đế platform hiện đại.','ACTIVE',TRUE,FALSE,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- Variants
INSERT INTO variants (product_id,sku,color,size,stock,status,price,sale_price,created_at,updated_at) VALUES
('P001','NK-AM270-BLK-40','Đen','40',8,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P001','NK-AM270-BLK-41','Đen','41',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P001','NK-AM270-BLK-42','Đen','42',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P001','NK-AM270-WHT-40','Trắng','40',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P001','NK-AM270-WHT-41','Trắng','41',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P002','NK-PG41-BLU-40','Xanh','40',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P002','NK-PG41-BLU-41','Xanh','41',8,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P002','NK-PG41-BLU-42','Xanh','42',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P002','NK-PG41-BLK-41','Đen','41',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P003','AD-UBL-ORG-37','Cam','37',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P003','AD-UBL-ORG-38','Cam','38',7,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P003','AD-UBL-ORG-39','Cam','39',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P003','AD-UBL-WHT-38','Trắng','38',2,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P004','AD-SAM-WHT-38','Trắng','38',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P004','AD-SAM-WHT-39','Trắng','39',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P004','AD-SAM-WHT-40','Trắng','40',7,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P004','AD-SAM-BLK-40','Đen','40',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P004','AD-SAM-BLK-41','Đen','41',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P005','NB-530-SLV-37','Bạc','37',9,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P005','NB-530-SLV-38','Bạc','38',7,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P005','NB-530-SLV-39','Bạc','39',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P005','NB-530-BLU-38','Xanh','38',2,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P006','NB-9060-SND-40','Be','40',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P006','NB-9060-SND-41','Be','41',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P006','NB-9060-SND-42','Be','42',2,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P006','NB-9060-BLK-41','Đen','41',1,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P007','AS-K31-ORG-40','Cam','40',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P007','AS-K31-ORG-41','Cam','41',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P007','AS-K31-ORG-42','Cam','42',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P007','AS-K31-NAV-41','Navy','41',2,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P008','AS-GNY-GRY-37','Xám','37',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P008','AS-GNY-GRY-38','Xám','38',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P008','AS-GNY-GRY-39','Xám','39',1,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P008','AS-GNY-CRM-38','Kem','38',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P009','CV-CH70-BLK-38','Đen','38',7,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P009','CV-CH70-BLK-39','Đen','39',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P009','CV-CH70-BLK-40','Đen','40',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P009','CV-CH70-CRM-39','Kem','39',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P010','CV-RSH-CRM-37','Kem','37',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P010','CV-RSH-CRM-38','Kem','38',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P010','CV-RSH-CRM-39','Kem','39',2,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P010','CV-RSH-BLK-38','Đen','38',2,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P011','NK-CB-KID-32','Trắng','32',7,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P011','NK-CB-KID-33','Trắng','33',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P011','NK-CB-KID-34','Trắng','34',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P011','NK-CB-KID-35','Trắng','35',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P012','AD-SS-KID-32','Trắng','32',0,'INACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P012','AD-SS-KID-33','Trắng','33',0,'INACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P013','NB-327-KID-32','Xám','32',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P013','NB-327-KID-33','Xám','33',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P013','NB-327-KID-34','Xám','34',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P013','NB-327-KID-35','Xám','35',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P014','AS-C9-KID-32','Xanh','32',6,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P014','AS-C9-KID-33','Xanh','33',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P014','AS-C9-KID-34','Xanh','34',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P014','AS-C9-KID-35','Xanh','35',4,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P015','AD-GZB-PNK-37','Hồng đất','37',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P015','AD-GZB-PNK-38','Hồng đất','38',5,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days'),
('P015','AD-GZB-PNK-39','Hồng đất','39',3,'ACTIVE',NULL,NULL,NOW()-INTERVAL '25 days',NOW()-INTERVAL '25 days')
ON CONFLICT (sku) DO NOTHING;

-- Promotions
INSERT INTO promotions (id,code,name,type,value,max_discount,min_spend,start_at,end_at,usage_limit,usage_count,enabled,updated_at) VALUES
('PR001','WELCOME10','Khách mới giảm 10%','PERCENT',10,150000,500000,NOW()-INTERVAL '30 days',NOW()+INTERVAL '60 days',500,36,TRUE,NOW()),
('PR002','SALE50K','Giảm 50K đơn từ 1 triệu','FIXED',50000,NULL,1000000,NOW()-INTERVAL '10 days',NOW()+INTERVAL '30 days',200,18,TRUE,NOW()),
('PR003','EXPIRED20','Mã đã hết hạn để test','PERCENT',20,200000,700000,NOW()-INTERVAL '60 days',NOW()-INTERVAL '2 days',100,42,TRUE,NOW()),
('PR004','LIMITED','Mã đã hết lượt','FIXED',100000,NULL,1500000,NOW()-INTERVAL '3 days',NOW()+INTERVAL '20 days',5,5,TRUE,NOW())
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (id,customer_id,guest,status,payment_method,payment_status,shipping_method,subtotal,discount,shipping_fee,total,promo_code,stock_restored,contact,tracking,note,created_at,updated_at,delivered_at,cancelled_at) VALUES
('SMVN-1001','U001',FALSE,'DELIVERED','COD','PAID','STANDARD',3990000,150000,0,3840000,'WELCOME10',FALSE,
 '{"fullName":"Nam Nguyễn","phone":"0912345678","email":"nam@solemate.vn","province":"Hà Nội","district":"Cầu Giấy","ward":"Dịch Vọng","address":"12 Trần Thái Tông"}'::JSONB,
 'VNPOST1001','',NOW()-INTERVAL '6 days',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day',NULL),
('SMVN-1002',NULL,TRUE,'DELIVERED','BANK','PAID','EXPRESS',3190000,0,50000,3240000,NULL,FALSE,
 '{"fullName":"Minh Anh","phone":"0988123456","email":"","province":"TP. Hồ Chí Minh","district":"Quận 1","ward":"Bến Nghé","address":"45 Lê Thánh Tôn"}'::JSONB,
 'GHN1002','',NOW()-INTERVAL '4 days',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day',NULL),
('SMVN-1003','U001',FALSE,'SHIPPING','MOMO','PAID','STANDARD',3590000,0,0,3590000,NULL,FALSE,
 '{"fullName":"Nam Nguyễn","phone":"0912345678","email":"nam@solemate.vn","province":"Hà Nội","district":"Cầu Giấy","ward":"Dịch Vọng","address":"12 Trần Thái Tông"}'::JSONB,
 'GHTK1003','',NOW()-INTERVAL '3 days',NOW()-INTERVAL '3 days',NULL,NULL),
('SMVN-1004',NULL,TRUE,'PENDING','COD','UNPAID','STANDARD',2190000,50000,0,2140000,'SALE50K',FALSE,
 '{"fullName":"Hoàng Long","phone":"0977123456","email":"long@example.com","province":"Đà Nẵng","district":"Hải Châu","ward":"Thạch Thang","address":"88 Nguyễn Chí Thanh"}'::JSONB,
 '','',NOW()-INTERVAL '1 day',NOW()-INTERVAL '1 day',NULL,NULL)
ON CONFLICT (id) DO NOTHING;

-- Order Items
INSERT INTO order_items (order_id,product_id,slug,name,brand,sku,color,size,qty,unit_price,line_total) VALUES
('SMVN-1001','P001','nike-air-max-270','Nike Air Max 270','NIKE','NK-AM270-BLK-41','Đen','41',1,3990000,3990000),
('SMVN-1002','P005','new-balance-530-classic','New Balance 530 Classic','NEW BALANCE','NB-530-SLV-38','Bạc','38',1,3190000,3190000),
('SMVN-1003','P002','nike-pegasus-41','Nike Pegasus 41','NIKE','NK-PG41-BLU-41','Xanh','41',1,3590000,3590000),
('SMVN-1004','P009','converse-chuck-70-high','Converse Chuck 70 High','CONVERSE','CV-CH70-BLK-39','Đen','39',1,2190000,2190000)
ON CONFLICT DO NOTHING;
