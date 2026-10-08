import { APP_CONFIG, getClassConfig, isValidClass } from './config.js';

// Roles: 'general' manages every class plus the contact page,
// 'class' manages one class only (hymns, letters, lessons).
const GENERAL_ROLE = 'general';
const CLASS_ROLE = 'class';

function buildAccounts() {
  const accounts = [
    {
      username: APP_CONFIG.admin.username,
      password: APP_CONFIG.admin.password,
      role: GENERAL_ROLE,
      classId: null,
      label: 'مدير عام',
    },
  ];
  APP_CONFIG.classAdmins.forEach((account) => {
    const classConfig = getClassConfig(account.classId);
    accounts.push({
      username: account.username,
      password: account.password,
      role: CLASS_ROLE,
      classId: account.classId,
      label: classConfig ? `مدير ${classConfig.name}` : 'مدير فصل',
    });
  });
  return accounts;
}

export function findAccount(username, password) {
  const user = String(username || '').trim();
  const secret = String(password || '');
  if (!user || !secret) return null;
  return buildAccounts().find((account) => account.username === user && account.password === secret) || null;
}

export function getSession() {
  try {
    const raw = window.sessionStorage.getItem(APP_CONFIG.adminSessionKey);
    if (!raw) return null;
    if (raw === 'active') {
      // Session written by the previous single-admin version.
      return { role: GENERAL_ROLE, username: APP_CONFIG.admin.username, classId: null, label: 'مدير عام' };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.role) return null;
    if (parsed.role === CLASS_ROLE && !isValidClass(parsed.classId)) return null;
    return {
      role: parsed.role === GENERAL_ROLE ? GENERAL_ROLE : CLASS_ROLE,
      username: String(parsed.username || ''),
      classId: parsed.role === CLASS_ROLE ? parsed.classId : null,
      label: String(parsed.label || ''),
    };
  } catch {
    return null;
  }
}

export function signIn(username, password) {
  const account = findAccount(username, password);
  if (!account) return null;
  const session = {
    role: account.role,
    username: account.username,
    classId: account.classId,
    label: account.label,
    startedAt: Date.now(),
  };
  try {
    window.sessionStorage.setItem(APP_CONFIG.adminSessionKey, JSON.stringify(session));
  } catch {
    return null;
  }
  return getSession();
}

export function signOut() {
  try {
    window.sessionStorage.removeItem(APP_CONFIG.adminSessionKey);
  } catch {
    /* ignore storage failures */
  }
}

export function isGeneral(session) {
  return session?.role === GENERAL_ROLE;
}

export function canManageClass(session, classId) {
  if (!session) return false;
  if (isGeneral(session)) return isValidClass(classId);
  return session.classId === classId;
}

export function canManageSite(session) {
  return isGeneral(session);
}

// Where an account lands right after login.
export function landingRoute(session) {
  if (!session) return '#/admin';
  return isGeneral(session) ? '#/admin' : `#/${session.classId}/admin`;
}

export function sessionTitle(session) {
  if (!session) return '';
  if (isGeneral(session)) return 'مدير عام · كل الفصول';
  const classConfig = getClassConfig(session.classId);
  return classConfig ? `مدير ${classConfig.name} · ${classConfig.arabicName}` : 'مدير فصل';
}
