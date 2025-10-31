/**
 * Data validation utilities
 * Validates JSON data structures and provides fallbacks
 */

/**
 * Validate a link object
 * @param {Object} link - Link object to validate
 * @returns {Object} Validated and sanitized link object
 */
export function validateLink(link) {
  if (!link || typeof link !== 'object') {
    return null;
  }
  
  // Required fields
  if (!link.url || typeof link.url !== 'string') {
    console.warn('Invalid link: missing or invalid URL', link);
    return null;
  }
  
  // Sanitize and set defaults
  return {
    title: (link.title && typeof link.title === 'string') ? link.title : 'Sin título',
    url: link.url,
    description: (link.description && typeof link.description === 'string') ? link.description : '',
    icon: (link.icon && typeof link.icon === 'string') ? link.icon : '',
    section: (link.section && typeof link.section === 'string') ? link.section : '',
    sectionColor: (link.sectionColor && typeof link.sectionColor === 'string') ? link.sectionColor : ''
  };
}

/**
 * Validate an array of links
 * @param {Array} links - Array of link objects
 * @returns {Array} Array of validated links (invalid ones filtered out)
 */
export function validateLinks(links) {
  if (!Array.isArray(links)) {
    console.warn('Invalid links data: expected array, got', typeof links);
    return [];
  }
  
  return links
    .map(validateLink)
    .filter(Boolean);
}

/**
 * Validate an activity object
 * @param {Object} activity - Activity object to validate
 * @returns {Object} Validated activity object
 */
export function validateActivity(activity) {
  if (!activity || typeof activity !== 'object') {
    return null;
  }
  
  // Required fields
  if (!activity.date && !activity.ymd) {
    console.warn('Invalid activity: missing date', activity);
    return null;
  }
  
  const dateStr = activity.date || activity.ymd;
  
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.warn('Invalid activity: invalid date format', activity);
    return null;
  }
  
  return {
    date: dateStr,
    ymd: dateStr,
    title: (activity.title || activity.text || 'Actividad'),
    link: (activity.link && typeof activity.link === 'string') ? activity.link : ''
  };
}

/**
 * Validate an array of activities
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Array of validated activities
 */
export function validateActivities(activities) {
  if (!Array.isArray(activities)) {
    console.warn('Invalid activities data: expected array, got', typeof activities);
    return [];
  }
  
  return activities
    .map(validateActivity)
    .filter(Boolean);
}

/**
 * Validate UNED subjects data
 * @param {Array} subjects - Array of subject groups
 * @returns {Array} Array of validated subject groups
 */
export function validateUnedSubjects(subjects) {
  if (!Array.isArray(subjects)) {
    console.warn('Invalid UNED subjects data: expected array');
    return [];
  }
  
  return subjects.map(group => {
    if (!group || typeof group !== 'object') {
      return null;
    }
    
    return {
      curso: (typeof group.curso === 'number') ? group.curso : 0,
      cuatrimestre: (typeof group.cuatrimestre === 'number') ? group.cuatrimestre : 0,
      asignaturas: Array.isArray(group.asignaturas) 
        ? group.asignaturas.map(asig => ({
            nombre: asig.nombre || 'Sin nombre',
            href: asig.href || '#'
          }))
        : []
    };
  }).filter(Boolean);
}

/**
 * Sanitize HTML to prevent XSS in user-generated content
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // For now, we allow SVG icons but strip script tags
  // In a production app, use a proper sanitization library like DOMPurify
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}
