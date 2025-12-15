# Rakip Otel Scraping Rehberi

## 📌 Genel Bakış

CompPrice sistemi, rakip otellerin **kendi web sitelerinden doğrudan scrape etmeyi** destekler. Bu rehber, rakip otelleri nasıl ekleyeceğinizi ve doğru scraper yöntemini seçeceğinizi açıklar.

## 🎯 Scraping Yöntemleri

### 1. **Otomatik Scraping (Recommended)** ✅
- **Yöntem**: `auto`
- **Açıklama**: Sistem, genel CSS selector'larını ve ortak class/id isimleri kullanarak otomatik olarak fiyat bulur
- **Avantajlar**: 
  - Konfigürasyon gerekmiyor
  - Çoğu otel sitesinde çalışır
  - Hızlı kurulum
- **Dezavantajlar**:
  - Bazı özel siteler için başarısız olabilir
  - Yüksek başarı oranı (%60-80%)

**Ne zaman kullanılır:**
- Ortak booking sitelerine benzer yapılı web siteler
- Hızlı test için

### 2. **Yapılandırılmış Veri Scraping** (JSON-LD) ⭐
- **Yöntem**: `structured-data`
- **Açıklama**: Web sitesinin JSON-LD şemasından fiyat bilgisini çıkarır
- **Avantajlar**:
  - Çok güvenilir (%90+)
  - Dinamik siteler için de çalışır
  - Google tarafından desteklenen standart format
- **Dezavantajlar**:
  - Tüm siteler JSON-LD kullanmaz
  - Bazen meta bilgiler eksik olabilir

**Ne zaman kullanılır:**
- Profesyonel otel web siteleri
- Google Hotels ile listelenen siteler
- Maksimum güvenilirlik gerekiyorsa

### 3. **Özel Selector Scraping** (Custom CSS)
- **Yöntem**: `custom`
- **Açıklama**: Siz belirttiğiniz CSS selector'ları kullanarak scrape eder
- **Avantajlar**:
  - Tam kontrol
  - %100 başarı oranı (doğru selector varsa)
  - Spesifik siteler için optimize edilmiş
- **Dezavantajlar**:
  - Kurulumu biraz teknik bilgi gerektirir
  - Site tasarımı değişirse selector güncellenmesi gerekir

**Ne zaman kullanılır:**
- Otomatik yöntem başarısız olduğunda
- Spesifik otel sitelerine özel kurulum
- En yüksek güvenilirlik gerekiyorsa

## 🔧 Adım Adım: Rakip Otel Ekleme

### Senaryo 1: Otomatik Yöntem Kullanarak

1. **Otel Management Sayfasına Git**
   - http://localhost:3000/hotels
   - "Otel Ekle" butonuna tıkla

2. **Otel Bilgilerini Gir**
   ```
   Adı: Grand Hotel Istanbul
   Adresi: Taksim Meydanı, Istanbul
   Şehir: Istanbul
   Puan: 4.5
   ```

3. **Rakip Otel Ekle**
   - "Rakip Otel Ekle" butonuna tıkla
   - Rakip otel adı gir: "Sheraton Otel"
   - URL gir: `https://www.sheratonhotel.com.tr/rooms`
   - Scraping yöntemi: **"Otomatik (Genel Selector'lar)"** seç
   - Kaydet

4. **Fiyatları Kontrol Et**
   - Dashboard'a git
   - Otel detayına tıkla
   - "Şimdi Scrape Et" butonuna tıkla

### Senaryo 2: JSON-LD Kullanarak (Google Hotels siteler)

1. Aynı adımları takip et
2. Scraping yöntemi olarak: **"Yapılandırılmış Veri (JSON-LD)"** seç
3. Kaydet

```
✅ Örnek siteler:
- Google Hotels'te listelenen oteller
- Hotels.com'da listelenen oteller
- TripAdvisor'da listelenen oteller
```

### Senaryo 3: Özel Selector'lar Kullanarak

#### Adım 1: Selector'ları Bulma

1. **Web sitesini tarayıcıda aç**
   ```
   https://www.rakip-otel.com
   ```

2. **Fiyat öğesini sağ tıkla**
   - Mouse'u fiyat öğesinin üzerine götür
   - Sağ tıkla → **"İnceleme yapın"** / **"Inspect"**

3. **HTML'de selector'u bul**
   ```html
   <!-- Örnek: Fiyat -->
   <span class="room-price">$150</span>
   Selector: .room-price

   <!-- Örnek: Diğer fiyat şekli -->
   <div data-price="150">$150</div>
   Selector: [data-price]

   <!-- Örnek: Rating -->
   <span class="hotel-rating" data-rating="4.5">4.5</span>
   Selector: .hotel-rating
   ```

#### Adım 2: Selector'ları Gir

1. Otel Management sayfasında "Rakip Otel Ekle" tıkla
2. Rakip otel bilgilerini gir
3. Scraping yöntemi: **"Özel Selector'lar"** seç
4. Aşağıdaki alanları doldur:

   **Fiyat Selector'ı** (Zorunlu):
   ```
   .room-price
   ```

   **Rating Selector'ı** (İsteğe bağlı):
   ```
   .hotel-rating
   ```

   **Uygunluk Selector'ı** (İsteğe bağlı):
   ```
   .available
   ```

5. Kaydet ve test et

## 🔍 CSS Selector Örnekleri

### Fiyat Bulma Örnekleri

```css
/* Class selector'ı */
.price
.room-price
.hotel-price
.rates
[class*="price"]

/* ID selector'ı */
#price
#room-price
#cost

/* Attribute selector'ı */
[data-price]
[data-testid="price"]
[class*="price"]

/* Kombinasyonlar */
.room .price
.booking-info .total-price
span.amount
```

### Rating Bulma Örnekleri

```css
.rating
.stars
.score
[data-rating]
[class*="rating"]
.hotel-rating
.guest-rating
.review-score
```

### Uygunluk Bulma Örnekleri

```css
.available
.in-stock
.booked
[data-available]
.unavailable
[class*="available"]
```

## 🛠️ Selector Bulma Araçları

### Chrome DevTools Kullanarak
1. F12 tuşuna basın
2. Element Picker simgesine tıkla (🔍)
3. İlgilendiğin öğeye tıkla
4. Sağ panelde HTML'i gör
5. Class veya ID'yi kopyala

### Konsol Kullanarak (Advanced)

```javascript
// Fiyat öğesini bul
document.querySelector('.price').textContent

// Tüm fiyat öğelerini bul
document.querySelectorAll('[data-price]')

// XPath kullan
document.evaluate("//span[@class='price']", document)
```

## ✅ Test Etme

### Scraping'i Test Et

```bash
# Terminal'de
curl -X POST http://localhost:5000/api/scrapers/scrape/{hotelId}
```

### Sonuçları Görüntüle

```json
{
  "hotelId": "...",
  "results": [
    {
      "competitorName": "Sheraton",
      "platform": "competitor",
      "price": 150,
      "currency": "USD",
      "availability": true,
      "rating": 4.5
    }
  ]
}
```

## 🐛 Sorunlar ve Çözümler

### Problem: "Fiyat bulunamadı"

**Sebep 1: URL yanlış**
- ✅ Çözüm: URL'yi kontrol et, otel fiyat sayfasını aç

**Sebep 2: Selector yanlış**
- ✅ Çözüm: DevTools'ta tekrar kontrol et
- ✅ Farklı selector'ları dene

**Sebep 3: Site anti-scraping kullanıyor**
- ✅ Çözüm: User-Agent başlığını güncelledim
- ✅ Timeout'u arttır

**Sebep 4: JavaScript dinamik**
- ✅ Çözüm: Structured-data yöntemi dene
- ✅ Çoğu otel sitesi JSON-LD kullanır

### Problem: Timeout/Ağ hatası

```bash
# Backend logs'ı kontrol et
tail -f backend/combined.log

# Çözüm önerileri:
1. URL'nin çalışıp çalışmadığını tarayıcıda test et
2. Timeout süresini arttır (backend/src/scrapers)
3. VPN varsa devre dışı bırak
```

### Problem: Yanlış fiyat alınıyor

- Selector birden fazla öğeyle eşleşiyordur
- İlk öğe yanlış seçilmiş olabilir
- Özel selector'lar daha spesifik olmalı

```css
/* Kötü */
.price  /* Birden fazla eşleşebilir */

/* İyi */
.room-container .price  /* Daha spesifik */
.booking-info .final-price  /* Context ile */
[data-room-id] .price  /* Attribute ile */
```

## 📊 Başarılı Scraping Kontrol Listesi

- [ ] URL tarayıcıda açılıp sayfayı yükle
- [ ] Selector'lar DevTools'ta çalışıyor
- [ ] JSON-LD verisi mevcutsa onu dene
- [ ] Custom selector'lar çok spesifik değil
- [ ] Timeout hatası almıyorsun
- [ ] Backend logs'ta hata yok
- [ ] Fiyat formatı doğru (USD/EUR/TL)

## 📝 Örnek Konfigürasyonlar

### Örnek 1: Booking.com benzeri site

```
Adı: Rakip Otel
URL: https://example.com/rooms/2024
Yöntem: Otomatik
(Hiçbir selector gerekmiyor)
```

### Örnek 2: Google Hotels sitesi

```
Adı: 5-Yıldız Otel
URL: https://example.com
Yöntem: JSON-LD (Yapılandırılmış Veri)
(Hiçbir selector gerekmiyor)
```

### Örnek 3: Özel otel sitesi

```
Adı: Boutique Hotel
URL: https://boutique-hotel.com/rooms
Yöntem: Özel Selector'lar

Fiyat Selector'ı: .room-card .price
Rating Selector'ı: .review-score
Uygunluk Selector'ı: .room-card:not(.sold-out)
```

## 🎯 İpuçları

1. **Başla otomatik yöntemle** - Kurulum yok, hızlı test
2. **JSON-LD başarısız olursa, özel selector'lar kullan**
3. **Selector'ları 1-2 hafta sonra tekrar kontrol et** - Siteler güncellenir
4. **Çoklu competitor'lar ekle** - Fiyat karşılaştırması için
5. **Logs'u izle** - Sorun giderme için

## 📚 Kaynaklar

- [MDN CSS Selector'lar](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)
- [JSON-LD Nedir?](https://json-ld.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

**Sorular? Backend logs'a (`backend/combined.log`) bakın ve hata mesajlarını kontrol edin!** 🔍
