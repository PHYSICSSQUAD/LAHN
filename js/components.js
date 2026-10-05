import { escapeHTML, formatTime } from './utils.js';

export function renderHeader(active = '') {
  const links = [
    { id: 'hymns', href: '#/hymns', icon: '🎵', label: 'الألحان' },
    { id: 'liturgy', href: '#/liturgy', icon: '⛪', label: 'الطقس' },
    { id: 'coptic', href: '#/coptic', icon: 'Ⲁⲃⲅ', label: 'القبطي' },
  ];
  return `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="#/home" aria-label="لحن — الصفحة الرئيسية">
          <span class="brand-symbol" aria-hidden="true">♫</span>
          <span class="brand-copy"><strong>لحن</strong><small>نتعلم ونرنم معا</small></span>
        </a>
        <nav class="main-nav" aria-label="التنقل الرئيسي">
          ${links.map((item) => `<a class="nav-link ${active === item.id ? 'is-active' : ''}" href="${item.href}" ${active === item.id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span></a>`).join('')}
        </nav>
        <a class="parents-link" href="#/admin"><span class="parents-sparkle" aria-hidden="true">✦</span><span>دخول الإدارة</span><span class="parents-arrow" aria-hidden="true">↙</span></a>
      </div>
    </header>`;
}

export function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <a class="footer-brand" href="#/home"><span aria-hidden="true">♫</span> لحن</a>
        <p>خطوات صغيرة… وفرح كبير 🌟</p>
        <a class="footer-admin" href="#/admin">لوحة الإدارة <span class="footer-admin-label">Admin</span><span aria-hidden="true">↗</span></a>
      </div>
      <div class="footer-note">محتوى تعليمي تجريبي — أضيفوا مواد كنيستكم من لوحة الإدارة.</div>
    </footer>`;
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
