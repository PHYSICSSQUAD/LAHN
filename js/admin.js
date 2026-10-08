import { APP_CONFIG, CLASS_LIST, getClassConfig } from './config.js';
import { getDefaultData } from './data.js';
import {
  createId, deleteMedia, loadClassSummary, loadData, resetData, resetSiteData, saveData, saveMedia, saveSiteData,
} from './storage.js';
import { renderClassSwitcher } from './components.js';
import { escapeHTML, safeYouTubeUrl, sortByOrder, facebookHref, mailtoHref } from './utils.js';

const sectionConfig = {
  hymns: {
    title: 'الألحان', singular: 'لحن', icon: '🎵', collection: 'hymns',
    fields: [
      { key: 'title', label: 'اسم اللحن', type: 'text', required: true, placeholder: 'لحن جديد' },
      { key: 'description', label: 'وصف قصير', type: 'textarea', placeholder: 'جملة بسيطة للأطفال' },
      { key: 'icon', label: 'أيقونة (إيموجي)', type: 'text', placeholder: '🎵', defaultValue: '🎵' },
      { key: 'lyrics', label: 'الكلمات', type: 'textarea', rows: 5, placeholder: 'اكتب الكلمات، واترك سطرا فارغا بين الفقرات.' },
      { key: 'notes', label: 'ملاحظات للأهل', type: 'textarea', rows: 3 },
      { key: 'youtubeUrl', label: 'رابط يوتيوب', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'نقبل روابط youtube.com و youtu.be فقط.' },
      { key: 'order', label: 'ترتيب العرض', type: 'number', min: 1, required: true, order: true },
      { key: 'imageAsset', label: 'صورة اللحن', type: 'file', assetKind: 'image', accept: 'image/*', help: 'تصغر الصور الكبيرة تلقائيا (حتى 8 ميجابايت قبل الضغط).' },
      { key: 'audioAsset', label: 'التسجيل الأصلي (اسمع اللحن)', type: 'file', assetKind: 'audio', accept: 'audio/*', sourceKey: 'audioSrc', help: 'صوت حتى 18 ميجابايت.' },
      { key: 'recordingAsset', label: 'تسجيل الأسرة (تسجيلي)', type: 'file', assetKind: 'audio', accept: 'audio/*', sourceKey: 'recordingSrc', help: 'يمكن إضافة تسجيل آخر لهذا اللحن.' },
    ],
  },
  copticLetters: {
    title: 'الحروف القبطية', singular: 'حرف', icon: 'Ⲁ', collection: 'copticLetters',
    fields: [
      { key: 'glyph', label: 'شكل الحرف القبطي', type: 'text', required: true, placeholder: 'Ⲁ' },
      { key: 'transliteration', label: 'اسم الحرف', type: 'text', required: true, placeholder: 'Alpha' },
      { key: 'name', label: 'اسمه بالعربية', type: 'text', placeholder: 'ألفا' },
      { key: 'word', label: 'كلمة المثال', type: 'text', placeholder: 'ⲁⲅⲓⲟⲥ' },
      { key: 'translation', label: 'الترجمة أو معنى المثال', type: 'text', placeholder: 'قدوس' },
      { key: 'note', label: 'ملاحظة للأهل', type: 'textarea', rows: 3 },
      { key: 'youtubeUrl', label: 'رابط شرح يوتيوب (اختياري)', type: 'url', placeholder: 'https://youtu.be/…', help: 'رابط آمن من يوتيوب فقط.' },
      { key: 'order', label: 'ترتيب الحرف', type: 'number', min: 1, required: true, order: true },
      { key: 'imageAsset', label: 'صورة أو رسم للحرف', type: 'file', assetKind: 'image', accept: 'image/*' },
      { key: 'audioAsset', label: 'تسجيل نطق الحرف', type: 'file', assetKind: 'audio', accept: 'audio/*', sourceKey: 'audioSrc' },
      { key: 'worksheetAsset', label: 'ورقة عمل إضافية (PDF أو صورة)', type: 'file', assetKind: 'document', accept: '.pdf,application/pdf,image/*' },
    ],
  },
  liturgy: {
    title: 'دروس الطقس', singular: 'درس', icon: '⛪', collection: 'liturgy',
    fields: [
      { key: 'title', label: 'عنوان الدرس', type: 'text', required: true, placeholder: 'حكاية جديدة' },
      { key: 'description', label: 'وصف قصير', type: 'textarea', placeholder: 'ماذا سيتعلم الطفل؟' },
      { key: 'icon', label: 'أيقونة (إيموجي)', type: 'text', placeholder: '⛪', defaultValue: '⛪' },
      { key: 'body', label: 'نص الدرس', type: 'textarea', rows: 8, placeholder: 'اكتب فقرات قصيرة بلغة بسيطة.' },
      { key: 'notes', label: 'ملاحظات للأهل', type: 'textarea', rows: 3 },
      { key: 'youtubeUrl', label: 'رابط يوتيوب (اختياري)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'نقبل روابط youtube.com و youtu.be فقط.' },
      { key: 'order', label: 'ترتيب العرض', type: 'number', min: 1, required: true, order: true },
      { key: 'imageAsset', label: 'صورة توضيحية', type: 'file', assetKind: 'image', accept: 'image/*' },
      { key: 'audioAsset', label: 'تسجيل صوتي للدرس', type: 'file', assetKind: 'audio', accept: 'audio/*', sourceKey: 'audioSrc' },
    ],
  },
};

const CLASS_SECTIONS = [
  ['overview', 'نظرة عامة', '⌂'],
  ['hymns', 'الألحان', '🎵'],
  ['copticLetters', 'الحروف القبطية', 'Ⲁ'],
  ['liturgy', 'دروس الطقس', '⛪'],
  ['settings', 'الإعدادات والنسخ', '⚙️'],
];

const CONTACT_SECTION = ['contact', 'صفحة التواصل', '✉️'];

const boundRoots = new WeakSet();
const rootContexts = new WeakMap();

function isGeneralSession(session) {
  return session?.role === 'general';
}

function sectionsFor(session) {
  return isGeneralSession(session) ? [...CLASS_SECTIONS, CONTACT_SECTION] : [...CLASS_SECTIONS];
}

// ---------------------------------------------------------------------------
// Login gate
// ---------------------------------------------------------------------------

function renderLogin({ session, targetClass = '', classScoped = false } = {}) {
  const classConfig = classScoped ? getClassConfig(targetClass) : null;
  const heading = classConfig
    ? `أهلا بكم في<br /><span>لوحة فصل ${escapeHTML(classConfig.name)}</span> ${escapeHTML(classConfig.emoji)}`
    : 'أهلا بكم في<br /><span>لوحة المدير العام</span> 🔐';
  const intro = classConfig
    ? `من هنا يدير خادم ${escapeHTML(classConfig.name)} ألحان الفصل وحروفه ودروسه.`
    : 'من هنا يدير المدير العام كل الفصول، ويعدل صفحة التواصل. مديرو الفصول يدخلون من لوحة فصلهم.';
  return `<div class="admin-gate page-enter"><div class="admin-gate-copy"><span class="eyebrow">دخول خاص بالمديرين</span><h1>${heading}</h1><p>${intro}</p><div class="gate-note"><span aria-hidden="true">🧡</span><div><strong>كل فصل له لوحته وبياناته</strong><small>${classConfig ? `حساب ${escapeHTML(classConfig.name)} يعدل هذا الفصل فقط.` : 'المدير العام يعدل كل الفصول وصفحة التواصل.'}</small></div></div><a class="back-home-link" href="#/">← كل الفصول</a></div><div class="admin-login-card"><div class="login-lock" aria-hidden="true">🔑</div><span class="eyebrow">تسجيل الدخول</span><h2>مرحبا بعودتكم</h2><p>اكتبوا اسم المستخدم وكلمة المرور.</p><form data-admin-login novalidate data-login-scope="${classScoped ? 'class' : 'general'}" data-login-class="${escapeHTML(targetClass)}"><label class="form-label" for="admin-username">اسم المستخدم</label><input id="admin-username" name="username" type="text" autocomplete="username" required placeholder="اسم المستخدم" /><label class="form-label" for="admin-password">كلمة المرور</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" /><p class="login-error" data-login-error role="alert" hidden></p><button class="button button-primary button-wide login-submit" type="submit">دخول لوحة الإدارة <span aria-hidden="true">←</span></button></form><div class="login-hint"><span aria-hidden="true">🗂️</span> حسابات الفصول: <b>babyclassadmin</b> و<b>kg1admin</b> و<b>kg2admin</b>.</div><div class="login-security-note"><span aria-hidden="true">🛡️</span> نسخة العرض لا تستخدم تسجيل دخول آمنا للخوادم. لا تنشروا كلمات مرور حقيقية هنا.</div></div></div>`;
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function renderOverview(data, { session, targetClass }) {
  const classConfig = getClassConfig(targetClass);
  const counts = [
    ['hymns', 'الألحان', '🎵', data.hymns.length],
    ['copticLetters', 'الحروف', 'Ⲁ', data.copticLetters.length],
    ['liturgy', 'دروس الطقس', '⛪', data.liturgy.length],
  ];
  const summary = isGeneralSession(session)
    ? `<div class="admin-classes-grid">${loadClassSummary().map((entry) => `<button class="admin-class-card ${entry.classId === targetClass ? 'is-active' : ''}" type="button" data-admin-class="${entry.classId}"><span class="admin-class-emoji" aria-hidden="true">${escapeHTML(entry.config.emoji)}</span><span class="admin-class-name">${escapeHTML(entry.config.name)}</span><small>${entry.counts.hymns} لحن · ${entry.counts.copticLetters} حرف · ${entry.counts.liturgy} درس</small><span class="admin-class-link">${entry.saved ? 'بيانات محفوظة' : 'بيانات البداية'} <span aria-hidden="true">←</span></span></button>`).join('')}</div>`
    : '';
  return `<div class="admin-overview"><div class="admin-welcome"><div><span class="eyebrow">${escapeHTML(classConfig.name)} · ${escapeHTML(classConfig.arabicName)}</span><h2>أهلا بكم 👋</h2><p>كل شيء جاهز لتصنعوا رحلة تعلم أجمل${isGeneralSession(session) ? ' — اختاروا الفصل الذي تريدون تعديله من الشريط أعلى الصفحة.' : ` لفصل ${escapeHTML(classConfig.name)}.`}</p></div><span class="admin-welcome-art" aria-hidden="true">${escapeHTML(classConfig.emoji)}</span></div>${summary}<div class="admin-stats-grid">${counts.map(([tab, label, icon, count]) => `<button class="admin-stat-card stat-${tab}" type="button" data-admin-tab="${tab}"><span class="stat-icon" aria-hidden="true">${icon}</span><span class="stat-number">${count}</span><span class="stat-label">${label}</span><span class="stat-arrow" aria-hidden="true">←</span></button>`).join('')}</div><div class="admin-overview-lower"><div class="admin-hint-card"><span class="admin-hint-icon" aria-hidden="true">✨</span><div><h3>ابدأوا بخطوة صغيرة</h3><p>حدثوا تسجيلا أو أضيفوا درسا واحدا. كل ما تحفظونه يبقى على هذا المتصفح بعد إعادة التحميل، ولكل فصل بياناته منفصلة عن باقي الفصول.</p></div></div><div class="admin-safety-card"><span aria-hidden="true">🔒</span><div><strong>ملاحظة مهمة عن الأمان</strong><p>وضع العرض محلي لهذا الجهاز فقط، وليس مناسبا لحفظ بيانات أطفال حقيقية.</p></div></div></div></div>`;
}

function getItems(data, type) {
  const list = data[sectionConfig[type].collection] || [];
  return sortByOrder(list);
}

function getItemMain(type, item) {
  if (type === 'copticLetters') return `${item.glyph || ''} ${item.transliteration || item.name || 'حرف جديد'}`;
  return item.title || 'عنصر جديد';
}

function getItemSubline(type, item, index) {
  if (type === 'hymns') return item.description || 'لا يوجد وصف بعد';
  if (type === 'copticLetters') return [item.name, item.word ? `مثال: ${item.word}` : 'لا يوجد مثال بعد'].filter(Boolean).join(' · ');
  return item.description || 'لا يوجد وصف بعد';
}

function renderList(data, type, classId) {
  const config = sectionConfig[type];
  const items = getItems(data, type);
  const classConfig = getClassConfig(classId);
  return `<section class="admin-list-section"><div class="admin-section-title"><div><span class="eyebrow">إدارة محتوى ${escapeHTML(classConfig.name)}</span><h2>${config.icon} ${config.title}</h2><p>أضيفوا المحتوى وعدلوا ترتيبه بسهولة.</p></div><button class="button button-primary admin-add-button" type="button" data-add="${type}"><span aria-hidden="true">＋</span> إضافة ${config.singular}</button></div>${items.length > 4 ? `<label class="admin-search"><span aria-hidden="true">⌕</span><input type="search" data-admin-search placeholder="ابحث في ${config.title}…" aria-label="ابحث في ${config.title}" /></label>` : ''}<div class="admin-items-grid" data-admin-items>${items.length ? items.map((item, index) => `<article class="admin-item-card" data-searchable="${escapeHTML(`${getItemMain(type, item)} ${getItemSubline(type, item, index)}`).toLowerCase()}"><div class="admin-item-icon" aria-hidden="true">${escapeHTML(item.avatar || item.icon || item.glyph || config.icon)}</div><div class="admin-item-copy"><strong>${escapeHTML(getItemMain(type, item))}</strong><small>${escapeHTML(getItemSubline(type, item, index))}</small></div><div class="admin-item-actions"><button class="icon-action edit-action" type="button" data-edit="${escapeHTML(type)}:${escapeHTML(item.id)}" aria-label="تعديل ${escapeHTML(getItemMain(type, item))}" title="تعديل">✎</button><button class="icon-action delete-action" type="button" data-delete="${escapeHTML(type)}:${escapeHTML(item.id)}" aria-label="حذف ${escapeHTML(getItemMain(type, item))}" title="حذف">×</button></div></article>`).join('') : `<div class="admin-empty-state"><span aria-hidden="true">${config.icon}</span><strong>لا يوجد محتوى بعد</strong><p>ابدأوا بإضافة ${config.singular} جديد لفصل ${escapeHTML(classConfig.name)}.</p><button class="button button-soft" type="button" data-add="${type}">＋ إضافة الآن</button></div>`}</div><p class="admin-search-empty" data-search-empty hidden>لم نعثر على نتائج. جرب كلمة أخرى.</p></section>`;
}

function renderSettings(data, classId) {
  const classConfig = getClassConfig(classId);
  return `<section class="admin-list-section settings-section"><div class="admin-section-title"><div><span class="eyebrow">إعدادات فصل ${escapeHTML(classConfig.name)}</span><h2>⚙️ الروابط والنسخ الاحتياطي</h2><p>عدلوا المصادر التعليمية واحفظوا نسخة من محتوى النصوص. هذه الإعدادات تخص هذا الفصل وحده.</p></div></div><form class="settings-form" data-settings-form><label class="form-label" for="coptic-source">رابط مصدر القبطي على يوتيوب</label><input id="coptic-source" name="copticSourceUrl" type="url" value="${escapeHTML(data.settings?.copticSourceUrl || '')}" placeholder="https://www.youtube.com/…" /><small class="field-help">يقبل رابط يوتيوب أو يوتيوب القصير فقط. يمكن تركه فارغا.</small><label class="form-label" for="parent-note">رسالة للأهل</label><textarea id="parent-note" name="parentNote" rows="3">${escapeHTML(data.settings?.parentNote || '')}</textarea><div class="form-actions"><button class="button button-primary" type="submit">حفظ الإعدادات</button></div></form><div class="backup-panel"><div><h3>نسخة من محتوى ${escapeHTML(classConfig.name)}</h3><p>يمكن تنزيل الأسماء والنصوص والإعدادات كملف JSON. الملفات الصوتية والصور المحملة لا تدخل في هذه النسخة.</p></div><div class="backup-actions"><button class="button button-soft" type="button" data-export-backup>⬇️ تنزيل نسخة</button><label class="button button-soft backup-import-button">⬆️ استيراد نسخة<input type="file" accept="application/json,.json" data-import-backup hidden /></label></div></div><div class="reset-panel"><div><strong>إعادة بيانات فصل ${escapeHTML(classConfig.name)}</strong><small>سيعود المحتوى النصي إلى الأمثلة الأصلية لهذا الفصل فقط. لا يمكن التراجع عن ذلك.</small></div><button class="button button-danger" type="button" data-reset-demo>إعادة الأمثلة</button></div><div class="storage-disclaimer"><span aria-hidden="true">⚠️</span><p>تُحفظ بيانات كل فصل في مفتاح مستقل: <code dir="ltr">${escapeHTML(APP_CONFIG.classStoragePrefix)}${escapeHTML(classConfig.id)}</code></p></div></section>`;
}

function renderContactEditor(siteData) {
  const contact = siteData.contact || {};
  const field = (name, label, { type = 'text', placeholder = '', help = '', rows = 3 } = {}) => {
    const value = escapeHTML(contact[name] || '');
    const control = type === 'textarea'
      ? `<textarea id="contact-${name}" name="${name}" rows="${rows}" placeholder="${escapeHTML(placeholder)}">${value}</textarea>`
      : `<input id="contact-${name}" name="${name}" type="${type}" value="${value}" placeholder="${escapeHTML(placeholder)}" />`;
    return `<div class="admin-field">${`<label class="form-label" for="contact-${name}">${escapeHTML(label)}</label>`}${control}${help ? `<small class="field-help">${escapeHTML(help)}</small>` : ''}</div>`;
  };
  const hasPreview = Boolean(contact.personName || contact.phone || contact.email || contact.facebook);
  const preview = hasPreview ? contact : null;
  return `<section class="admin-list-section settings-section contact-editor"><div class="admin-section-title"><div><span class="eyebrow">بيانات مشتركة لكل الموقع</span><h2>✉️ صفحة التواصل</h2><p>هذه البيانات تظهر في صفحة <b dir="ltr">#/contact</b> وفي تذييل كل الصفحات. يحررها المدير العام فقط.</p></div><a class="button button-soft" href="#/contact">معاينة الصفحة <span aria-hidden="true">←</span></a></div><form class="settings-form" data-contact-form><div class="contact-editor-grid">${field('personName', 'الاسم', { placeholder: 'مثال: خادم مدرسة الشمامسة' })}${field('role', 'الصفة', { placeholder: 'مثال: مدرسة شمامسة كنيسة …' })}${field('phone', 'رقم الهاتف', { placeholder: '+201005550100', help: 'يظهر كرابط اتصال tel: مباشر.' })}${field('whatsapp', 'رقم الواتساب', { placeholder: '201005550100', help: 'اكتب الرقم بالكود الدولي من دون + ليظهر رابط wa.me صحيحا.' })}${field('email', 'البريد الإلكتروني', { type: 'email', placeholder: 'name@example.com' })}${field('facebook', 'رابط فيسبوك', { placeholder: 'https://www.facebook.com/…' })}</div>${field('address', 'العنوان', { placeholder: 'كنيسة … — العنوان' })}${field('hours', 'مواعيد التواصل', { placeholder: 'الجمعة والسبت: من … إلى …' })}${field('message', 'رسالة ترحيب', { type: 'textarea', placeholder: 'رسالة قصيرة تظهر أعلى بيانات التواصل' })}<div class="form-actions"><button class="button button-primary" type="submit">حفظ بيانات التواصل</button><button class="button button-soft" type="button" data-contact-reset>استعادة النموذج</button></div><small class="field-help">تُحفظ في مفتاح <code dir="ltr">${escapeHTML(APP_CONFIG.siteStorageKey)}</code>.</small></form><div class="contact-preview">${preview ? `<h3>معاينة سريعة</h3><ul class="contact-list">${contact.personName ? `<li class="contact-row"><span class="contact-icon" aria-hidden="true">🧑‍🏫</span><span class="contact-copy"><small>الاسم</small><span>${escapeHTML(contact.personName)}</span></span></li>` : ''}${contact.phone ? `<li class="contact-row"><span class="contact-icon" aria-hidden="true">📞</span><span class="contact-copy"><small>هاتف</small><span dir="ltr">${escapeHTML(contact.phone)}</span></span></li>` : ''}${facebookHref(contact.facebook) ? `<li class="contact-row"><span class="contact-icon" aria-hidden="true">📘</span><span class="contact-copy"><small>فيسبوك</small><span dir="ltr">${escapeHTML(facebookHref(contact.facebook))}</span></span></li>` : ''}${mailtoHref(contact.email) ? `<li class="contact-row"><span class="contact-icon" aria-hidden="true">✉️</span><span class="contact-copy"><small>بريد</small><span dir="ltr">${escapeHTML(mailtoHref(contact.email))}</span></span></li>` : ''}</ul>` : '<p class="contact-preview-empty">املأوا البيانات ثم اضغطوا حفظ لتظهر المعاينة.</p>'}</div></section>`;
}

// ---------------------------------------------------------------------------
// Admin page
// ---------------------------------------------------------------------------

export function renderAdminPage({ data, session, targetClass, activeTab = 'overview', siteData }) {
  if (!session) {
    return renderLogin({ session, targetClass, classScoped: Boolean(targetClass) });
  }
  const classConfig = getClassConfig(targetClass) || getClassConfig('kg1');
  const allowed = sectionsFor(session);
  const active = allowed.some(([id]) => id === activeTab) ? activeTab : 'overview';
  const content = active === 'overview' ? renderOverview(data, { session, targetClass })
    : active === 'contact' ? renderContactEditor(siteData, session)
      : active === 'settings' ? renderSettings(data, targetClass)
        : renderList(data, active, targetClass);
  const roleLabel = isGeneralSession(session) ? 'مدير عام · كل الفصول' : `مدير فصل ${classConfig.name}`;
  const switcher = isGeneralSession(session) ? renderClassSwitcher({ selectedClass: targetClass, session }) : '';
  return `<div class="admin-page page-enter">${switcher}<div class="admin-heading"><div><span class="eyebrow">مساحة الكبار</span><h1>لوحة ${escapeHTML(classConfig.name)} <span aria-hidden="true">${escapeHTML(classConfig.emoji)}</span></h1><p>${escapeHTML(roleLabel)} — ${isGeneralSession(session) ? 'تعدلون كل الفصول وصفحة التواصل.' : 'تعدلون هذا الفصل فقط.'}</p></div><button class="button button-soft admin-logout" type="button" data-admin-logout>تسجيل الخروج <span aria-hidden="true">↗</span></button></div><div class="admin-dashboard"><aside class="admin-sidebar" aria-label="أقسام لوحة الإدارة"><span class="sidebar-label">القائمة</span>${allowed.map(([id, label, icon]) => `<button class="admin-sidebar-link ${active === id ? 'is-active' : ''}" type="button" data-admin-tab="${id}" ${active === id ? 'aria-current="page"' : ''}><span class="sidebar-icon" aria-hidden="true">${icon}</span><span>${label}</span><span class="sidebar-chevron" aria-hidden="true">‹</span></button>`).join('')}<div class="sidebar-safety"><span aria-hidden="true">🔐</span><small>${isGeneralSession(session) ? `إدارة ${CLASS_LIST.length} فصول<br />وصفحة التواصل` : `إدارة فصل<br />${escapeHTML(classConfig.name)} فقط`}</small></div></aside><div class="admin-main-panel">${content}</div></div><div class="admin-bottom-notice"><span aria-hidden="true">💾</span> تحفظ التغييرات في بيانات فصل ${escapeHTML(classConfig.name)} على هذا المتصفح بعد الضغط على حفظ.</div></div>`;
}

// ---------------------------------------------------------------------------
// Record dialogs
// ---------------------------------------------------------------------------

function nextOrder(data, type) {
  const items = data[sectionConfig[type].collection] || [];
  return items.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
}

function renderFormField(field, item, type, classId) {
  const value = item?.[field.key] ?? (field.order ? nextOrder(loadData(classId), type) : field.defaultValue ?? '');
  if (field.type === 'file') {
    const current = item?.[field.key];
    return `<div class="admin-field file-admin-field"><label class="form-label" for="file-${field.key}">${escapeHTML(field.label)}</label><div class="file-picker-wrap"><input id="file-${field.key}" type="file" name="file:${field.key}" accept="${escapeHTML(field.accept || '*/*')}" /><span class="file-picker-hint">${current ? 'اختاروا ملفا جديدا للاستبدال' : 'اختاروا ملفا من الجهاز'}</span></div>${field.help ? `<small class="field-help">${escapeHTML(field.help)}</small>` : ''}${current ? `<label class="remove-file-option"><input type="checkbox" name="remove:${field.key}" /> إزالة الملف الحالي</label>` : ''}</div>`;
  }
  const common = `id="field-${escapeHTML(field.key)}" name="${escapeHTML(field.key)}" ${field.required ? 'required' : ''} ${field.min !== undefined ? `min="${field.min}"` : ''} placeholder="${escapeHTML(field.placeholder || '')}"`;
  const label = `<label class="form-label" for="field-${escapeHTML(field.key)}">${escapeHTML(field.label)}</label>`;
  const control = field.type === 'textarea'
    ? `<textarea ${common} rows="${field.rows || 3}" maxlength="5000">${escapeHTML(value)}</textarea>`
    : `<input ${common} type="${field.type}" value="${escapeHTML(value)}" ${field.type === 'text' ? 'maxlength="180"' : ''} />`;
  return `<div class="admin-field">${label}${control}${field.help ? `<small class="field-help">${escapeHTML(field.help)}</small>` : ''}</div>`;
}

function openRecordDialog(root, type, item = null, notify, rerender, classId) {
  const config = sectionConfig[type];
  if (!config) return;
  root.querySelector('.admin-dialog')?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'admin-dialog';
  dialog.setAttribute('aria-labelledby', 'record-dialog-title');
  const classConfig = getClassConfig(classId);
  dialog.innerHTML = `<div class="dialog-header"><div><span class="eyebrow">${item ? 'تعديل المحتوى' : 'إضافة محتوى جديد'} · ${escapeHTML(classConfig.name)}</span><h2 id="record-dialog-title">${item ? 'تعديل' : 'إضافة'} ${escapeHTML(config.singular)}</h2></div><button class="dialog-close" type="button" data-dialog-close aria-label="إغلاق">×</button></div><form class="record-form" data-record-form><div class="record-form-fields">${config.fields.map((field) => renderFormField(field, item, type, classId)).join('')}</div><div class="dialog-actions"><button class="button button-soft" type="button" data-dialog-close>إلغاء</button><button class="button button-primary" type="submit">حفظ ${escapeHTML(config.singular)} <span aria-hidden="true">✓</span></button></div></form>`;
  root.append(dialog);
  dialog.showModal();
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  const form = dialog.querySelector('[data-record-form]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const fresh = { ...(item || {}), id: item?.id || createId(type === 'hymns' ? 'hymn' : type === 'copticLetters' ? 'letter' : 'lesson') };
    for (const field of config.fields.filter((entry) => entry.type !== 'file')) {
      const raw = String(formData.get(field.key) ?? '').trim();
      if (field.required && !raw) {
        form.querySelector(`[name="${field.key}"]`)?.focus();
        notify(`يرجى كتابة: ${field.label}`, 'error');
        return;
      }
      if (field.key === 'youtubeUrl' && raw && !safeYouTubeUrl(raw)) {
        form.querySelector(`[name="${field.key}"]`)?.focus();
        notify('أدخلوا رابطا صحيحا من يوتيوب (youtube.com أو youtu.be).', 'error');
        return;
      }
      fresh[field.key] = field.type === 'number' ? Math.max(0, Number(raw) || 0) : raw;
    }
    try {
      fresh.demo = false;
      for (const field of config.fields.filter((entry) => entry.type === 'file')) {
        const file = form.querySelector(`[name="file:${field.key}"]`)?.files?.[0];
        const removeCurrent = formData.get(`remove:${field.key}`) === 'on';
        if (removeCurrent && fresh[field.key]) {
          await deleteMedia(fresh[field.key]);
          delete fresh[field.key];
          if (field.sourceKey) delete fresh[field.sourceKey];
        }
        if (file) {
          if (field.assetKind === 'image' && !file.type.startsWith('image/')) throw new Error('اختاروا ملف صورة صالحا.');
          if (field.assetKind === 'audio' && !file.type.startsWith('audio/')) throw new Error('اختاروا ملفا صوتيا صالحا.');
          if (field.assetKind === 'document' && !(file.type === 'application/pdf' || file.type.startsWith('image/'))) throw new Error('ورقة العمل يجب أن تكون PDF أو صورة.');
          const previous = fresh[field.key];
          const mediaId = await saveMedia(file, field.assetKind);
          if (previous) await deleteMedia(previous);
          fresh[field.key] = mediaId;
          if (field.sourceKey) delete fresh[field.sourceKey];
        }
      }
      const data = loadData(classId);
      const collection = config.collection;
      const existingIndex = data[collection].findIndex((record) => record.id === fresh.id);
      if (existingIndex >= 0) data[collection][existingIndex] = fresh;
      else data[collection].push(fresh);
      saveData(classId, data);
      dialog.close();
      notify(item ? 'تم حفظ التعديلات بنجاح 🌟' : `تمت إضافة ${config.singular} جديد إلى ${classConfig.name} 🎉`);
      rerender();
    } catch (error) {
      notify(error.message || 'تعذر حفظ التغييرات.', 'error');
    }
  });
}

function downloadJson(value, filename) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function readContactForm(form) {
  const formData = new FormData(form);
  const keys = ['personName', 'role', 'message', 'phone', 'whatsapp', 'email', 'facebook', 'address', 'hours'];
  return keys.reduce((result, key) => {
    result[key] = String(formData.get(key) ?? '').trim();
    return result;
  }, {});
}

// ---------------------------------------------------------------------------
// Bindings
// ---------------------------------------------------------------------------

export function bindAdmin(root, context) {
  rootContexts.set(root, {
    token: {},
    session: context.session || null,
    targetClass: context.targetClass,
    siteData: context.siteData,
    setTab: context.setTab,
    setClass: context.setClass,
    toast: (message, kind) => context.toast?.(message, kind),
    navigate: (path) => context.navigate?.(path),
    rerender: () => context.rerender?.(),
    signIn: (username, password) => context.signIn?.(username, password),
    landingRoute: (account) => context.landingRoute?.(account),
    sessionTitle: (account) => context.sessionTitle?.(account),
    signOut: () => context.onSignOut?.(),
  });

  if (boundRoots.has(root)) return;
  boundRoots.add(root);

  root.addEventListener('click', async (event) => {
    const ctx = rootContexts.get(root);
    if (!ctx) return;
    const tabButton = event.target.closest('[data-admin-tab]');
    if (tabButton) {
      ctx.setTab?.(tabButton.dataset.adminTab);
      return;
    }
    const classButton = event.target.closest('[data-admin-class]');
    if (classButton && ctx.session?.role === 'general') {
      ctx.setClass?.(classButton.dataset.adminClass);
      return;
    }
    const logout = event.target.closest('[data-admin-logout]');
    if (logout) {
      ctx.signOut();
      ctx.toast('تم تسجيل الخروج. نراكم قريبا 👋');
      ctx.navigate('#/');
      return;
    }
    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      openRecordDialog(root, addButton.dataset.add, null, ctx.toast, ctx.rerender, ctx.targetClass);
      return;
    }
    const editButton = event.target.closest('[data-edit]');
    if (editButton) {
      const [type, id] = editButton.dataset.edit.split(':');
      const item = loadData(ctx.targetClass)[sectionConfig[type]?.collection]?.find((entry) => entry.id === id);
      if (item) openRecordDialog(root, type, item, ctx.toast, ctx.rerender, ctx.targetClass);
      return;
    }
    const deleteButton = event.target.closest('[data-delete]');
    if (deleteButton) {
      const [type, id] = deleteButton.dataset.delete.split(':');
      const config = sectionConfig[type];
      const data = loadData(ctx.targetClass);
      const list = data[config?.collection] || [];
      const item = list.find((entry) => entry.id === id);
      if (!item) return;
      if (!window.confirm(`هل تريد حذف «${item.name || item.title || item.glyph}» من ${getClassConfig(ctx.targetClass).name}؟ لا يمكن التراجع عن الحذف.`)) return;
      data[config.collection] = list.filter((entry) => entry.id !== id);
      try {
        for (const field of config.fields.filter((entry) => entry.type === 'file')) {
          if (item[field.key]) await deleteMedia(item[field.key]);
        }
        saveData(ctx.targetClass, data);
        ctx.toast('تم حذف العنصر.');
        ctx.rerender();
      } catch (error) { ctx.toast(error.message || 'تعذر حذف العنصر.', 'error'); }
      return;
    }
    if (event.target.closest('[data-export-backup]')) {
      const data = loadData(ctx.targetClass);
      downloadJson({ ...data, _backupNote: 'هذه النسخة تشمل بيانات المحتوى والنصوص لفصل واحد فقط، ولا تشمل ملفات الصور أو الصوت المخزنة في المتصفح.' }, `lahn-${ctx.targetClass}-backup.json`);
      ctx.toast(`تم تنزيل نسخة محتوى ${getClassConfig(ctx.targetClass).name}. تذكروا أنها لا تشمل الملفات المرفوعة.`);
      return;
    }
    if (event.target.closest('[data-reset-demo]')) {
      if (!window.confirm(`إعادة أمثلة فصل ${getClassConfig(ctx.targetClass).name} الأصلية؟ ستستبدل الأسماء والمحتويات الحالية لهذا الفصل ولا يمكن التراجع.`)) return;
      try {
        resetData(ctx.targetClass);
        ctx.toast(`عادت أمثلة فصل ${getClassConfig(ctx.targetClass).name} الأصلية.`);
        ctx.rerender();
      } catch (error) { ctx.toast(error.message, 'error'); }
      return;
    }
    if (event.target.closest('[data-contact-reset]')) {
      if (!window.confirm('استعادة نموذج بيانات التواصل الأصلي؟ سيستبدل بيانات التواصل الحالية.')) return;
      try {
        resetSiteData();
        ctx.toast('تمت استعادة نموذج بيانات التواصل.');
        ctx.rerender();
      } catch (error) { ctx.toast(error.message, 'error'); }
    }
  });

  root.addEventListener('submit', (event) => {
    const ctx = rootContexts.get(root);
    if (!ctx) return;
    const loginForm = event.target.closest('[data-admin-login]');
    if (loginForm) {
      event.preventDefault();
      const values = new FormData(loginForm);
      const account = ctx.signIn(String(values.get('username') || ''), String(values.get('password') || ''));
      const error = loginForm.querySelector('[data-login-error]');
      if (!account) {
        if (error) {
          error.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة. حاولوا مرة أخرى.';
          error.hidden = false;
        }
        const password = loginForm.querySelector('[name="password"]');
        if (password) { password.value = ''; password.focus(); }
        return;
      }
      ctx.toast(`أهلا بكم! ${ctx.sessionTitle(account) || 'لوحة الإدارة جاهزة'} 🧡`);
      const target = ctx.landingRoute(account) || '#/';
      if (target === window.location.hash) ctx.rerender();
      else ctx.navigate(target);
      return;
    }

    const contactForm = event.target.closest('[data-contact-form]');
    if (contactForm) {
      event.preventDefault();
      if (ctx.session?.role !== 'general') {
        ctx.toast('صفحة التواصل يحررها المدير العام فقط.', 'error');
        return;
      }
      const contact = readContactForm(contactForm);
      if (contact.email && !mailtoHref(contact.email)) {
        ctx.toast('أدخلوا بريدا إلكترونيا صحيحا أو اتركوا الخانة فارغة.', 'error');
        return;
      }
      if (contact.facebook && !facebookHref(contact.facebook)) {
        ctx.toast('أدخلوا رابط فيسبوك صحيحا أو اتركوا الخانة فارغة.', 'error');
        return;
      }
      try {
        saveSiteData({ ...ctx.siteData, contact });
        ctx.toast('تم حفظ بيانات صفحة التواصل، وستظهر مباشرة في #/contact.');
        ctx.rerender();
      } catch (error) { ctx.toast(error.message, 'error'); }
      return;
    }

    const settingsForm = event.target.closest('[data-settings-form]');
    if (settingsForm) {
      event.preventDefault();
      const formData = new FormData(settingsForm);
      const source = String(formData.get('copticSourceUrl') || '').trim();
      if (source && !safeYouTubeUrl(source)) {
        ctx.toast('أدخلوا رابطا صحيحا من يوتيوب أو اتركوا الخانة فارغة.', 'error');
        return;
      }
      const data = loadData(ctx.targetClass);
      data.settings.copticSourceUrl = source;
      data.settings.parentNote = String(formData.get('parentNote') || '').trim();
      try {
        saveData(ctx.targetClass, data);
        ctx.toast(`تم حفظ إعدادات فصل ${getClassConfig(ctx.targetClass).name}.`);
        ctx.rerender();
      } catch (error) { ctx.toast(error.message, 'error'); }
    }
  });

  root.addEventListener('change', async (event) => {
    const ctx = rootContexts.get(root);
    if (!ctx) return;
    const input = event.target.closest('[data-import-backup]');
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      const valid = ['hymns', 'copticLetters', 'liturgy'].every((key) => Array.isArray(imported[key]));
      if (!valid) throw new Error('ملف النسخة لا يحتوي على أقسام لحن المطلوبة.');
      if (!window.confirm(`سيستبدل هذا الملف كل محتوى فصل ${getClassConfig(ctx.targetClass).name} الحالي. هل نتابع؟`)) return;
      const base = getDefaultData(ctx.targetClass);
      const restored = {
        ...base,
        students: [],
        hymns: imported.hymns,
        copticLetters: imported.copticLetters,
        liturgy: imported.liturgy,
        settings: { ...base.settings, ...(imported.settings || {}) },
        progress: imported.progress || { completed: [] },
      };
      saveData(ctx.targetClass, restored);
      ctx.toast('تم استيراد المحتوى. قد تحتاج الملفات المرفوعة إلى إعادة اختيارها.');
      ctx.rerender();
    } catch (error) {
      ctx.toast(error.message || 'تعذر قراءة ملف النسخة.', 'error');
    } finally {
      input.value = '';
    }
  });

  root.addEventListener('input', (event) => {
    const search = event.target.closest('[data-admin-search]');
    if (!search) return;
    const query = search.value.trim().toLocaleLowerCase('ar');
    const cards = [...root.querySelectorAll('.admin-item-card')];
    let shown = 0;
    cards.forEach((card) => {
      const match = !query || (card.dataset.searchable || '').includes(query);
      card.hidden = !match;
      if (match) shown += 1;
    });
    const empty = root.querySelector('[data-search-empty]');
    if (empty) empty.hidden = shown > 0;
  });
}
