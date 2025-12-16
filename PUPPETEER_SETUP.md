# Puppeteer Setup for ETS Tur Scraping

## Sorun
ETS Tur 403 hatası veriyor çünkü bot koruması var. Cheerio (basit HTTP istekleri) yeterli değil.

## Çözüm
Puppeteer eklendi - gerçek tarayıcı gibi davranarak bot korumasını aşıyor.

## Render'da Puppeteer

### Otomatik Kurulum
Render genellikle Puppeteer'ı otomatik olarak kurar. Ancak bazen manuel ayar gerekebilir.

### Environment Variables
Render Dashboard → Backend → Environment sekmesinde şunları ekleyin:

```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### Build Command
Render'da build command şu şekilde olmalı:

```bash
npm install && npm run build
```

### Chrome/Chromium Kurulumu
Eğer Puppeteer çalışmazsa, Render'da Chrome kurulumu için:

1. **Render Dashboard** → Backend → Settings
2. **Build Command**'ı güncelleyin:
   ```bash
   apt-get update && apt-get install -y chromium-browser && npm install && npm run build
   ```

   Veya daha hafif:
   ```bash
   npm install && npm run build
   ```

### Puppeteer Fallback
Kod otomatik olarak Puppeteer başarısız olursa Cheerio'ya geçer. Loglarda şunu göreceksiniz:

```
⚠️  Puppeteer başlatılamadı, Cheerio kullanılacak
```

## Test

### Local Test
```bash
cd backend
npm run dev
```

### Render Test
1. Backend deploy edin
2. Sezon scraping başlatın
3. Logları kontrol edin:
   - `🚀 Puppeteer browser başlatılıyor...` - Puppeteer çalışıyor
   - `⚠️  Puppeteer başlatılamadı` - Puppeteer çalışmıyor, Cheerio kullanılıyor

## Sorun Giderme

### Puppeteer Başlatılamıyor
1. **Logları kontrol edin**: Render Dashboard → Backend → Logs
2. **Chrome binary kontrolü**: Puppeteer Chrome'u bulamıyor olabilir
3. **Memory limit**: Render free tier'da memory limiti düşük olabilir

### 403 Hatası Devam Ediyor
1. Puppeteer çalışıyor mu kontrol edin (loglarda görünür)
2. User-Agent ve header'lar doğru mu kontrol edin
3. Rate limiting: Çok hızlı istek yapıyorsanız yavaşlatın

### Memory Hatası
Render free tier'da Puppeteer memory limitini aşabilir. Çözüm:
1. Sezon scraping'i daha küçük parçalara bölün
2. Her scraping sonrası browser'ı kapatın (kod otomatik yapıyor)
3. Paid plan'a geçin

## Performans

### Puppeteer vs Cheerio
- **Puppeteer**: Daha yavaş ama bot korumasını aşar (~3-5 saniye/sayfa)
- **Cheerio**: Daha hızlı ama 403 hatası alabilir (~0.5 saniye/sayfa)

### Optimizasyon
- Browser'ı tekrar kullanın (kod zaten yapıyor)
- Sayfa yükleme bekleme süresini azaltın (2 saniye yeterli)
- Network idle bekleme süresini optimize edin

## Notlar

- Puppeteer ilk başlatmada ~2-3 saniye sürer
- Her sayfa yüklemesi ~3-5 saniye sürer
- 52 hafta için toplam süre: ~5-10 dakika (Puppeteer ile)
- Cheerio ile: ~1-2 dakika (ama 403 hatası alabilir)

