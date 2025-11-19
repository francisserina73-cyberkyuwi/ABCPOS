# 🚀 Production Deployment Checklist

## ⚠️ BEFORE UPLOADING TO WEB HOSTING

### 1. **Update Configuration** ⚠️ CRITICAL
- [ ] Edit `includes/config.php`
- [ ] Change `APP_ENV` from `'development'` to `'production'`
- [ ] Update database credentials:
  ```php
  define('DB_HOST', 'localhost'); // Usually 'localhost' on hosting
  define('DB_PORT', 3306); // Usually 3306 on hosting (not 3307)
  define('DB_USER', 'your_hosting_db_user');
  define('DB_PASS', 'your_hosting_db_password');
  define('DB_NAME', 'your_hosting_db_name');
  ```

### 2. **Database Setup**
- [ ] Create database in hosting control panel
- [ ] Import `sql/database_schema.sql` via phpMyAdmin
- [ ] Run `sql/security_updates.sql` (optional but recommended)
- [ ] Run `setup_admin.php` to create/update admin user

### 3. **File Permissions** ⚠️ IMPORTANT
Set these permissions on hosting:
- [ ] `uploads/` directory: **755** (readable/writable by web server)
- [ ] `uploads/images/` directory: **755**
- [ ] `logs/` directory: **755**
- [ ] All PHP files: **644**

### 4. **Files to DELETE Before Upload** 🗑️
Remove these development files:
- [ ] `test_connection.php`
- [ ] `verify_setup.php`
- [ ] `setup_admin.php` (or keep for initial setup, then delete)
- [ ] `config/database.php` (old config file)

### 5. **Files to Keep**
✅ Keep these files:
- All PHP pages (dashboard.php, menu.php, etc.)
- All CSS files
- `api/` folder
- `includes/` folder
- `sql/` folder (for backup/reference)
- `uploads/` folder structure
- `logs/` folder structure

### 6. **Security**
- [ ] Ensure `.htaccess` files are uploaded (in `uploads/` and `uploads/images/`)
- [ ] Check that `logs/` directory is not web-accessible
- [ ] Verify SSL/HTTPS is enabled on hosting
- [ ] Change default admin password after first login

### 7. **PHP Requirements**
Verify hosting supports:
- [ ] PHP 7.4 or higher
- [ ] MySQL/MariaDB
- [ ] `mysqli` extension
- [ ] `gd` extension (for image handling)
- [ ] `fileinfo` extension (for file upload validation)

### 8. **Testing After Deployment**
- [ ] Test login with admin credentials
- [ ] Test product creation/editing
- [ ] Test image upload
- [ ] Test POS checkout
- [ ] Test reports page
- [ ] Check error logs

## 📋 Quick Deployment Steps

1. **Update `includes/config.php`:**
   ```php
   define('APP_ENV', 'production');
   define('DB_HOST', 'localhost'); // or hosting provided
   define('DB_PORT', 3306); // usually 3306
   // Update credentials
   ```

2. **Upload files via FTP/cPanel File Manager**

3. **Import database via phpMyAdmin:**
   - Import `sql/database_schema.sql`
   - Import `sql/security_updates.sql` (optional)

4. **Run setup_admin.php once:**
   - Visit: `https://yourdomain.com/setup_admin.php`
   - Creates admin user
   - Delete this file after use

5. **Set file permissions:**
   - `uploads/` and `logs/` → 755

6. **Test and change admin password**

## 🔒 Security Reminders

- ✅ All SQL injections protected
- ✅ XSS protection enabled
- ✅ CSRF tokens active
- ✅ Password hashing (Argon2ID)
- ✅ File upload validation
- ⚠️ Change default admin password!
- ⚠️ Enable HTTPS/SSL
- ⚠️ Remove setup files after deployment

## ⚡ Common Hosting Issues

### Issue: "Database connection error"
- Check database credentials in `includes/config.php`
- Verify database name, user, password
- Check if port is 3306 (not 3307)

### Issue: "Permission denied" on uploads
- Set `uploads/` directory to 755
- Some hosts need 777 (less secure, ask host first)

### Issue: "Page not found"
- Check if using correct domain path
- Verify `.htaccess` files uploaded
- Check file permissions

### Issue: Images not displaying
- Check `uploads/images/` permissions
- Verify image paths are relative, not absolute
- Check `.htaccess` in uploads folder

## 📞 Support

If issues occur:
1. Check `logs/error.log` for errors
2. Check `logs/security.log` for security events
3. Contact hosting support for server-specific issues


