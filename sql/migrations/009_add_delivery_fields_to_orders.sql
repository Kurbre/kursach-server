ALTER TABLE orders
ADD COLUMN delivery_method VARCHAR(50),
ADD COLUMN delivery_info JSONB;