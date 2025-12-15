# Network Error Debugging Guide

Render'da "network error" alıyorsanız, bu rehber sorunu bulmanıza yardımcı olacak.

## 🔍 Sorun Tespiti

### 1. Browser Console Kontrolü

**Chrome/Edge:**
1. F12 tuşuna basın
2. **Console** sekmesine gidin
3. Hata mesajlarını kontrol edin

**Firefox:**
1. F12 tuşuna basın
2. **Console** sekmesine gidin

**Safari:**
1. Cmd+Option+I
2. **Console** sekmesine gidin

### 2. Network Tab Kontrolü

1. F12 → **Network** sekmesi
2. Sayfayı yenileyin
3. API isteklerini kontrol edin:
   - **Status Code:** 200 (başarılı), 404 (bulunamadı), 500 (server hatası), CORS error
   - **Request URL:** Doğru backend URL'i mi?
   - **Response:** Hata mesajı var mı?

## 🐛 Yaygın Sorunlar ve Çözümleri

### Sorun 1: CORS Hatası

**Belirtiler:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Çözüm:**
1. Render Dashboard → Backend servisi
2. **Environment** sekmesi
3. `FRONTEND_URL` değişkenini kontrol edin:
   ```
   FRONTEND_URL = https://compprice-frontend.onrender.com
   ```
4. Backend'i yeniden deploy edin

### Sorun 2: Backend Çalışmıyor

**Kontrol:**
```bash
# Browser'da test edin
https://compprice-backend.onrender.com/health
```

**Beklenen cevap:**
```json
{"status":"ok","timestamp":"2024-..."}
```

**Çözüm:**
- Render Dashboard → Backend → **Logs** sekmesini kontrol edin
- MongoDB bağlantısını kontrol edin
- Environment Variables'ı kontrol edin

### Sorun 3: Frontend API URL Yanlış

**Kontrol:**
1. Browser Console'da:
   ```javascript
   console.log(process.env.REACT_APP_API_URL)
   ```
2. Render Dashboard → Frontend → **Environment** sekmesi
3. `REACT_APP_API_URL` değişkenini kontrol edin:
   ```
   REACT_APP_API_URL = https://compprice-backend.onrender.com/api
   ```

**Önemli:** Frontend'i yeniden deploy etmeniz gerekebilir!

### Sorun 4: MongoDB Bağlantı Hatası

**Kontrol:**
1. Render Dashboard → Backend → **Logs**
2. Şu hatayı arıyorsunuz:
   ```
   ❌ MongoDB bağlantı hatası
   ```

**Çözüm:**
1. MongoDB Atlas → **Network Access**
2. **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
3. MongoDB Atlas → **Database Access** → Kullanıcı şifresini kontrol edin
4. Render → Backend → Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://kullanici:DOGRU_SIFRE@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   ```

### Sorun 5: Backend Uyku Modunda

**Belirtiler:**
- İlk istek 30-60 saniye sürüyor
- Sonraki istekler hızlı

**Çözüm:**
- Bu normal (free tier limiti)
- İlk istekten sonra hızlı çalışır
- Production için paid plan önerilir

## 🔧 Adım Adım Debug

### Adım 1: Backend Health Check
```bash
curl https://compprice-backend.onrender.com/health
```

### Adım 2: Backend API Test
```bash
curl https://compprice-backend.onrender.com/api/hotels
```

### Adım 3: Frontend Environment Variable
1. Render Dashboard → Frontend
2. **Environment** sekmesi
3. `REACT_APP_API_URL` değerini kontrol edin

### Adım 4: Browser Console
1. Frontend sayfasını açın
2. F12 → Console
3. Şu komutu çalıştırın:
   ```javascript
   console.log('API URL:', process.env.REACT_APP_API_URL)
   ```

### Adım 5: Network Tab
1. F12 → Network
2. Otel kaydetmeyi deneyin
3. İsteği kontrol edin:
   - **URL:** Doğru mu?
   - **Status:** 200, 400, 500?
   - **Response:** Hata mesajı var mı?

## 📋 Checklist

- [ ] Backend health check çalışıyor mu?
- [ ] Backend API endpoint'leri erişilebilir mi?
- [ ] Frontend `REACT_APP_API_URL` doğru mu?
- [ ] Backend `FRONTEND_URL` doğru mu?
- [ ] MongoDB bağlantısı başarılı mı?
- [ ] CORS hatası var mı?
- [ ] Browser console'da hata var mı?
- [ ] Network tab'de istek başarılı mı?

## 🆘 Hala Çalışmıyorsa

1. **Render Logs'u kontrol edin:**
   - Backend → Logs
   - Frontend → Logs

2. **MongoDB Atlas Logs:**
   - MongoDB Atlas → Monitoring

3. **Browser Console:**
   - Tüm hata mesajlarını not edin

4. **Network Tab:**
   - Failed request'leri kontrol edin
   - Response'ları inceleyin

## 💡 Hızlı Test

Browser Console'da test edin:

```javascript
// API URL'i kontrol et
console.log('API URL:', process.env.REACT_APP_API_URL);

// Backend'e istek at
fetch('https://compprice-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Hotels endpoint test
fetch('https://compprice-backend.onrender.com/api/hotels')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

Bu testler sorunun nerede olduğunu gösterecektir!

