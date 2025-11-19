# POS System - Setup Guide

## Prerequisites
- XAMPP (PHP 7.4+ and MySQL)
- Web browser

## Installation Steps

### 1. Database Setup
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import the SQL file: `sql/database_schema.sql`
   - Or copy the SQL content and execute it in phpMyAdmin
3. This will create:
   - Database: `pos_system1`
   - Tables: users, products, orders, order_items, sales, stock_history
   - Default admin user (username: `admin`, password: `admin123`)

### 2. Database Configuration
Update `db.php` with your MySQL credentials:
```php
$host = "localhost";
$port = 3307; // Change if different
$user = "root";
$pass = ""; // Your MySQL password
$dbname = "pos_system1";
```

### 3. Access the System
1. Start Apache and MySQL in XAMPP
2. Navigate to: `http://localhost/pos_system_dark/`
3. Login with:
   - Username: `admin`
   - Password: `admin123`

## Features

### ✅ Completed Backend Features:
- **Authentication System**: Login with database users
- **Dashboard**: Real-time statistics from database
- **Products/Inventory Management**: 
  - View all products
  - Add/Edit/Delete products
  - Filter by category, status, stock, price
- **Menu**: Display products from database
- **Reports**: 
  - Order statistics
  - Monthly charts
  - Order details table

### 📁 File Structure:
```
pos_system_dark/
├── api/
│   ├── auth.php          # Authentication API
│   ├── products.php      # Products CRUD API
│   ├── dashboard.php     # Dashboard data API
│   └── reports.php       # Reports data API
├── includes/
│   └── functions.php     # Helper functions
├── sql/
│   └── database_schema.sql  # Database structure
├── index.php             # Login page
├── dashboard.php         # Dashboard
├── menu.php              # Menu/Products page
├── inventory.php         # Inventory management
├── reports.php           # Reports page
└── db.php                # Database connection
```

## API Endpoints

### Authentication
- `POST api/auth.php?action=login` - Login
- `POST api/auth.php?action=logout` - Logout
- `GET api/auth.php?check` - Check session

### Products
- `GET api/products.php` - Get all products
- `GET api/products.php?id={id}` - Get single product
- `POST api/products.php` - Create product
- `PUT api/products.php` - Update product
- `DELETE api/products.php?id={id}` - Delete product

### Dashboard
- `GET api/dashboard.php` - Get dashboard stats

### Reports
- `GET api/reports.php?type=reservation&start_date={date}&end_date={date}` - Get order reports

## Default Data

The system comes with sample products:
- Ensaymada (Pastry)
- Torta (Pastry)
- Cookies (Dessert)
- Biscuits (Pastry)
- Leche Flan (Dessert)
- Cassava Cake (Dessert)
- Pichi-Pichi (Dessert) - Out of stock
- Brownies (Dessert)

## Security Notes

- Passwords are hashed using PHP's `password_hash()`
- SQL injection protected with prepared statements
- Session-based authentication
- XSS protection with `htmlspecialchars()`

## Next Steps / To-Do

- [ ] Image upload functionality for products
- [ ] Order creation system
- [ ] Sales/Transactions recording
- [ ] User management (add/edit users)
- [ ] Export reports to PDF/Excel
- [ ] Email notifications
- [ ] Barcode scanning

