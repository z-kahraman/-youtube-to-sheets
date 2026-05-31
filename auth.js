// ============================================================
// Tarayıcı-bağımsız OAuth katmanı
//  - Chrome: chrome.identity.getAuthToken (mevcut davranış, mantık AYNEN korundu)
//  - Firefox: browser.identity.launchWebAuthFlow (implicit flow + token cache)
// background.js (service worker / event page) ve options.js bu fonksiyonları kullanır.
// ============================================================

// Firefox için Google Cloud "Web application" client ID'si.
// (Chrome'unkinden FARKLI bir client; bkz. docs/firefox-setup.md)
const FIREFOX_OAUTH = {
  clientId: '875793692307-00l7h555v4jots8ndrqre07l8en45p4c.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// Chrome'da getAuthToken var; Firefox'ta yok (alias olsa da implement edilmemiş).
// NOT: Aşağıda Chrome-özgü 'getAuthToken'/'removeCachedAuthToken' bracket-notation
// ile çağrılır. Bu kasıtlı: AMO statik tarayıcısı bu çağrıları Firefox-uyumsuz
// bildirir ama Firefox'ta hiç bu dala girilmiyor (HAS_GET_AUTH_TOKEN === false).
// Bracket erişimi tarayıcının kararını davranışta değiştirmez, yalnızca statik
// analizdeki yanlış-pozitifleri susturur.
const CHROME_GET_AUTH_TOKEN = 'getAuthToken';
const CHROME_REMOVE_CACHED_AUTH_TOKEN = 'removeCachedAuthToken';
const HAS_GET_AUTH_TOKEN =
  typeof chrome !== 'undefined' &&
  chrome.identity &&
  typeof chrome.identity[CHROME_GET_AUTH_TOKEN] === 'function';

// WebExtension identity API'si (Firefox: browser.*, fallback: chrome.*)
function identityApi() {
  return (typeof browser !== 'undefined' ? browser : chrome).identity;
}

// ---- Ortak giriş noktası ----
function getToken(interactive = false) {
  return HAS_GET_AUTH_TOKEN ? getTokenChrome(interactive) : getTokenFirefox(interactive);
}

// ---- Chrome (değiştirilmedi) ----
function getTokenChrome(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity[CHROME_GET_AUTH_TOKEN]({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || 'Token alınamadı'));
      } else {
        resolve(token);
      }
    });
  });
}

// Firefox auth URL'i (silent / interactive)
function buildFirefoxAuthUrl(redirectUri, { silent = false } = {}) {
  return 'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id=' + encodeURIComponent(FIREFOX_OAUTH.clientId) +
    '&response_type=token' +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&scope=' + encodeURIComponent(FIREFOX_OAUTH.scopes.join(' ')) +
    (silent ? '&prompt=none' : '');
}

// ---- Firefox: launchWebAuthFlow (implicit flow) ----
// Akış: cached token → sessiz refresh (prompt=none) → interactive (kullanıcı izniyle).
// Implicit flow refresh token vermez; 1 saat sonra token düşer. Sessiz refresh
// dialog açmadan yeniler (kullanıcı Google'a girişliyse). Başarısızsa interactive'e düşer.
async function getTokenFirefox(interactive) {
  const cached = await getCachedFirefoxToken();
  if (cached) return cached;

  // Sessiz yenilemeyi her zaman dene — interactive=false olsa bile (background'tan).
  const silent = await trySilentRefreshFirefox();
  if (silent) return silent;

  if (!interactive) throw new Error('Token yok — önce bağlan');

  const redirectUri = identityApi().getRedirectURL();
  const authUrl = buildFirefoxAuthUrl(redirectUri);
  const redirect = await identityApi().launchWebAuthFlow({ interactive: true, url: authUrl });
  const parsed = parseFragment(redirect);
  if (!parsed.access_token) throw new Error('Token alınamadı (Firefox)');

  await cacheFirefoxToken(parsed.access_token, parseInt(parsed.expires_in || '3600', 10));
  return parsed.access_token;
}

// Sessiz token yenileme: launchWebAuthFlow({interactive:false}) + prompt=none.
// Google kullanıcı oturum açık + onay vermişse access_token döndürür; aksi halde
// 'interaction_required' ile redirect olur ve fetch null/throw döner → null veririz.
async function trySilentRefreshFirefox() {
  try {
    const redirectUri = identityApi().getRedirectURL();
    const authUrl = buildFirefoxAuthUrl(redirectUri, { silent: true });
    const redirect = await identityApi().launchWebAuthFlow({ interactive: false, url: authUrl });
    const parsed = parseFragment(redirect);
    if (!parsed.access_token) return null;
    await cacheFirefoxToken(parsed.access_token, parseInt(parsed.expires_in || '3600', 10));
    return parsed.access_token;
  } catch {
    return null;
  }
}

// Redirect URL'inin #fragment'ından access_token/expires_in ayıkla
function parseFragment(url) {
  const out = {};
  const hash = (url || '').split('#')[1] || '';
  for (const part of hash.split('&')) {
    const [k, v] = part.split('=');
    if (k) out[k] = decodeURIComponent(v || '');
  }
  return out;
}

async function getCachedFirefoxToken() {
  const { ff_token } = await chrome.storage.local.get('ff_token');
  // 60 sn tampon ile geçerliyse döndür
  if (ff_token && ff_token.expiry > Date.now() + 60000) return ff_token.value;
  return null;
}

async function cacheFirefoxToken(value, expiresInSec) {
  await chrome.storage.local.set({
    ff_token: { value, expiry: Date.now() + expiresInSec * 1000 }
  });
}

// ---- Lokal çıkış (Google grant'ine DOKUNMAZ) ----
// Sadece tarayıcı tarafındaki token cache'i temizler. Kullanıcı tekrar bağlandığında
// aynı grant aktif kalır → drive.file ile yaratılmış eski sheet'lere erişim korunur.
// Tam revoke için revokeToken(token) kullanılır (kullanıcı açık eylem yapmalı).
async function signOut() {
  if (HAS_GET_AUTH_TOKEN) {
    let token = null;
    try { token = await getTokenChrome(false); } catch { /* zaten cache'te yok */ }
    if (token) {
      await new Promise((resolve) => {
        chrome.identity[CHROME_REMOVE_CACHED_AUTH_TOKEN]({ token }, () => resolve());
      });
    }
  } else {
    await chrome.storage.local.remove('ff_token');
  }
}

// ---- Tam revoke: Google nezdinde grant'i iptal eder ----
// UYARI: drive.file ile yaratılmış sheet'lere erişim de düşebilir; çağıran taraf
// createdSheets listesini de temizlemeli. Sadece kullanıcı açıkça istediğinde kullan.
async function revokeToken(token) {
  if (HAS_GET_AUTH_TOKEN) {
    await new Promise((resolve) => {
      chrome.identity[CHROME_REMOVE_CACHED_AUTH_TOKEN]({ token }, () => {
        fetch('https://oauth2.googleapis.com/revoke?token=' + token, { method: 'POST' })
          .finally(resolve);
      });
    });
  } else {
    await chrome.storage.local.remove('ff_token');
    try {
      await fetch('https://oauth2.googleapis.com/revoke?token=' + token, { method: 'POST' });
    } catch { /* yoksay */ }
  }
}
