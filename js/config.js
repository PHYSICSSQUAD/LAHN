// Central place for the demo settings of the multi-class version.
// Never treat these browser-side values as secrets.
export const APP_CONFIG = Object.freeze({
  // Legacy single-class key. Kept only for a one-time migration into kg1.
  legacyStorageKey: 'lahn-learning-data-v1',
  // Every class keeps its own learning data under this prefix.
  classStoragePrefix: 'lahn-class-data-v2:',
  // Shared site data (contact page and general settings).
  siteStorageKey: 'lahn-site-data-v1',
  // Remembers the last class the visitor opened, so old links keep working.
  lastClassKey: 'lahn-last-class-v1',
  adminSessionKey: 'lahn-admin-session-v1',
  // Institution name shown in the banner strip at the very top of every page.
  siteBanner: 'مدرسة شمامسة كنيسة الشهيد العظيم ابي سيفين بحدائق القبة',
  // Demo-only general manager account: change here (once) before sharing a demo.
  admin: Object.freeze({
    username: 'admin',
    password: 'ابي سيفين',
  }),
  // Demo-only class manager accounts: each one manages its own class only.
  classAdmins: Object.freeze([
    Object.freeze({ username: 'babyclassadmin', password: 'babyclass123', classId: 'babyclass' }),
    Object.freeze({ username: 'kg1admin', password: 'kg1123', classId: 'kg1' }),
    Object.freeze({ username: 'kg2admin', password: 'kg2123', classId: 'kg2' }),
  ]),
  limits: Object.freeze({
    imageBytes: 8 * 1024 * 1024,
    audioBytes: 18 * 1024 * 1024,
    documentBytes: 12 * 1024 * 1024,
  }),
});

// The three classes share the same site, but each one has its own theme,
// mascot, localStorage key and admin account.
export const CLASS_LIST = Object.freeze([
  Object.freeze({
    id: 'babyclass',
    name: 'Baby Class',
    arabicName: 'فصل البيبي',
    emoji: '🍼',
    theme: 'pink',
    accent: '#ef7fa6',
    accentDark: '#cf5c85',
    pageColor: '#fffafc',
    heroGradient: 'linear-gradient(112deg, #fdeaf3 0%, #fff3f8 46%, #fff4e6 100%)',
    angel: 'assets/images/angel-babyclass.svg',
    angelAlt: 'ملاك لطيف يحمل دبدوبا',
    tagline: 'خطوات صغيرة… وفرح كبير',
    description: 'ألحان قصيرة وحكايات هادئة لأصغر الشمامسة.',
  }),
  Object.freeze({
    id: 'kg1',
    name: 'KG1',
    arabicName: 'تمهيدي أول',
    emoji: '🎈',
    theme: 'mint',
    accent: '#49a78f',
    accentDark: '#2f907b',
    pageColor: '#fbf8f1',
    heroGradient: 'linear-gradient(112deg, #eaf6ef 0%, #f6f9ed 46%, #fff4df 100%)',
    angel: 'assets/images/angel-kg1.svg',
    angelAlt: 'ملاك لطيف يقرأ كتابا',
    tagline: 'نرنم ونتعلم معا',
    description: 'ألحان وحروف قبطية ودروس طقس بخطوات بسيطة.',
  }),
  Object.freeze({
    id: 'kg2',
    name: 'KG2',
    arabicName: 'تمهيدي ثاني',
    emoji: '🎒',
    theme: 'sky',
    accent: '#4f9fd4',
    accentDark: '#3778a8',
    pageColor: '#f9fcff',
    heroGradient: 'linear-gradient(112deg, #e9f3fd 0%, #f2f8ff 46%, #eafaf5 100%)',
    angel: 'assets/images/angel-kg2.svg',
    angelAlt: 'ملاك لطيف يدق الناقوس',
    tagline: 'نكبر خطوة كل يوم',
    description: 'ألحان وطقس وحروف قبطية لشمامسة أكبر.',
  }),
]);

export const CLASS_IDS = Object.freeze(CLASS_LIST.map((item) => item.id));

export function getClassConfig(classId) {
  return CLASS_LIST.find((item) => item.id === classId) || null;
}

export function isValidClass(classId) {
  return CLASS_IDS.includes(classId);
}

export function getClassLabel(classId) {
  const config = getClassConfig(classId);
  return config ? `${config.name} · ${config.arabicName}` : '';
}
