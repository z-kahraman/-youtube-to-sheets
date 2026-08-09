// ============================================================
// i18n katmanı — tarayıcıya/seçime göre TR/EN dizeler
//  - Varsayılan: tarayıcı dili (TR → tr, diğerleri → en)
//  - Kullanıcı ayarlardan değiştirebilir (storage.sync.lang)
// content.js, options.js, background.js bu fonksiyonları kullanır.
// ============================================================

const I18N = {
  tr: {
    optionsTitle: 'YouTube to Sheets — Ayarlar',
    subtitle: "Videolarını Google Sheets'e kaydet",
    notConnected: 'Henüz Google hesabı bağlı değil.',
    connect: 'Google ile bağlan',
    accountConnected: 'Hesap bağlı',
    disconnect: 'Çıkış yap',
    revokeGrant: "Google'da yetkileri tamamen iptal et",
    revokeGrantConfirm: "Bu işlem, eklentinin Google nezdindeki TÜM yetkilerini iptal eder. Eklentinin oluşturduğu eski sheet'lere artık erişilemez (yeniden bağlandığında yeni bir tane oluşturman gerekir). Devam edilsin mi?",
    revokeGrantDone: "Yetkiler iptal edildi. Google izin sayfasından da kontrol edebilirsin.",
    targetSheet: 'Hedef Sheet',
    currentlySelected: 'Şu an seçili',
    change: 'Değiştir',
    openSheet: "Sheet'i aç",
    pickCreated: "Oluşturduğun sheet'lerden seç",
    useThis: "Bu sheet'i kullan",
    orCreateNew: 'Veya yeni bir tane oluştur',
    createNew: 'Yeni sheet oluştur',
    selectSheet: '— Bir sheet seç —',
    noSheetsYet: 'Henüz oluşturulmuş sheet yok — aşağıdan oluştur',
    loading: '— Yükleniyor —',
    connected: 'Bağlandı ✓',
    connectError: 'Bağlanma hatası: ',
    disconnected: 'Bağlantı kesildi',
    selectFirst: 'Önce bir sheet seç',
    selected: 'Seçildi: ',
    creatingSheet: 'Sheet oluşturuluyor...',
    sheetCreated: 'Sheet oluşturuldu ✓',
    createError: 'Oluşturma hatası: ',
    emailFail: '(email alınamadı)',
    langLabel: 'Dil / Language',
    themeLabel: 'Tema',
    themeAuto: 'Otomatik',
    themeLight: 'Açık',
    themeDark: 'Koyu',
    connecting: 'Bağlanılıyor...',
    howToHint: "Kullanım: YouTube'da bir video aç → sağ tık → \"Sheet'e kaydet\" (ya da video açılışında çıkan balon).",
    noSheetsHelp: "Aşağıdan bir sheet oluştur; uygulama yalnızca kendi oluşturduğu sheet'lere erişebilir.",
    footerPrivacy: 'Gizlilik',
    footerFeedback: 'Geri bildirim',
    cardTitle: "📋 Sheet'e kaydet",
    promptText: 'Bu videoyu kaydedeyim mi?',
    watched: 'İzlenen',
    statusLabel: 'Durum',
    statusWatched: 'İzlendi',
    statusPartial: 'Kısmen izlendi',
    statusOpened: 'Açıldı',
    notePlaceholder: 'Not...',
    tagPlaceholder: 'Etiket ekle (virgül / Tab)',
    save: 'Kaydet',
    saving: 'Kaydediliyor...',
    close: 'Kapat',
    saved: '✓ Kaydedildi',
    errorPrefix: 'Hata: ',
    reloadNeeded: 'Uzantı güncellendi, sayfayı yenile (F5)',
    timeout: "Yanıt gecikti — sheet'i kontrol et",
    unknownError: 'Bilinmeyen hata',
    saveToSheet: "Sheet'e kaydet",
    noSheet: 'Önce ayarlardan bir sheet seç',
    alreadySaved: 'Daha önce kaydedilmiş — notun mevcut kaydın altına eklenecek',
    existingNote: 'Mevcut not: ',
    showPromptLabel: 'Video açılınca kaydetme balonunu göster',
    recentSaves: 'Son kayıtlar',
    totalSaved: 'Toplam kayıt',
    errSheetInfo: 'Sheet bilgisi alınamadı',
    errAppend: 'Satır eklenemedi',
    errRead: 'Sheet okunamadı',
    errRowRead: 'Satır okunamadı',
    errUpdate: 'Satır güncellenemedi',
    authExpired: 'Oturum doğrulanamadı — ayarlar sayfasından yeniden bağlan',
    tokenMissing: 'Bağlantı yok — ayarlardan Google hesabını bağla',
    defaultSheetName: 'YouTube İzleme Notları',
    tabName: 'Notlar',
    dateLocale: 'tr-TR',
    headers: ['Tarih', 'Başlık', 'Kanal', 'Kanal Linki', 'URL', 'İzleme Süresi', 'Toplam Süre', 'Not', 'Etiketler', 'Durum']
  },
  en: {
    optionsTitle: 'YouTube to Sheets — Settings',
    subtitle: 'Save your videos to Google Sheets',
    notConnected: 'No Google account connected yet.',
    connect: 'Connect with Google',
    accountConnected: 'Account connected',
    disconnect: 'Sign out',
    revokeGrant: "Revoke all access in Google",
    revokeGrantConfirm: "This revokes ALL of this app's grants in Google. Sheets the app created will no longer be accessible (you'll need to create a new one after reconnecting). Continue?",
    revokeGrantDone: "Access revoked. You can verify on Google's permissions page.",
    targetSheet: 'Target Sheet',
    currentlySelected: 'Currently selected',
    change: 'Change',
    openSheet: 'Open sheet',
    pickCreated: 'Pick from sheets you created',
    useThis: 'Use this sheet',
    orCreateNew: 'Or create a new one',
    createNew: 'Create new sheet',
    selectSheet: '— Select a sheet —',
    noSheetsYet: 'No sheets created yet — create one below',
    loading: '— Loading —',
    connected: 'Connected ✓',
    connectError: 'Connection error: ',
    disconnected: 'Disconnected',
    selectFirst: 'Select a sheet first',
    selected: 'Selected: ',
    creatingSheet: 'Creating sheet...',
    sheetCreated: 'Sheet created ✓',
    createError: 'Creation error: ',
    emailFail: '(email unavailable)',
    langLabel: 'Dil / Language',
    themeLabel: 'Theme',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    connecting: 'Connecting...',
    howToHint: 'How to use: open a video on YouTube → right-click → "Save to Sheet" (or use the prompt shown when a video opens).',
    noSheetsHelp: 'Create a sheet below; the app can only access sheets it created.',
    footerPrivacy: 'Privacy',
    footerFeedback: 'Feedback',
    cardTitle: '📋 Save to Sheet',
    promptText: 'Save this video?',
    watched: 'Watched',
    statusLabel: 'Status',
    statusWatched: 'Watched',
    statusPartial: 'Partially watched',
    statusOpened: 'Opened',
    notePlaceholder: 'Note...',
    tagPlaceholder: 'Add tag (comma / Tab)',
    save: 'Save',
    saving: 'Saving...',
    close: 'Close',
    saved: '✓ Saved',
    errorPrefix: 'Error: ',
    reloadNeeded: 'Extension updated, reload the page (F5)',
    timeout: 'Response delayed — check your sheet',
    unknownError: 'Unknown error',
    saveToSheet: 'Save to Sheet',
    noSheet: 'Select a sheet in settings first',
    alreadySaved: 'Already saved — your note will be appended to the existing entry',
    existingNote: 'Existing note: ',
    showPromptLabel: 'Show the save prompt when a video opens',
    recentSaves: 'Recent saves',
    totalSaved: 'Total saved',
    errSheetInfo: 'Could not read sheet info',
    errAppend: 'Could not append row',
    errRead: 'Could not read sheet',
    errRowRead: 'Could not read row',
    errUpdate: 'Could not update row',
    authExpired: 'Authentication failed — reconnect from the settings page',
    tokenMissing: 'Not connected — connect your Google account in settings',
    defaultSheetName: 'YouTube Watch Notes',
    tabName: 'Notes',
    dateLocale: 'en-US',
    headers: ['Date', 'Title', 'Channel', 'Channel Link', 'URL', 'Watched Time', 'Total Time', 'Note', 'Tags', 'Status']
  }
};

let _lang = null;

// Tarayıcı dilinden varsayılanı belirle (TR → tr, diğerleri → en)
function detectDefaultLang() {
  let ui = 'en';
  try {
    ui = (chrome.i18n && chrome.i18n.getUILanguage && chrome.i18n.getUILanguage()) ||
         navigator.language || 'en';
  } catch {
    ui = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  }
  return ui.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

// Seçili dili storage'dan yükle (yoksa/erişilemezse tarayıcı dili)
async function loadLang() {
  let lang = null;
  try {
    ({ lang } = await chrome.storage.sync.get('lang'));
  } catch { /* storage yok → tarayıcı diline düş */ }
  _lang = (lang === 'tr' || lang === 'en') ? lang : detectDefaultLang();
  return _lang;
}

function currentLang() {
  return _lang || detectDefaultLang();
}

// Çeviri getir (yoksa EN'e, o da yoksa anahtara düş)
function t(key) {
  const dict = I18N[_lang] || I18N.en;
  if (dict[key] !== undefined) return dict[key];
  if (I18N.en[key] !== undefined) return I18N.en[key];
  return key;
}

async function setLang(lang) {
  _lang = lang;
  await chrome.storage.sync.set({ lang });
}
