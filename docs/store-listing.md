# Store listing copy (AMO / Chrome Web Store)

Ready-to-paste listing text. English is the default locale; the Turkish block is for the
Turkish locale (AMO Manage Listing → add locale).

## Category
- AMO: there's no "Productivity"; closest fits are **Photos, Music & Videos** and **Bookmarks**.
- Chrome Web Store: **Productivity**.

## Single-purpose statement
The extension's single purpose: save a YouTube video's metadata and the user's notes to the
user's own Google Sheet.

## Permission justifications
- **identity:** to connect the user's Google account via OAuth and call the Sheets API.
- **storage:** to store the selected/created sheet's id and name (and language/theme/prompt preferences).
- **contextMenus:** to add the "Save to Sheet" right-click menu on YouTube watch and Shorts pages.
- **activeTab:** when the user clicks the toolbar icon or presses the shortcut, to tell whether
  the current tab is a YouTube video page (opens the save card there, options page elsewhere).
- **host googleapis.com:** Google API calls to append rows to Sheets and read the account email.
- **content script (youtube.com):** injected site-wide because YouTube is a single-page app
  (a tab opened on the homepage never reloads when navigating to a video); it only acts on
  watch/Shorts pages, where it reads video info and shows the note card.
- **scope drive.file:** to write only to Sheets files the extension created.
- **scope userinfo.email:** to show the connected account on the settings page.

## Images
- Icon 128px ✓ (`icons/icon128.png`)
- Screenshots: `screenshots/*-en.png` (English locale), `screenshots/*-tr.png` (Turkish locale).

---

## English (default locale)

**Short summary (≤132 chars):**
```
Save the YouTube videos you watch — with notes and tags — to your own Google Sheet in one click.
```

**Description:**
```
YouTube to Sheets is the fastest way to keep the videos you watch organized.

While watching, right-click the page → "Save to Sheet" — or just press Alt+S. A small card opens with the video's title, channel and duration pre-filled — add your note and tags and save. The row goes straight into your own Google Sheet.

Features:
• Quick save via right-click, the Alt+S shortcut, the toolbar icon, or the optional "Save this video?" prompt
• Works on regular videos and YouTube Shorts
• Auto-filled: title, channel, channel link, video URL, watched/total time, and a watch status (Watched / Partially watched / Opened)
• Note + multiple tags (comma or Tab)
• One row per video: saving again updates the same row — and the card shows an "already saved" badge with your existing note and tags
• Create your own Google Sheet or pick one you created before; settings show your total saves and the 5 most recent
• Light / dark / auto theme, English + Turkish interface

Privacy-first: your data goes straight from your browser to Google. No third-party servers, analytics, or ads. The extension only accesses Sheets it created.

Open source (MIT): https://github.com/z-kahraman/youtube-to-sheets
```

---

## Türkçe (Turkish locale)

**Kısa açıklama (≤132 karakter):**
```
İzlediğin YouTube videolarını not ve etiketlerle tek tıkla kendi Google Sheets dosyana kaydet.
```

**Açıklama:**
```
YouTube to Sheets, izlediğin videoları düzenli tutmanın en hızlı yolu.

İzlerken bir videoyu kaydetmek istediğinde sayfaya sağ tıkla → "Sheet'e kaydet" de — ya da sadece Alt+S'ye bas. Açılan küçük kartta videonun başlığı, kanalı ve süresi otomatik dolu gelir; sen sadece notunu ve etiketlerini ekleyip kaydet. Satır doğrudan kendi Google Sheets dosyana düşer.

Özellikler:
• Sağ tık, Alt+S kısayolu, araç çubuğu ikonu ya da isteğe bağlı "Bu videoyu kaydedeyim mi?" balonuyla hızlı kaydetme
• Normal videolarda ve YouTube Shorts'ta çalışır
• Başlık, kanal, kanal linki, video URL'si, izlenen/toplam süre ve izleme durumu (İzlendi / Kısmen izlendi / Açıldı) otomatik
• Not + çoklu etiket (virgül veya Tab)
• Video başına tek satır: aynı videoyu tekrar kaydedince satır güncellenir — kart "zaten kayıtlı" rozetiyle mevcut notunu ve etiketlerini gösterir
• Kendi Google Sheets dosyanı oluştur veya daha önce oluşturduklarından seç; ayarlarda toplam kayıt sayın ve son 5 kaydın görünür
• Açık / koyu / otomatik tema, Türkçe + İngilizce arayüz

Gizlilik öncelikli: Verilerin doğrudan tarayıcından Google'a gider. Üçüncü taraf sunucu, analitik veya reklam yok. Uzantı yalnızca kendi oluşturduğu Sheets dosyalarına erişir.

Açık kaynak (MIT): https://github.com/z-kahraman/youtube-to-sheets
```

---

## Technical Details (AMO Manage → Technical Details)

> Eski metindeki `github.com/zaferkahraman/...` linkleri 404'tü (doğrusu `z-kahraman`);
> "Version 0.1.0 / rough edges" ve "kendi Google Cloud projeni kurman gerekir" ifadeleri
> kaldırıldı (son kullanıcının kendi OAuth client'ına ihtiyacı yok, sadece Connect der).

**Developer Comments (public):**
```
A privacy-first extension that saves the YouTube video you're watching — title, channel, link, watched/total time, plus your note and tags — as a row in your own Google Sheet.

🚀 QUICK START
1. Connect your Google account on the settings page and create a sheet
2. Open a YouTube video → right-click → "Save to Sheet" (or press Alt+S)
3. Add your note and tags, save — done. Saving the same video again updates its row instead of duplicating it.

🔒 PRIVACY
- No data is ever sent to the developer's servers (there are no developer servers)
- Everything goes straight from your browser to Google; notes are written to YOUR sheet
- No analytics, no tracking, no third-party services
- The extension can only access Sheets it created itself (drive.file scope)
- Source code is fully open and auditable on GitHub

🐛 BUG REPORTS / FEATURE REQUESTS
Open an issue on GitHub:
https://github.com/z-kahraman/youtube-to-sheets/issues

ℹ️ This extension is not affiliated with, endorsed by, or sponsored by Google or YouTube. All trademarks belong to their respective owners.
```

**Whiteboard (reviewer-only):**
```
Open-source MV3 extension. Repository: https://github.com/z-kahraman/youtube-to-sheets — the submitted zip is built by ./build.sh from this source (vanilla JS, no bundler/minification).

OVERVIEW: Saves the YouTube video the user is watching (title, channel, URL, watched/total time) plus the user's note, tags and a watch status as a row in a Google Sheet the user owns. Upsert: re-saving the same video updates its existing row.

WHY EACH PERMISSION IS NEEDED
- identity: Google OAuth via browser.identity.launchWebAuthFlow (separate Web client, implicit flow + silent prompt=none refresh). chrome.identity.getAuthToken references in auth.js are Chrome-only, behind a runtime check, written in bracket notation.
- storage: sync = selectedSheet, createdSheets, lang, theme, showPrompt; local = token cache + sheet tab-title cache.
- contextMenus: "Save to Sheet" item, documentUrlPatterns-restricted to youtube.com/watch* and youtube.com/shorts/*.
- activeTab: on toolbar click / Alt+S, to tell whether the active tab is a YouTube video page (opens the save card there, options page elsewhere). Chosen to avoid the broad "tabs" permission.
- hosts sheets.googleapis.com / www.googleapis.com / oauth2.googleapis.com: Sheets API v4 read/write on the user's own sheet, drive.file files.list, userinfo.email, token revoke.
- content script (youtube.com/*): site-wide because YouTube is a SPA — a tab opened on the homepage never full-page-loads when navigating to a video, so a watch*-only match would never inject. It acts only on watch/Shorts pages: reads visible video metadata, renders the note card in a closed Shadow DOM, and uses the same-origin unauthenticated youtube.com/oembed endpoint as a title/channel fallback.

OAUTH SCOPES: drive.file (only files this extension created) + userinfo.email (shown on the options page). No restricted scopes; no CASA needed.

DATA FLOW: browser → Google APIs directly. No developer servers, no analytics, no third parties. data_collection_permissions: personallyIdentifyingInfo (account email shown in options) + websiteContent (YouTube metadata the user explicitly saves to their own sheet).
```

---

## Chrome Web Store (yayınlanınca)

- Category: **Productivity**. One-time $5 developer fee: chrome.google.com/webstore/devconsole
- Summary (≤132) ve Description: yukarıdaki English bloklarının aynısı kullanılır.
- CWS her izni ayrı gerekçeyle sorar — "Permission justifications" bölümündeki satırlar
  bire bir yapıştırılabilir.
- Privacy tab: "Does not collect user data" ler işaretlenir; single-purpose statement
  yukarıdaki "Single-purpose statement" bölümünden.
- Zip: `dist/yt2sheets-chrome.zip` (Chrome OAuth client manifest'te gömülü).
