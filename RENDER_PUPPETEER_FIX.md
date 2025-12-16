# Render'da Puppeteer 403 Hatası Çözümü

## Sorun
ETS Tur 403 hatası veriyor çünkü Puppeteer başlatılamıyor veya Chrome binary bulunamıyor.

## Çözüm Adımları

### 1. Render Dashboard'da Build Command Güncelleme

**Render Dashboard** → Backend → Settings → Build Command:

```bash
apt-get update && apt-get install -y chromium-browser chromium-chromedriver && npm install && npm run build
```

**VEYA** (daha hızlı, eğer Chrome zaten kuruluysa):

```bash
npm install && npm run build
```

### 2. Environment Variables Ekleme

**Render Dashboard** → Backend → Environment sekmesinde:

```
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

**VEYA** (eğer yukarıdaki çalışmazsa):

```
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### 3. Deploy Sonrası Test

Deploy tamamlandıktan sonra logları kontrol edin:

**Render Dashboard** → Backend → Logs

Aranacak log mesajları:

✅ **Başarılı:**
```
🚀 Puppeteer browser başlatılıyor...
🔧 Chrome bulundu: /usr/bin/chromium-browser
✅ Puppeteer browser başlatıldı
🌐 Puppeteer ile sayfa yükleniyor...
✅ Puppeteer ile sayfa yüklendi
```

❌ **Başarısız:**
```
❌ Puppeteer başlatılamadı: ...
⚠️  Cheerio kullanılacak (403 hatası alınabilir)
```

### 4. Alternatif: Puppeteer-core Kullanımı

Eğer yukarıdaki çözümler çalışmazsa, `puppeteer-core` kullanabiliriz (Chrome'u manuel kurmamız gerekir).

## Render Free Tier Limitleri

⚠️ **Önemli:** Render free tier'da:
- Memory limiti düşük olabilir (Puppeteer ~200-300MB kullanır)
- Chrome binary kurulumu gerekebilir
- Build süresi uzayabilir

## Hızlı Test

Deploy sonrası sezon scraping başlatın ve logları izleyin:

1. Frontend'den "🗓️ Sezon Scraping" butonuna tıklayın
2. Render Dashboard → Backend → Logs'u açın
3. Puppeteer loglarını kontrol edin

## Sorun Devam Ederse

1. **Chrome Binary Kontrolü:**
   ```bash
   # Render'da SSH ile (eğer mümkünse)
   which chromium-browser
   which google-chrome-stable
   ls -la /usr/bin/chrom*
   ```

2. **Puppeteer Versiyonu:**
   - `package.json`'da `puppeteer` versiyonunu kontrol edin
   - Render'da otomatik kurulur

3. **Memory Limit:**
   - Free tier'da memory limiti aşılabilir
   - Paid plan'a geçmeyi düşünün

4. **Alternative: Playwright**
   - Puppeteer yerine Playwright deneyebiliriz
   - Daha iyi Render desteği olabilir

## Notlar

- İlk Puppeteer başlatma ~5-10 saniye sürebilir
- Her sayfa yüklemesi ~3-5 saniye sürer
- 52 hafta için toplam: ~5-10 dakika
- Browser tekrar kullanılır (memory tasarrufu)

