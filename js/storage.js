import { APP_CONFIG, isValidClass } from './config.js';
import { getClassContent } from './data.js';

// The site content is static (js/data.js). The browser only keeps two small
// things: the stars the child collected, and the last class that was opened.

function progressKey(classId) {
  return `${APP_CONFIG.progressStoragePrefix}${classId}`;
}

export function loadProgress(classId = 'kg1') {
  const safeClass = isValidClass(classId) ? classId : 'kg1';
  try {
    const raw = window.localStorage.getItem(progressKey(safeClass));
    if (!raw) return { completed: [] };
    const saved = JSON.parse(raw);
    return { completed: Array.isArray(saved?.completed) ? saved.completed : [] };
  } catch (error) {
    console.warn('Could not read the saved stars:', error);
    return { completed: [] };
  }
}

export function saveProgress(classId, progress) {
  const safeClass = isValidClass(classId) ? classId : 'kg1';
  try {
    const completed = Array.isArray(progress?.completed) ? progress.completed : [];
    window.localStorage.setItem(progressKey(safeClass), JSON.stringify({ completed }));
    return true;
  } catch (error) {
    console.error('Could not save the stars:', error);
    throw new Error('تعذر حفظ النجوم على هذا الجهاز.');
  }
}

// Content + the stars of this browser, ready for the pages to render.
export function loadData(classId = 'kg1') {
  const safeClass = isValidClass(classId) ? classId : 'kg1';
  return { ...getClassContent(safeClass), progress: loadProgress(safeClass) };
}

// ---------------------------------------------------------------------------
// Last opened class: keeps old links without a class working.
// ---------------------------------------------------------------------------

export function getLastClass() {
  try {
    const value = window.localStorage.getItem(APP_CONFIG.lastClassKey);
    return isValidClass(value) ? value : '';
  } catch {
    return '';
  }
}

export function setLastClass(classId) {
  if (!isValidClass(classId)) return;
  try {
    window.localStorage.setItem(APP_CONFIG.lastClassKey, classId);
  } catch {
    /* ignore storage failures */
  }
}

// ---------------------------------------------------------------------------
// One-time cleanup of the data the removed admin panel used to write.
// ---------------------------------------------------------------------------

export function cleanupLegacyStorage() {
  try {
    const { localStorage, sessionStorage } = window;
    localStorage.removeItem(APP_CONFIG.legacyStorageKey);
    localStorage.removeItem(APP_CONFIG.legacySiteKey);
    localStorage.removeItem(APP_CONFIG.legacySessionKey);
    sessionStorage?.removeItem(APP_CONFIG.legacySessionKey);
    Object.keys(localStorage)
      .filter((key) => key.startsWith(APP_CONFIG.legacyClassPrefix))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Could not clean up the old saved data:', error);
  }
  // The uploaded media of the old admin panel lived in IndexedDB.
  try {
    window.indexedDB?.deleteDatabase('lahn-media-library');
  } catch {
    /* ignore */
  }
}
