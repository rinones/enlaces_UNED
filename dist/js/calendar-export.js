/**
 * Calendar export/import utilities
 * Allows users to backup and restore calendar events
 */

/**
 * Export calendar events to JSON
 * @returns {string} JSON string of all calendar events
 */
export function exportCalendarEvents() {
  const events = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('notes:')) {
      try {
        const value = localStorage.getItem(key);
        events[key] = JSON.parse(value);
      } catch (e) {
        console.error(`Error parsing ${key}:`, e);
      }
    }
  }
  
  return JSON.stringify(events, null, 2);
}

/**
 * Import calendar events from JSON
 * @param {string} jsonString - JSON string containing events
 * @param {boolean} merge - If true, merge with existing events; if false, replace
 * @returns {Object} Import result with success status and count
 */
export function importCalendarEvents(jsonString, merge = false) {
  try {
    const events = JSON.parse(jsonString);
    let count = 0;
    
    // Clear existing notes if not merging
    if (!merge) {
      clearAllCalendarEvents();
    }
    
    for (const [key, value] of Object.entries(events)) {
      if (key.startsWith('notes:')) {
        if (merge) {
          // Merge with existing events
          const existing = localStorage.getItem(key);
          if (existing) {
            try {
              const existingArr = JSON.parse(existing);
              const newArr = Array.isArray(value) ? value : [];
              const merged = [...existingArr, ...newArr];
              localStorage.setItem(key, JSON.stringify(merged));
            } catch (e) {
              localStorage.setItem(key, JSON.stringify(value));
            }
          } else {
            localStorage.setItem(key, JSON.stringify(value));
          }
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
        count++;
      }
    }
    
    return { success: true, count };
  } catch (e) {
    console.error('Error importing calendar events:', e);
    return { success: false, error: e.message };
  }
}

/**
 * Clear all calendar events
 */
export function clearAllCalendarEvents() {
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('notes:')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  return keysToRemove.length;
}

/**
 * Download calendar events as a file
 * @param {string} filename - Name for the downloaded file
 */
export function downloadCalendarEvents(filename = 'calendar-events.json') {
  const json = exportCalendarEvents();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export calendar to iCalendar format (.ics)
 * @returns {string} iCalendar format string
 */
export function exportToICS() {
  const events = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('notes:')) {
      const dateStr = key.slice(6); // Remove 'notes:' prefix
      try {
        const notesArray = JSON.parse(localStorage.getItem(key) || '[]');
        notesArray.forEach(note => {
          events.push({
            date: dateStr,
            title: note.text || note.title || 'Evento',
            link: note.link || ''
          });
        });
      } catch (e) {
        console.error(`Error parsing ${key}:`, e);
      }
    }
  }
  
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Enlaces Calendar//ES',
    'CALSCALE:GREGORIAN'
  ];
  
  events.forEach(event => {
    const dateStr = event.date.replace(/-/g, '');
    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`DTSTART:${dateStr}`);
    icsLines.push(`SUMMARY:${event.title}`);
    if (event.link) {
      icsLines.push(`URL:${event.link}`);
    }
    icsLines.push(`UID:${dateStr}-${Math.random().toString(36).substr(2, 9)}`);
    icsLines.push('END:VEVENT');
  });
  
  icsLines.push('END:VCALENDAR');
  
  return icsLines.join('\r\n');
}

/**
 * Download calendar as iCalendar file
 * @param {string} filename - Name for the downloaded file
 */
export function downloadICS(filename = 'calendar.ics') {
  const ics = exportToICS();
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
