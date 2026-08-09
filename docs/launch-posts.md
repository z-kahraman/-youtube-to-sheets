# Tanıtım gönderisi taslakları

Kopyala-uyarla metinleri. Samimi "kendime yazdım, paylaşıyorum" tonu reklam dilinden
her mecrada daha iyi çalışır. Linkler: AMO listing + GitHub repo.

---

## Show HN (news.ycombinator.com)

**Title:**
```
Show HN: I built a browser extension that saves YouTube videos to a Google Sheet
```

**Body:**
```
My "watch later" list had become a graveyard, and I kept losing track of which
tutorials I'd actually watched and what I'd learned from them. So I built a small
MV3 extension (Firefox + Chrome): while watching, right-click → "Save to Sheet"
(or Alt+S), add a note and tags, and the video lands as a row in a Google Sheet
you own — title, channel, URL, watched/total time, and a watch status derived
from your progress.

Design decisions I cared about:
- No servers. The browser talks to Google's API directly; I never see any data.
- drive.file scope only — the extension can literally only touch spreadsheets
  it created itself, not the rest of your Drive.
- One row per video (upsert): re-saving appends your note and merges tags
  instead of duplicating.
- Vanilla JS, no build step; the shipped zip is the readable source.

Firefox: https://addons.mozilla.org/firefox/addon/youtube-to-sheets/
Source (MIT): https://github.com/z-kahraman/youtube-to-sheets

Would love feedback — especially on what you'd want tracked in the sheet.
```

---

## Reddit (r/GoogleSheets, r/productivity, r/chrome_extensions, r/firefox)

**Title (uyarlamalı):**
```
I made a free, open-source extension that logs YouTube videos (with your notes/tags) to a Google Sheet
```

**Body:**
```
I watch a lot of tutorials and my watch-later list was useless for remembering
what I actually learned. So I built this: right-click on any YouTube video (or
press Alt+S) → a small card pops up → add a note + tags → it saves a row to your
own Google Sheet with the title, channel, link, how much of it you watched, and
a Watched/Partial/Opened status.

Re-saving the same video updates the existing row instead of duplicating, and
the card shows what you noted last time.

Privacy stuff, because it matters: there's no server, no analytics — data goes
straight from your browser to your own sheet, and the extension can only access
sheets it created (Google's drive.file scope). It's open source (MIT).

Firefox: https://addons.mozilla.org/firefox/addon/youtube-to-sheets/
Chrome: load the zip from GitHub releases for now (Web Store submission pending)
Code: https://github.com/z-kahraman/youtube-to-sheets

Happy to answer questions / take feature requests.
```

---

## Product Hunt

**Tagline (≤60):**
```
Save YouTube videos to your own Google Sheet — with notes & tags
```

**Description:**
```
YouTube to Sheets turns your scattered watch history into a personal video log.
Right-click or press Alt+S on any video, jot a note, add tags, and it lands in a
Google Sheet you own — title, channel, watch progress and status included.
Re-saving updates the same row. No servers, no analytics, open source (MIT);
the extension can only access sheets it created.
```

---

## X / LinkedIn (Türkçe)

```
İzlediğim YouTube videolarını (özellikle dersleri) takip edemez olmuştum;
kendime küçük bir eklenti yazdım, açık kaynak paylaşıyorum:

📋 Sağ tık ya da Alt+S → not + etiket ekle → video kendi Google Sheets
dosyana satır olarak düşer (başlık, kanal, link, ne kadarını izlediğin,
İzlendi/Kısmen/Açıldı durumu).

🔒 Sunucu yok, analitik yok — veri tarayıcından doğrudan kendi sheet'ine
gider; eklenti yalnızca kendi oluşturduğu dosyalara erişebilir.

Firefox: https://addons.mozilla.org/firefox/addon/youtube-to-sheets/
Kaynak (MIT): https://github.com/z-kahraman/youtube-to-sheets

TR + EN arayüz. Geri bildirim ve katkıya açığım 🙌
```

---

## Zamanlama / sıra önerisi

1. Chrome Web Store yayını beklenmeden Firefox linkiyle Reddit'te 1-2 nişte başla
   (r/GoogleSheets en hedefli kitle; kural gereği self-promo etiketi gerekiyorsa ekle).
2. CWS yayını çıkınca Show HN + Product Hunt (iki mağaza linki birden güven verir).
3. Her gönderiden gelen soruları GitHub issue'ya çevir — yol haritası oradan beslensin.
4. İlk 10-20 kullanıcıdan mağaza yorumu iste (yorum sayısı mağaza sıralamasını besler).
