-- Migration SQL for Production Database
-- Run this in phpMyAdmin if you don't have command-line access

-- Add Bayarcash and SenangPay fields to payment_settings table
ALTER TABLE `payment_settings` 
ADD COLUMN `bayarcash_access_token` TEXT NULL AFTER `category_code`,
ADD COLUMN `bayarcash_portal_key` VARCHAR(255) NULL AFTER `bayarcash_access_token`,
ADD COLUMN `bayarcash_is_sandbox` TINYINT(1) NOT NULL DEFAULT 1 AFTER `bayarcash_portal_key`,
ADD COLUMN `bayarcash_is_active` TINYINT(1) NOT NULL DEFAULT 0 AFTER `bayarcash_is_sandbox`,
ADD COLUMN `senangpay_merchant_id` VARCHAR(255) NULL AFTER `bayarcash_is_active`,
ADD COLUMN `senangpay_secret_key` TEXT NULL AFTER `senangpay_merchant_id`,
ADD COLUMN `senangpay_is_sandbox` TINYINT(1) NOT NULL DEFAULT 1 AFTER `senangpay_secret_key`,
ADD COLUMN `senangpay_is_active` TINYINT(1) NOT NULL DEFAULT 0 AFTER `senangpay_is_sandbox`;

-- Verify the migration
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'payment_settings' 
AND TABLE_SCHEMA = 'chilloc1_yuran'
ORDER BY ORDINAL_POSITION;
