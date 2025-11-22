/**
 * API Module
 * Database operations for all tables
 */

import { supabase } from './supabase-client.js';
import { getCurrentUser } from './auth.js';

// =====================================================
// PRODUCTS API
// =====================================================

/**
 * Get all products
 * @param {object} filters - {status, category, search}
 * @returns {Promise<{data: array, error: string}>}
 */
export async function getProducts(filters = {}) {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get products error:', error);
    return { data: null, error: 'Failed to fetch products' };
  }
}

/**
 * Get single product by ID
 * @param {number} productId 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function getProduct(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get product error:', error);
    return { data: null, error: 'Failed to fetch product' };
  }
}

/**
 * Create new product
 * @param {object} productData 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function createProduct(productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Log audit
    await logAudit('CREATE', 'products', data.id, null, data);

    return { data, error: null };
  } catch (error) {
    console.error('Create product error:', error);
    return { data: null, error: 'Failed to create product' };
  }
}

/**
 * Update product
 * @param {number} productId 
 * @param {object} productData 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function updateProduct(productId, productData) {
  try {
    // Get old data first for audit
    const { data: oldData } = await getProduct(productId);

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Log audit
    await logAudit('UPDATE', 'products', productId, oldData, data);

    return { data, error: null };
  } catch (error) {
    console.error('Update product error:', error);
    return { data: null, error: 'Failed to update product' };
  }
}

/**
 * Delete product
 * @param {number} productId 
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function deleteProduct(productId) {
  try {
    // Get old data first for audit
    const { data: oldData } = await getProduct(productId);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit
    await logAudit('DELETE', 'products', productId, oldData, null);

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete product error:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

/**
 * Update product stock
 * @param {number} productId 
 * @param {number} newStock 
 * @param {string} changeType - 'increase', 'decrease', 'set'
 * @param {string} reason 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function updateProductStock(productId, newStock, changeType, reason = '') {
  try {
    const { user } = await getCurrentUser();
    
    // Get current product
    const { data: product } = await getProduct(productId);
    
    if (!product) {
      return { data: null, error: 'Product not found' };
    }

    const previousStock = product.stock;
    const changeAmount = newStock - previousStock;

    // Update product stock
    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Record stock history
    await supabase.from('stock_history').insert([{
      product_id: productId,
      previous_stock: previousStock,
      new_stock: newStock,
      change_amount: changeAmount,
      change_type: changeType,
      reason: reason,
      created_by: user?.id
    }]);

    return { data, error: null };
  } catch (error) {
    console.error('Update product stock error:', error);
    return { data: null, error: 'Failed to update stock' };
  }
}

// =====================================================
// ORDERS API
// =====================================================

/**
 * Get all orders
 * @param {object} filters - {status, startDate, endDate}
 * @returns {Promise<{data: array, error: string}>}
 */
export async function getOrders(filters = {}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        user_profiles:created_by(username, full_name)
      `)
      .order('order_date', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('order_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('order_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get orders error:', error);
    return { data: null, error: 'Failed to fetch orders' };
  }
}

/**
 * Get single order by ID
 * @param {number} orderId 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function getOrder(orderId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        user_profiles:created_by(username, full_name)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get order error:', error);
    return { data: null, error: 'Failed to fetch order' };
  }
}

/**
 * Create new order with items
 * @param {object} orderData - {customer_name, customer_phone, items: [{product_id, quantity, unit_price}]}
 * @returns {Promise<{data: object, error: string}>}
 */
export async function createOrder(orderData) {
  try {
    const { user } = await getCurrentUser();
    
    // Generate order number
    const orderNumber = orderData.order_number || `ORD-${Date.now()}`;
    const paymentMethod = orderData.payment_method || 'cash';
    const paymentStatus = orderData.payment_status || (paymentMethod === 'cash' ? 'paid' : 'pending');
    
    // Calculate total
    const totalAmount = orderData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: orderData.customer_name || null,
        customer_phone: orderData.customer_phone || null,
        total_amount: totalAmount,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        payment_reference: orderData.payment_reference || null,
        payment_qr_payload: orderData.payment_qr_payload || null,
        created_by: user?.id
      }])
      .select()
      .single();

    if (orderError) {
      return { data: null, error: orderError.message };
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback order if items insert fails
      await supabase.from('orders').delete().eq('id', order.id);
      return { data: null, error: itemsError.message };
    }

    // Create sales records
    const salesRecords = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price
    }));

    await supabase.from('sales').insert(salesRecords);

    // Update product stocks
    for (const item of orderData.items) {
      const { data: product } = await getProduct(item.product_id);
      if (product) {
        await updateProductStock(
          item.product_id,
          product.stock - item.quantity,
          'decrease',
          `Order ${orderNumber}`
        );
      }
    }

    // Get complete order with items
    const { data: completeOrder } = await getOrder(order.id);

    // Log audit
    await logAudit('CREATE', 'orders', order.id, null, completeOrder);

    return { data: completeOrder, error: null };
  } catch (error) {
    console.error('Create order error:', error);
    return { data: null, error: 'Failed to create order' };
  }
}

/**
 * Update order status
 * @param {number} orderId 
 * @param {string} status 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const { data: oldData } = await getOrder(orderId);

    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Log audit
    await logAudit('UPDATE', 'orders', orderId, oldData, data);

    return { data, error: null };
  } catch (error) {
    console.error('Update order status error:', error);
    return { data: null, error: 'Failed to update order status' };
  }
}

// =====================================================
// DASHBOARD / STATS API
// =====================================================

/**
 * Get dashboard statistics
 * @returns {Promise<{data: object, error: string}>}
 */
export async function getDashboardStats() {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return { data: null, error: 'Failed to fetch dashboard stats' };
  }
}

/**
 * Get sales by date range
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {Promise<{data: array, error: string}>}
 */
export async function getSalesByDateRange(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get sales by date range error:', error);
    return { data: null, error: 'Failed to fetch sales data' };
  }
}

// =====================================================
// USER MANAGEMENT API
// =====================================================

/**
 * Get all user profiles
 * @returns {Promise<{data: array, error: string}>}
 */
export async function getUserProfiles() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get user profiles error:', error);
    return { data: null, error: 'Failed to fetch users' };
  }
}

/**
 * Update user profile
 * @param {string} userId 
 * @param {object} profileData 
 * @returns {Promise<{data: object, error: string}>}
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Log audit
    await logAudit('UPDATE', 'user_profiles', userId, null, data);

    return { data, error: null };
  } catch (error) {
    console.error('Update user profile error:', error);
    return { data: null, error: 'Failed to update user profile' };
  }
}

// =====================================================
// AUDIT LOG API
// =====================================================

/**
 * Log audit event
 * @param {string} action 
 * @param {string} tableName 
 * @param {number} recordId 
 * @param {object} oldValues 
 * @param {object} newValues 
 */
async function logAudit(action, tableName, recordId, oldValues, newValues) {
  try {
    const { user } = await getCurrentUser();
    
    await supabase.from('audit_logs').insert([{
      user_id: user?.id,
      username: user?.profile?.username,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: null, // Will be captured by Supabase
      user_agent: navigator.userAgent
    }]);
  } catch (error) {
    console.error('Log audit error:', error);
  }
}

/**
 * Get audit logs
 * @param {object} filters - {userId, tableName, startDate, endDate}
 * @returns {Promise<{data: array, error: string}>}
 */
export async function getAuditLogs(filters = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*, user_profiles:user_id(username, full_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.tableName) {
      query = query.eq('table_name', filters.tableName);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get audit logs error:', error);
    return { data: null, error: 'Failed to fetch audit logs' };
  }
}

// =====================================================
// STOCK HISTORY API
// =====================================================

/**
 * Get stock history
 * @param {number} productId 
 * @returns {Promise<{data: array, error: string}>}
 */
export async function getStockHistory(productId) {
  try {
    const { data, error } = await supabase
      .from('stock_history')
      .select('*, user_profiles:created_by(username, full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Get stock history error:', error);
    return { data: null, error: 'Failed to fetch stock history' };
  }
}

