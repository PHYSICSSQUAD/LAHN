import { APP_CONFIG, CLASS_LIST, getClassConfig } from './config.js';
import { escapeHTML, formatTime, classHref } from './utils.js';

export function renderSiteBanner() {
  const text = String(APP_CONFIG.siteBanner || '').trim();
  if (!text) return '';
  return `<div class="site-banner" data-site-banner><p class="site-banner-inner"><span class="site-banner-mark" aria-hidden="true">✝</span><span class="site-banner-text">${escapeHTML(text)}</span><span class="site-banner-mark" aria-hidden="true">✝</span></p></div>`;
}

export function renderHeader({ active = '', classId = '', session = null } = {}) {
  const classConfig = classId ? getClassConfig(classId) : null;
  const homeHref = classId ? classHref(classId, '/home') : '#/';
  const adminHref = session?.role === 'general' ? '#/admin' : classHref(classId, '/admin');
  const links = [
    { id: 'hymns', href: classHref(classId, '/hymns'), icon: '🎵', label: 'الألحان' },
    { id: 'liturgy', href: classHref(classId, '/liturgy'), icon: '⛪', label: 'الطقس' },
    { id: 'coptic', href: classHref(classId, '/coptic'), icon: 'Ⲁⲃⲅ', label: 'القبطي' },
  ];
  const brandSub = classConfig ? `${classConfig.name} · ${classConfig.arabicName}` : 'اختار فصلك وابدأ';
  const adminLabel = session ? 'لوحة الإدارة' : 'دخول الإدارة';
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
          <a class="parents-link" href="${adminHref}"><span class="parents-sparkle" aria-hidden="true">✦</span><span>${escapeHTML(adminLabel)}</span><span class="parents-arrow" aria-hidden="true">↙</span></a>
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
          <a class="footer-admin" href="${classId ? classHref(classId, '/admin') : '#/admin'}">لوحة الإدارة <span class="footer-admin-label">Admin</span><span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div class="footer-note">محتوى تعليمي تجريبي — أضيفوا مواد فصل كل خدمة من لوحة الإدارة.</div>
    </footer>`;
}

// Class switcher strip: the general admin uses it inside the admin panel,
// and it also appears on class pages so switching between classes is one click.
export function renderClassSwitcher({ selectedClass = '', session = null } = {}) {
  if (session?.role !== 'general') return '';
  return `<div class="class-switcher-bar" data-class-switcher role="group" aria-label="تبديل الفصول">
    <span class="class-switcher-label"><span aria-hidden="true">🗂️</span> تبديل الفصول</span>
    <div class="class-switcher-list">
      ${CLASS_LIST.map((item) => `<button class="class-switcher-button ${selectedClass === item.id ? 'is-active' : ''}" type="button" data-admin-class="${item.id}" ${selectedClass === item.id ? 'aria-pressed="true"' : 'aria-pressed="false"'}><span aria-hidden="true">${escapeHTML(item.emoji)}</span><span>${escapeHTML(item.name)}</span></button>`).join('')}
    </div>
    <a class="class-switcher-link" href="#/admin">لوحة المدير العام <span aria-hidden="true">←</span></a>
  </div>`;
}

// Quick strip for the general admin while browsing a class site.
export function renderVisitorClassBar({ classId = '', page = 'home' } = {}) {
  const target = ['home', 'hymns', 'coptic', 'liturgy'].includes(page) ? page : 'home';
  return `<div class="visitor-class-bar" role="group" aria-label="تبديل فصول الموقع">
    <span class="visitor-class-label"><span aria-hidden="true">🧭</span> تتصفح الآن</span>
    <div class="visitor-class-list">
      ${CLASS_LIST.map((item) => `<a class="visitor-class-link ${item.id === classId ? 'is-active' : ''}" href="${classHref(item.id, `/${target}`)}"><span aria-hidden="true">${escapeHTML(item.emoji)}</span><span>${escapeHTML(item.name)}</span></a>`).join('')}
    </div>
    <a class="visitor-class-manage" href="${classHref(classId, '/admin')}">إدارة هذا الفصل <span aria-hidden="true">←</span></a>
  </div>`;
}

export function mediaArt(item, className = '') {
  const label = item.title || item.name || item.transliteration || 'صورة تعليمية';
  const icon = item.icon || item.glyph || '🌟';
  const image = item.imageAsset
    ? `<img class="art-image" data-asset-id="${escapeHTML(item.imageAsset)}" alt="${escapeHTML(label)}" hidden />`
    : '';
  return `<div class="media-art ${className}" aria-hidden="${image ? 'false' : 'true'}"><span class="art-emoji">${escapeHTML(icon)}</span>${image}</div>`;
}

export function audioPlayer({ label = 'تسجيل صوتي', assetId = '', src = '', caption = '' } = {}) {
  const validSrc = String(src).startsWith('assets/') ? src : '';
  if (!assetId && !validSrc) {
    return `<div class="audio-empty"><span class="audio-empty-icon" aria-hidden="true">🎧</span><div><strong>التسجيل قريبا</strong><small>سيضيف الأهل الصوت من لوحة الإدارة.</small></div></div>`;
  }
  return `
    <div class="audio-player" data-audio-player>
      <audio preload="metadata" ${assetId ? `data-asset-id="${escapeHTML(assetId)}"` : `src="${escapeHTML(validSrc)}"`}></audio>
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
    audio.addEventListener('error', () => { if (status) status.textContent = 'هذا تسجيل تجريبي غير متاح الآن'; });
    updateTime();
  });
}
