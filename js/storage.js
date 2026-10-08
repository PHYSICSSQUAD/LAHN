import { APP_CONFIG, getClassConfig, isValidClass, CLASS_IDS } from './config.js';
import { DEFAULT_DATA, getDefaultData } from './data.js';

const DB_NAME = 'lahn-media-library';
const DB_VERSION = 1;
const STORE_NAME = 'files';
const mediaUrlCache = new Map();
let databasePromise;

const clone = (value) => JSON.parse(JSON.stringify(value));

// ---------------------------------------------------------------------------
// Per-class learning data: lahn-class-data-v2:<class>
// ---------------------------------------------------------------------------

export function classStorageKey(classId) {
  return `${APP_CONFIG.classStoragePrefix}${classId}`;
}

function normalizeClassData(classId, saved) {
  const base = getDefaultData(classId);
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    version: 2,
    classId,
    // Student names and points were removed from the product: never keep them.
    students: [],
    hymns: Array.isArray(saved.hymns) ? saved.hymns : base.hymns,
    copticLetters: Array.isArray(saved.copticLetters) ? saved.copticLetters : base.copticLetters,
    liturgy: Array.isArray(saved.liturgy) ? saved.liturgy : base.liturgy,
    settings: { ...base.settings, ...(saved.settings || {}) },
    progress: { completed: [], ...(saved.progress || {}) },
  };
}

export function loadData(classId = 'kg1') {
  const safeClass = isValidClass(classId) ? classId : 'kg1';
  try {
    const raw = window.localStorage.getItem(classStorageKey(safeClass));
    if (!raw) return getDefaultData(safeClass);
    return normalizeClassData(safeClass, JSON.parse(raw));
  } catch (error) {
    console.error('Could not load saved learning data:', error);
    return getDefaultData(safeClass);
  }
}

export function saveData(classIdOrData, maybeData) {
  // Supports both saveData(classId, data) and the legacy saveData(data) call shape.
  const classId = typeof classIdOrData === 'string'
    ? classIdOrData
    : (maybeData?.classId && isValidClass(maybeData.classId) ? maybeData.classId : 'kg1');
  const data = typeof classIdOrData === 'string' ? maybeData : classIdOrData;
  const safeClass = isValidClass(classId) ? classId : 'kg1';
  try {
    window.localStorage.setItem(classStorageKey(safeClass), JSON.stringify({ ...data, classId: safeClass, version: 2 }));
    window.dispatchEvent(new CustomEvent('lahn:class-data-updated', { detail: { classId: safeClass } }));
    return true;
  } catch (error) {
    console.error('Could not save learning data:', error);
    const message = error?.name === 'QuotaExceededError'
      ? 'مساحة التخزين ممتلئة. احذف بعض الملفات الكبيرة ثم حاول مرة أخرى.'
      : 'تعذر حفظ التغييرات على هذا الجهاز.';
    throw new Error(message);
  }
}

export function resetData(classId = 'kg1') {
  const safeClass = isValidClass(classId) ? classId : 'kg1';
  const fresh = getDefaultData(safeClass);
  saveData(safeClass, fresh);
  return fresh;
}

export function hasSavedClassData(classId) {
  try {
    return Boolean(window.localStorage.getItem(classStorageKey(classId)));
  } catch {
    return false;
  }
}

export function loadAllClassData() {
  return CLASS_IDS.reduce((result, classId) => {
    result[classId] = loadData(classId);
    return result;
  }, {});
}

export function loadClassSummary() {
  return CLASS_IDS.map((classId) => {
    const config = getClassConfig(classId);
    const data = loadData(classId);
    return {
      classId,
      config,
      counts: {
        hymns: data.hymns.length,
        copticLetters: data.copticLetters.length,
        liturgy: data.liturgy.length,
      },
      saved: hasSavedClassData(classId),
    };
  });
}

// Old single-class links kept their data in lahn-learning-data-v1.
// It is copied once into the kg1 key so nothing is lost after the upgrade.
export function migrateLegacyData() {
  try {
    const legacy = window.localStorage.getItem(APP_CONFIG.legacyStorageKey);
    if (!legacy) return false;
    if (!window.localStorage.getItem(classStorageKey('kg1'))) {
      window.localStorage.setItem(classStorageKey('kg1'), legacy);
    }
    window.localStorage.removeItem(APP_CONFIG.legacyStorageKey);
    return true;
  } catch (error) {
    console.warn('Could not migrate the previous data set:', error);
    return false;
  }
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

export function clearLastClass() {
  try {
    window.localStorage.removeItem(APP_CONFIG.lastClassKey);
  } catch {
    /* ignore storage failures */
  }
}

// ---------------------------------------------------------------------------
// Shared site data: lahn-site-data-v1 (contact page edited by the general admin)
// ---------------------------------------------------------------------------

export const DEFAULT_SITE_DATA = Object.freeze({
  version: 1,
  contact: Object.freeze({
    personName: 'خدام مدرسة الشمامسة',
    role: 'مدرسة شمامسة كنيسة الشهيد العظيم ابي سيفين بحدائق القبة',
    message: 'يسعدنا أن نستقبل أسئلتكم واقتراحاتكم، وأن نساعد كل أسرة في رحلة التعلم.',
    phone: '+201005550100',
    whatsapp: '201005550100',
    email: 'lahn.school@example.com',
    facebook: 'https://www.facebook.com/lahn.school',
    address: 'كنيسة الشهيد العظيم ابي سيفين — حدائق القبة، القاهرة',
    hours: 'الجمعة والسبت: من 9 صباحا إلى 12 ظهرا',
  }),
});

export function loadSiteData() {
  try {
    const raw = window.localStorage.getItem(APP_CONFIG.siteStorageKey);
    if (!raw) return clone(DEFAULT_SITE_DATA);
    const saved = JSON.parse(raw);
    return {
      version: 1,
      ...saved,
      contact: { ...clone(DEFAULT_SITE_DATA.contact), ...(saved.contact || {}) },
    };
  } catch (error) {
    console.error('Could not load saved site data:', error);
    return clone(DEFAULT_SITE_DATA);
  }
}

export function saveSiteData(siteData) {
  try {
    window.localStorage.setItem(APP_CONFIG.siteStorageKey, JSON.stringify({ version: 1, ...siteData }));
    window.dispatchEvent(new CustomEvent('lahn:site-data-updated'));
    return true;
  } catch (error) {
    console.error('Could not save site data:', error);
    throw new Error('تعذر حفظ بيانات الموقع على هذا الجهاز.');
  }
}

export function resetSiteData() {
  const fresh = clone(DEFAULT_SITE_DATA);
  saveSiteData(fresh);
  return fresh;
}

// ---------------------------------------------------------------------------
// Media library (IndexedDB) — shared by all classes, ids stay unique.
// ---------------------------------------------------------------------------

function openMediaDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('هذا المتصفح لا يدعم حفظ الملفات محليا.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('تعذر فتح مساحة الملفات.'));
  });
  return databasePromise;
}

function withStore(mode, operation) {
  return openMediaDatabase().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    let result;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error || new Error('تعذر الوصول إلى الملف.'));
    };
    request.onsuccess = () => { result = request.result; };
    request.onerror = () => fail(request.error);
    transaction.oncomplete = () => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    transaction.onerror = () => fail(transaction.error);
    transaction.onabort = () => fail(transaction.error || new Error('تعذر حفظ الملف.'));
  }));
}

async function optimizeImage(file) {
  if (file.size > APP_CONFIG.limits.imageBytes) {
    throw new Error('حجم الصورة أكبر من 8 ميجابايت. اختر صورة أصغر.');
  }
  if (!('createImageBitmap' in window)) return file;
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1500;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', { alpha: true });
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('تعذر تجهيز الصورة.')), 'image/webp', 0.84);
  });
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`, { type: 'image/webp' });
}

export async function saveMedia(file, kind = 'document') {
  if (!file || !file.size) throw new Error('اختر ملفا أولا.');
  const sizeLimit = kind === 'image' ? APP_CONFIG.limits.imageBytes
    : kind === 'audio' ? APP_CONFIG.limits.audioBytes
      : APP_CONFIG.limits.documentBytes;
  if (file.size > sizeLimit) {
    const sizeMb = Math.round(sizeLimit / 1024 / 1024);
    throw new Error(`حجم الملف أكبر من ${sizeMb} ميجابايت.`);
  }
  let blob = file;
  if (kind === 'image') blob = await optimizeImage(file);
  const id = `media-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const entry = { id, blob, name: blob.name || file.name, type: blob.type || file.type, savedAt: Date.now() };
  await withStore('readwrite', (store) => store.put(entry));
  return id;
}

export async function getMediaUrl(id) {
  if (!id) return '';
  if (mediaUrlCache.has(id)) return mediaUrlCache.get(id);
  const entry = await withStore('readonly', (store) => store.get(id));
  if (!entry?.blob) return '';
  const url = URL.createObjectURL(entry.blob);
  mediaUrlCache.set(id, url);
  return url;
}

export async function deleteMedia(id) {
  if (!id) return;
  const url = mediaUrlCache.get(id);
  if (url) URL.revokeObjectURL(url);
  mediaUrlCache.delete(id);
  await withStore('readwrite', (store) => store.delete(id));
}

export async function hydrateMedia(root = document) {
  const nodes = root.querySelectorAll('[data-asset-id]');
  await Promise.all([...nodes].map(async (node) => {
    if (node.dataset.hydrated === 'true') return;
    node.dataset.hydrated = 'true';
    try {
      const url = await getMediaUrl(node.dataset.assetId);
      if (!url) return;
      if (node.matches('img')) {
        node.addEventListener('load', () => node.closest('.media-art')?.classList.add('has-image'), { once: true });
        node.src = url;
        node.hidden = false;
      } else if (node.matches('audio')) {
        node.src = url;
        node.load();
      } else if (node.matches('[data-asset-link]')) {
        node.href = url;
        node.hidden = false;
      }
    } catch (error) {
      console.warn('Could not load saved media:', error);
    }
  }));
}

export function createId(prefix = 'item') {
  const random = crypto.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

export { DEFAULT_DATA };
