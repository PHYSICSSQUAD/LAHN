import { APP_CONFIG } from './config.js';
import { DEFAULT_DATA } from './data.js';

const DB_NAME = 'lahn-media-library';
const DB_VERSION = 1;
const STORE_NAME = 'files';
const mediaUrlCache = new Map();
let databasePromise;

const clone = (value) => JSON.parse(JSON.stringify(value));

export function loadData() {
  try {
    const raw = window.localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) return clone(DEFAULT_DATA);
    const saved = JSON.parse(raw);
    return {
      ...clone(DEFAULT_DATA),
      ...saved,
      students: Array.isArray(saved.students) ? saved.students : clone(DEFAULT_DATA.students),
      hymns: Array.isArray(saved.hymns) ? saved.hymns : clone(DEFAULT_DATA.hymns),
      copticLetters: Array.isArray(saved.copticLetters) ? saved.copticLetters : clone(DEFAULT_DATA.copticLetters),
      liturgy: Array.isArray(saved.liturgy) ? saved.liturgy : clone(DEFAULT_DATA.liturgy),
      settings: { ...clone(DEFAULT_DATA.settings), ...(saved.settings || {}) },
      progress: { completed: [], ...(saved.progress || {}) },
    };
  } catch (error) {
    console.error('Could not load saved learning data:', error);
    return clone(DEFAULT_DATA);
  }
}

export function saveData(data) {
  try {
    window.localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('lahn:data-updated'));
    return true;
  } catch (error) {
    console.error('Could not save learning data:', error);
    const message = error?.name === 'QuotaExceededError'
      ? 'مساحة التخزين ممتلئة. احذف بعض الملفات الكبيرة ثم حاول مرة أخرى.'
      : 'تعذّر حفظ التغييرات على هذا الجهاز.';
    throw new Error(message);
  }
}

export function resetData() {
  const fresh = clone(DEFAULT_DATA);
  saveData(fresh);
  return fresh;
}

function openMediaDatabase() {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('هذا المتصفح لا يدعم حفظ الملفات محليًا.'));
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
    request.onerror = () => reject(request.error || new Error('تعذّر فتح مساحة الملفات.'));
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
      reject(error || new Error('تعذّر الوصول إلى الملف.'));
    };
    request.onsuccess = () => { result = request.result; };
    request.onerror = () => fail(request.error);
    transaction.oncomplete = () => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    transaction.onerror = () => fail(transaction.error);
    transaction.onabort = () => fail(transaction.error || new Error('تعذّر حفظ الملف.'));
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
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('تعذّر تجهيز الصورة.')), 'image/webp', 0.84);
  });
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`, { type: 'image/webp' });
}

export async function saveMedia(file, kind = 'document') {
  if (!file || !file.size) throw new Error('اختر ملفًا أولًا.');
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
