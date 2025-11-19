/**
 * Configuration for Supabase POS System
 * Create a .env file and add your Supabase credentials
 */

// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase credentials
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

// App Configuration
export const APP_NAME = 'ABC POS System';
export const APP_VERSION = '2.0.0';

// Storage Configuration
export const STORAGE_BUCKET = 'product-images';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Roles
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft'
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Stock Change Types
export const STOCK_CHANGE_TYPES = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  SET: 'set'
};

