# 📋 Database Setup Instructions

## Step-by-Step: Import Database Schema

### Method 1: Using phpMyAdmin (Recommended)

1. **Open phpMyAdmin**
   - Open your browser
   - Go to: `http://localhost/phpmyadmin`
   - Make sure MySQL is running in XAMPP

2. **Import SQL File**
   - Click "**New**" on the left sidebar (to create new database) OR skip to step 3 if you want to import to existing database
   - Click "**Import**" tab (top menu)
   - Click "**Choose File**" button
   - Navigate to: `C:\xampp\htdocs\pos_system_dark\sql\database_schema.sql`
   - Select the file
   - Scroll down and click "**Go**" button
   - Wait for the import to complete

3. **Or Create Database First** (Alternative)
   - Click "**New**" on left sidebar
   - Database name: `pos_system1`
   - Collation: `utf8mb4_general_ci`
   - Click "**Create**"
   - Then go to "**Import**" tab and follow step 2

4. **Verify Installation**
   - On the left sidebar, click "**pos_system**" database
   - You should see these tables:
     - ✅ users
     - ✅ products
     - ✅ orders
     - ✅ order_items
     - ✅ sales
     - ✅ stock_history

### Method 2: Using MySQL Command Line

1. **Open Command Prompt**
   - Press `Win + R`
   - Type `cmd` and press Enter

2. **Navigate to MySQL**
   ```
   cd C:\xampp\mysql\bin
   ```

3. **Login to MySQL**
   ```
   mysql -u root -p -P 3307
   ```
   (Press Enter when asked for password, or type your password)

4. **Import SQL File**
   ```
   source C:/xampp/htdocs/pos_system_dark/sql/database_schema.sql
   ```
   Or:
   ```
   mysql -u root -P 3307 pos_system1 < C:/xampp/htdocs/pos_system_dark/sql/database_schema.sql
   ```

### Method 3: Copy-Paste SQL Content

1. **Open phpMyAdmin**
   - Go to: `http://localhost/phpmyadmin`

2. **Select Database**
   - Click "**New**" or select existing database
   - Database name: `pos_system1`

3. **Click SQL Tab**
   - Click "**SQL**" tab at the top

4. **Copy SQL Content**
   - Open `sql/database_schema.sql` in a text editor
   - Copy ALL the content (Ctrl+A, Ctrl+C)

5. **Paste and Execute**
   - Paste into the SQL text area
   - Click "**Go**" button

### ✅ After Import - Verify:

1. **Check Default Admin User**
   - Go to phpMyAdmin
   - Click "**pos_system1**" database
   - Click "**users**" table
   - Click "**Browse**" tab
   - You should see: username `admin` with hashed password

2. **Default Login Credentials**
   - Username: `admin`
   - Password: `admin123`

3. **Check Sample Products**
   - Click "**products**" table
   - Click "**Browse**" tab
   - You should see 8 sample products

### 🐛 Troubleshooting

**Error: "Unknown database 'pos_system1'"**
- Solution: The SQL file will create the database automatically, but if it fails, create it manually first (Method 1, Step 3)

**Error: "Table already exists"**
- Solution: Drop the existing database first:
  1. In phpMyAdmin, click "**pos_system1**"
   - Click "**Operations**" tab
   - Scroll down and click "**Drop the database**"
   - Confirm, then import again

**Error: "Access denied"**
- Solution: Make sure MySQL is running in XAMPP Control Panel

---

**Need Help?** Run `test_connection.php` to check if MySQL is accessible:
`http://localhost/pos_system_dark/test_connection.php`

