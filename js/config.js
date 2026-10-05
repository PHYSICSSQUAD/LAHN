// Central place for the first-version demo settings. Never treat these browser-side values as secrets.
export const APP_CONFIG = Object.freeze({
  storageKey: 'lahn-learning-data-v1',
  adminSessionKey: 'lahn-admin-session-v1',
  // Institution name shown in the banner strip at the very top of every page.
  siteBanner: 'مدرسة شمامسة كنيسة الشهيد العظيم ابي سيفين بحدائق القبة',
  // Demo-only credentials: change here (once) before sharing a local demo.
  // Real deployments need server-side authentication; see README.md.
  admin: Object.freeze({
    username: 'admin',
    password: 'ابي سيفين',
  }),
  limits: Object.freeze({
    imageBytes: 8 * 1024 * 1024,
    audioBytes: 18 * 1024 * 1024,
    documentBytes: 12 * 1024 * 1024,
  }),
});
