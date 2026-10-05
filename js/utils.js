export function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeYouTubeUrl(raw) {
  if (!raw || !String(raw).trim()) return '';
  try {
    const url = new URL(String(raw).trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const allowed = ['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'youtube-nocookie.com'];
    if (url.protocol !== 'https:' || !allowed.includes(host)) return '';
    return url.href;
  } catch {
    return '';
  }
}

export function youtubeAnchor(raw, label = 'شاهد على يوتيوب', className = 'button button-youtube') {
  const href = safeYouTubeUrl(raw);
  if (!href) return '';
  return `<a class="${className}" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span><span>${escapeHTML(label)}</span><span class="external-mark" aria-hidden="true">↗</span></a>`;
}

export function sortByOrder(items = []) {
  return [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}

export function sortStudents(items = []) {
  return [...items].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || String(a.name).localeCompare(String(b.name), 'ar'));
}

export function formatTime(seconds = 0) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60).toString().padStart(2, '0');
  const secs = (total % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function createHashUrl(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const search = query.toString();
  return `#${path}${search ? `?${search}` : ''}`;
}

export function textParagraphs(text = '') {
  return String(text).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    .map((paragraph) => `<p>${escapeHTML(paragraph).replaceAll('\n', '<br>')}</p>`).join('');
}

export function getRankLabel(index) {
  return ['🥇', '🥈', '🥉'][index] || `${index + 1}`;
}

export function getActiveSection(path) {
  if (path.startsWith('/hymn') || path === '/hymns') return 'hymns';
  if (path.startsWith('/letter') || path === '/coptic') return 'coptic';
  if (path.startsWith('/ritual') || path === '/liturgy') return 'liturgy';
  return '';
}

export function humanFileSize(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} كيلوبايت`;
  return `${(bytes / 1024 / 1024).toFixed(1)} ميجابايت`;
}
