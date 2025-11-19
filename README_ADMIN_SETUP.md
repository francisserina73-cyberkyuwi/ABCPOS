# Admin User Setup

## Default Admin Credentials

**Username:** `admin`  
**Password:** `admin123`

## Setup Instructions

### Option 1: Automatic Setup (Recommended)

1. Open your browser and go to:
   ```
   http://localhost/pos_system_dark/setup_admin.php
   ```

2. The script will:
   - Check if admin user exists
   - Create admin user if it doesn't exist
   - Update password hash to latest format (Argon2ID)
   - Set proper role and status

3. You'll see a success message with login credentials

### Option 2: Manual Setup via SQL

Run this SQL in phpMyAdmin:

```sql
USE pos_system1;

-- Generate password hash (you'll need to run setup_admin.php to get proper Argon2ID hash)
-- Or use this temporary bcrypt hash that works with admin123:
INSERT IGNORE INTO users (username, password, full_name, role, status) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'active');
```

Then run `setup_admin.php` to update to latest password format.

## Important Notes

- The default password `admin123` is **NOT SECURE** for production
- **Change the password immediately** after first login in production
- The password hash format has been upgraded to Argon2ID (stronger than bcrypt)
- If you get login errors, run `setup_admin.php` to update the password hash

## Troubleshooting

### Can't login with admin/admin123?

1. Run `setup_admin.php` in your browser
2. This will create/update the admin user with correct password hash
3. Try logging in again

### Forgot admin password?

1. Run this SQL in phpMyAdmin:
   ```sql
   UPDATE users SET password = '' WHERE username = 'admin';
   ```
2. Run `setup_admin.php` to reset password to `admin123`

## Security Recommendations

**After first login:**
1. Change the admin password immediately
2. Create additional admin accounts
3. Disable or delete the default admin account
4. Use strong, unique passwords


