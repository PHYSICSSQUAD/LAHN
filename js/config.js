// Central place for the settings of the multi-class version.
// The site is read-only for visitors: there is no admin panel and no login.
export const APP_CONFIG = Object.freeze({
  // Legacy keys from older versions. Kept only so they can be cleaned up once.
  legacyStorageKey: 'lahn-learning-data-v1',
  legacyClassPrefix: 'lahn-class-data-v2:',
  legacySiteKey: 'lahn-site-data-v1',
  legacySessionKey: 'lahn-admin-session-v1',
  // Stars collected by the child, per class.
  progressStoragePrefix: 'lahn-progress-v1:',
  // Remembers the last class the visitor opened, so old links keep working.
  lastClassKey: 'lahn-last-class-v1',
  // Institution name shown in the banner strip at the very top of every page.
  siteBanner: 'مدرسة شمامسة كنيسة الشهيد العظيم ابي سيفين بحدائق القبة',
});

// Contact details of the school (static content, shown in #/contact).
export const SITE_CONTACT = Object.freeze({
  personName: 'خدام مدرسة الشمامسة',
  role: 'مدرسة شمامسة كنيسة الشهيد العظيم ابي سيفين بحدائق القبة',
  message: 'يسعدنا أن نستقبل أسئلتكم واقتراحاتكم، وأن نساعد كل أسرة في رحلة التعلم.',
  phone: '+201005550100',
  whatsapp: '201005550100',
  email: 'lahn.school@example.com',
  facebook: 'https://www.facebook.com/lahn.school',
  address: 'كنيسة الشهيد العظيم ابي سيفين — حدائق القبة، القاهرة',
  hours: 'الجمعة والسبت: من 9 صباحا إلى 12 ظهرا',
});

// The three classes share the same site, but each one has its own theme,
// mascot and seed content.
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
