/*
 * Script para la interactividad de la página Mergesort
 * Añade funcionalidad de colapsar/expandir a los pasos de la traza
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Busca todos los títulos que actúan como interruptores
    // Usamos un selector que sea específico de esta página
    const toggles = document.querySelectorAll('.mergesort-steps .step-toggle');

    toggles.forEach(toggle => {
        // Busca el contenido asociado
        const content = toggle.nextElementSibling;
        
        // Asegura que el siguiente elemento es un contenido de paso
        if (content && content.classList.contains('step__content')) {
            // Oculta todos los contenidos excepto el del Nivel 0
            const parentStep = toggle.closest('.step');
            if (!parentStep.classList.contains('step-level-0')) {
                content.style.display = 'none';
                toggle.textContent = '▶️' + toggle.textContent.substring(1); // Cambia icono
            } else {
                // Asegúrate de que el primer nivel esté visible y con el icono correcto
                content.style.display = 'block';
                toggle.textContent = '🔽' + toggle.textContent.substring(1);
            }
        }
        
        // Añade el evento de clic
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            if (content && content.classList.contains('step__content')) {
                // Comprueba el estado actual y lo invierte
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                
                // Actualiza el icono
                toggle.textContent = (isHidden ? '🔽' : '▶️') + toggle.textContent.substring(1);
            }
        });
    });
});