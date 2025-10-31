/**
 * Help module - displays keyboard shortcuts and tips
 */

import { $ } from './utils.js';

const HELP_CONTENT = `
<div class="help-modal-content">
  <h2>Atajos de Teclado</h2>
  <div class="help-shortcuts">
    <div class="help-shortcut">
      <kbd>/</kbd>
      <span>Enfocar búsqueda</span>
    </div>
    <div class="help-shortcut">
      <kbd>t</kbd>
      <span>Cambiar tema (claro/oscuro)</span>
    </div>
    <div class="help-shortcut">
      <kbd>h</kbd>
      <span>Ir a inicio</span>
    </div>
    <div class="help-shortcut">
      <kbd>u</kbd>
      <span>Ir a UNED</span>
    </div>
    <div class="help-shortcut">
      <kbd>c</kbd>
      <span>Ir a calendario</span>
    </div>
    <div class="help-shortcut">
      <kbd>Esc</kbd>
      <span>Limpiar búsqueda / Cerrar modales</span>
    </div>
    <div class="help-shortcut">
      <kbd>?</kbd>
      <span>Mostrar esta ayuda</span>
    </div>
  </div>
  
  <h3>Características</h3>
  <ul class="help-features">
    <li>🔍 Búsqueda global desde la página de inicio</li>
    <li>📱 Diseño responsive optimizado para móviles</li>
    <li>⚡ Soporte offline con Service Worker</li>
    <li>📊 Estadísticas de uso de enlaces</li>
    <li>♿ Navegación por teclado mejorada</li>
  </ul>
</div>
`;

/**
 * Initialize help functionality
 */
export function initHelp() {
  const helpBtn = $('#help-toggle');
  if (!helpBtn) return;
  
  helpBtn.addEventListener('click', showHelp);
  
  // Also bind to '?' key
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && 
        e.target.tagName !== 'INPUT' && 
        e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      showHelp();
    }
  });
}

/**
 * Show help modal
 */
function showHelp() {
  // Create modal if it doesn't exist
  let modal = $('#help-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'help-modal';
    modal.className = 'help-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'help-modal-title');
    
    const overlay = document.createElement('div');
    overlay.className = 'help-modal-overlay';
    overlay.addEventListener('click', hideHelp);
    
    const content = document.createElement('div');
    content.className = 'help-modal-inner';
    content.innerHTML = HELP_CONTENT;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'help-modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar ayuda');
    closeBtn.addEventListener('click', hideHelp);
    
    content.appendChild(closeBtn);
    modal.appendChild(overlay);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
  
  modal.classList.add('active');
  
  // Trap focus in modal
  const closeBtn = modal.querySelector('.help-modal-close');
  if (closeBtn) closeBtn.focus();
  
  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      hideHelp();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Hide help modal
 */
function hideHelp() {
  const modal = $('#help-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}
