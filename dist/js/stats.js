/**
 * Statistics tracking module
 * Tracks link clicks and provides usage analytics
 */

const STORAGE_KEY = 'enlaces:stats';

/**
 * Get statistics from localStorage
 * @returns {Object} Statistics object
 */
export function getStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { clicks: {}, lastVisit: null, totalClicks: 0 };
  } catch (_) {
    return { clicks: {}, lastVisit: null, totalClicks: 0 };
  }
}

/**
 * Save statistics to localStorage
 * @param {Object} stats - Statistics object
 */
function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}

/**
 * Track a link click
 * @param {string} url - URL that was clicked
 * @param {string} title - Title of the link
 */
export function trackLinkClick(url, title) {
  const stats = getStats();
  
  if (!stats.clicks[url]) {
    stats.clicks[url] = {
      count: 0,
      title: title,
      lastClick: null
    };
  }
  
  stats.clicks[url].count++;
  stats.clicks[url].lastClick = Date.now();
  stats.totalClicks++;
  stats.lastVisit = Date.now();
  
  saveStats(stats);
}

/**
 * Get top clicked links
 * @param {number} limit - Number of results to return
 * @returns {Array} Array of top links
 */
export function getTopLinks(limit = 10) {
  const stats = getStats();
  
  return Object.entries(stats.clicks)
    .map(([url, data]) => ({ url, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get recently clicked links
 * @param {number} limit - Number of results to return
 * @returns {Array} Array of recent links
 */
export function getRecentLinks(limit = 10) {
  const stats = getStats();
  
  return Object.entries(stats.clicks)
    .map(([url, data]) => ({ url, ...data }))
    .filter(item => item.lastClick)
    .sort((a, b) => b.lastClick - a.lastClick)
    .slice(0, limit);
}

/**
 * Clear all statistics
 */
export function clearStats() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export statistics as JSON
 * @returns {string} JSON string of statistics
 */
export function exportStats() {
  const stats = getStats();
  return JSON.stringify(stats, null, 2);
}

/**
 * Import statistics from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} Success status
 */
export function importStats(jsonString) {
  try {
    const stats = JSON.parse(jsonString);
    saveStats(stats);
    return true;
  } catch (e) {
    console.error('Error importing stats:', e);
    return false;
  }
}
