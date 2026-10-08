import { CLASS_LIST, SITE_CONTACT, getClassConfig, isValidClass } from './config.js';
import {
  renderHeader, renderFooter, mediaArt, audioPlayer, bindAudioPlayers, renderVisitorClassBar, sourceList,
} from './components.js';
import {
  loadData, saveProgress, getLastClass, setLastClass, cleanupLegacyStorage,
} from './storage.js';
import {
  escapeHTML, classHref, sectionForPage, sortByOrder, textParagraphs,
  youtubeAnchor, safeYouTubeUrl, telHref, whatsappHref, mailtoHref, facebookHref,
} from './utils.js';

const root = document.querySelector('#app');
const CLASS_PAGES = ['home', 'hymns', 'hymn', 'coptic', 'letter', 'liturgy', 'ritual', 'curriculum'];
const LEGACY_PAGES = new Set([...CLASS_PAGES, 'admin']);
const PAGE_TITLES = {
  home: 'الرئيسية', hymns: 'الألحان', hymn: 'لحن', coptic: 'القبطي', letter: 'حرف قبطي',
  liturgy: 'الطقس', ritual: 'درس من الطقس', curriculum: 'المنهج',
};
let pendingLegacyPage = '';
let pendingLegacyQuery = '';
let toastTimer;

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

function parseRoute() {
  const hash = window.location.hash.slice(1);
  const clean = hash.replace(/^\/+/, '');
  const splitAt = clean.indexOf('?');
  const rawPath = splitAt >= 0 ? clean.slice(0, splitAt) : clean;
  const pathname = rawPath.replace(/\/+$/, '');
  const params = new URLSearchParams(splitAt >= 0 ? clean.slice(splitAt + 1) : '');
  const segments = pathname ? pathname.split('/').map((segment) => segment.trim()).filter(Boolean) : [];
  return { segments, params };
}

function resolveRoute() {
  const { segments, params } = parseRoute();
  if (!segments.length) return { kind: 'picker', classId: '', page: '', params };
  const [first, second] = segments;
  if (first === 'contact') return { kind: 'contact', classId: '', page: 'contact', params };
  // Old admin links simply go back to the class picker: there is no admin anymore.
  if (first === 'admin') return { kind: 'retired-admin', classId: '', page: '', params };
  if (isValidClass(first)) {
    const page = second || 'home';
    if (page === 'admin') return { kind: 'retired-admin', classId: first, page: '', params };
    if (!CLASS_PAGES.includes(page)) return { kind: 'notfound', classId: first, page, params };
    return { kind: 'page', classId: first, page, params };
  }
  if (LEGACY_PAGES.has(first)) return { kind: 'legacy', classId: '', page: first, params };
  return { kind: 'notfound', classId: '', page: '', params };
}

function replaceHash(hash) {
  const target = hash.startsWith('#') ? hash : `#${hash}`;
  if (window.location.hash === target) return;
  if (typeof window.location.replace === 'function') {
    const { origin, pathname, search } = window.location;
    window.location.replace(`${origin}${pathname}${search}${target}`);
  } else {
    window.location.hash = target;
  }
}

function applyTheme(classId) {
  const html = document.documentElement;
  const classConfig = classId ? getClassConfig(classId) : null;
  if (classConfig) {
    html.dataset.class = classConfig.id;
    html.dataset.theme = classConfig.theme;
  } else {
    delete html.dataset.class;
    delete html.dataset.theme;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', classConfig ? classConfig.pageColor : '#fbf8f1');
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function toast(message, kind = 'success') {
  const area = document.querySelector('#toast-area');
  if (!area) return;
  clearTimeout(toastTimer);
  area.innerHTML = `<div class="toast toast-${kind}" role="status"><span class="toast-mark" aria-hidden="true">${kind === 'error' ? '!' : '✓'}</span><span>${escapeHTML(message)}</span></div>`;
  toastTimer = window.setTimeout(() => { area.innerHTML = ''; }, 3600);
}

function pageIntro(kicker, title, description, icon = '') {
  return `<div class="page-intro"><div class="page-intro-copy"><span class="eyebrow">${escapeHTML(kicker)}</span><h1>${icon ? `<span aria-hidden="true">${icon}</span> ` : ''}${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div><a class="back-home-link" href="#/"><span aria-hidden="true">🗂️</span> الفصول</a></div>`;
}

function emptyState(icon, title, message, link = '#/', linkText = 'اختيار الفصل') {
  return `<section class="empty-state"><div class="empty-state-icon" aria-hidden="true">${icon}</div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(message)}</p><a class="button button-primary" href="${link}">${escapeHTML(linkText)} <span aria-hidden="true">←</span></a></section>`;
}

function completionButton(collection, id, data) {
  const key = `${collection}:${id}`;
  const done = (data.progress?.completed || []).includes(key);
  return `<button class="complete-button ${done ? 'is-complete' : ''}" type="button" data-complete="${escapeHTML(key)}" aria-pressed="${done ? 'true' : 'false'}"><span aria-hidden="true">${done ? '⭐' : '☆'}</span><span>${done ? 'أحسنت! هذه الرحلة مكتملة' : 'أنهيت التعلم؟ اجمع نجمة!'}</span></button>`;
}

function lyricsBlock(text) {
  return escapeHTML(String(text || '')).replaceAll('\n', '<br>');
}

// ---------------------------------------------------------------------------
// Class picker (#/)
// ---------------------------------------------------------------------------

function pickerTarget(classConfig) {
  const page = pendingLegacyPage && CLASS_PAGES.includes(pendingLegacyPage) ? pendingLegacyPage : 'home';
  return classHref(classConfig.id, `/${page}`, Object.fromEntries(new URLSearchParams(pendingLegacyQuery)));
}

function renderClassCard(classConfig, index) {
  return `<a class="picker-card picker-${classConfig.theme}" href="${pickerTarget(classConfig)}" style="--card-index:${index}">
    <span class="picker-card-glow" aria-hidden="true"></span>
    <span class="picker-card-icon" aria-hidden="true">${escapeHTML(classConfig.emoji)}</span>
    <span class="picker-card-body">
      <strong>${escapeHTML(classConfig.name)}</strong>
      <small class="picker-card-arabic">${escapeHTML(classConfig.arabicName)}</small>
      <small class="picker-card-text">${escapeHTML(classConfig.tagline)}</small>
    </span>
    <span class="picker-card-action">ادخل الفصل <span aria-hidden="true">←</span></span>
  </a>`;
}

function renderPicker() {
  return `<div class="picker-page page-enter">
    <section class="picker-hero">
      <span class="eyebrow"><span class="hero-kicker-dot" aria-hidden="true"></span> مدرسة الشمامسة</span>
      <h1>اختاروا الفصل، <span>وابدأوا الفرح</span> 🎈</h1>
      <p>كل فصل له ألحانه وحروفه ودروسه، وكلمات كل لحن بالعربي والقبطي المعرب مع مصادره.</p>
    </section>
    <section class="picker-section" aria-labelledby="picker-title">
      <div class="section-heading">
        <div><span class="eyebrow">الفصول المتاحة</span><h2 id="picker-title">إلى أي فصل ندخل اليوم؟</h2><p>ثلاثة فصول من منهج مدرسة الشمامسة</p></div>
        <span class="heading-doodle" aria-hidden="true">✿</span>
      </div>
      <div class="class-picker-grid">
        ${CLASS_LIST.map((classConfig, index) => renderClassCard(classConfig, index)).join('')}
      </div>
    </section>
    <section class="picker-note">
      <span aria-hidden="true">🧡</span>
      <p>لو مش متأكد، اختار الفصل اللي فيه ابنك. كل لحن فيه الكلام عربي وقبطي معرب، ورابط سماعه بصوت المعلم إبراهيم عياد.</p>
    </section>
  </div>`;
}

// ---------------------------------------------------------------------------
// Contact page (#/contact)
// ---------------------------------------------------------------------------

function contactRow({ icon, label, value, href = '', external = false }) {
  const text = String(value || '').trim();
  if (!text) return '';
  const content = href
    ? `<a href="${escapeHTML(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHTML(text)}${external ? '<span class="external-mark" aria-hidden="true">↗</span>' : ''}</a>`
    : `<span>${escapeHTML(text)}</span>`;
  return `<li class="contact-row"><span class="contact-icon" aria-hidden="true">${icon}</span><span class="contact-copy"><small>${escapeHTML(label)}</small>${content}</span></li>`;
}

function renderContact() {
  const contact = SITE_CONTACT;
  const rows = [
    contactRow({ icon: '📞', label: 'هاتف', value: contact.phone, href: telHref(contact.phone) }),
    contactRow({ icon: '💬', label: 'واتساب', value: contact.whatsapp, href: whatsappHref(contact.whatsapp), external: true }),
    contactRow({ icon: '✉️', label: 'البريد الإلكتروني', value: contact.email, href: mailtoHref(contact.email) }),
    contactRow({ icon: '📘', label: 'فيسبوك', value: contact.facebook, href: facebookHref(contact.facebook), external: true }),
    contactRow({ icon: '📍', label: 'العنوان', value: contact.address }),
    contactRow({ icon: '🕒', label: 'مواعيد التواصل', value: contact.hours }),
  ].filter(Boolean).join('');
  return `<div class="content-page contact-page page-enter">
    ${pageIntro('تواصل معي', 'صفحة التواصل', 'يسعدنا سماعكم في أي وقت، لأي سؤال أو اقتراح.', '✉️')}
    <section class="contact-card">
      <div class="contact-card-head">
        <span class="contact-avatar" aria-hidden="true">🕊️</span>
        <div><span class="eyebrow">خدمة مدرسة الشمامسة</span><h2>${escapeHTML(contact.personName)}</h2><p class="contact-role">${escapeHTML(contact.role)}</p></div>
      </div>
      <p class="contact-message">${escapeHTML(contact.message)}</p>
      <ul class="contact-list">${rows || '<li class="contact-row"><span class="contact-copy"><small>لا توجد بيانات بعد</small></span></li>'}</ul>
      <div class="contact-actions">
        ${telHref(contact.phone) ? `<a class="button button-primary" href="${escapeHTML(telHref(contact.phone))}"><span aria-hidden="true">📞</span> اتصل بنا</a>` : ''}
        ${whatsappHref(contact.whatsapp) ? `<a class="button button-soft" href="${escapeHTML(whatsappHref(contact.whatsapp))}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">💬</span> راسلنا على واتساب</a>` : ''}
        ${mailtoHref(contact.email) ? `<a class="button button-soft" href="${escapeHTML(mailtoHref(contact.email))}"><span aria-hidden="true">✉️</span> أرسل بريدا</a>` : ''}
      </div>
    </section>
    <div class="soft-callout callout-parent"><span aria-hidden="true">🕊️</span><p>رسالتكم تصل إلى خدام المدرسة، ونسعد بخدمتكم.</p></div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Class pages
// ---------------------------------------------------------------------------

function renderHome(ctx, data) {
  const { classConfig } = ctx;
  const completedCount = data.progress?.completed?.length || 0;
  return `
    <div class="home-page page-enter">
      <section class="hero-section">
        <div class="hero-copy">
          <span class="hero-kicker"><span class="hero-kicker-dot"></span> ${escapeHTML(classConfig.name)} · رحلة ممتعة للعائلة كلها</span>
          <h1>أهلا يا بطل!<br /><span>جاهز نكتشف؟</span></h1>
          <p>نرنم بالعربي والقبطي، نتعلم حروفنا، ونكتشف أسرار الكنيسة… خطوة صغيرة كل يوم 💛</p>
          <div class="hero-actions">
            <a class="button button-primary button-large" href="${ctx.href('/hymns')}">هيا نبدأ <span aria-hidden="true">←</span></a>
            <div class="hero-progress"><span class="progress-star" aria-hidden="true">⭐</span><span><strong>${completedCount}</strong><small>نجمة في رحلتك</small></span></div>
          </div>
          <div class="hero-trust"><span aria-hidden="true">👨‍👩‍👧</span><span>نتعلم مع ماما وبابا</span><i></i><span>بخطوات بسيطة</span></div>
        </div>
        <div class="hero-visual" aria-label="${escapeHTML(classConfig.angelAlt)}">
          <div class="hero-sky-orb hero-orb-one"></div><div class="hero-sky-orb hero-orb-two"></div>
          <span class="hero-doodle doodle-star" aria-hidden="true">✦</span><span class="hero-doodle doodle-note" aria-hidden="true">♪</span><span class="hero-doodle doodle-cloud" aria-hidden="true">☁</span>
          <div class="hero-art-ring"></div>
          <img class="hero-mascot" src="${escapeHTML(classConfig.angel)}" alt="${escapeHTML(classConfig.angelAlt)}" fetchpriority="high" />
          <div class="hero-sticker sticker-song"><span aria-hidden="true">🎶</span><span>نرنم سوا!</span></div>
          <div class="hero-sticker sticker-heart"><span aria-hidden="true">${escapeHTML(classConfig.emoji)}</span><span>${escapeHTML(classConfig.name)}</span></div>
        </div>
        <span class="hero-bottom-cloud" aria-hidden="true"></span>
      </section>

      <section class="destination-section" aria-labelledby="destinations-title">
        <div class="section-heading">
          <div><span class="eyebrow">اختار مغامرتك</span><h2 id="destinations-title">إلى أين نذهب اليوم؟</h2><p>ثلاث محطات مليئة بالمرح والتعلم</p></div>
          <span class="heading-doodle" aria-hidden="true">✿</span>
        </div>
        <div class="destination-grid">
          <a class="destination-card destination-hymns" href="${ctx.href('/hymns')}">
            <span class="destination-number">01</span><span class="destination-art" aria-hidden="true"><span>🎵</span><i>♪</i><b>♫</b></span>
            <span class="destination-body"><strong>الألحان</strong><small>عربي وقبطي معرب</small></span><span class="round-arrow" aria-hidden="true">←</span>
          </a>
          <a class="destination-card destination-liturgy" href="${ctx.href('/liturgy')}">
            <span class="destination-number">02</span><span class="destination-art" aria-hidden="true"><span>⛪</span><i>✦</i><b>☁</b></span>
            <span class="destination-body"><strong>الطقس</strong><small>نكتشف حكاية الكنيسة</small></span><span class="round-arrow" aria-hidden="true">←</span>
          </a>
          <a class="destination-card destination-coptic" href="${ctx.href('/coptic')}">
            <span class="destination-number">03</span><span class="destination-art coptic-art" aria-hidden="true"><span class="coptic-fish-mark"><img src="assets/images/coptic-fish.svg" alt="" /></span><i>Ⲁ</i><b>ⲃ</b></span>
            <span class="destination-body"><strong>القبطي</strong><small>نلعب مع الحروف القبطية</small></span><span class="round-arrow" aria-hidden="true">←</span>
          </a>
        </div>
      </section>

      <section class="home-lower-grid">
        <aside class="parent-note-card"><div class="parent-note-top"><span class="parent-note-icon" aria-hidden="true">🧡</span><span class="mini-label">${escapeHTML(classConfig.arabicName)}</span></div><h2>لحظة تعلم…<br /><span>تصير ذكرى حلوة.</span></h2><p>${escapeHTML(data.settings?.parentNote || 'اختاروا محطة، واستمتعوا بها معا.')}</p><a href="${ctx.href('/curriculum')}" class="text-link">شوف منهج ${escapeHTML(classConfig.name)} <span aria-hidden="true">←</span></a><div class="parent-note-doodle" aria-hidden="true">✿</div></aside>
      </section>

      <section class="home-encouragement"><span class="encouragement-sun" aria-hidden="true">🌞</span><div><strong>أنت تتعلم شيئا جديدا كل يوم!</strong><small>خذ نفسا، اختر محطة، وابدأ مغامرتك.</small></div><span class="encouragement-stars" aria-hidden="true">✦　✦　✦</span></section>
    </div>`;
}

function renderHymns(ctx, data) {
  const items = sortByOrder(data.hymns || []);
  return `<div class="content-page page-enter">${pageIntro(`محطة النغمات · ${ctx.classConfig.name}`, 'الألحان', 'اسمع اللحن، اقرأ كلماته بالعربي والقبطي المعرب، وغن مع من تحب.', '🎵')}
    ${items.length ? `<div class="item-grid hymn-grid">${items.map((item, index) => `<a class="learning-card hymn-card" href="${ctx.href('/hymn', { id: item.id })}" style="--card-index:${index}">${mediaArt(item, 'card-art tone-art')}<span class="card-topline"><span class="card-tag">لحن</span><span class="card-arrow" aria-hidden="true">←</span></span><h2>${escapeHTML(item.title)}</h2>${item.copticTitle ? `<span class="card-coptic-title">${escapeHTML(item.copticTitle)}</span>` : ''}<p>${escapeHTML(item.description || 'لحن جميل لنتعلمه معا.')}</p><span class="card-action">اكتشف اللحن <span aria-hidden="true">↙</span></span></a>`).join('')}</div>` : emptyState('🎶', 'قريبا نرنم معا', 'لا توجد ألحان في هذا الفصل حاليا.', ctx.href('/home'), 'الرئيسية')}
    <div class="soft-callout callout-song"><span aria-hidden="true">🎧</span><p>كل لحن فيه رابط لسماعه بصوت المعلم إبراهيم عياد، ومصادر كلماته.</p></div>
  </div>`;
}

function renderHymnDetail(ctx, data, id) {
  const item = (data.hymns || []).find((hymn) => hymn.id === id);
  if (!item) return `<div class="content-page page-enter">${emptyState('🎵', 'لم نجد هذا اللحن', 'ربما تغير الرابط أو حذف اللحن.', ctx.href('/hymns'), 'العودة إلى الألحان')}</div>`;
  const ayadUrl = safeYouTubeUrl(item.ayad?.url);
  const sources = sourceList(item.sources);
  return `<div class="content-page detail-page page-enter">
    <div class="back-row"><a class="back-button" href="${ctx.href('/hymns')}"><span aria-hidden="true">→</span> رجوع إلى الألحان</a><a class="quiet-home" href="${ctx.href('/home')}">الرئيسية</a></div>
    <section class="detail-hero hymn-detail-hero"><div class="detail-hero-copy"><span class="eyebrow">محطة الألحان · لنتعلم معا</span><h1>${escapeHTML(item.title)}</h1>${item.copticTitle ? `<p class="detail-coptic-title">${escapeHTML(item.copticTitle)}</p>` : ''}<p>${escapeHTML(item.description || '')}</p><div class="detail-hero-badges"><span>🎧 نستمع</span><span>📖 عربي وقبطي معرب</span><span>🔗 مصادر موثقة</span></div></div><div class="detail-hero-art">${mediaArt(item, 'detail-art tone-art')}<span class="detail-orbit orbit-one">♪</span><span class="detail-orbit orbit-two">✦</span></div></section>
    <article class="content-tile lyrics-tile">
      <div class="tile-heading"><span class="tile-icon lyrics-icon">📖</span><div><span class="eyebrow">اقرأ وردد</span><h2>كلام اللحن</h2></div></div>
      <div class="lyrics-columns">
        <div class="lyrics-column lyrics-arabic"><h3><span aria-hidden="true">🇪🇬</span> عربي</h3><div class="hymn-lyrics">${lyricsBlock(item.lyricsArabic || 'لم تضف كلمات عربية بعد.')}</div></div>
        <div class="lyrics-column lyrics-coptic"><h3><span aria-hidden="true">Ⲁ</span> قبطي معرب</h3><div class="hymn-lyrics hymn-lyrics-coptic">${lyricsBlock(item.lyricsCoptic || 'لم تضف الكلمات القبطية المعربة بعد.')}</div></div>
      </div>
      <small class="tiny-disclaimer">«القبطي المعرب» هو نطق الكلمات القبطية مكتوبا بحروف عربية ليسهل ترديده مع الأطفال.</small>
    </article>
    <div class="hymn-detail-grid">
      <article class="content-tile ayad-tile"><div class="tile-heading"><span class="tile-icon source-icon">▶️</span><div><span class="eyebrow">نفس اللحن بصوت</span><h2>المعلم إبراهيم عياد</h2></div></div>${ayadUrl
        ? `<p>${escapeHTML(item.ayad?.label || 'استمعوا للحن بصوت المعلم إبراهيم عياد.')}</p>${youtubeAnchor(ayadUrl, 'استمع بصوت المعلم إبراهيم عياد', 'button button-youtube button-wide')}`
        : '<div class="audio-empty"><span>🔎</span><div><strong>التسجيل غير متاح حاليا</strong><small>راجعوا المصادر بالأسفل.</small></div></div>'}</article>
      <article class="content-tile audio-tile"><div class="tile-heading"><span class="tile-icon tone-icon">🎧</span><div><span class="eyebrow">تسجيل المدرسة</span><h2>اسمع اللحن</h2></div></div>${audioPlayer({ label: 'اسمع اللحن', src: item.audioSrc, caption: 'تسجيل المدرسة' })}<p class="tiny-disclaimer">استمعوا بهدوء وجربوا ترديد اللحن.</p></article>
      <article class="content-tile sources-tile"><div class="tile-heading"><span class="tile-icon worksheet-icon">🔗</span><div><span class="eyebrow">من أين جاء الكلام؟</span><h2>مصادر اللحن</h2></div></div>${sources || '<p>لا توجد مصادر مسجلة لهذا اللحن.</p>'}</article>
      <article class="content-tile notes-tile"><div class="tile-heading"><span class="tile-icon notes-icon">📝</span><div><span class="eyebrow">معلومة لطيفة</span><h2>ملاحظات</h2></div></div><p>${escapeHTML(item.notes || 'لا توجد ملاحظات بعد.')}</p></article>
    </div>
    <div class="detail-complete-row">${completionButton('hymns', item.id, data)}<a class="button button-soft" href="${ctx.href('/hymns')}">اختر لحنا آخر <span aria-hidden="true">←</span></a></div>
  </div>`;
}

function renderCoptic(ctx, data) {
  const letters = sortByOrder(data.copticLetters || []);
  const sources = sourceList(data.settings?.copticSources);
  return `<div class="content-page page-enter">${pageIntro(`محطة الحروف · ${ctx.classConfig.name}`, 'القبطي', 'كل حرف له شكل وصوت وحكاية صغيرة. هيا نتعرف إليها!', 'Ⲁⲃⲅ')}
    <div class="coptic-tip"><span class="coptic-tip-fish" aria-hidden="true"><img src="assets/images/coptic-fish.svg" alt="" /></span><p>صديقتنا السمكة القبطية تساعدنا على اكتشاف الحروف. اضغط على الحرف لقراءة المثال وطباعة ورقة العمل.</p><span class="coptic-tip-coptic" aria-hidden="true">Ⲁ Ⲃ Ⲅ</span></div>
    ${letters.length ? `<div class="letter-grid">${letters.map((letter, index) => `<a class="letter-card" href="${ctx.href('/letter', { id: letter.id })}" style="--card-index:${index}"><span class="letter-glyph" lang="cop">${escapeHTML(letter.glyph || 'Ⲁ')}</span><span class="letter-name">${escapeHTML(letter.transliteration || letter.name || 'حرف جديد')}</span><span class="letter-card-arrow" aria-hidden="true">↙</span></a>`).join('')}</div>` : emptyState('Ⲁ', 'الحروف ستصل قريبا', 'لا توجد حروف في هذا الفصل حاليا.', ctx.href('/home'), 'الرئيسية')}
    <article class="content-tile sources-tile coptic-sources"><div class="tile-heading"><span class="tile-icon worksheet-icon">🔗</span><div><span class="eyebrow">مصادر منهج القبطي</span><h2>كتاب الحروف وترنيمتها</h2></div></div>${sources}</article>
  </div>`;
}

function renderLetterDetail(ctx, data, id) {
  const letters = sortByOrder(data.copticLetters || []);
  const index = letters.findIndex((letter) => letter.id === id);
  const item = letters[index];
  if (!item) return `<div class="content-page page-enter">${emptyState('Ⲁ', 'لم نجد هذا الحرف', 'ربما تغير الرابط أو حذف الحرف.', ctx.href('/coptic'), 'العودة إلى الحروف')}</div>`;
  const previous = letters[index - 1];
  const next = letters[index + 1];
  return `<div class="content-page detail-page page-enter letter-detail-page">
    <div class="back-row"><a class="back-button" href="${ctx.href('/coptic')}"><span aria-hidden="true">→</span> رجوع إلى الحروف</a><a class="quiet-home" href="${ctx.href('/home')}">الرئيسية</a></div>
    <section class="letter-hero"><div class="letter-hero-copy"><span class="eyebrow">حرف جديد · ${escapeHTML(item.transliteration || '')}</span><h1>هيا نتعرف على <span>${escapeHTML(item.name || item.transliteration || 'الحرف')}</span></h1><p>انظر إلى الحرف، اقرأ اسمه، وجرب كتابته مع شخص كبير.</p></div><div class="letter-hero-side"><div class="giant-letter" lang="cop" aria-label="حرف ${escapeHTML(item.transliteration || '')}">${escapeHTML(item.glyph)}</div></div><span class="letter-hero-sparkle" aria-hidden="true">✦</span></section>
    <div class="letter-learning-grid">
      <article class="content-tile example-tile"><div class="tile-heading"><span class="tile-icon example-icon">🔤</span><div><span class="eyebrow">كلمة للتدرب</span><h2>مثال وكلمة</h2></div></div><div class="example-word" lang="cop">${escapeHTML(item.word || '…')}</div><p class="example-translation">${escapeHTML(item.translation || 'سنضيف مثالا مناسبا لهذا الحرف.')}</p><span class="practice-dots" aria-hidden="true">●　●　●</span></article>
      <article class="content-tile worksheet-tile"><div class="tile-heading"><span class="tile-icon worksheet-icon">🖨️</span><div><span class="eyebrow">وقت التلوين والكتابة</span><h2>ورقة عمل</h2></div></div><p>اطبع ورقة جميلة، ثم تتبع الحرف بإصبعك أو بقلمك.</p><button class="button button-primary print-button" type="button" data-print-work><span aria-hidden="true">🖨️</span> اطبع الورقة</button></article>
      <article class="content-tile sources-tile"><div class="tile-heading"><span class="tile-icon source-icon">🔗</span><div><span class="eyebrow">من أين نتعلم؟</span><h2>مصادر الحرف</h2></div></div>${sourceList(item.sources)}</article>
      <article class="content-tile parent-tip-tile"><div class="tile-heading"><span class="tile-icon notes-icon">💛</span><div><span class="eyebrow">تعلم معا</span><h2>ملاحظة للأهل</h2></div></div><p>${escapeHTML(item.note || 'شجع الطفل على النظر إلى شكل الحرف ورسمه في الهواء، ثم على الورق.')}</p></article>
    </div>
    <div class="detail-complete-row">${completionButton('coptic', item.id, data)}<div class="detail-prev-next">${previous ? `<a class="button button-soft" href="${ctx.href('/letter', { id: previous.id })}">السابق <span aria-hidden="true">←</span></a>` : ''}${next ? `<a class="button button-soft" href="${ctx.href('/letter', { id: next.id })}">الحرف التالي <span aria-hidden="true">→</span></a>` : ''}</div></div>
    <section class="print-sheet" aria-label="ورقة عمل حرف ${escapeHTML(item.transliteration || '')}"><div class="worksheet-top"><div class="worksheet-brand">لحن <span>ورقة تعلم مرحة</span></div><div class="worksheet-stamp">Ⲁⲃⲅ</div></div><div class="worksheet-title"><span>حرف اليوم</span><h1>${escapeHTML(item.name || item.transliteration || '')}</h1></div><div class="worksheet-main-letter" lang="cop">${escapeHTML(item.glyph)}</div><div class="worksheet-label">أنظر، أقول، ثم أكتب</div><div class="worksheet-trace" lang="cop">${escapeHTML(item.glyph)}　${escapeHTML(item.glyph)}　${escapeHTML(item.glyph)}　${escapeHTML(item.glyph)}</div><div class="worksheet-example"><span>كلمة نتدرب عليها</span><strong lang="cop">${escapeHTML(item.word || '________________')}</strong><span>${escapeHTML(item.translation || '')}</span></div><div class="worksheet-writing-lines"><span></span><span></span><span></span></div><div class="worksheet-footer"><span>اسمي: __________________</span><span>🌟 أحسنت يا بطل!</span></div></section>
  </div>`;
}

function renderLiturgy(ctx, data) {
  const items = sortByOrder(data.liturgy || []);
  return `<div class="content-page page-enter">${pageIntro(`محطة الحكايات · ${ctx.classConfig.name}`, 'الطقس', 'حكايات صغيرة تساعدنا أن نفهم الصلاة والكنيسة.', '⛪')}
    <div class="liturgy-welcome"><span class="liturgy-welcome-icon" aria-hidden="true">🕊️</span><div><strong>نتعلم بهدوء ومحبة</strong><p>هذه الدروس مبسطة من كتب المنهج، ومصادرها موجودة في صفحة كل درس.</p></div></div>
    ${items.length ? `<div class="item-grid liturgy-grid">${items.map((item, index) => `<a class="learning-card ritual-card" href="${ctx.href('/ritual', { id: item.id })}" style="--card-index:${index}">${mediaArt(item, 'card-art ritual-art')}<span class="card-topline"><span class="card-tag">درس قصير</span><span class="card-arrow" aria-hidden="true">←</span></span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.description || '')}</p><span class="card-action">اكتشف القصة <span aria-hidden="true">↙</span></span></a>`).join('')}</div>` : emptyState('⛪', 'حكايات جديدة قريبا', 'لا توجد دروس في هذا الفصل حاليا.', ctx.href('/home'), 'الرئيسية')}
    <div class="soft-callout callout-parent"><span aria-hidden="true">👨‍👩‍👧</span><p>المحتوى يساعد على الحوار، وليس بديلا عن إرشاد خادم الكنيسة.</p></div>
  </div>`;
}

function renderCurriculum(ctx, data) {
  const tracks = data.curriculum || [];
  const cards = tracks.map((track, index) => `<article class="content-tile curriculum-card" style="--card-index:${index}">
      <div class="tile-heading"><span class="tile-icon tone-icon" aria-hidden="true">${escapeHTML(track.icon || '📘')}</span><div><span class="eyebrow">${escapeHTML(track.duration || 'محطة من المنهج')}</span><h2>${escapeHTML(track.title)}</h2></div></div>
      <p class="curriculum-goal">${escapeHTML(track.goal || '')}</p>
      <ul class="curriculum-points">${(track.points || []).map((point) => `<li>${escapeHTML(point)}</li>`).join('')}</ul>
      ${track.reference ? `<small class="tiny-disclaimer">المرجع: ${escapeHTML(track.reference)}</small>` : ''}
      ${sourceList(track.links, 'source-list curriculum-sources')}
    </article>`).join('');
  return `<div class="content-page page-enter">${pageIntro(`منهج الفصل · ${ctx.classConfig.name}`, 'المنهج', 'الألحان والطقس والحروف القبطية لهذا الفصل، مع المدة والمرجع وروابط المصادر.', '📘')}
    ${tracks.length ? `<div class="curriculum-grid">${cards}</div>` : emptyState('📘', 'لا يوجد منهج بعد', 'سيضاف المنهج هنا قريبا.', ctx.href('/home'), 'الرئيسية')}
  </div>`;
}

function renderRitualDetail(ctx, data, id) {
  const item = (data.liturgy || []).find((lesson) => lesson.id === id);
  if (!item) return `<div class="content-page page-enter">${emptyState('⛪', 'لم نجد هذا الدرس', 'ربما تغير الرابط أو حذف الدرس.', ctx.href('/liturgy'), 'العودة إلى الطقس')}</div>`;
  return `<div class="content-page detail-page page-enter">
    <div class="back-row"><a class="back-button" href="${ctx.href('/liturgy')}"><span aria-hidden="true">→</span> رجوع إلى الطقس</a><a class="quiet-home" href="${ctx.href('/home')}">الرئيسية</a></div>
    <section class="ritual-detail-hero"><div class="ritual-detail-icon" aria-hidden="true">${escapeHTML(item.icon || '⛪')}</div><div><span class="eyebrow">حكاية من الطقس · لنتعلم معا</span><h1>${escapeHTML(item.title)}</h1><p>${escapeHTML(item.description || '')}</p></div></section>
    <div class="ritual-detail-layout">
      <div class="ritual-main-column"><article class="content-tile lesson-text-tile"><div class="tile-heading"><span class="tile-icon notes-icon">📚</span><div><span class="eyebrow">نقرأ ونحكي</span><h2>${escapeHTML(item.title)}</h2></div></div><div class="lesson-body">${textParagraphs(item.body || '')}</div></article></div>
      <aside class="ritual-aside">
        <article class="content-tile lesson-notes-tile"><div class="tile-heading"><span class="tile-icon example-icon">💡</span><div><span class="eyebrow">تذكروا</span><h2>ملاحظات</h2></div></div><p>${escapeHTML(item.notes || 'لا توجد ملاحظات بعد.')}</p></article>
        <article class="content-tile sources-tile"><div class="tile-heading"><span class="tile-icon source-icon">🔗</span><div><span class="eyebrow">من أين جاء الدرس؟</span><h2>مصادر الدرس</h2></div></div>${sourceList(item.sources) || '<p>لا توجد مصادر مسجلة.</p>'}</article>
      </aside>
    </div>
    <div class="detail-complete-row">${completionButton('liturgy', item.id, data)}<a class="button button-soft" href="${ctx.href('/liturgy')}">اختر حكاية أخرى <span aria-hidden="true">←</span></a></div>
  </div>`;
}

function renderClassPage(ctx, route) {
  const { data } = ctx;
  if (route.page === 'home') return renderHome(ctx, data);
  if (route.page === 'hymns') return renderHymns(ctx, data);
  if (route.page === 'hymn') return renderHymnDetail(ctx, data, route.params.get('id'));
  if (route.page === 'coptic') return renderCoptic(ctx, data);
  if (route.page === 'letter') return renderLetterDetail(ctx, data, route.params.get('id'));
  if (route.page === 'liturgy') return renderLiturgy(ctx, data);
  if (route.page === 'ritual') return renderRitualDetail(ctx, data, route.params.get('id'));
  if (route.page === 'curriculum') return renderCurriculum(ctx, data);
  return emptyState('🧭', 'هذه الصفحة غير موجودة', 'لنرجع معا إلى بداية الرحلة.', ctx.href('/home'), 'العودة للرئيسية');
}

function renderNotFound() {
  return `<div class="content-page page-enter">${emptyState('🧭', 'هذه الصفحة غير موجودة', 'لنرجع معا إلى صفحة اختيار الفصل.', '#/', 'اختيار الفصل')}</div>`;
}

// ---------------------------------------------------------------------------
// Render cycle
// ---------------------------------------------------------------------------

function bindPageInteractions(ctx, data) {
  root.querySelectorAll('[data-complete]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.complete;
      data.progress ||= { completed: [] };
      data.progress.completed ||= [];
      if (!data.progress.completed.includes(key)) {
        data.progress.completed.push(key);
        try {
          saveProgress(ctx.classId, data.progress);
          toast('رائع! أضفنا نجمة إلى رحلتك ⭐');
          renderApp();
        } catch (error) {
          toast(error.message, 'error');
        }
      } else {
        toast('هذه الرحلة مكتملة بالفعل، أحسنت! 🌟');
      }
    });
  });
  root.querySelectorAll('[data-print-work]').forEach((button) => button.addEventListener('click', () => window.print()));
  bindAudioPlayers(root);
}

function renderApp() {
  if (!root) return;
  const route = resolveRoute();

  // Old links without a class: continue in the last opened class, otherwise pick.
  if (route.kind === 'legacy') {
    pendingLegacyPage = route.page === 'admin' ? 'home' : route.page;
    pendingLegacyQuery = route.params.toString();
    const lastClass = getLastClass();
    replaceHash(lastClass ? `#/${lastClass}/${pendingLegacyPage}${pendingLegacyQuery ? `?${pendingLegacyQuery}` : ''}` : '#/');
    return;
  }

  // The admin panel was removed: send old admin links to the class home page.
  if (route.kind === 'retired-admin') {
    const target = route.classId || getLastClass();
    replaceHash(target ? `#/${target}/home` : '#/');
    return;
  }

  const classId = route.kind === 'page' ? route.classId : '';
  applyTheme(classId);
  if (classId) setLastClass(classId);

  const classConfig = classId ? getClassConfig(classId) : null;
  const data = classId ? loadData(classId) : null;
  const ctx = {
    classId,
    classConfig,
    data,
    href: (path, params) => classHref(classId, path, params),
  };

  const active = sectionForPage(route.page);
  let page = '';
  let title = 'رحلتنا';

  if (route.kind === 'picker') {
    page = renderPicker();
    title = 'اختيار الفصل';
  } else if (route.kind === 'contact') {
    page = renderContact();
    title = 'تواصل معي';
  } else if (route.kind === 'notfound') {
    page = renderNotFound();
    title = 'صفحة غير موجودة';
  } else if (route.kind === 'page') {
    page = renderClassPage(ctx, route);
    title = `${classConfig ? `${classConfig.name} · ` : ''}${PAGE_TITLES[route.page] || 'رحلتنا'}`;
  }

  const headerActive = route.kind === 'page' ? active : '';
  const visitorBar = classId ? renderVisitorClassBar({ classId, page: route.page }) : '';
  root.innerHTML = `${renderHeader({ active: headerActive, classId })}<main id="main-content" class="main-content" tabindex="-1">${visitorBar}${page}</main>${renderFooter({ classId })}`;

  bindPageInteractions(ctx, data);

  document.title = `${title} | لحن`;
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

window.addEventListener('hashchange', renderApp);

cleanupLegacyStorage();
renderApp();

export { renderApp };
