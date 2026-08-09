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
