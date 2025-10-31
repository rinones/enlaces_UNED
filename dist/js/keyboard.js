/**
 * Keyboard shortcuts module
 * Provides keyboard navigation and shortcuts
 */

import { $ } from './utils.js';

const shortcuts = {
  '/': () => {
    // Focus search input
    const search = $('#search-input');
    if (search) {
      search.focus();
      search.select();
    }
  },
  't': () => {
    // Toggle theme
    const themeBtn = $('#theme-toggle');
    if (themeBtn) themeBtn.click();
  },
  'h': () => {
    // Go to home
    window.location.href = '/index.html';
  },
  'u': () => {
    // Go to UNED
    window.location.href = '/uned.html';
  },
  'c': () => {
    // Go to calendar
    window.location.href = '/calendar.html';
  },
  'Escape': () => {
    // Clear search or close modals
    const search = $('#search-input');
    if (search && search.value) {
      search.value = '';
      search.dispatchEvent(new Event('input'));
    }
  }
};

/**
 * Initialize keyboard shortcuts
 */
export function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable) {
      // Allow Escape even in inputs
      if (e.key === 'Escape' && shortcuts['Escape']) {
        shortcuts['Escape']();
      }
      return;
    }

    const key = e.key;
    if (shortcuts[key]) {
      e.preventDefault();
      shortcuts[key]();
    }
  });
}

/**
 * Show keyboard shortcuts help
 */
export function showShortcutsHelp() {
  const helpText = `
Atajos de teclado:
  / - Buscar
  t - Cambiar tema
  h - Ir a inicio
  u - Ir a UNED
  c - Ir a calendario
  Esc - Limpiar búsqueda
  `;
  
  console.info(helpText);
}
