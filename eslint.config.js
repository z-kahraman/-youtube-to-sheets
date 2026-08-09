// ESLint flat config — build adımı olmayan vanilya MV3 eklentisi.
// Dosyalar module değil, klasik <script>/importScripts ile yüklenir; bir dosyada
// tanımlanan fonksiyonlar diğerlerinde global olarak kullanılır. Bu yüzden
// paylaşılan katmanın (strings.js/auth.js) fonksiyonları TÜKETİCİ dosyalarda
// global olarak bildirilir; sağlayıcı dosyalarda ise "unused" uyarısı kapatılır.
'use strict';

const browserGlobals = {
  chrome: 'readonly',
  browser: 'readonly',
  window: 'readonly',
  document: 'readonly',
  location: 'readonly',
  navigator: 'readonly',
  fetch: 'readonly',
  URLSearchParams: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  requestAnimationFrame: 'readonly',
  confirm: 'readonly',
  console: 'readonly',
  importScripts: 'readonly'
};

// strings.js + auth.js'in dışarıya verdikleri
const sharedLayerGlobals = {
  I18N: 'readonly',
  t: 'readonly',
  loadLang: 'readonly',
  setLang: 'readonly',
  currentLang: 'readonly',
  getToken: 'readonly',
  invalidateToken: 'readonly',
  signOut: 'readonly',
  revokeToken: 'readonly',
  listAppSpreadsheets: 'readonly'
};

const baseRules = {
  'no-undef': 'error',
  'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
  'no-redeclare': 'error',
  'eqeqeq': ['error', 'smart'],
  'no-var': 'error',
  'prefer-const': 'warn'
};

module.exports = [
  {
    ignores: ['dist/', 'node_modules/', 'docs/', 'screenshots/', 'eslint.config.js']
  },
  // Tüketici dosyalar: paylaşılan katmanı global olarak kullanır
  {
    files: ['background.js', 'content.js', 'options.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...browserGlobals, ...sharedLayerGlobals }
    },
    rules: baseRules
  },
  // Sağlayıcı dosyalar: export'ları dosya içinde "kullanılmıyor" görünür
  {
    files: ['strings.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: browserGlobals
    },
    rules: { ...baseRules, 'no-unused-vars': 'off' }
  },
  {
    files: ['auth.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      // auth.js hata mesajı için t()'yi kullanır (strings.js'ten gelir)
      globals: { ...browserGlobals, t: 'readonly' }
    },
    rules: { ...baseRules, 'no-unused-vars': 'off' }
  }
];
