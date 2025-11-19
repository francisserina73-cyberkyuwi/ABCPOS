# 🚀 Supabase Setup Guide for POS System

## 📋 Prerequisites
- Supabase account (free tier: supabase.com)
- Your existing MySQL database with data (optional)

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "**Start your project**" or "**New Project**"
3. Sign in with GitHub (recommended) or email
4. Click "**New Project**"
5. Fill in project details:
   - **Name:** `pos-system` (or any name)
   - **Database Password:** Generate a strong password (SAVE THIS!)
   - **Region:** Choose closest to Philippines (Singapore recommended)
   - **Pricing Plan:** Free
6. Click "**Create new project**"
7. Wait 2-3 minutes for setup to complete

---

## Step 2: Setup Database Schema

1. In your Supabase dashboard, click "**SQL Editor**" (left sidebar)
2. Click "**New query**"
3. Copy the entire content of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "**Run**" (or press Ctrl+Enter)
6. Wait for execution to complete
7. You should see: "Success. No rows returned"

### Verify Tables Created:
1. Click "**Table Editor**" (left sidebar)
2. You should see these tables:
   - ✅ user_profiles
   - ✅ products
   - ✅ orders
   - ✅ order_items
   - ✅ sales
   - ✅ stock_history
   - ✅ audit_logs

---

## Step 3: Configure Authentication

1. Click "**Authentication**" (left sidebar)
2. Click "**Providers**" tab
3. Make sure "**Email**" is enabled (should be by default)
4. Click "**Email**" to configure:
   - ✅ Enable Email provider
   - ✅ Confirm email: **DISABLED** (for easier testing)
   - ✅ Save changes

### Optional: Setup Email Templates
1. Click "**Email Templates**" tab
2. Customize the welcome email (optional)

---

## Step 4: Setup Storage for Product Images

1. Click "**Storage**" (left sidebar)
2. Click "**Create a new bucket**"
3. Bucket details:
   - **Name:** `product-images`
   - **Public bucket:** ✅ **YES** (enable)
   - **File size limit:** 5MB
   - **Allowed MIME types:** `image/*`
4. Click "**Create bucket**"

### Setup Storage Policies:
1. Click on the `product-images` bucket
2. Click "**Policies**" tab
3. Click "**New policy**"

**Policy 1: Public Read Access**
- Name: `Public read access`
- Policy definition: Select "Custom"
- Allowed operations: SELECT
- Target roles: `public`
- Policy definition (SQL):
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );
```

**Policy 2: Authenticated Upload**
- Name: `Authenticated users can upload`
- Policy definition: Select "Custom"
- Allowed operations: INSERT
- Target roles: `authenticated`
- Policy definition (SQL):
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Authenticated Delete**
```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

---

## Step 5: Create First Admin User

### Method 1: Using Supabase Dashboard

1. Click "**Authentication**" > "**Users**"
2. Click "**Add user**" (top right)
3. Fill in:
   - **Email:** your admin email (e.g., `admin@yourdomain.com`)
   - **Password:** Create a strong password
   - **Auto Confirm User:** ✅ YES
   - **User Metadata (JSON):**
   ```json
   {
     "username": "admin",
     "full_name": "System Administrator",
     "role": "admin"
   }
   ```
4. Click "**Create user**"

### Method 2: Using SQL Editor

1. Go to SQL Editor
2. Run this query (replace with your details):
```sql
-- First, create the auth user
-- Note: You'll need to get the UUID from the auth.users table after signup

-- Then update the user_profiles table
INSERT INTO user_profiles (id, username, full_name, role, status)
VALUES (
  'YOUR_USER_UUID_HERE',  -- Replace with actual UUID from auth.users
  'admin',
  'System Administrator',
  'admin',
  'active'
);
```

### Verify Admin User:
1. Go to "Table Editor" > "user_profiles"
2. You should see your admin user with role = 'admin'

---

## Step 6: Get Your Supabase Credentials

You'll need these for your application:

1. Click "**Settings**" (left sidebar, bottom)
2. Click "**API**" tab
3. Copy these values:

   - **Project URL:** `https://xxxx.supabase.co`
   - **Project API Key (anon public):** `eyJhbG...` (long string)
   - **Service Role Key:** `eyJhbG...` (KEEP THIS SECRET!)

4. Save these in a safe place (you'll use them in the frontend)

---

## Step 7: (Optional) Migrate Existing Data

If you have existing data in your MySQL database:

### Option A: Use the Migration Script

1. Make sure you have Node.js installed
2. Run the migration script:
```bash
cd supabase
node migrate-data.js
```

3. Follow the prompts to enter your MySQL and Supabase credentials

### Option B: Manual Export/Import

1. **Export from MySQL:**
   - Go to phpMyAdmin
   - Select your database
   - Export to SQL

2. **Convert and Import:**
   - Use the provided `convert-sql.js` script (coming next)
   - Or manually insert data via Supabase SQL Editor

---

## Step 8: Test the Setup

### Test Database Connection:
1. Go to SQL Editor
2. Run this query:
```sql
SELECT * FROM get_dashboard_stats();
```
3. You should get a JSON response with stats

### Test Authentication:
1. Go to "Authentication" > "Users"
2. Click on your admin user
3. Click "Send magic link" to test email
4. Or use the frontend login page

### Test Storage:
1. Go to "Storage" > "product-images"
2. Click "Upload file"
3. Upload a test image
4. Verify it appears in the bucket

---

## 🔑 Environment Variables for Frontend

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For development
VITE_SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**IMPORTANT:** 
- Never commit `.env` to version control
- Add `.env` to your `.gitignore`
- Use service role key only in secure backend/server code

---

## 📊 Free Tier Limits

Supabase Free Tier includes:
- ✅ 500MB database space
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ Unlimited API requests
- ✅ Up to 500MB in database backups

**For your POS system, this should be more than enough!**

---

## 🔒 Security Best Practices

1. **Enable RLS:** Already enabled in schema ✅
2. **Use anon key in frontend:** Only use anon key, never service role key
3. **Row Level Security:** Policies ensure users only see their data
4. **HTTPS Only:** Supabase forces HTTPS by default
5. **Regular Backups:** Enable in Settings > Database > Backups

---

## 🐛 Troubleshooting

### "Permission denied" errors:
- Check RLS policies are enabled
- Verify user has correct role in user_profiles
- Check auth token is valid

### "relation does not exist" errors:
- Make sure you ran the schema.sql file
- Check table names are correct (lowercase)
- Refresh the Table Editor

### Cannot upload images:
- Check storage policies are created
- Verify bucket is public
- Check file size < 5MB

### Connection errors:
- Verify Project URL and API keys are correct
- Check internet connection
- Try regenerating anon key

---

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the console for error messages

---

## ✅ Setup Complete!

If you've completed all steps:
- ✅ Database schema created
- ✅ RLS policies enabled
- ✅ Storage bucket created
- ✅ Admin user created
- ✅ Credentials saved

**Next:** Set up the frontend application with these credentials.


