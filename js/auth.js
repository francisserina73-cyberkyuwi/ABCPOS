/**
 * Authentication Module
 * Handles user authentication and authorization
 */

import { supabase } from './supabase-client.js';
import { ROLES } from './config.js';

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user: object, error: string}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get user profile with role
    const profile = await getUserProfile(data.user.id);
    
    if (!profile) {
      await supabase.auth.signOut();
      return { success: false, error: 'User profile not found' };
    }

    if (profile.status !== 'active') {
      await supabase.auth.signOut();
      return { success: false, error: 'Your account is inactive. Please contact administrator.' };
    }

    return { 
      success: true, 
      user: {
        ...data.user,
        profile
      }
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Failed to sign in. Please try again.' };
  }
}

/**
 * Sign up new user (admin only)
 * @param {object} userData - {email, password, username, full_name, role}
 * @returns {Promise<{success: boolean, user: object, error: string}>}
 */
export async function signUp(userData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role || ROLES.STAFF
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Failed to create user. Please try again.' };
  }
}

/**
 * Sign out current user
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    // Redirect to login page
    window.location.href = '/index.html';
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out. Please try again.' };
  }
}

/**
 * Get current user session
 * @returns {Promise<{user: object, session: object}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return { user: null, session: null };
    }

    // Get user profile
    const profile = await getUserProfile(session.user.id);
    
    return { 
      user: {
        ...session.user,
        profile
      }, 
      session 
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, session: null };
  }
}

/**
 * Get user profile from database
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get user profile error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const { user } = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user is admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const { user } = await getCurrentUser();
  return user?.profile?.role === ROLES.ADMIN;
}

/**
 * Check if user has specific role
 * @param {string} role 
 * @returns {Promise<boolean>}
 */
export async function hasRole(role) {
  const { user } = await getCurrentUser();
  return user?.profile?.role === role;
}

/**
 * Require authentication - redirect to login if not authenticated
 * Call this on page load for protected pages
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    window.location.href = '/index.html';
    return false;
  }
  
  return true;
}

/**
 * Require admin role - redirect if not admin
 * Call this on page load for admin-only pages
 */
export async function requireAdmin() {
  const authenticated = await requireAuth();
  
  if (!authenticated) return false;
  
  const admin = await isAdmin();
  
  if (!admin) {
    alert('Access denied. Admin privileges required.');
    window.location.href = '/dashboard.html';
    return false;
  }
  
  return true;
}

/**
 * Listen to auth state changes
 * @param {function} callback - Called when auth state changes
 * @returns {object} subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      const profile = await getUserProfile(session.user.id);
      callback(event, {
        ...session.user,
        profile
      });
    } else {
      callback(event, null);
    }
  });
}

/**
 * Update user password
 * @param {string} newPassword 
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'Failed to update password. Please try again.' };
  }
}

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<{success: boolean, error: string}>}
 */
export async function sendPasswordResetEmail(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Send password reset error:', error);
    return { success: false, error: 'Failed to send password reset email. Please try again.' };
  }
}

