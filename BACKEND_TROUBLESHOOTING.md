# Backend Troubleshooting - Network Error

## 🔍 Sorun: "Network Error - Backend'e erişilemiyor"

Bu hata genellikle şu nedenlerden kaynaklanır:

### 1. Backend Uyku Modunda (Free Tier)

**Belirtiler:**
- İlk istek 30-60 saniye sürüyor
- Sonraki istekler hızlı

**Çözüm:**
- Bu normal (free tier limiti)
- İlk istekten sonra hızlı çalışır
- Production için paid plan önerilir

### 2. Backend Çalışmıyor

**Kontrol:**
1. Render Dashboard → Backend servisi
2. **Logs** sekmesini kontrol edin
3. Şunları arayın:
   - ✅ `🚀 Sunucu 5000 portunda çalışıyor`
   - ✅ `✅ MongoDB bağlantısı başarılı`
   - ❌ Hata mesajları

**Test:**
Browser'da şu URL'i açın:
```
https://compprice-backend.onrender.com/health
```

**Beklenen cevap:**
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "mongodb": "connected",
  "environment": "production"
}
```

**Eğer hata alıyorsanız:**
- Backend deploy edilmemiş olabilir
- Backend crash olmuş olabilir
- Render Dashboard → Backend → Logs'u kontrol edin

### 3. MongoDB Bağlantı Hatası

**Kontrol:**
Render Dashboard → Backend → Logs'da şunu arayın:
```
❌ MongoDB bağlantı hatası
```

**Çözüm:**
1. MongoDB Atlas → **Network Access**
   - **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
   
2. MongoDB Atlas → **Database Access**
   - Kullanıcı şifresini kontrol edin
   
3. Render → Backend → Environment Variables
   ```
   MONGODB_URI = mongodb+srv://kullanici:DOGRU_SIFRE@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   ```

4. Backend'i yeniden deploy edin

### 4. CORS Hatası

**Belirtiler:**
Browser Console'da:
```
Access to XMLHttpRequest ... has been blocked by CORS policy
```

**Çözüm:**
1. Render Dashboard → Backend → Environment
2. `FRONTEND_URL` değişkenini kontrol edin:
   ```
   FRONTEND_URL = https://compprice-frontend.onrender.com
   ```
3. Backend'i yeniden deploy edin

### 5. Frontend API URL Yanlış

**Kontrol:**
Browser Console'da (F12):
```javascript
console.log(process.env.REACT_APP_API_URL)
```

**Beklenen:**
```
https://compprice-backend.onrender.com/api
```

**Eğer farklıysa:**
1. Render Dashboard → Frontend → Environment
2. `REACT_APP_API_URL` değişkenini kontrol edin
3. Frontend'i yeniden deploy edin

## 🧪 Adım Adım Test

### Adım 1: Backend Health Check
```bash
curl https://compprice-backend.onrender.com/health
```

Veya browser'da:
```
https://compprice-backend.onrender.com/health
```

### Adım 2: Backend API Test
```bash
curl https://compprice-backend.onrender.com/api
```

### Adım 3: Hotels Endpoint Test
```bash
curl https://compprice-backend.onrender.com/api/hotels
```

### Adım 4: Browser Console Test
Browser Console'da (F12):
```javascript
fetch('https://compprice-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## 📋 Checklist

- [ ] Backend health check çalışıyor mu?
- [ ] Backend logs'da MongoDB bağlantısı başarılı mı?
- [ ] Backend logs'da sunucu çalışıyor mu?
- [ ] Frontend `REACT_APP_API_URL` doğru mu?
- [ ] Backend `FRONTEND_URL` doğru mu?
- [ ] MongoDB Atlas IP whitelist doğru mu?
- [ ] MongoDB şifresi doğru mu?

## 🆘 Hala Çalışmıyorsa

1. **Render Backend Logs:**
   - Tüm log'ları kopyalayın
   - MongoDB bağlantı hatalarını kontrol edin

2. **Browser Console:**
   - F12 → Console
   - Tüm hataları not edin

3. **Network Tab:**
   - F12 → Network
   - Failed request'leri kontrol edin
   - Response'ları inceleyin

4. **Backend Health Check:**
   - `https://compprice-backend.onrender.com/health` çalışıyor mu?

## 💡 Hızlı Çözüm

Eğer backend uyku modundaysa:
1. İlk isteği bekleyin (30-60 saniye)
2. Sonraki istekler hızlı olacak
3. Veya backend'i "wake up" etmek için health check yapın

## 🔧 Backend'i Yeniden Başlatma

Render Dashboard → Backend → **Manual Deploy** → **Deploy latest commit**

Bu backend'i yeniden başlatır ve uyku modundan çıkarır.

