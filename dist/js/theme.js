/**
 * Theme management module
 * Handles dark/light theme switching and persistence
 */

import { $ } from './utils.js';

/**
 * Loads the saved theme from localStorage and applies it
 */
export function loadTheme() {
  const t = localStorage.getItem('theme');
  if (t === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

/**
 * Binds theme toggle button functionality
 */
export function bindThemeToggle() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}
