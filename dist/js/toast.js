/**
 * Toast notification system
 * Shows temporary messages to users
 */

let toastContainer = null;

/**
 * Initialize toast container
 */
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {Object} options - Toast options
 * @param {string} options.type - Type of toast (success, error, info, warning)
 * @param {number} options.duration - Duration in milliseconds (default 3000)
 * @param {boolean} options.dismissible - Whether toast can be dismissed (default true)
 */
export function showToast(message, options = {}) {
  const {
    type = 'info',
    duration = 3000,
    dismissible = true
  } = options;
  
  const container = ensureToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  
  const icon = getIconForType(type);
  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.innerHTML = icon;
  
  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  
  toast.appendChild(iconEl);
  toast.appendChild(messageEl);
  
  if (dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar notificación');
    closeBtn.addEventListener('click', () => removeToast(toast));
    toast.appendChild(closeBtn);
  }
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
  
  return toast;
}

/**
 * Remove a toast
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
  toast.classList.remove('show');
  toast.classList.add('hide');
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} SVG icon
 */
function getIconForType(type) {
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 20h20L12 2z"/><path d="M12 9v4M12 17h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  };
  
  return icons[type] || icons.info;
}

/**
 * Convenience methods
 */
export const toast = {
  success: (message, options) => showToast(message, { ...options, type: 'success' }),
  error: (message, options) => showToast(message, { ...options, type: 'error' }),
  warning: (message, options) => showToast(message, { ...options, type: 'warning' }),
  info: (message, options) => showToast(message, { ...options, type: 'info' })
};
