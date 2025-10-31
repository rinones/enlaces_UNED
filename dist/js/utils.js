/**
 * DOM utility functions and data helpers
 */

/**
 * Query selector shorthand
 * @param {string} sel - CSS selector
 * @returns {Element|null} First matching element
 */
export function $(sel) { 
  return document.querySelector(sel); 
}

/**
 * Query selector all shorthand
 * @param {string} sel - CSS selector
 * @returns {Array<Element>} Array of matching elements
 */
export function $all(sel) { 
  return Array.prototype.slice.call(document.querySelectorAll(sel)); 
}

/**
 * Fetch and parse JSON with error handling
 * @param {string} path - Path to JSON file
 * @returns {Promise<any|null>} Parsed JSON or null on error
 */
export function fetchJSON(path) { 
  return fetch(path, { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .catch(() => null); 
}

/**
 * Get nested property from object using dot notation
 * @param {Object} obj - Source object
 * @param {string} keyPath - Dot-separated path (e.g., 'user.name.first')
 * @returns {any|null} Value at path or null
 */
export function getByKeyPath(obj, keyPath) { 
  try { 
    if (!obj || !keyPath) return null; 
    return keyPath.split('.').reduce((acc, k) => acc && acc[k], obj);
  } catch (_) { 
    return null; 
  } 
}

/**
 * Infer links key from current page path
 * @returns {string} Key name (home, travel, content)
 */
export function inferLinksKeyFromPath() { 
  const page = (location.pathname || '').split('/').pop() || 'index.html'; 
  if (page === 'index.html' || page === '') return 'home'; 
  if (page === 'travel.html') return 'travel'; 
  if (page === 'contenido.html') return 'content'; 
  return 'home'; 
}

/**
 * Infer subject slug from URL hash
 * @returns {string|null} Subject slug or null
 */
export function inferSubjectFromPath() { 
  return null; 
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
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
