// ============================================================
// Background'tan gelen mesajları dinle
// ============================================================
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return; // sadece kendi uzantımızdan gelen mesajları işle
  if (msg.action === 'openSaveCard') openSaveCard();
  else if (msg.action === 'saveResult') handleSaveResult(msg);
  else if (msg.action === 'lookupResult') handleLookupResult(msg);
});

// Sağ tık konumunu takip et → kart tam orada açılsın
let lastRightClick = { x: null, y: null };
document.addEventListener('contextmenu', (e) => {
  lastRightClick = { x: e.clientX, y: e.clientY };
}, true);

// ============================================================
// Helper: saniyeyi M:SS / H:MM:SS formatına çevir
// ============================================================
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// İlerlemeye göre otomatik durum: %90+ izlendi, %10+ kısmen, altı açıldı
function computeStatusKey(video) {
  if (!video || !video.duration || isNaN(video.duration)) return 'statusOpened';
  const ratio = video.currentTime / video.duration;
  if (ratio >= 0.9) return 'statusWatched';
  if (ratio >= 0.1) return 'statusPartial';
  return 'statusOpened';
}

// Durum sıralaması + hücre metninden anahtara dönüş (tüm dillerde tanır;
// background'taki no-downgrade mantığının kart tarafındaki karşılığı)
const STATUS_RANK = { statusOpened: 0, statusPartial: 1, statusWatched: 2 };

function statusKeyFromText(text) {
  const s = (text || '').trim();
  for (const lang of Object.keys(I18N)) {
    for (const key of Object.keys(STATUS_RANK)) {
      if (I18N[lang][key] === s) return key;
    }
  }
  return null;
}

// ============================================================
// Aktif video ID'si — watch (?v=) ve shorts (/shorts/ID) desteklenir
// ============================================================
function currentVideoId() {
  if (location.pathname === '/watch') {
    return new URLSearchParams(location.search).get('v');
  }
  const m = location.pathname.match(/^\/shorts\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function isShortsPage() {
  return location.pathname.startsWith('/shorts/');
}

// ============================================================
// YouTube sayfasından video bilgisini çek
// ============================================================
async function scrapeVideoInfo() {
  const titleEl = document.querySelector(
    'h1.ytd-watch-metadata yt-formatted-string, h1.ytd-watch-metadata'
  );
  const channelEl = document.querySelector(
    'ytd-video-owner-renderer #channel-name a, #channel-name a'
  );
  // Shorts'ta DOM'da birden çok <video> olabilir (önceki/sonraki preload) → aktif olanı seç
  const video = document.querySelector('ytd-reel-video-renderer[is-active] video') ||
                document.querySelector('video');

  // URL'i normalize et: shorts dahil her video watch?v=ID olarak kaydedilir
  // (upsert anahtarı tekil kalsın; zaman/liste parametreleri atılır)
  const vid = currentVideoId();
  const url = vid ? `https://www.youtube.com/watch?v=${vid}` : location.href;

  const info = {
    title: titleEl?.textContent?.trim() || document.title.replace(/ - YouTube$/, ''),
    channel: channelEl?.textContent?.trim() || '',
    channelUrl: channelEl?.href || '',
    url,
    watchedTime: video ? formatTime(video.currentTime) : '',
    totalTime: video ? formatTime(video.duration) : '',
    statusKey: computeStatusKey(video)
  };

  // Shorts'ta (ve YouTube markup değişirse watch'ta) başlık/kanal DOM'dan çıkmayabilir.
  // oEmbed endpoint'i yetki istemez ve aynı origin'de → güvenilir fallback.
  if (vid && (isShortsPage() || !info.title || !info.channel)) {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      );
      if (res.ok) {
        const d = await res.json();
        // Shorts'ta document.title akıştaki aktif videoyu yansıtmayabilir; oEmbed'i tercih et
        info.title = isShortsPage() ? (d.title || info.title) : (info.title || d.title || '');
        info.channel = info.channel || d.author_name || '';
        info.channelUrl = info.channelUrl || d.author_url || '';
      }
    } catch { /* offline vb. → eldeki bilgiyle devam */ }
  }

  return info;
}

// ============================================================
// Not kartı durumu
// ============================================================
let cardHost = null;
let cardEl = null;
let activeSaveBtn = null;
let saveTimeoutId = null;
// Lookup ("zaten kayıtlı mı?") için kart bileşen referansları
let activeCardUrl = null;
let badgeEl = null;
let noteHintEl = null;
let tagFieldRef = null;
let statusSelectRef = null;
let statusTouched = false;   // kullanıcı durumu elle değiştirdi mi?
let lookupApplied = false;   // mevcut etiketler karta yüklendi mi? (→ kaydette replace)

// Kartı kapat — closed shadow host'u (ve olası artıkları) temizle
function closeCard() {
  document.querySelectorAll('div[data-yt2sheets-host]').forEach((el) => el.remove());
  cardHost = null;
  cardEl = null;
  activeSaveBtn = null;
  activeCardUrl = null;
  badgeEl = null;
  noteHintEl = null;
  tagFieldRef = null;
  statusSelectRef = null;
  statusTouched = false;
  lookupApplied = false;
  clearTimeout(saveTimeoutId);
}

// Background iş bitince sonucu buradan bildirir
function handleSaveResult(msg) {
  clearTimeout(saveTimeoutId);
  if (!cardEl) return; // kullanıcı kartı kapatmış
  if (msg.ok) showSuccessInCard();
  else showErrorInCard(msg.error || t('unknownError'));
}

// Kart açılırken sorduğumuz "bu video kayıtlı mı?" cevabı
function handleLookupResult(msg) {
  if (!cardEl || !msg.existing || msg.url !== activeCardUrl) return;
  const ex = msg.existing;
  lookupApplied = true;
  if (badgeEl) {
    badgeEl.textContent = '✓ ' + t('alreadySaved');
    badgeEl.style.display = 'block';
  }
  if (noteHintEl && ex.note) {
    noteHintEl.textContent = t('existingNote') + ex.note;
    noteHintEl.style.display = 'block';
  }
  // Mevcut etiketleri chip olarak yükle → kullanıcı görebilir/silebilir;
  // kaydette kart replace modunda gönderir (silme sheet'e yansır)
  if (tagFieldRef && ex.tags) {
    ex.tags.split(',').forEach((tag) => tagFieldRef.addTag(tag));
  }
  // Sheet'teki durum daha "ileri"yse seçiciyi ona çek (kullanıcı elle değiştirmediyse)
  const exKey = statusKeyFromText(ex.status);
  if (statusSelectRef && !statusTouched && exKey &&
      STATUS_RANK[exKey] > STATUS_RANK[statusSelectRef.value]) {
    statusSelectRef.value = exKey;
  }
}

// Kartın yerinde "✓ Kaydedildi" göster, sonra kendiliğinden kapan
function showSuccessInCard() {
  if (!cardEl) return;
  cardEl.textContent = '';
  const ok = document.createElement('div');
  ok.textContent = t('saved');
  Object.assign(ok.style, {
    color: '#2ecc71', fontWeight: '700', fontSize: '16px',
    textAlign: 'center', padding: '10px 0'
  });
  cardEl.appendChild(ok);
  saveTimeoutId = setTimeout(closeCard, 1300);
}

// Hatayı kartın içinde göster, kaydet butonunu yeniden aç
function showErrorInCard(message) {
  if (activeSaveBtn) {
    activeSaveBtn.disabled = false;
    activeSaveBtn.textContent = t('save');
  }
  if (!cardEl) return;
  let err = cardEl.querySelector('.yt2sheets-error');
  if (!err) {
    err = document.createElement('div');
    err.className = 'yt2sheets-error';
    Object.assign(err.style, { color: '#e74c3c', fontSize: '12px', marginTop: '8px' });
    cardEl.appendChild(err);
  }
  err.textContent = t('errorPrefix') + message;
}

// ============================================================
// Kart/balon renk paleti — YouTube koyu temadaysa (html[dark]) veya sistem
// koyu temadaysa koyu renkler. Sayfaya gömülü kart YouTube'la uyumlu görünsün.
// ============================================================
function isDarkContext() {
  return document.documentElement.hasAttribute('dark') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function currentPalette() {
  return isDarkContext()
    ? { bg: '#212121', text: '#f1f1f1', sub: '#bbbbbb', faint: '#888888',
        border: '#3d3d3d', field: '#121212', secBg: '#3d3d3d', secText: '#f1f1f1' }
    : { bg: '#ffffff', text: '#1a1a1a', sub: '#555555', faint: '#888888',
        border: '#cccccc', field: '#ffffff', secBg: '#e0e0e0', secText: '#333333' };
}

let pal = currentPalette();

// ============================================================
// Not kartını aç (sağ tık konumunda)
// ============================================================
async function openSaveCard() {
  if (!currentVideoId()) return; // video sayfası değil (ikon/kısayol yanlış yerde tetiklendi)
  await loadLang();
  closeCard();
  pal = currentPalette();
  const info = await scrapeVideoInfo();

  // Closed Shadow DOM host → kart, sayfa scriptlerinden ve YouTube CSS'inden izole
  cardHost = document.createElement('div');
  cardHost.setAttribute('data-yt2sheets-host', '');
  const shadow = cardHost.attachShadow({ mode: 'closed' });

  const card = document.createElement('div');
  // Inline stiller: YouTube CSS'inden bağımsız, kendi katmanında float eder
  Object.assign(card.style, {
    position: 'fixed', top: '0', left: '0', zIndex: '2147483647',
    width: '320px', boxSizing: 'border-box',
    background: pal.bg, color: pal.text,
    borderRadius: '12px', boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
    padding: '16px', fontFamily: 'Roboto, Arial, sans-serif', fontSize: '14px',
    lineHeight: '1.4'
  });

  // YouTube'un klavye kısayolları (space=duraklat, k, f, j, l...) not yazarken
  // tetiklenmesin: kart içindeki tuş olaylarını sayfaya sızdırma.
  // (Kart closed Shadow DOM'da olduğu için YouTube odaklı input'u göremiyor.)
  ['keydown', 'keyup', 'keypress'].forEach((type) => {
    card.addEventListener(type, (e) => e.stopPropagation());
  });

  // Başlık satırı
  const header = document.createElement('div');
  header.textContent = t('cardTitle');
  Object.assign(header.style, { fontWeight: '700', fontSize: '15px', marginBottom: '10px' });

  // Çekilen bilgi (salt okunur özet)
  const meta = document.createElement('div');
  meta.textContent = `${info.title} — ${info.channel}`;
  Object.assign(meta.style, {
    color: pal.sub, fontSize: '12px', marginBottom: '4px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  });

  const timeMeta = document.createElement('div');
  timeMeta.textContent = `${t('watched')}: ${info.watchedTime || '—'} / ${info.totalTime || '—'}`;
  Object.assign(timeMeta.style, { color: pal.faint, fontSize: '12px', marginBottom: '12px' });

  // "Zaten kayıtlı" rozeti + mevcut not önizlemesi (lookup cevabı gelince görünür)
  const badge = document.createElement('div');
  Object.assign(badge.style, {
    display: 'none', color: '#2ecc71', fontSize: '12px', fontWeight: '600',
    margin: '-6px 0 8px'
  });

  const noteHint = document.createElement('div');
  Object.assign(noteHint.style, {
    display: 'none', color: pal.faint, fontSize: '12px', margin: '0 0 8px',
    maxHeight: '3.6em', overflow: 'hidden', whiteSpace: 'pre-line'
  });

  // Not + etiket inputları
  const noteInput = document.createElement('textarea');
  noteInput.placeholder = t('notePlaceholder');
  noteInput.rows = 2;
  styleField(noteInput);

  const tagField = createTagInput();

  // Durum seçici: ilerlemeye göre otomatik dolu, elle değiştirilebilir
  const statusWrap = document.createElement('div');
  Object.assign(statusWrap.style, {
    display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px'
  });
  const statusLabel = document.createElement('span');
  statusLabel.textContent = t('statusLabel');
  Object.assign(statusLabel.style, { fontSize: '12px', color: pal.sub, flex: '0 0 auto' });
  const statusSelect = document.createElement('select');
  Object.assign(statusSelect.style, {
    flex: '1', padding: '7px', borderRadius: '6px', border: `1px solid ${pal.border}`,
    fontSize: '13px', fontFamily: 'inherit', background: pal.field, color: pal.text
  });
  ['statusWatched', 'statusPartial', 'statusOpened'].forEach((key) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = t(key);
    statusSelect.appendChild(opt);
  });
  statusSelect.value = info.statusKey;
  statusSelect.addEventListener('change', () => { statusTouched = true; });
  statusWrap.append(statusLabel, statusSelect);

  // Buton satırı
  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '4px' });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = t('save');
  styleButton(saveBtn, '#3ea6ff', '#fff');

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = t('close');
  styleButton(cancelBtn, pal.secBg, pal.secText);

  cancelBtn.addEventListener('click', closeCard);
  saveBtn.addEventListener('click', () => {
    saveBtn.disabled = true;
    saveBtn.textContent = t('saving');
    activeSaveBtn = saveBtn;
    const data = {
      ...info,
      note: noteInput.value.trim(),
      tags: tagField.getTags().join(', '),
      status: statusSelect.value,
      statusManual: statusTouched,   // elle seçildiyse background düşürme koruması uygulamaz
      tagsReplace: lookupApplied     // chip'ler mevcut kaydı temsil ediyor → merge değil replace
    };

    try {
      chrome.runtime.sendMessage({ action: 'saveRow', data });
    } catch (e) {
      // Uzantı güncellenmiş ama sayfa yenilenmemişse buraya düşer
      showErrorInCard(t('reloadNeeded'));
      return;
    }

    // Güvenlik ağı: sonuç gelmezse buton sonsuza kadar kilitli kalmasın
    clearTimeout(saveTimeoutId);
    saveTimeoutId = setTimeout(() => {
      if (cardEl && activeSaveBtn === saveBtn) {
        showErrorInCard(t('timeout'));
      }
    }, 15000);
  });

  btnRow.append(saveBtn, cancelBtn);
  card.append(header, meta, timeMeta, badge, noteHint, noteInput, tagField.wrap, statusWrap, btnRow);
  shadow.appendChild(card);
  document.body.appendChild(cardHost);
  cardEl = card;
  activeCardUrl = info.url;
  badgeEl = badge;
  noteHintEl = noteHint;
  tagFieldRef = tagField;
  statusSelectRef = statusSelect;

  // Bu video sheet'te var mı? Cevap 'lookupResult' mesajıyla gelir
  try {
    chrome.runtime.sendMessage({ action: 'lookupRow', url: info.url });
  } catch { /* bağlantı yoksa rozet gösterilmez */ }

  positionCard(card);
  // Firefox'ta yeni eklenen closed-shadow input'a odak ilk karede oturmayabiliyor;
  // bir sonraki karede odakla. Odak kartta değilse tuşlar YouTube'a gider
  // (video oynar / ileri-geri sarar). preventScroll: sayfa zıplamasın.
  requestAnimationFrame(() => {
    try { noteInput.focus({ preventScroll: true }); }
    catch { noteInput.focus(); }
  });
}

// Kartı sağ tık konumuna yerleştir, viewport dışına taşırsa içeri çek
function positionCard(card) {
  const margin = 12;
  const rect = card.getBoundingClientRect();
  let x = lastRightClick.x ?? (window.innerWidth - rect.width - 24);
  let y = lastRightClick.y ?? 80;
  x = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));
  y = Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin));
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
}

// ============================================================
// Etiket girişi: virgül / Enter / Tab ile chip ekle, × ile sil
// ============================================================
function createTagInput() {
  const tags = [];

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
    width: '100%', boxSizing: 'border-box', padding: '6px 8px',
    margin: '0 0 8px', borderRadius: '6px', border: `1px solid ${pal.border}`,
    minHeight: '38px', cursor: 'text', background: pal.field
  });

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = t('tagPlaceholder');
  Object.assign(input.style, {
    flex: '1', minWidth: '90px', border: '0', outline: 'none',
    fontSize: '13px', fontFamily: 'inherit', padding: '2px 0', background: 'transparent',
    color: pal.text
  });

  function addTag(raw) {
    const value = raw.replace(/,/g, '').trim();
    if (!value || tags.includes(value)) return;
    tags.push(value);

    const chip = document.createElement('span');
    Object.assign(chip.style, {
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: '#e8f0fe', color: '#1a73e8', borderRadius: '12px',
      padding: '2px 8px', fontSize: '12px', fontWeight: '600'
    });
    const label = document.createElement('span');
    label.textContent = value;
    const x = document.createElement('span');
    x.textContent = '×';
    Object.assign(x.style, { cursor: 'pointer', fontWeight: '700', lineHeight: '1' });
    x.addEventListener('click', () => {
      const i = tags.indexOf(value);
      if (i > -1) tags.splice(i, 1);
      chip.remove();
      input.focus();
    });
    chip.append(label, x);
    wrap.insertBefore(chip, input);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (input.value.trim()) {
        e.preventDefault(); // virgül/Tab karakterini ekleme, etikete çevir
        addTag(input.value);
        input.value = '';
      }
      // input boşsa Tab normal davransın (odak değişimi)
    } else if (e.key === 'Backspace' && !input.value && tags.length) {
      tags.pop();
      input.previousElementSibling?.remove(); // son chip
    }
  });

  // Alanın boşluğuna tıklayınca yazmaya devam et
  wrap.addEventListener('click', () => input.focus());

  wrap.appendChild(input);

  return {
    wrap,
    addTag, // lookup mevcut etiketleri chip olarak yüklerken kullanır
    getTags() {
      // Kaydederken input'ta bekleyen yazı varsa onu da etikete çevir
      if (input.value.trim()) {
        addTag(input.value);
        input.value = '';
      }
      return tags.slice();
    }
  };
}

// ============================================================
// Stil helper'ları (inline, izole)
// ============================================================
function styleField(el) {
  Object.assign(el.style, {
    width: '100%', boxSizing: 'border-box', padding: '8px',
    margin: '0 0 8px', borderRadius: '6px', border: `1px solid ${pal.border}`,
    fontSize: '13px', fontFamily: 'inherit', resize: 'vertical',
    background: pal.field, color: pal.text
  });
}

function styleButton(el, bg, fg) {
  Object.assign(el.style, {
    flex: '1', background: bg, color: fg, border: '0',
    padding: '9px 0', borderRadius: '6px', fontWeight: '600',
    cursor: 'pointer', fontSize: '13px'
  });
}

// ============================================================
// Video açılışında "kaydedeyim mi?" balonu
//  - YouTube SPA olduğu için her video geçişinde tetiklenir
//  - Aynı videoyu ikinci kez sormaz (rahatsız etmesin)
//  - Yalnız /watch sayfalarında (shorts akışında araya girmesin)
//  - Ayarlardan kapatılabilir (storage.sync.showPrompt = false)
// ============================================================
let promptHost = null;
const promptedVideos = new Set();

function closePrompt() {
  document.querySelectorAll('div[data-yt2sheets-prompt]').forEach((el) => el.remove());
  promptHost = null;
}

// Watch sayfasındaysak ve bu videoyu daha önce sormadıysak balonu göster
async function maybeShowPrompt() {
  if (location.pathname !== '/watch') { closePrompt(); return; }
  const vid = currentVideoId();
  if (!vid) { closePrompt(); return; }
  if (promptedVideos.has(vid)) return;  // bu videoyu zaten sorduk
  if (cardEl) return;                   // not kartı zaten açık
  let promptPref = null;
  try {
    ({ showPrompt: promptPref } = await chrome.storage.sync.get('showPrompt'));
  } catch { /* storage erişilemedi → varsayılan: göster */ }
  if (promptPref === false) return;     // kullanıcı balonu kapatmış
  promptedVideos.add(vid);
  await loadLang();
  showPrompt();
}

function showPrompt() {
  closePrompt();
  pal = currentPalette();

  // Closed Shadow DOM → balon, YouTube CSS'inden ve scriptlerinden izole
  promptHost = document.createElement('div');
  promptHost.setAttribute('data-yt2sheets-prompt', '');
  const shadow = promptHost.attachShadow({ mode: 'closed' });

  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'fixed', top: '70px', right: '24px', zIndex: '2147483646',
    display: 'flex', alignItems: 'center', gap: '10px',
    background: pal.bg, color: pal.text,
    borderRadius: '10px', boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
    padding: '10px 12px', fontFamily: 'Roboto, Arial, sans-serif', fontSize: '13px'
  });

  const text = document.createElement('span');
  text.textContent = t('promptText');

  const yesBtn = document.createElement('button');
  yesBtn.textContent = t('save');
  styleButton(yesBtn, '#3ea6ff', '#fff');
  Object.assign(yesBtn.style, { flex: '0 0 auto', padding: '7px 14px' });

  const noBtn = document.createElement('button');
  noBtn.textContent = '×';
  styleButton(noBtn, pal.secBg, pal.secText);
  Object.assign(noBtn.style, { flex: '0 0 auto', padding: '7px 12px' });

  // "Kaydet" → mevcut not/etiket kartını aç; "×" → balonu kapat
  // (sağ tık konumunu sıfırla ki kart varsayılan sağ-üst konumda açılsın)
  yesBtn.addEventListener('click', () => {
    lastRightClick = { x: null, y: null };
    closePrompt();
    openSaveCard();
  });
  noBtn.addEventListener('click', closePrompt);

  bar.append(text, yesBtn, noBtn);
  shadow.appendChild(bar);
  document.body.appendChild(promptHost);
}

// YouTube SPA: her video geçişinde + ilk doğrudan yüklemede tetikle
document.addEventListener('yt-navigate-finish', maybeShowPrompt);
maybeShowPrompt();

// ============================================================
// Klavye kalkanı — kart açık ve odak karttayken, sayfanın/diğer eklentilerin
// tuşları yakalamasını engelle:
//   • YouTube kısayolları (space, k, j, l, oklar, sayılar…)
//   • "Video Speed Controller" gibi eklentiler (z = geri sar, x = ileri sar…)
// Bu işleyiciler çoğu zaman CAPTURE aşamasında dinler; kart closed Shadow
// DOM'da olduğu için event.target'ı sıradan bir <div> görür ve "input değil"
// sanıp videoyu sarar. Bu yüzden window'da CAPTURE'da, herkesten önce durdururuz.
//   • preventDefault YOK → karakter yine input'a yazılır.
//   • Escape → kartı kapatır (YouTube tam ekrandan çıkma vb. tetiklenmeden).
//   • Tag girişinin gerektirdiği tuşlar (Enter/Tab/Backspace/virgül) geçer;
//     bunlar zaten sar/oynat kısayolu değil, chip mantığının çalışması için lazım.
const PASS_THROUGH_KEYS = new Set(['Enter', 'Tab', 'Backspace', ',']);

function keyShield(e) {
  if (!cardHost) return;                            // kart kapalı
  if (document.activeElement !== cardHost) return;  // odak bizim kartta değil
  if (e.key === 'Escape') {
    e.stopPropagation();
    if (e.type === 'keydown') closeCard();
    return;
  }
  if (PASS_THROUGH_KEYS.has(e.key)) return;         // tag girişine bırak
  e.stopPropagation();
}

['keydown', 'keyup', 'keypress'].forEach((type) => {
  window.addEventListener(type, keyShield, true); // capture: herkesten önce yakala
});

// Kartın dışına tıklanınca kapat (closed shadow: kart içi tıklamalar
// dışarıdan cardHost olarak görünür → onlar kartı kapatmaz)
document.addEventListener('mousedown', (e) => {
  if (cardHost && e.target !== cardHost) closeCard();
}, true);
