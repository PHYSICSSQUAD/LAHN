import { APP_CONFIG, CLASS_LIST, getClassConfig } from './config.js';
import { escapeHTML, formatTime, classHref, safeLinkUrl, linkKind } from './utils.js';

export function renderSiteBanner() {
  const text = String(APP_CONFIG.siteBanner || '').trim();
  if (!text) return '';
  return `<div class="site-banner" data-site-banner><p class="site-banner-inner"><span class="site-banner-mark" aria-hidden="true">✝</span><span class="site-banner-text">${escapeHTML(text)}</span><span class="site-banner-mark" aria-hidden="true">✝</span></p></div>`;
}

export function renderHeader({ active = '', classId = '' } = {}) {
  const classConfig = classId ? getClassConfig(classId) : null;
  const homeHref = classId ? classHref(classId, '/home') : '#/';
  const links = [
    { id: 'hymns', href: classHref(classId, '/hymns'), icon: '🎵', label: 'الألحان' },
    { id: 'liturgy', href: classHref(classId, '/liturgy'), icon: '⛪', label: 'الطقس' },
    { id: 'coptic', href: classHref(classId, '/coptic'), icon: 'Ⲁⲃⲅ', label: 'القبطي' },
    { id: 'curriculum', href: classHref(classId, '/curriculum'), icon: '📘', label: 'المنهج' },
  ];
  const brandSub = classConfig ? `${classConfig.name} · ${classConfig.arabicName}` : 'اختار فصلك وابدأ';
  return `${renderSiteBanner()}
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="${homeHref}" aria-label="لحن — ${classConfig ? escapeHTML(classConfig.name) : 'الصفحة الرئيسية'}">
          <span class="brand-symbol" aria-hidden="true">${classConfig ? escapeHTML(classConfig.emoji) : '♫'}</span>
          <span class="brand-copy"><strong>لحن${classConfig ? ` <span class="brand-class">${escapeHTML(classConfig.name)}</span>` : ''}</strong><small>${escapeHTML(brandSub)}</small></span>
        </a>
        <nav class="main-nav" aria-label="التنقل الرئيسي">
          ${classId ? links.map((item) => `<a class="nav-link ${active === item.id ? 'is-active' : ''}" href="${item.href}" ${active === item.id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span></a>`).join('') : ''}
        </nav>
        <div class="header-actions">
          <a class="class-switch-link" href="#/"><span aria-hidden="true">🗂️</span><span>الفصول</span></a>
          <a class="contact-link" href="#/contact"><span aria-hidden="true">✉️</span><span>تواصل معنا</span></a>
        </div>
      </div>
    </header>`;
}

export function renderFooter({ classId = '' } = {}) {
  const classConfig = classId ? getClassConfig(classId) : null;
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <a class="footer-brand" href="${classId ? classHref(classId, '/home') : '#/'}"><span aria-hidden="true">${classConfig ? escapeHTML(classConfig.emoji) : '♫'}</span> لحن${classConfig ? ` ${escapeHTML(classConfig.name)}` : ''}</a>
        <p>خطوات صغيرة… وفرح كبير 🌟</p>
        <nav class="footer-links" aria-label="روابط سريعة">
          <a class="footer-contact" href="#/contact"><span aria-hidden="true">✉️</span> تواصل معي</a>
          <a class="footer-classes" href="#/"><span aria-hidden="true">🗂️</span> كل الفصول</a>
        </nav>
      </div>
      <div class="footer-note">المحتوى مأخوذ من منهج مدرسة الشمامسة، وكلمات الألحان من مصادرها الموثقة في صفحة كل لحن.</div>
    </footer>`;
}

// Quick strip to move between the three classes while browsing.
export function renderVisitorClassBar({ classId = '', page = 'home' } = {}) {
  const target = ['home', 'hymns', 'coptic', 'liturgy', 'curriculum'].includes(page) ? page : 'home';
  return `<div class="visitor-class-bar" role="group" aria-label="تبديل فصول الموقع">
    <span class="visitor-class-label"><span aria-hidden="true">🧭</span> تتصفح الآن</span>
    <div class="visitor-class-list">
      ${CLASS_LIST.map((item) => `<a class="visitor-class-link ${item.id === classId ? 'is-active' : ''}" href="${classHref(item.id, `/${target}`)}"><span aria-hidden="true">${escapeHTML(item.emoji)}</span><span>${escapeHTML(item.name)}</span></a>`).join('')}
    </div>
  </div>`;
}

export function mediaArt(item, className = '') {
  const icon = item.icon || item.glyph || '🌟';
  return `<div class="media-art ${className}" aria-hidden="true"><span class="art-emoji">${escapeHTML(icon)}</span></div>`;
}

// ---------------------------------------------------------------------------
// Source links (مصادر اللحن / الدرس)
// ---------------------------------------------------------------------------

const KIND_META = {
  youtube: { icon: '▶️', label: 'يوتيوب' },
  drive: { icon: '📂', label: 'Google Drive' },
  pdf: { icon: '📄', label: 'ملف PDF' },
  site: { icon: '🔗', label: 'موقع' },
};

export function sourceList(sources = [], className = 'source-list') {
  const items = (sources || [])
    .map((source) => ({ ...source, href: safeLinkUrl(source?.url) }))
    .filter((source) => source.href);
  if (!items.length) return '';
  return `<ul class="${className}">${items.map((source) => {
    const kind = linkKind(source.href);
    const meta = KIND_META[kind] || KIND_META.site;
    const external = !source.href.startsWith('assets/');
    return `<li class="source-item source-${kind}"><a href="${escapeHTML(source.href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}><span class="source-mark" aria-hidden="true">${meta.icon}</span><span class="source-copy"><strong>${escapeHTML(source.label || meta.label)}</strong><small>${escapeHTML(meta.label)}</small></span><span class="external-mark" aria-hidden="true">↗</span></a></li>`;
  }).join('')}</ul>`;
}

export function audioPlayer({ label = 'تسجيل صوتي', src = '', caption = '' } = {}) {
  const validSrc = String(src).startsWith('assets/') ? src : '';
  if (!validSrc) {
    return `<div class="audio-empty"><span class="audio-empty-icon" aria-hidden="true">🎧</span><div><strong>لا يوجد تسجيل للمدرسة هنا</strong><small>استمعوا للحن من المصادر بصوت المعلم إبراهيم عياد.</small></div></div>`;
  }
  return `
    <div class="audio-player" data-audio-player>
      <audio preload="metadata" src="${escapeHTML(validSrc)}"></audio>
      <button class="audio-play" type="button" data-audio-play aria-label="تشغيل ${escapeHTML(label)}"><span aria-hidden="true">▶</span></button>
      <div class="audio-player-content">
        <div class="audio-player-title"><strong>${escapeHTML(label)}</strong><span class="audio-status">${escapeHTML(caption || 'جاهز للاستماع')}</span></div>
        <div class="audio-player-controls">
          <input type="range" class="audio-seek" min="0" max="100" value="0" step="0.1" data-audio-seek aria-label="تقدم التسجيل: ${escapeHTML(label)}" />
          <span class="audio-time" data-audio-time dir="ltr">${formatTime(0)} / ${formatTime(0)}</span>
        </div>
      </div>
    </div>`;
}

export function bindAudioPlayers(root = document) {
  root.querySelectorAll('[data-audio-player]').forEach((player) => {
    if (player.dataset.bound === 'true') return;
    player.dataset.bound = 'true';
    const audio = player.querySelector('audio');
    const playButton = player.querySelector('[data-audio-play]');
    const seek = player.querySelector('[data-audio-seek]');
    const time = player.querySelector('[data-audio-time]');
    const status = player.querySelector('.audio-status');
    if (!audio || !playButton || !seek || !time) return;

    const updateTime = () => {
      const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      seek.value = duration ? String((current / duration) * 100) : '0';
      time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    };
    const setPlayState = (playing) => {
      player.classList.toggle('is-playing', playing);
      playButton.innerHTML = `<span aria-hidden="true">${playing ? 'Ⅱ' : '▶'}</span>`;
      playButton.setAttribute('aria-label', `${playing ? 'إيقاف مؤقت' : 'تشغيل'} ${player.querySelector('.audio-player-title strong')?.textContent || 'التسجيل'}`);
      if (status) status.textContent = playing ? 'يشغل الآن' : 'جاهز للاستماع';
    };

    playButton.addEventListener('click', async () => {
      if (!audio.src) {
        if (status) status.textContent = 'تعذر العثور على الملف';
        return;
      }
      if (audio.paused) {
        try {
          await audio.play();
        } catch {
          if (status) status.textContent = 'اضغط مرة أخرى لتشغيل الصوت';
        }
      } else {
        audio.pause();
      }
    });
    seek.addEventListener('input', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = (Number(seek.value) / 100) * audio.duration;
        updateTime();
      }
    });
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('play', () => setPlayState(true));
    audio.addEventListener('pause', () => setPlayState(false));
    audio.addEventListener('ended', () => { setPlayState(false); updateTime(); });
    audio.addEventListener('error', () => { if (status) status.textContent = 'تعذر تشغيل هذا التسجيل الآن'; });
    updateTime();
  });
}
