/**
 * Utility Functions
 * General helper functions used across the application
 */

/**
 * Format number as currency (Philippine Peso)
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount || 0);
}

/**
 * Format date to readable string
 * @param {string|Date} date 
 * @param {string} format - 'short', 'long', 'time', 'datetime'
 * @returns {string}
 */
export function formatDate(date, format = 'short') {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-PH');
    case 'long':
      return d.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return d.toLocaleTimeString('en-PH');
    case 'datetime':
      return `${d.toLocaleDateString('en-PH')} ${d.toLocaleTimeString('en-PH')}`;
    default:
      return d.toLocaleDateString('en-PH');
  }
}

/**
 * Show toast notification
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {number} duration - milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toasts
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add toast styles if not already added
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .toast-success { background-color: #10b981; }
      .toast-error { background-color: #ef4444; }
      .toast-warning { background-color: #f59e0b; }
      .toast-info { background-color: #3b82f6; }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Remove toast after duration
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show loading spinner
 * @param {string} message 
 * @returns {HTMLElement} spinner element
 */
export function showLoading(message = 'Loading...') {
  const spinner = document.createElement('div');
  spinner.id = 'loading-spinner';
  spinner.innerHTML = `
    <div class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    </div>
  `;

  // Add spinner styles if not already added
  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .loading-spinner {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(spinner);
  return spinner;
}

/**
 * Hide loading spinner
 */
export function hideLoading() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.remove();
  }
}

/**
 * Confirm dialog
 * @param {string} message 
 * @param {string} title 
 * @returns {Promise<boolean>}
 */
export async function confirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <div class="confirm-overlay">
        <div class="confirm-box">
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="confirm-buttons">
            <button class="btn btn-cancel">Cancel</button>
            <button class="btn btn-confirm">Confirm</button>
          </div>
        </div>
      </div>
    `;

    // Add confirm dialog styles if not already added
    if (!document.getElementById('confirm-styles')) {
      const style = document.createElement('style');
      style.id = 'confirm-styles';
      style.textContent = `
        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-center: center;
          z-index: 9999;
        }
        .confirm-box {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          max-width: 400px;
          text-align: center;
        }
        .confirm-box h3 {
          margin: 0 0 15px 0;
        }
        .confirm-box p {
          margin: 0 0 20px 0;
        }
        .confirm-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-cancel {
          background-color: #e5e7eb;
          color: #374151;
        }
        .btn-cancel:hover {
          background-color: #d1d5db;
        }
        .btn-confirm {
          background-color: #3b82f6;
          color: white;
        }
        .btn-confirm:hover {
          background-color: #2563eb;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(dialog);

    const btnCancel = dialog.querySelector('.btn-cancel');
    const btnConfirm = dialog.querySelector('.btn-confirm');

    btnCancel.onclick = () => {
      dialog.remove();
      resolve(false);
    };

    btnConfirm.onclick = () => {
      dialog.remove();
      resolve(true);
    };
  });
}

/**
 * Debounce function
 * @param {function} func 
 * @param {number} wait 
 * @returns {function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html 
 * @returns {string}
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
    return true;
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    showToast('Failed to copy to clipboard', 'error');
    return false;
  }
}

/**
 * Generate order number
 * @returns {string}
 */
export function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

/**
 * Validate email
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number (Philippine format)
 * @param {string} phone 
 * @returns {boolean}
 */
export function validatePhone(phone) {
  // Philippine mobile: 09XX-XXX-XXXX or +639XX-XXX-XXXX
  const re = /^(\+63|0)9\d{9}$/;
  return re.test(phone.replace(/[^0-9+]/g, ''));
}

/**
 * Format phone number
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhone(phone) {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+639')) {
    return cleaned.replace(/(\+639)(\d{2})(\d{3})(\d{4})/, '$1-$2-$3-$4');
  } else if (cleaned.startsWith('09')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

/**
 * Export data to CSV
 * @param {array} data 
 * @param {string} filename 
 */
export function exportToCSV(data, filename) {
  if (!data || !data.length) {
    showToast('No data to export', 'warning');
    return;
  }

  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      return typeof value === 'string' && (value.includes(',') || value.includes('"'))
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    });
    csv += values.join(',') + '\n';
  });

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  showToast('Data exported successfully', 'success');
}

/**
 * Print element
 * @param {string} elementId 
 */
export function printElement(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    showToast('Element not found', 'error');
    return;
  }

  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f3f4f6; }
  `);
  printWindow.document.write('</style></head><body>');
  printWindow.document.write(element.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

