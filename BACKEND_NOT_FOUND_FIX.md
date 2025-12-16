# Backend "Not Found" Hatası - Çözüm

## 🔍 Sorun: `https://compprice-backend.onrender.com/health` → Not Found

Bu hata backend'in çalışmadığı anlamına gelir.

## ✅ Hızlı Kontrol Listesi

### 1. Render Dashboard'da Backend Durumu

1. Render Dashboard → Backend servisi
2. **Logs** sekmesine gidin
3. Şunları kontrol edin:

**✅ Başarılı Deploy:**
```
🚀 Sunucu 5000 portunda çalışıyor
✅ MongoDB bağlantısı başarılı
```

**❌ Hata Varsa:**
- Build hatası
- MongoDB bağlantı hatası
- Port hatası

### 2. Backend Ayarları Kontrolü

Render Dashboard → Backend → **Settings** sekmesinde:

**Root Directory:**
```
backend
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Environment:**
```
Node
```

### 3. Environment Variables

Render Dashboard → Backend → **Environment** sekmesinde:

```
MONGODB_URI = mongodb+srv://...
NODE_ENV = production
PORT = 5000
FRONTEND_URL = https://compprice-frontend.onrender.com
LOG_LEVEL = info
```

### 4. Backend'i Yeniden Deploy Et

1. Render Dashboard → Backend
2. **Manual Deploy** → **Deploy latest commit**
3. Logs'u izleyin
4. Başarılı olana kadar bekleyin

## 🐛 Yaygın Sorunlar

### Sorun 1: Root Directory Yanlış

**Belirtiler:**
- Build başarılı ama start hatası
- "Cannot find module" hatası

**Çözüm:**
- Render Dashboard → Backend → Settings
- **Root Directory:** `backend` olmalı

### Sorun 2: Build Hatası

**Belirtiler:**
- Logs'da TypeScript hatası
- "Build failed" mesajı

**Çözüm:**
- GitHub'a en son commit'i push edin
- Backend'i yeniden deploy edin

### Sorun 3: MongoDB Bağlantı Hatası

**Belirtiler:**
- Logs'da: `❌ MongoDB bağlantı hatası`
- Backend crash oluyor

**Çözüm:**
1. MongoDB Atlas → Network Access → `0.0.0.0/0` ekleyin
2. MongoDB şifresini kontrol edin
3. `MONGODB_URI` environment variable'ını güncelleyin
4. Backend'i yeniden deploy edin

### Sorun 4: Port Hatası

**Belirtiler:**
- Backend başlamıyor
- Port conflict hatası

**Çözüm:**
- Render otomatik port atar
- `PORT` environment variable'ını kaldırın veya Render'ın otomatik port'unu kullanın
- Backend kodunda `process.env.PORT || 5000` kullanılıyor, bu doğru

## 🔧 Adım Adım Düzeltme

### Adım 1: Backend Logs Kontrolü
1. Render Dashboard → Backend → **Logs**
2. Son log'ları okuyun
3. Hata var mı kontrol edin

### Adım 2: Backend Ayarları
1. Render Dashboard → Backend → **Settings**
2. Root Directory: `backend` ✅
3. Build Command: `npm install && npm run build` ✅
4. Start Command: `npm start` ✅

### Adım 3: Environment Variables
1. Render Dashboard → Backend → **Environment**
2. Tüm değişkenleri kontrol edin
3. `MONGODB_URI` doğru mu?

### Adım 4: Yeniden Deploy
1. Render Dashboard → Backend
2. **Manual Deploy** → **Deploy latest commit**
3. Logs'u izleyin

### Adım 5: Test
Deploy tamamlandıktan sonra:
```
https://compprice-backend.onrender.com/health
```

Beklenen cevap:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "mongodb": "connected",
  "environment": "production"
}
```

## 📞 Hala Çalışmıyorsa

1. **Render Backend Logs'u kopyalayın:**
   - Tüm log'ları seçin ve kopyalayın
   - Özellikle son 50-100 satırı

2. **Backend Settings screenshot'u alın:**
   - Root Directory
   - Build Command
   - Start Command

3. **Environment Variables listesi:**
   - Hangi değişkenler var?
   - Değerleri doğru mu? (şifreler hariç)

Bu bilgileri paylaşın, daha spesifik yardım edebilirim.

