# 📊 Data Migration Guide - MySQL to Supabase

## Overview

This guide helps you migrate your existing data from the old MySQL database to Supabase PostgreSQL.

---

## 🎯 What Data to Migrate

### Tables to Migrate:
1. **users** → `user_profiles` (with auth.users)
2. **products** → `products`
3. **orders** → `orders`
4. **order_items** → `order_items`
5. **sales** → `sales`
6. **stock_history** → `stock_history`

---

## 📝 METHOD 1: Manual Export/Import (Recommended for Small Data)

### Step 1: Export from MySQL

#### Export Products:
1. Open phpMyAdmin
2. Select `pos_system1` database
3. Click `products` table
4. Click "**Export**" tab
5. Format: **CSV**
6. Click "**Go**"
7. Save file as `products_export.csv`

#### Export Orders:
1. Select `orders` table
2. Export as CSV
3. Save as `orders_export.csv`

#### Export Sales:
1. Select `sales` table
2. Export as CSV
3. Save as `sales_export.csv`

### Step 2: Prepare Data

#### For Products CSV:
- Remove the `id` column (PostgreSQL will auto-generate)
- Make sure dates are in format: `YYYY-MM-DD HH:MM:SS`
- Remove any rows with invalid data

#### For Orders CSV:
- Remove `id` column
- Convert `created_by` to match new user UUIDs (see below)

### Step 3: Import to Supabase

1. Go to Supabase Dashboard
2. Click "**Table Editor**"
3. Select `products` table
4. Click "**Insert**" dropdown > "**Import data from CSV**"
5. Upload `products_export.csv`
6. Map columns:
   - Match column names
   - Skip `id` column
7. Click "**Import**"
8. Repeat for other tables

---

## 🔧 METHOD 2: SQL Script Migration

### Step 1: Export MySQL Data as SQL

```sql
-- In phpMyAdmin or MySQL CLI

-- Export products
SELECT * FROM products INTO OUTFILE '/tmp/products.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Or use mysqldump
mysqldump -u root -p pos_system1 products > products.sql
```

### Step 2: Convert MySQL to PostgreSQL

#### Key Differences:

**MySQL:**
```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**PostgreSQL (Supabase):**
```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Conversion Steps:
1. Replace `AUTO_INCREMENT` with `SERIAL` or `BIGSERIAL`
2. Replace `ENUM` with `TEXT` + `CHECK` constraint
3. Replace `TIMESTAMP` with `TIMESTAMPTZ`
4. Replace `CURRENT_TIMESTAMP` with `NOW()`

### Step 3: Insert Data via SQL Editor

1. Go to Supabase > **SQL Editor**
2. Paste your INSERT statements:

```sql
INSERT INTO products (name, description, price, stock, category, status, created_at)
VALUES 
    ('Ensaymada', 'Sweet bread', 55.00, 45, 'Pastry', 'active', NOW()),
    ('Torta', 'Flower-shaped pastry', 75.00, 73, 'Pastry', 'active', NOW()),
    -- ... more rows
;
```

3. Click "**Run**"

---

## 👥 METHOD 3: Migrating Users (Special Case)

Users need special handling because Supabase uses auth.users + user_profiles.

### Step 1: Create Users in Supabase Auth

For each user in your MySQL `users` table:

1. Go to Supabase > **Authentication** > **Users**
2. Click "**Add user**"
3. Fill in:
   - **Email**: `username@yourdomain.com` (convert username to email)
   - **Password**: Set a temporary password
   - **Auto Confirm**: YES
   - **User Metadata**:
   ```json
   {
     "username": "original_username",
     "full_name": "User Full Name",
     "role": "admin" or "staff"
   }
   ```
4. Click "**Create user**"
5. Note the UUID generated

### Step 2: User Profile is Auto-Created

The database trigger automatically creates a `user_profiles` entry when you create an auth user.

### Alternative: Bulk User Creation via SQL

```sql
-- You'll need to do this via Supabase Management API or manually
-- Supabase doesn't support bulk auth.users creation via SQL
```

---

## 🖼️ METHOD 4: Migrating Product Images

### Step 1: Download Images from Old Server

```bash
# If using XAMPP locally
cd C:\xampp\htdocs\pos_system_dark\uploads\images

# Copy all images to a new folder
mkdir migrated_images
cp *.jpg *.png *.gif migrated_images/
```

### Step 2: Upload to Supabase Storage

**Option A: Via Dashboard (Small number of images)**
1. Go to Supabase > **Storage** > `product-images`
2. Click "**Upload file**"
3. Select all images
4. Upload

**Option B: Via Script (Many images)**

Create `upload-images.js`:
```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SERVICE_ROLE_KEY' // Use service role for this
);

const imagesDir = './migrated_images';
const files = fs.readdirSync(imagesDir);

for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(file, fileBuffer, {
            contentType: 'image/jpeg', // or detect from file
            upsert: true
        });
    
    if (error) {
        console.error(`Failed to upload ${file}:`, error);
    } else {
        console.log(`Uploaded ${file}`);
    }
}
```

Run:
```bash
node upload-images.js
```

### Step 3: Update Product Image Paths

After uploading, update product records:

```sql
-- In Supabase SQL Editor
UPDATE products 
SET image_path = 'https://your-project.supabase.co/storage/v1/object/public/product-images/' || 
                 (SELECT substring(image_path from '([^/]+)$'))
WHERE image_path IS NOT NULL;
```

---

## 🔄 DATA MAPPING REFERENCE

### Users Table Mapping

| MySQL `users` | Supabase `user_profiles` | Notes |
|---------------|---------------------------|-------|
| id (INT) | id (UUID) | New UUID from auth.users |
| username | username | Same |
| password | (in auth.users) | Re-hash with bcrypt |
| full_name | full_name | Same |
| role | role | Same |
| status | status | Same |
| created_at | created_at | Convert timezone |

### Products Table Mapping

| MySQL | Supabase | Notes |
|-------|----------|-------|
| id (INT) | id (BIGINT) | Auto-generated |
| name | name | Same |
| description | description | Same |
| price | price | DECIMAL stays same |
| stock | stock | INT stays same |
| category | category | TEXT |
| image_path | image_path | Update to Supabase Storage URL |
| status | status | TEXT with CHECK constraint |
| perishable | perishable | BOOLEAN |
| created_at | created_at | Convert to TIMESTAMPTZ |
| updated_at | updated_at | Convert to TIMESTAMPTZ |

### Orders Table Mapping

| MySQL | Supabase | Notes |
|-------|----------|-------|
| id | id | Auto-generated |
| order_number | order_number | Same |
| customer_name | customer_name | Same |
| customer_phone | customer_phone | Same |
| total_amount | total_amount | Same |
| status | status | TEXT with CHECK |
| order_date | order_date | TIMESTAMPTZ |
| completed_at | completed_at | TIMESTAMPTZ |
| created_by (INT) | created_by (UUID) | Map to new user UUID |

---

## ✅ VERIFICATION CHECKLIST

After migration, verify:

- [ ] All products migrated (check count)
- [ ] Product images loading correctly
- [ ] All orders migrated
- [ ] Order items linked correctly
- [ ] Sales data accurate
- [ ] User accounts working (can login)
- [ ] Stock quantities correct
- [ ] Dates/timestamps correct (check timezone)

### SQL Verification Queries:

```sql
-- Check product count
SELECT COUNT(*) FROM products;

-- Check users
SELECT COUNT(*) FROM user_profiles;

-- Check orders
SELECT COUNT(*) FROM orders;

-- Check data integrity
SELECT o.order_number, COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.order_number;
```

---

## 🐛 COMMON ISSUES

### Issue: "Foreign key constraint fails"
**Solution**: Import tables in order:
1. user_profiles (after creating auth.users)
2. products
3. orders
4. order_items
5. sales
6. stock_history

### Issue: "Date format incorrect"
**Solution**: Convert dates to ISO 8601:
```sql
-- MySQL: 2024-01-15 10:30:00
-- PostgreSQL: 2024-01-15 10:30:00+00 (or +08 for Manila)
```

### Issue: "UUID vs INT mismatch"
**Solution**: Create mapping table:
```sql
CREATE TEMP TABLE user_id_mapping (
    old_id INT,
    new_id UUID
);

-- Then use JOINs to update foreign keys
```

---

## 💡 PRO TIPS

1. **Test with small dataset first**: Migrate 10-20 records to test the process

2. **Backup before migration**: 
```bash
mysqldump -u root -p pos_system1 > backup_before_migration.sql
```

3. **Use transactions**: Wrap imports in transactions so you can rollback if needed

4. **Verify counts**: Check that record counts match before and after

5. **Time zones**: Be aware of timezone differences (MySQL vs PostgreSQL)

---

## 🆘 NEED HELP?

1. Check Supabase logs: Dashboard > Logs
2. Check browser console for errors
3. Test small batch first
4. Ask in Supabase Discord: https://discord.supabase.com

---

## ✅ SUCCESS!

Once migration is complete:
- Your old data is now in Supabase
- Application should show all existing data
- You can delete the old MySQL database (after confirming everything works)

**Remember to backup your old database before deleting it!**


