# 🚨 Network Error Hızlı Çözüm

## ⚡ Hızlı Kontrol Listesi

### 1. Browser Console'u Açın (F12)
Console'da şunu görmelisiniz:
```
🔗 API Base URL: https://compprice-backend.onrender.com/api
```

**Eğer `http://localhost:5001/api` görüyorsanız:**
- Frontend environment variable set edilmemiş!
- Render Dashboard → Frontend → Environment → `REACT_APP_API_URL` ekleyin
- Frontend'i yeniden deploy edin

### 2. Backend Health Check

Browser Console'da çalıştırın:
```javascript
fetch('https://compprice-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Beklenen cevap:**
```json
{"status":"ok","timestamp":"2024-..."}
```

**Eğer hata alıyorsanız:**
- Backend çalışmıyor
- Render Dashboard → Backend → Logs'u kontrol edin

### 3. Render Environment Variables Kontrolü

#### Frontend (Static Site)
```
REACT_APP_API_URL = https://compprice-backend.onrender.com/api
```

#### Backend (Web Service)
```
FRONTEND_URL = https://compprice-frontend.onrender.com
MONGODB_URI = mongodb+srv://...
NODE_ENV = production
PORT = 5000
```

### 4. MongoDB Bağlantısı

Render Dashboard → Backend → Logs'da şunu arayın:
```
✅ MongoDB bağlantısı başarılı
```

**Eğer şunu görüyorsanız:**
```
❌ MongoDB bağlantı hatası
```

**Çözüm:**
1. MongoDB Atlas → Network Access → `0.0.0.0/0` ekleyin
2. MongoDB Atlas → Database Access → Şifreyi kontrol edin
3. Render → Backend → Environment → `MONGODB_URI` güncelleyin

## 🔧 Adım Adım Düzeltme

### Adım 1: Frontend Environment Variable
1. Render Dashboard → Frontend servisi
2. **Environment** sekmesi
3. **Add Environment Variable:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://compprice-backend.onrender.com/api`
4. **Save Changes**
5. **Manual Deploy** → **Deploy latest commit**

### Adım 2: Backend Environment Variable
1. Render Dashboard → Backend servisi
2. **Environment** sekmesi
3. `FRONTEND_URL` değişkenini kontrol edin:
   - Value: `https://compprice-frontend.onrender.com`
4. **Save Changes** (Backend otomatik redeploy olur)

### Adım 3: Backend Logs Kontrolü
1. Render Dashboard → Backend → **Logs**
2. Şunları kontrol edin:
   - ✅ MongoDB bağlantısı başarılı
   - 🚀 Sunucu portunda çalışıyor
   - ⏰ Scheduler başlatıldı

### Adım 4: Test
1. Browser Console'u açın (F12)
2. Şu komutu çalıştırın:
   ```javascript
   console.log('API URL:', process.env.REACT_APP_API_URL)
   ```
3. Doğru URL'i görmelisiniz

## 🐛 Yaygın Hatalar

### "Network Error" - Backend'e erişilemiyor
**Neden:** Frontend yanlış URL kullanıyor
**Çözüm:** `REACT_APP_API_URL` environment variable'ı ekleyin

### "CORS Error"
**Neden:** Backend frontend URL'ini tanımıyor
**Çözüm:** Backend'de `FRONTEND_URL` environment variable'ı ekleyin

### "MongoDB bağlantı hatası"
**Neden:** MongoDB Atlas IP whitelist veya şifre yanlış
**Çözüm:** MongoDB Atlas ayarlarını kontrol edin

### Backend uyku modunda
**Neden:** Free tier - 15 dakika kullanılmazsa uyur
**Çözüm:** İlk istek 30-60 saniye sürebilir, normal

## ✅ Başarı Kontrolü

Tüm bunlar çalışıyorsa:
1. Browser Console'da API URL doğru görünüyor
2. Backend health check başarılı
3. Backend logs'da MongoDB bağlantısı başarılı
4. Frontend'de otel listesi yükleniyor

## 📞 Hala Çalışmıyorsa

1. Browser Console'daki tüm hataları kopyalayın
2. Render Backend Logs'u kopyalayın
3. Network Tab'deki failed request'leri kontrol edin
4. Bu bilgileri paylaşın

