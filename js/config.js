// Central place for the first-version demo settings. Never treat these browser-side values as secrets.
export const APP_CONFIG = Object.freeze({
  storageKey: 'lahn-learning-data-v1',
  adminSessionKey: 'lahn-admin-session-v1',
  // Demo-only credentials: change here (once) before sharing a local demo.
  // Real deployments need server-side authentication; see README.md.
  admin: Object.freeze({
    username: 'admin',
    password: 'Lahn2026!',
  }),
  limits: Object.freeze({
    imageBytes: 8 * 1024 * 1024,
    audioBytes: 18 * 1024 * 1024,
    documentBytes: 12 * 1024 * 1024,
  }),
});
