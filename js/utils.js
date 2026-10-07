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

// ---------------------------------------------------------------------------
// Class-aware links: every class page lives under #/<class>/<page>
// ---------------------------------------------------------------------------

export function classHref(classId, path = '/home', params = {}) {
  const base = classId ? `#/${classId}${path}` : `#${path}`;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const query = search.toString();
  return `${base}${query ? `?${query}` : ''}`;
}

export function sectionForPage(page = '') {
  if (page === 'hymns' || page === 'hymn') return 'hymns';
  if (page === 'coptic' || page === 'letter') return 'coptic';
  if (page === 'liturgy' || page === 'ritual') return 'liturgy';
  return '';
}

// ---------------------------------------------------------------------------
// Safe contact links (tel:, wa.me, mailto:, facebook)
// ---------------------------------------------------------------------------

export function phoneDigits(raw = '') {
  let digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);
  return digits.replace(/\D/g, '');
}

export function telHref(phone = '') {
  const digits = phoneDigits(phone);
  return digits ? `tel:${digits}` : '';
}

export function whatsappHref(phone = '') {
  const digits = phoneDigits(phone);
  return digits ? `https://wa.me/${digits}` : '';
}

export function mailtoHref(email = '') {
  const value = String(email).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : '';
}

export function facebookHref(raw = '') {
  const value = String(raw).trim();
  if (!value) return '';
  if (value.startsWith('@')) return `https://www.facebook.com/${encodeURIComponent(value.slice(1))}`;
  if (!/^https?:\/\//i.test(value) && /^[\w.\-]{3,}$/.test(value)) return `https://www.facebook.com/${encodeURIComponent(value)}`;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const allowed = ['facebook.com', 'm.facebook.com', 'fb.com', 'fb.me', 'm.me', 'messenger.com'];
    if (!allowed.includes(host)) return '';
    return url.href;
  } catch {
    return '';
  }
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

export function textParagraphs(text = '') {
  return String(text).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    .map((paragraph) => `<p>${escapeHTML(paragraph).replaceAll('\n', '<br>')}</p>`).join('');
}

export function getRankLabel(index) {
  return ['🥇', '🥈', '🥉'][index] || `${index + 1}`;
}

export function humanFileSize(bytes = 0) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} كيلوبايت`;
  return `${(bytes / 1024 / 1024).toFixed(1)} ميجابايت`;
}
