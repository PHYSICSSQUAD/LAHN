import { APP_CONFIG } from './config.js';
import { DEFAULT_DATA } from './data.js';
import { createId, deleteMedia, loadData, resetData, saveData, saveMedia } from './storage.js';
import { escapeHTML, safeYouTubeUrl, sortByOrder, sortStudents } from './utils.js';

const sectionConfig = {
  students: {
    title: 'الأبطال والنقاط', singular: 'طالب', icon: '🏆', collection: 'students',
    fields: [
      { key: 'name', label: 'اسم الطالب', type: 'text', required: true, placeholder: 'مثال: مريم' },
      { key: 'avatar', label: 'رمز الشخصية (إيموجي)', type: 'text', required: false, placeholder: '🦋', defaultValue: '🌟' },
    ],
  },
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

const boundRoots = new WeakSet();

const sections = [
  ['overview', 'نظرة عامة', '⌂'],
  ['students', 'الأبطال والنقاط', '🏆'],
  ['hymns', 'الألحان', '🎵'],
  ['copticLetters', 'الحروف القبطية', 'Ⲁ'],
  ['liturgy', 'دروس الطقس', '⛪'],
  ['settings', 'الإعدادات والنسخ', '⚙️'],
];

function isLoggedIn() {
  try { return window.sessionStorage.getItem(APP_CONFIG.adminSessionKey) === 'active'; } catch { return false; }
}

function renderLogin() {
  return `<div class="admin-gate page-enter"><div class="admin-gate-copy"><span class="eyebrow">دخول خاص بالمدير</span><h1>أهلا بكم في<br /><span>لوحة الإدارة</span> 🔐</h1><p>من هنا يمكنكم إضافة الدروس، ترتيب الألحان، وتحديث لوحة الأبطال.</p><div class="gate-note"><span aria-hidden="true">🧡</span><div><strong>الدخول للمدير فقط</strong><small>البيانات التجريبية تحفظ على هذا الجهاز.</small></div></div><a class="back-home-link" href="#/home">← العودة إلى الصفحة الرئيسية</a></div><div class="admin-login-card"><div class="login-lock" aria-hidden="true">🔑</div><span class="eyebrow">تسجيل الدخول</span><h2>مرحبا بعودتكم</h2><p>اكتبوا اسم المستخدم وكلمة المرور.</p><form data-admin-login novalidate><label class="form-label" for="admin-username">اسم المستخدم</label><input id="admin-username" name="username" type="text" autocomplete="username" required placeholder="اسم المستخدم" /><label class="form-label" for="admin-password">كلمة المرور</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" /><p class="login-error" data-login-error role="alert" hidden></p><button class="button button-primary button-wide login-submit" type="submit">دخول لوحة الإدارة <span aria-hidden="true">←</span></button></form><div class="login-security-note"><span aria-hidden="true">🛡️</span> نسخة العرض لا تستخدم تسجيل دخول آمنا للخوادم. لا تنشروا كلمات مرور حقيقية هنا.</div></div></div>`;
}

function renderOverview(data) {
  const counts = [
    ['students', 'الأبطال', '🏆', data.students.length],
    ['hymns', 'الألحان', '🎵', data.hymns.length],
    ['copticLetters', 'الحروف', 'Ⲁ', data.copticLetters.length],
    ['liturgy', 'دروس الطقس', '⛪', data.liturgy.length],
  ];
  return `<div class="admin-overview"><div class="admin-welcome"><div><span class="eyebrow">لوحة الإدارة</span><h2>أهلا بكم 👋</h2><p>كل شيء جاهز لتصنعوا رحلة تعلم أجمل.</p></div><span class="admin-welcome-art" aria-hidden="true">🌈</span></div><div class="admin-stats-grid">${counts.map(([tab, label, icon, count]) => `<button class="admin-stat-card stat-${tab}" type="button" data-admin-tab="${tab}"><span class="stat-icon" aria-hidden="true">${icon}</span><span class="stat-number">${count}</span><span class="stat-label">${label}</span><span class="stat-arrow" aria-hidden="true">←</span></button>`).join('')}</div><div class="admin-overview-lower"><div class="admin-hint-card"><span class="admin-hint-icon" aria-hidden="true">✨</span><div><h3>ابدأوا بخطوة صغيرة</h3><p>حدثوا تسجيلا أو أضيفوا درسا واحدا. كل ما تحفظونه يبقى على هذا المتصفح بعد إعادة التحميل.</p></div></div><div class="admin-safety-card"><span aria-hidden="true">🔒</span><div><strong>ملاحظة مهمة عن الأمان</strong><p>وضع العرض محلي لهذا الجهاز فقط، وليس مناسبا لحفظ بيانات أطفال حقيقية.</p></div></div></div></div>`;
}

function getItems(data, type) {
  const list = data[sectionConfig[type].collection] || [];
  return type === 'students' ? sortStudents(list) : sortByOrder(list);
}

function getItemMain(type, item) {
  if (type === 'students') return item.name || 'طالب جديد';
  if (type === 'copticLetters') return `${item.glyph || ''} ${item.transliteration || item.name || 'حرف جديد'}`;
  return item.title || 'عنصر جديد';
}

function getItemSubline(type, item, index) {
  if (type === 'students') return `الترتيب ${index + 1} · ${Number(item.score) || 0} نقطة`;
  if (type === 'hymns') return item.description || 'لا يوجد وصف بعد';
  if (type === 'copticLetters') return [item.name, item.word ? `مثال: ${item.word}` : 'لا يوجد مثال بعد'].filter(Boolean).join(' · ');
  return item.description || 'لا يوجد وصف بعد';
}

function renderList(data, type) {
  const config = sectionConfig[type];
  const items = getItems(data, type);
  return `<section class="admin-list-section"><div class="admin-section-title"><div><span class="eyebrow">إدارة المحتوى</span><h2>${config.icon} ${config.title}</h2><p>${type === 'students' ? 'الترتيب تلقائي. عدلوا النقاط بخطوات ثابتة: 20 أو 50 أو 100.' : 'أضيفوا المحتوى وعدلوا ترتيبه بسهولة.'}</p></div><button class="button button-primary admin-add-button" type="button" data-add="${type}"><span aria-hidden="true">＋</span> إضافة ${config.singular}</button></div>${items.length > 4 ? `<label class="admin-search"><span aria-hidden="true">⌕</span><input type="search" data-admin-search placeholder="ابحث في ${config.title}…" aria-label="ابحث في ${config.title}" /></label>` : ''}<div class="admin-items-grid" data-admin-items>${items.length ? items.map((item, index) => `<article class="admin-item-card" data-searchable="${escapeHTML(`${getItemMain(type, item)} ${getItemSubline(type, item, index)}`).toLowerCase()}"><div class="admin-item-icon" aria-hidden="true">${escapeHTML(item.avatar || item.icon || item.glyph || config.icon)}</div><div class="admin-item-copy"><strong>${escapeHTML(getItemMain(type, item))}</strong><small>${escapeHTML(getItemSubline(type, item, index))}</small></div><div class="admin-item-actions">${type === 'students' ? `<button class="icon-action score-action" type="button" data-score-edit="${escapeHTML(item.id)}" aria-label="تعديل نقاط ${escapeHTML(item.name)}" title="تعديل النقاط">±</button>` : ''}<button class="icon-action edit-action" type="button" data-edit="${escapeHTML(type)}:${escapeHTML(item.id)}" aria-label="تعديل ${escapeHTML(getItemMain(type, item))}" title="تعديل">✎</button><button class="icon-action delete-action" type="button" data-delete="${escapeHTML(type)}:${escapeHTML(item.id)}" aria-label="حذف ${escapeHTML(getItemMain(type, item))}" title="حذف">×</button></div></article>`).join('') : `<div class="admin-empty-state"><span aria-hidden="true">${config.icon}</span><strong>لا يوجد محتوى بعد</strong><p>ابدأوا بإضافة ${config.singular} جديد.</p><button class="button button-soft" type="button" data-add="${type}">＋ إضافة الآن</button></div>`}</div><p class="admin-search-empty" data-search-empty hidden>لم نعثر على نتائج. جرب كلمة أخرى.</p></section>`;
}

function renderSettings(data) {
  return `<section class="admin-list-section settings-section"><div class="admin-section-title"><div><span class="eyebrow">إعدادات الرحلة</span><h2>⚙️ الروابط والنسخ الاحتياطي</h2><p>عدلوا المصادر التعليمية واحفظوا نسخة من محتوى النصوص.</p></div></div><form class="settings-form" data-settings-form><label class="form-label" for="coptic-source">رابط مصدر القبطي على يوتيوب</label><input id="coptic-source" name="copticSourceUrl" type="url" value="${escapeHTML(data.settings?.copticSourceUrl || '')}" placeholder="https://www.youtube.com/…" /><small class="field-help">يقبل رابط يوتيوب أو يوتيوب القصير فقط. يمكن تركه فارغا.</small><label class="form-label" for="parent-note">رسالة للأهل</label><textarea id="parent-note" name="parentNote" rows="3">${escapeHTML(data.settings?.parentNote || '')}</textarea><div class="form-actions"><button class="button button-primary" type="submit">حفظ الإعدادات</button></div></form><div class="backup-panel"><div><h3>نسخة من المحتوى</h3><p>يمكن تنزيل الأسماء والنصوص والإعدادات كملف JSON. الملفات الصوتية والصور المحملة لا تدخل في هذه النسخة.</p></div><div class="backup-actions"><button class="button button-soft" type="button" data-export-backup>⬇️ تنزيل نسخة</button><label class="button button-soft backup-import-button">⬆️ استيراد نسخة<input type="file" accept="application/json,.json" data-import-backup hidden /></label></div></div><div class="reset-panel"><div><strong>إعادة بيانات العرض</strong><small>سيعود المحتوى النصي إلى الأمثلة الأصلية. لا يمكن التراجع عن ذلك.</small></div><button class="button button-danger" type="button" data-reset-demo>إعادة الأمثلة</button></div><div class="storage-disclaimer"><span aria-hidden="true">⚠️</span><p>التعديلات والملفات محفوظة محليا في هذا المتصفح فقط. لن تظهر تلقائيا للزوار أو على جهاز آخر.</p></div></section>`;
}

export function renderAdminPage(data, activeTab = 'overview') {
  if (!isLoggedIn()) return renderLogin();
  const active = sections.some(([id]) => id === activeTab) ? activeTab : 'overview';
  const content = active === 'overview' ? renderOverview(data)
    : active === 'settings' ? renderSettings(data)
      : renderList(data, active);
  return `<div class="admin-page page-enter"><div class="admin-heading"><div><span class="eyebrow">مساحة الكبار</span><h1>لوحة الإدارة <span aria-hidden="true">🧡</span></h1><p>أضيفوا وعدلوا محتوى رحلة لحن.</p></div><button class="button button-soft admin-logout" type="button" data-admin-logout>تسجيل الخروج <span aria-hidden="true">↗</span></button></div><div class="admin-dashboard"><aside class="admin-sidebar" aria-label="أقسام لوحة الإدارة"><span class="sidebar-label">القائمة</span>${sections.map(([id, label, icon]) => `<button class="admin-sidebar-link ${active === id ? 'is-active' : ''}" type="button" data-admin-tab="${id}" ${active === id ? 'aria-current="page"' : ''}><span class="sidebar-icon" aria-hidden="true">${icon}</span><span>${label}</span><span class="sidebar-chevron" aria-hidden="true">‹</span></button>`).join('')}<div class="sidebar-safety"><span aria-hidden="true">🔐</span><small>إدارة تجريبية<br />على هذا الجهاز</small></div></aside><div class="admin-main-panel">${content}</div></div><div class="admin-bottom-notice"><span aria-hidden="true">💾</span> تحفظ التغييرات على هذا المتصفح تلقائيا بعد الضغط على حفظ.</div></div>`;
}

function nextOrder(data, type) {
  const items = data[sectionConfig[type].collection] || [];
  return items.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
}

function renderFormField(field, item, type, isNew) {
  const value = item?.[field.key] ?? (field.order ? nextOrder(loadData(), type) : field.defaultValue ?? '');
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

function openRecordDialog(root, type, item = null, notify, rerender) {
  const config = sectionConfig[type];
  if (!config) return;
  root.querySelector('.admin-dialog')?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'admin-dialog';
  dialog.setAttribute('aria-labelledby', 'record-dialog-title');
  const scoreFormHint = type === 'students' ? '<p class="score-form-note">يبدأ الطالب من صفر نقطة. يمكن إضافة النقاط لاحقا بخطوات ثابتة من 20 أو 50 أو 100.</p>' : '';
  dialog.innerHTML = `<div class="dialog-header"><div><span class="eyebrow">${item ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}</span><h2 id="record-dialog-title">${item ? 'تعديل' : 'إضافة'} ${escapeHTML(config.singular)}</h2></div><button class="dialog-close" type="button" data-dialog-close aria-label="إغلاق">×</button></div><form class="record-form" data-record-form>${scoreFormHint}<div class="record-form-fields">${config.fields.map((field) => renderFormField(field, item, type, !item)).join('')}</div><div class="dialog-actions"><button class="button button-soft" type="button" data-dialog-close>إلغاء</button><button class="button button-primary" type="submit">حفظ ${escapeHTML(config.singular)} <span aria-hidden="true">✓</span></button></div></form>`;
  root.append(dialog);
  dialog.showModal();
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  const form = dialog.querySelector('[data-record-form]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const fresh = { ...(item || {}), id: item?.id || createId(type === 'students' ? 'student' : type === 'hymns' ? 'hymn' : type === 'copticLetters' ? 'letter' : 'lesson') };
    if (type === 'students' && !Number.isFinite(Number(fresh.score))) fresh.score = 0;
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
      const data = loadData();
      const collection = config.collection;
      const existingIndex = data[collection].findIndex((record) => record.id === fresh.id);
      if (existingIndex >= 0) data[collection][existingIndex] = fresh;
      else data[collection].push(fresh);
      saveData(data);
      dialog.close();
      notify(item ? 'تم حفظ التعديلات بنجاح 🌟' : `تمت إضافة ${config.singular} جديد 🎉`);
      rerender();
    } catch (error) {
      notify(error.message || 'تعذر حفظ التغييرات.', 'error');
    }
  });
}

function openScoreDialog(root, studentId, toast, rerender) {
  const student = loadData().students.find((record) => record.id === studentId);
  if (!student) return;
  root.querySelector('.admin-dialog')?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'admin-dialog score-dialog';
  dialog.setAttribute('aria-labelledby', 'score-dialog-title');
  dialog.innerHTML = `<div class="dialog-header"><div><span class="eyebrow">نقاط الطالب</span><h2 id="score-dialog-title">${escapeHTML(student.name)}</h2></div><button class="dialog-close" type="button" data-score-close aria-label="إغلاق">×</button></div><div class="score-dialog-body"><div class="score-current"><span>النقاط الحالية</span><strong>${Number(student.score) || 0}</strong></div><p>اختر خطوة ثابتة لإضافة النقاط أو خصمها:</p><div class="score-adjust-grid"><button class="score-step score-step-plus" type="button" data-score-delta="20">+20</button><button class="score-step score-step-plus" type="button" data-score-delta="50">+50</button><button class="score-step score-step-plus" type="button" data-score-delta="100">+100</button><button class="score-step score-step-minus" type="button" data-score-delta="-20">-20</button><button class="score-step score-step-minus" type="button" data-score-delta="-50">-50</button><button class="score-step score-step-minus" type="button" data-score-delta="-100">-100</button></div><small>لا يمكن أن تصبح النقاط أقل من صفر. يتحدث ترتيب الأبطال تلقائيا بعد كل تعديل.</small></div>`;
  root.append(dialog);
  dialog.showModal();
  dialog.querySelector('[data-score-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  dialog.querySelectorAll('[data-score-delta]').forEach((button) => button.addEventListener('click', () => {
    const delta = Number(button.dataset.scoreDelta) || 0;
    const data = loadData();
    const record = data.students.find((entry) => entry.id === studentId);
    if (!record) return;
    const nextScore = (Number(record.score) || 0) + delta;
    if (nextScore < 0) {
      toast('لا يمكن خصم نقاط أكثر من الرصيد الحالي.', 'error');
      return;
    }
    record.score = nextScore;
    try {
      saveData(data);
      dialog.close();
      toast(`تم تحديث النقاط إلى ${nextScore}.`);
      rerender();
    } catch (error) { toast(error.message, 'error'); }
  }));
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

export function bindAdmin(root, { rerender, setTab, toast, navigate }) {
  if (!boundRoots.has(root)) {
    boundRoots.add(root);
    root.addEventListener('click', async (event) => {
    const tabButton = event.target.closest('[data-admin-tab]');
    if (tabButton) {
      setTab(tabButton.dataset.adminTab);
      return;
    }
    const logout = event.target.closest('[data-admin-logout]');
    if (logout) {
      window.sessionStorage.removeItem(APP_CONFIG.adminSessionKey);
      navigate('/home');
      toast('تم تسجيل الخروج. نراكم قريبا 👋');
      return;
    }
    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      openRecordDialog(root, addButton.dataset.add, null, toast, rerender);
      return;
    }
    const scoreButton = event.target.closest('[data-score-edit]');
    if (scoreButton) {
      openScoreDialog(root, scoreButton.dataset.scoreEdit, toast, rerender);
      return;
    }
    const editButton = event.target.closest('[data-edit]');
    if (editButton) {
      const [type, id] = editButton.dataset.edit.split(':');
      const item = loadData()[sectionConfig[type]?.collection]?.find((entry) => entry.id === id);
      if (item) openRecordDialog(root, type, item, toast, rerender);
      return;
    }
    const deleteButton = event.target.closest('[data-delete]');
    if (deleteButton) {
      const [type, id] = deleteButton.dataset.delete.split(':');
      const config = sectionConfig[type];
      const data = loadData();
      const list = data[config?.collection] || [];
      const item = list.find((entry) => entry.id === id);
      if (!item) return;
      if (!window.confirm(`هل تريد حذف «${item.name || item.title || item.glyph}»؟ لا يمكن التراجع عن الحذف.`)) return;
      const removed = list.filter((entry) => entry.id !== id);
      data[config.collection] = removed;
      try {
        for (const field of config.fields.filter((entry) => entry.type === 'file')) {
          if (item[field.key]) await deleteMedia(item[field.key]);
        }
        saveData(data);
        toast('تم حذف العنصر.');
        rerender();
      } catch (error) { toast(error.message || 'تعذر حذف العنصر.', 'error'); }
      return;
    }
    if (event.target.closest('[data-export-backup]')) {
      const data = loadData();
      downloadJson({ ...data, _backupNote: 'هذه النسخة تشمل بيانات المحتوى والنصوص فقط، ولا تشمل ملفات الصور أو الصوت المخزنة في المتصفح.' }, 'lahn-content-backup.json');
      toast('تم تنزيل نسخة المحتوى. تذكروا أنها لا تشمل الملفات المرفوعة.');
      return;
    }
    if (event.target.closest('[data-reset-demo]')) {
      if (!window.confirm('إعادة الأمثلة الأصلية؟ ستستبدل الأسماء والمحتويات الحالية ولا يمكن التراجع.')) return;
      try {
        resetData();
        toast('عادت أمثلة لحن الأصلية.');
        rerender();
      } catch (error) { toast(error.message, 'error'); }
    }
    });
  }

  root.querySelector('[data-admin-login]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = String(new FormData(form).get('username') || '');
    const password = String(new FormData(form).get('password') || '');
    const error = form.querySelector('[data-login-error]');
    if (username === APP_CONFIG.admin.username && password === APP_CONFIG.admin.password) {
      window.sessionStorage.setItem(APP_CONFIG.adminSessionKey, 'active');
      toast('أهلا بكم! لوحة الإدارة جاهزة 🧡');
      rerender();
      return;
    }
    error.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة. حاولوا مرة أخرى.';
    error.hidden = false;
    form.querySelector('[name="password"]').value = '';
    form.querySelector('[name="password"]').focus();
  });

  root.querySelector('[data-settings-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const source = String(formData.get('copticSourceUrl') || '').trim();
    if (source && !safeYouTubeUrl(source)) {
      toast('أدخلوا رابطا صحيحا من يوتيوب أو اتركوا الخانة فارغة.', 'error');
      return;
    }
    const data = loadData();
    data.settings.copticSourceUrl = source;
    data.settings.parentNote = String(formData.get('parentNote') || '').trim();
    try {
      saveData(data);
      toast('تم حفظ الإعدادات.');
      rerender();
    } catch (error) { toast(error.message, 'error'); }
  });

  root.querySelector('[data-import-backup]')?.addEventListener('change', async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      const valid = ['students', 'hymns', 'copticLetters', 'liturgy'].every((key) => Array.isArray(imported[key]));
      if (!valid) throw new Error('ملف النسخة لا يحتوي على أقسام لحن المطلوبة.');
      if (!window.confirm('سيستبدل هذا الملف كل المحتوى النصي الحالي. هل نتابع؟')) return;
      const restored = {
        ...DEFAULT_DATA,
        students: imported.students,
        hymns: imported.hymns,
        copticLetters: imported.copticLetters,
        liturgy: imported.liturgy,
        settings: { ...DEFAULT_DATA.settings, ...(imported.settings || {}) },
        progress: imported.progress || { completed: [] },
      };
      saveData(restored);
      toast('تم استيراد المحتوى. قد تحتاج الملفات المرفوعة إلى إعادة اختيارها.');
      rerender();
    } catch (error) {
      toast(error.message || 'تعذر قراءة ملف النسخة.', 'error');
    } finally {
      input.value = '';
    }
  });

  root.querySelector('[data-admin-search]')?.addEventListener('input', (event) => {
    const query = event.currentTarget.value.trim().toLocaleLowerCase('ar');
    const cards = [...root.querySelectorAll('.admin-item-card')];
    let shown = 0;
    cards.forEach((card) => {
      const match = !query || card.dataset.searchable.includes(query);
      card.hidden = !match;
      if (match) shown += 1;
    });
    const empty = root.querySelector('[data-search-empty]');
    if (empty) empty.hidden = shown > 0;
  });
}
