import { APP_CONFIG } from './config.js';
import { renderAdminPage, bindAdmin } from './admin.js';
import { renderHeader, renderFooter, mediaArt, audioPlayer, bindAudioPlayers } from './components.js';
import { loadData, saveData, hydrateMedia } from './storage.js';
import { escapeHTML, createHashUrl, getActiveSection, getRankLabel, safeYouTubeUrl, sortByOrder, sortStudents, textParagraphs, youtubeAnchor } from './utils.js';

const root = document.querySelector('#app');
let adminTab = 'overview';
let toastTimer;

function parseRoute() {
  const raw = window.location.hash.slice(1) || '/home';
  const splitAt = raw.indexOf('?');
  const pathname = splitAt >= 0 ? raw.slice(0, splitAt) : raw;
  const params = new URLSearchParams(splitAt >= 0 ? raw.slice(splitAt + 1) : '');
  return { path: pathname || '/home', params };
}

function toast(message, kind = 'success') {
  const area = document.querySelector('#toast-area');
  if (!area) return;
  clearTimeout(toastTimer);
  area.innerHTML = `<div class="toast toast-${kind}" role="status"><span class="toast-mark" aria-hidden="true">${kind === 'error' ? '!' : '✓'}</span><span>${escapeHTML(message)}</span></div>`;
  toastTimer = window.setTimeout(() => { area.innerHTML = ''; }, 3600);
}

function pageIntro(kicker, title, description, icon = '') {
  return `<div class="page-intro"><div class="page-intro-copy"><span class="eyebrow">${escapeHTML(kicker)}</span><h1>${icon ? `<span aria-hidden="true">${icon}</span> ` : ''}${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p></div><a class="back-home-link" href="#/home"><span aria-hidden="true">⌂</span> الرئيسية</a></div>`;
}

function emptyState(icon, title, message, link = '#/home', linkText = 'العودة للرئيسية') {
  return `<section class="empty-state"><div class="empty-state-icon" aria-hidden="true">${icon}</div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(message)}</p><a class="button button-primary" href="${link}">${escapeHTML(linkText)} <span aria-hidden="true">←</span></a></section>`;
}

function completionButton(collection, id, data) {
  const key = `${collection}:${id}`;
  const done = (data.progress?.completed || []).includes(key);
  return `<button class="complete-button ${done ? 'is-complete' : ''}" type="button" data-complete="${escapeHTML(key)}" ${done ? 'aria-pressed="true"' : 'aria-pressed="false"'}><span aria-hidden="true">${done ? '⭐' : '☆'}</span><span>${done ? 'أحسنت! هذه الرحلة مكتملة' : 'أنهيت التعلّم؟ اجمع نجمة!'}</span></button>`;
}

function renderHome(data) {
  const students = sortStudents(data.students || []).slice(0, 5);
  const completedCount = data.progress?.completed?.length || 0;
  return `
    <div class="home-page page-enter">
      <section class="hero-section">
        <div class="hero-copy">
          <span class="hero-kicker"><span class="hero-kicker-dot"></span> رحلة ممتعة للعائلة كلها</span>
          <h1>أهلًا يا بطل!<br /><span>جاهز نكتشف؟</span></h1>
          <p>نرنّم، نتعلّم حروفنا، ونكتشف أسرار الكنيسة… خطوة صغيرة كل يوم 💛</p>
          <div class="hero-actions">
            <a class="button button-primary button-large" href="#/hymns">هيا نبدأ <span aria-hidden="true">←</span></a>
            <div class="hero-progress"><span class="progress-star" aria-hidden="true">⭐</span><span><strong>${completedCount}</strong><small>نجمة في رحلتك</small></span></div>
          </div>
          <div class="hero-trust"><span aria-hidden="true">👨‍👩‍👧</span><span>نتعلّم مع ماما وبابا</span><i></i><span>بخطوات بسيطة</span></div>
        </div>
        <div class="hero-visual" aria-label="شمس صغيرة سعيدة تحمل كتابًا">
          <div class="hero-sky-orb hero-orb-one"></div><div class="hero-sky-orb hero-orb-two"></div>
          <span class="hero-doodle doodle-star" aria-hidden="true">✦</span><span class="hero-doodle doodle-note" aria-hidden="true">♪</span><span class="hero-doodle doodle-cloud" aria-hidden="true">☁</span>
          <div class="hero-art-ring"></div>
          <img class="hero-mascot" src="assets/images/mascot.png" alt="شمس لطيفة تقرأ كتابًا" fetchpriority="high" />
          <div class="hero-sticker sticker-song"><span aria-hidden="true">🎶</span><span>نرنّم سوا!</span></div>
          <div class="hero-sticker sticker-heart"><span aria-hidden="true">💛</span><span>أنت بطل!</span></div>
        </div>
        <span class="hero-bottom-cloud" aria-hidden="true"></span>
      </section>

      <section class="destination-section" aria-labelledby="destinations-title">
        <div class="section-heading">
          <div><span class="eyebrow">اختار مغامرتك</span><h2 id="destinations-title">إلى أين نذهب اليوم؟</h2><p>ثلاث محطات مليئة بالمرح والتعلّم</p></div>
          <span class="heading-doodle" aria-hidden="true">✿</span>
        </div>
        <div class="destination-grid">
          <a class="destination-card destination-hymns" href="#/hymns">
            <span class="destination-number">01</span><span class="destination-art" aria-hidden="true"><span>🎵</span><i>♪</i><b>♫</b></span>
            <span class="destination-body"><strong>الألحان</strong><small>نسمع ونرنّم معًا</small></span><span class="round-arrow" aria-hidden="true">←</span>
          </a>
          <a class="destination-card destination-liturgy" href="#/liturgy">
            <span class="destination-number">02</span><span class="destination-art" aria-hidden="true"><span>☀️</span><i>✦</i><b>☁</b></span>
            <span class="destination-body"><strong>الطقس</strong><small>نكتشف حكاية الكنيسة</small></span><span class="round-arrow" aria-hidden="true">←</span>
          </a>
          <a class="destination-card destination-coptic" href="#/coptic">
            <span class="destination-number">03</span><span class="destination-art coptic-art" aria-hidden="true"><span>Ⲁ</span><i>ⲃ</i><b>✦</b></span>
            <span class="destination-body"><strong>القبطي</strong><small>نلعب مع الحروف القبطية</small></span><span class="round-arrow" aria-hidden="true">←</span>
          </a>
        </div>
      </section>

      <section class="home-lower-grid">
        <div class="scoreboard-card">
          <div class="scoreboard-heading"><div class="trophy-icon" aria-hidden="true">🏆</div><div><span class="eyebrow">كل محاولة تستحق التصفيق</span><h2>ترتيب الأبطال</h2></div><span class="scoreboard-confetti" aria-hidden="true">✦</span></div>
          ${students.length ? `<ol class="score-list">${students.map((student, index) => `<li class="score-row ${index < 3 ? `score-rank-${index + 1}` : ''}"><span class="score-rank">${getRankLabel(index)}</span><span class="score-avatar" aria-hidden="true">${escapeHTML(student.avatar || '🌟')}</span><span class="score-name">${escapeHTML(student.name)}</span><span class="score-points"><strong>${Number(student.score) || 0}</strong><small>نقطة</small></span></li>`).join('')}</ol>` : `<div class="score-empty"><span>🌱</span><p>ستظهر أسماء الأبطال هنا قريبًا.</p></div>`}
          <div class="scoreboard-footer"><span>👏 كل طفل بطل بطريقته!</span><span class="read-only-note">النتائج يحدّثها الأهل</span></div>
        </div>
        <aside class="parent-note-card"><div class="parent-note-top"><span class="parent-note-icon" aria-hidden="true">🧡</span><span class="mini-label">للأهل الصغار والكبار</span></div><h2>لحظة تعلّم…<br /><span>تصير ذكرى حلوة.</span></h2><p>${escapeHTML(data.settings?.parentNote || 'اختاروا محطة، واستمتعوا بها معًا.')}</p><a href="#/admin" class="text-link">افتح مساحة الأهل <span aria-hidden="true">←</span></a><div class="parent-note-doodle" aria-hidden="true">✿</div></aside>
      </section>

      <section class="home-encouragement"><span class="encouragement-sun" aria-hidden="true">🌞</span><div><strong>أنت تتعلّم شيئًا جديدًا كل يوم!</strong><small>خذ نفسًا، اختر محطة، وابدأ مغامرتك.</small></div><span class="encouragement-stars" aria-hidden="true">✦　✦　✦</span></section>
    </div>`;
}

function renderHymns(data) {
  const items = sortByOrder(data.hymns || []);
  return `<div class="content-page page-enter">${pageIntro('محطة النغمات', 'الألحان', 'اسمع اللحن، اقرأ كلماته، وغنِّ مع من تحب.', '🎵')}
    ${items.length ? `<div class="item-grid hymn-grid">${items.map((item, index) => `<a class="learning-card hymn-card" href="${createHashUrl('/hymn', { id: item.id })}" style="--card-index:${index}">${mediaArt(item, 'card-art tone-art')}<span class="card-topline"><span class="card-tag">${item.demo ? 'مثال تجريبي' : 'لحن'}</span><span class="card-arrow" aria-hidden="true">←</span></span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.description || 'لحن جميل لنتعلّمه معًا.')}</p><span class="card-action">اكتشف اللحن <span aria-hidden="true">↙</span></span></a>`).join('')}</div>` : emptyState('🎶', 'قريبًا نرنّم معًا', 'سيضيف الأهل الألحان من لوحة الإدارة.', '#/admin', 'إضافة لحن')}
    <div class="soft-callout callout-song"><span aria-hidden="true">🎧</span><p>ارتدِ سماعاتك أو استمعوا معًا بصوت هادئ ومريح.</p></div>
  </div>`;
}

function renderHymnDetail(data, id) {
  const item = (data.hymns || []).find((hymn) => hymn.id === id);
  if (!item) return `<div class="content-page page-enter">${emptyState('🎵', 'لم نجد هذا اللحن', 'ربما تغيّر الرابط أو حُذف اللحن.', '#/hymns', 'العودة إلى الألحان')}</div>`;
  const primaryPlayer = audioPlayer({ label: 'اسمع اللحن', assetId: item.audioAsset, src: item.audioSrc, caption: item.demo ? 'نغمة تجريبية — ليست تسجيلًا كنسيًا' : 'التسجيل الأصلي' });
  const ownPlayer = audioPlayer({ label: 'تسجيلي', assetId: item.recordingAsset, src: item.recordingSrc, caption: item.demo ? 'ملف تجريبي — أضف تسجيلكم الخاص' : 'تسجيل خاص' });
  const source = safeYouTubeUrl(item.youtubeUrl);
  return `<div class="content-page detail-page page-enter">
    <div class="back-row"><a class="back-button" href="#/hymns"><span aria-hidden="true">→</span> رجوع إلى الألحان</a><a class="quiet-home" href="#/home">الرئيسية</a></div>
    <section class="detail-hero hymn-detail-hero"><div class="detail-hero-copy"><span class="eyebrow">محطة الألحان · ${item.demo ? 'محتوى تجريبي' : 'لنتعلّم معًا'}</span><h1>${escapeHTML(item.title)}</h1><p>${escapeHTML(item.description || '')}</p><div class="detail-hero-badges"><span>🎧 نستمع</span><span>📖 نقرأ</span><span>💛 نتعلّم معًا</span></div></div><div class="detail-hero-art">${mediaArt(item, 'detail-art tone-art')}<span class="detail-orbit orbit-one">♪</span><span class="detail-orbit orbit-two">✦</span></div></section>
    <div class="hymn-detail-grid">
      <article class="content-tile audio-tile"><div class="tile-heading"><span class="tile-icon tone-icon">🎧</span><div><span class="eyebrow">استمعوا معًا</span><h2>اسمع اللحن</h2></div></div>${primaryPlayer}<p class="tiny-disclaimer">${item.demo ? 'المقطع صوت اختباري قصير، وليس تسجيل اللحن الحقيقي.' : 'استمعوا بهدوء وجرّبوا ترديد اللحن.'}</p></article>
      <article class="content-tile source-tile"><div class="tile-heading"><span class="tile-icon source-icon">▶️</span><div><span class="eyebrow">مصدر خارجي</span><h2>شاهد المصدر</h2></div></div><p>شاهدوا الشرح أو التسجيل على يوتيوب مع أحد الوالدين.</p>${source ? youtubeAnchor(item.youtubeUrl, 'افتح المصدر على يوتيوب', 'button button-youtube button-wide') : '<div class="audio-empty"><span>🔎</span><div><strong>سيُضاف المصدر قريبًا</strong><small>يمكن إضافته من لوحة الأهل.</small></div></div>'}<small class="tiny-disclaimer">روابط الأمثلة تفتح نتائج بحث يوتيوب، ويمكن استبدالها بمصدر محدد.</small></article>
      <article class="content-tile lyrics-tile"><div class="tile-heading"><span class="tile-icon lyrics-icon">📖</span><div><span class="eyebrow">اقرأ وردّد</span><h2>الكلام</h2></div></div><div class="hymn-lyrics">${escapeHTML(item.lyrics || 'سيضيف الأهل كلمات اللحن هنا.').replaceAll('\n', '<br>')}</div></article>
      <article class="content-tile recording-tile"><div class="tile-heading"><span class="tile-icon recording-icon">🎙️</span><div><span class="eyebrow">صوت الأسرة</span><h2>تسجيلي</h2></div></div>${ownPlayer}<p class="tiny-disclaimer">سجّلوا اللحن بصوتكم وأضيفوه من لوحة الأهل.</p></article>
      <article class="content-tile notes-tile"><div class="tile-heading"><span class="tile-icon notes-icon">📝</span><div><span class="eyebrow">معلومة لطيفة</span><h2>ملاحظات</h2></div></div><p>${escapeHTML(item.notes || 'لا توجد ملاحظات بعد.')}</p></article>
    </div>
    <div class="detail-complete-row">${completionButton('hymns', item.id, data)}<a class="button button-soft" href="#/hymns">اختر لحنًا آخر <span aria-hidden="true">←</span></a></div>
  </div>`;
}

function renderCoptic(data) {
  const letters = sortByOrder(data.copticLetters || []);
  const sourceHref = safeYouTubeUrl(data.settings?.copticSourceUrl);
  return `<div class="content-page page-enter">${pageIntro('محطة الحروف', 'القبطي', 'كل حرف له شكل وصوت وحكاية صغيرة. هيا نتعرّف إليها!', 'Ⲁⲃⲅ')}
    <div class="coptic-tip"><span aria-hidden="true">💡</span><p>اضغط على الحرف لتسمع عنه، وتقرأ مثالًا، وتطبع ورقة تدريب.</p><span class="coptic-tip-coptic" aria-hidden="true">Ⲁ Ⲃ Ⲅ</span></div>
    ${letters.length ? `<div class="letter-grid">${letters.map((letter, index) => `<a class="letter-card" href="${createHashUrl('/letter', { id: letter.id })}" style="--card-index:${index}"><span class="letter-glyph" lang="cop">${escapeHTML(letter.glyph || 'Ⲁ')}</span><span class="letter-name">${escapeHTML(letter.transliteration || letter.name || 'حرف جديد')}</span><span class="letter-card-arrow" aria-hidden="true">↙</span></a>`).join('')}</div>` : emptyState('Ⲁ', 'الحروف ستصل قريبًا', 'يمكن إضافة حروف من لوحة الأهل.', '#/admin', 'إضافة حرف')}
    <section class="youtube-banner coptic-source-banner"><span class="youtube-banner-art" aria-hidden="true">📺</span><div><span class="eyebrow">شاهدوا وتعلّموا</span><h2>شرح القبطي مع الأسرة</h2><p>رابط تعليمي يضيفه الأهل. روابط العرض الحالية بحث تجريبي على يوتيوب.</p></div>${sourceHref ? youtubeAnchor(data.settings.copticSourceUrl, 'شاهد شرح القبطي', 'button button-youtube') : '<a class="button button-soft" href="#/admin">أضف رابطًا من لوحة الأهل</a>'}</section>
  </div>`;
}

function renderLetterDetail(data, id) {
  const letters = sortByOrder(data.copticLetters || []);
  const index = letters.findIndex((letter) => letter.id === id);
  const item = letters[index];
  if (!item) return `<div class="content-page page-enter">${emptyState('Ⲁ', 'لم نجد هذا الحرف', 'ربما تغيّر الرابط أو حُذف الحرف.', '#/coptic', 'العودة إلى الحروف')}</div>`;
  const audio = audioPlayer({ label: `نطق حرف ${item.transliteration || item.name || ''}`, assetId: item.audioAsset, src: item.audioSrc, caption: item.demo ? 'نغمة تجريبية — ليست نطقًا' : 'تسجيل النطق' });
  const previous = letters[index - 1];
  const next = letters[index + 1];
  return `<div class="content-page detail-page page-enter letter-detail-page">
    <div class="back-row"><a class="back-button" href="#/coptic"><span aria-hidden="true">→</span> رجوع إلى الحروف</a><a class="quiet-home" href="#/home">الرئيسية</a></div>
    <section class="letter-hero"><div class="letter-hero-copy"><span class="eyebrow">حرف جديد · ${escapeHTML(item.transliteration || '')}</span><h1>هيا نتعرّف على <span>${escapeHTML(item.name || item.transliteration || 'الحرف')}</span></h1><p>انظر إلى الحرف، اسمع صوته، وجرّب كتابته مع شخص كبير.</p><span class="demo-pill">${item.demo ? 'مثال تعليمي قابل للتعديل' : 'درس الحرف'}</span></div><div class="letter-hero-side"><div class="giant-letter" lang="cop" aria-label="حرف ${escapeHTML(item.transliteration || '')}">${escapeHTML(item.glyph)}</div>${item.imageAsset ? mediaArt(item, 'letter-image-art') : ''}</div><span class="letter-hero-sparkle" aria-hidden="true">✦</span></section>
    <div class="letter-learning-grid">
      <article class="content-tile pronunciation-tile"><div class="tile-heading"><span class="tile-icon tone-icon">🔊</span><div><span class="eyebrow">جرّب أن تسمع</span><h2>النطق</h2></div></div>${audio}<p class="tiny-disclaimer">${item.demo && item.audioSrc ? 'الصوت المرفق تجريبي، وليس نطقًا صحيحًا للحرف.' : escapeHTML(item.note || (item.audioAsset ? 'استمعوا إلى صوت الحرف وكرّروا معًا.' : 'يمكن إضافة تسجيل النطق من لوحة الأهل.'))}</p></article>
      <article class="content-tile example-tile"><div class="tile-heading"><span class="tile-icon example-icon">🔤</span><div><span class="eyebrow">كلمة للتدرّب</span><h2>مثال وكلمة</h2></div></div><div class="example-word" lang="cop">${escapeHTML(item.word || '…')}</div><p class="example-translation">${escapeHTML(item.translation || 'سيضيف المعلّم مثالًا مناسبًا لهذا الحرف.')}</p><span class="practice-dots" aria-hidden="true">●　●　●</span></article>
      <article class="content-tile worksheet-tile"><div class="tile-heading"><span class="tile-icon worksheet-icon">🖨️</span><div><span class="eyebrow">وقت التلوين والكتابة</span><h2>ورقة عمل</h2></div></div><p>اطبع ورقة جميلة، ثم تتبّع الحرف بإصبعك أو بقلمك.</p><button class="button button-primary print-button" type="button" data-print-work><span aria-hidden="true">🖨️</span> اطبع الورقة</button><a class="button button-soft worksheet-download" data-asset-id="${escapeHTML(item.worksheetAsset || '')}" data-asset-link hidden download="ورقة-${escapeHTML(item.glyph)}.pdf"><span aria-hidden="true">⬇️</span> تنزيل ملف إضافي</a></article>
      ${safeYouTubeUrl(item.youtubeUrl) ? `<article class="content-tile letter-source-tile"><div class="tile-heading"><span class="tile-icon source-icon">▶️</span><div><span class="eyebrow">مصدر إضافي</span><h2>شاهد شرح الحرف</h2></div></div>${youtubeAnchor(item.youtubeUrl, 'شاهدوا على يوتيوب', 'button button-youtube button-wide')}</article>` : ''}
      <article class="content-tile parent-tip-tile"><div class="tile-heading"><span class="tile-icon notes-icon">💛</span><div><span class="eyebrow">تعلّم معًا</span><h2>ملاحظة للأهل</h2></div></div><p>${escapeHTML(item.note && !item.audioSrc ? item.note : 'شجّع الطفل على النظر إلى شكل الحرف ورسمه في الهواء. يمكن للأهل تعديل المثال والتسجيل من لوحة الأهل.')}</p></article>
    </div>
    <div class="detail-complete-row">${completionButton('coptic', item.id, data)}<div class="detail-prev-next">${previous ? `<a class="button button-soft" href="${createHashUrl('/letter', { id: previous.id })}">السابق <span aria-hidden="true">←</span></a>` : ''}${next ? `<a class="button button-soft" href="${createHashUrl('/letter', { id: next.id })}">الحرف التالي <span aria-hidden="true">→</span></a>` : ''}</div></div>
    <section class="print-sheet" aria-label="ورقة عمل حرف ${escapeHTML(item.transliteration || '')}"><div class="worksheet-top"><div class="worksheet-brand">لَحْن <span>ورقة تعلّم مرحة</span></div><div class="worksheet-stamp">Ⲁⲃⲅ</div></div><div class="worksheet-title"><span>حرف اليوم</span><h1>${escapeHTML(item.name || item.transliteration || '')}</h1></div><div class="worksheet-main-letter" lang="cop">${escapeHTML(item.glyph)}</div><div class="worksheet-label">أنظر، أقول، ثم أكتب</div><div class="worksheet-trace" lang="cop">${escapeHTML(item.glyph)}　${escapeHTML(item.glyph)}　${escapeHTML(item.glyph)}　${escapeHTML(item.glyph)}</div><div class="worksheet-example"><span>كلمة نتدرّب عليها</span><strong lang="cop">${escapeHTML(item.word || '________________')}</strong><span>${escapeHTML(item.translation || '')}</span></div><div class="worksheet-writing-lines"><span></span><span></span><span></span></div><div class="worksheet-footer"><span>اسمي: __________________</span><span>🌟 أحسنت يا بطل!</span></div></section>
  </div>`;
}

function renderLiturgy(data) {
  const items = sortByOrder(data.liturgy || []);
  return `<div class="content-page page-enter">${pageIntro('محطة الحكايات', 'الطقس', 'حكايات صغيرة تساعدنا أن نفهم الصلاة والكنيسة.', '☀️')}
    <div class="liturgy-welcome"><span class="liturgy-welcome-icon" aria-hidden="true">🕊️</span><div><strong>نتعلّم بهدوء ومحبة</strong><p>هذه الدروس مبسّطة للأسرة، ويمكن للأهل تعديلها لتناسب تعليم كنيستهم.</p></div></div>
    ${items.length ? `<div class="item-grid liturgy-grid">${items.map((item, index) => `<a class="learning-card ritual-card" href="${createHashUrl('/ritual', { id: item.id })}" style="--card-index:${index}">${mediaArt(item, 'card-art ritual-art')}<span class="card-topline"><span class="card-tag">${item.demo ? 'قصة تجريبية' : 'درس قصير'}</span><span class="card-arrow" aria-hidden="true">←</span></span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(item.description || '')}</p><span class="card-action">اكتشف القصة <span aria-hidden="true">↙</span></span></a>`).join('')}</div>` : emptyState('☀️', 'حكايات جديدة قريبًا', 'سيضيف الأهل دروس الطقس من لوحة الإدارة.', '#/admin', 'إضافة درس')}
    <div class="soft-callout callout-parent"><span aria-hidden="true">👨‍👩‍👧</span><p>المحتوى يساعد على الحوار، وليس بديلًا عن إرشاد معلّم الكنيسة.</p></div>
  </div>`;
}

function renderRitualDetail(data, id) {
  const item = (data.liturgy || []).find((lesson) => lesson.id === id);
  if (!item) return `<div class="content-page page-enter">${emptyState('☀️', 'لم نجد هذا الدرس', 'ربما تغيّر الرابط أو حُذف الدرس.', '#/liturgy', 'العودة إلى الطقس')}</div>`;
  const source = safeYouTubeUrl(item.youtubeUrl);
  return `<div class="content-page detail-page page-enter">
    <div class="back-row"><a class="back-button" href="#/liturgy"><span aria-hidden="true">→</span> رجوع إلى الطقس</a><a class="quiet-home" href="#/home">الرئيسية</a></div>
    <section class="ritual-detail-hero"><div class="ritual-detail-icon" aria-hidden="true">${escapeHTML(item.icon || '☀️')}</div><div><span class="eyebrow">حكاية من الطقس · ${item.demo ? 'مثال قابل للتعديل' : 'لنتعلّم معًا'}</span><h1>${escapeHTML(item.title)}</h1><p>${escapeHTML(item.description || '')}</p></div></section>
    <div class="ritual-detail-layout"><div class="ritual-main-column"><article class="content-tile lesson-text-tile"><div class="tile-heading"><span class="tile-icon notes-icon">📚</span><div><span class="eyebrow">نقرأ ونحكي</span><h2>${escapeHTML(item.title)}</h2></div></div><div class="lesson-body">${textParagraphs(item.body || 'سيضيف الأهل محتوى هذا الدرس قريبًا.')}</div></article>${item.imageAsset ? `<figure class="lesson-image media-art" aria-label="صورة توضيحية"><span class="art-emoji" aria-hidden="true">${escapeHTML(item.icon || '☀️')}</span><img class="art-image" data-asset-id="${escapeHTML(item.imageAsset)}" alt="${escapeHTML(item.title)}" hidden /></figure>` : ''}</div>
      <aside class="ritual-aside"><article class="content-tile lesson-audio-tile"><div class="tile-heading"><span class="tile-icon tone-icon">🎧</span><div><span class="eyebrow">استمعوا معًا</span><h2>تسجيل الدرس</h2></div></div>${audioPlayer({ label: 'استمع إلى الدرس', assetId: item.audioAsset, src: item.audioSrc, caption: item.demo ? 'صوت تجريبي قصير' : 'تسجيل الدرس' })}<small class="tiny-disclaimer">${item.demo && item.audioSrc ? 'نغمة اختبار فقط وليست شرحًا صوتيًا.' : ''}</small></article><article class="content-tile lesson-notes-tile"><div class="tile-heading"><span class="tile-icon example-icon">💡</span><div><span class="eyebrow">تذكّروا</span><h2>ملاحظات</h2></div></div><p>${escapeHTML(item.notes || 'لا توجد ملاحظات بعد.')}</p></article>${source ? `<article class="content-tile lesson-source-tile"><div class="tile-heading"><span class="tile-icon source-icon">▶️</span><div><span class="eyebrow">شاهدوا معًا</span><h2>مصدر إضافي</h2></div></div>${youtubeAnchor(item.youtubeUrl, 'شاهدوا على يوتيوب', 'button button-youtube button-wide')}<small class="tiny-disclaimer">روابط الأمثلة تفتح نتائج بحث تجريبية.</small></article>` : ''}</aside></div>
    <div class="detail-complete-row">${completionButton('liturgy', item.id, data)}<a class="button button-soft" href="#/liturgy">اختر حكاية أخرى <span aria-hidden="true">←</span></a></div>
  </div>`;
}

function renderPage(route, data) {
  if (route.path === '/' || route.path === '/home') return renderHome(data);
  if (route.path === '/hymns') return renderHymns(data);
  if (route.path === '/hymn') return renderHymnDetail(data, route.params.get('id'));
  if (route.path === '/coptic') return renderCoptic(data);
  if (route.path === '/letter') return renderLetterDetail(data, route.params.get('id'));
  if (route.path === '/liturgy') return renderLiturgy(data);
  if (route.path === '/ritual') return renderRitualDetail(data, route.params.get('id'));
  if (route.path === '/admin') return renderAdminPage(data, adminTab);
  return emptyState('🧭', 'هذه الصفحة غير موجودة', 'لنرجع معًا إلى بداية الرحلة.', '#/home', 'العودة للرئيسية');
}

function bindPageInteractions(route, data) {
  root.querySelectorAll('[data-complete]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.complete;
      data.progress ||= { completed: [] };
      data.progress.completed ||= [];
      if (!data.progress.completed.includes(key)) {
        data.progress.completed.push(key);
        try {
          saveData(data);
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
  hydrateMedia(root).then(() => bindAudioPlayers(root)).catch((error) => console.warn('Media loading issue:', error));
  if (route.path === '/admin') {
    bindAdmin(root, {
      rerender: renderApp,
      setTab: (tab) => { adminTab = tab; renderApp(); },
      toast,
      navigate: (path) => { window.location.hash = path; },
    });
  }
}

function renderApp() {
  if (!root) return;
  const route = parseRoute();
  const data = loadData();
  const active = getActiveSection(route.path);
  const page = renderPage(route, data);
  root.innerHTML = `${renderHeader(active)}<main id="main-content" class="main-content" tabindex="-1">${page}</main>${renderFooter()}`;
  bindPageInteractions(route, data);
  const titles = { '/home': 'الرئيسية', '/hymns': 'الألحان', '/coptic': 'القبطي', '/liturgy': 'الطقس', '/admin': 'مساحة الأهل' };
  const currentTitle = titles[route.path] || (route.path === '/hymn' ? 'لحن' : route.path === '/letter' ? 'حرف قبطي' : route.path === '/ritual' ? 'درس من الطقس' : 'رحلتنا');
  document.title = `${currentTitle} | لَحْن`;
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

window.addEventListener('hashchange', renderApp);
window.addEventListener('storage', (event) => {
  if (event.key === APP_CONFIG.storageKey) renderApp();
});
renderApp();
