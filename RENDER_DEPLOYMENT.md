# Render Deployment Guide

Bu rehber CompPrice uygulamasını Render'da deploy etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

1. ✅ GitHub hesabı ve repository
2. ✅ Render hesabı (https://render.com - ücretsiz)
3. ✅ MongoDB Atlas hesabı (zaten kullanıyorsunuz)

---

## 🚀 Backend Deployment (Web Service)

### Adım 1: Render Dashboard'a Giriş
1. https://render.com → Sign Up / Login
2. GitHub hesabınızla giriş yapın

### Adım 2: Yeni Web Service Oluştur
1. Dashboard → **New** → **Web Service**
2. GitHub repository'nizi bağlayın
3. Repository'yi seçin

### Adım 3: Backend Ayarları

**Temel Bilgiler:**
```
Name: compprice-backend
Region: Frankfurt (EU) veya Oregon (US)
Branch: main
```

**Build & Deploy Ayarları:**
```
Root Directory: backend
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Instance Type:**
- Free tier seçin (yeterli)

### Adım 4: Environment Variables

**Environment Variables** bölümüne şunları ekleyin:

```
MONGODB_URI = mongodb+srv://kullanici:sifre@cluster0.xxxxx.mongodb.net/?appName=Cluster0
NODE_ENV = production
PORT = 5000
LOG_LEVEL = info
FRONTEND_URL = https://compprice-frontend.onrender.com
```

**Önemli:** `FRONTEND_URL`'i frontend deploy edildikten sonra güncelleyin!

### Adım 5: Deploy
1. **Create Web Service** butonuna tıklayın
2. İlk deploy 5-10 dakika sürebilir
3. Deploy tamamlandığında backend URL'inizi not edin:
   - Örnek: `https://compprice-backend.onrender.com`

---

## 🎨 Frontend Deployment (Static Site)

### Adım 1: Yeni Static Site Oluştur
1. Render Dashboard → **New** → **Static Site**
2. Aynı GitHub repository'yi seçin

### Adım 2: Frontend Ayarları

**Temel Bilgiler:**
```
Name: compprice-frontend
Branch: main
```

**Build Ayarları:**
```
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: build
```

### Adım 3: Environment Variables

**Environment Variables** bölümüne ekleyin:

```
REACT_APP_API_URL = https://compprice-backend.onrender.com/api
```

**Önemli:** Backend URL'ini yukarıda not ettiğiniz URL ile değiştirin!

### Adım 4: Deploy
1. **Create Static Site** butonuna tıklayın
2. Deploy tamamlandığında frontend URL'inizi not edin:
   - Örnek: `https://compprice-frontend.onrender.com`

---

## 🔄 Backend FRONTEND_URL Güncelleme

Frontend deploy edildikten sonra:

1. Backend servisine gidin (Render Dashboard)
2. **Environment** sekmesine tıklayın
3. `FRONTEND_URL` değişkenini güncelleyin:
   ```
   FRONTEND_URL = https://compprice-frontend.onrender.com
   ```
4. **Save Changes** → Backend otomatik olarak yeniden deploy olacak

---

## ✅ Deployment Checklist

### Backend
- [ ] Render'da Web Service oluşturuldu
- [ ] Root Directory: `backend` ayarlandı
- [ ] Build Command: `npm install && npm run build` ayarlandı
- [ ] Start Command: `npm start` ayarlandı
- [ ] Environment Variables eklendi (MONGODB_URI, NODE_ENV, PORT, FRONTEND_URL)
- [ ] Backend deploy edildi ve çalışıyor
- [ ] Backend URL not edildi

### Frontend
- [ ] Render'da Static Site oluşturuldu
- [ ] Root Directory: `frontend` ayarlandı
- [ ] Build Command: `npm install && npm run build` ayarlandı
- [ ] Publish Directory: `build` ayarlandı
- [ ] Environment Variable: `REACT_APP_API_URL` eklendi
- [ ] Frontend deploy edildi
- [ ] Backend'deki `FRONTEND_URL` güncellendi

---

## 🔍 Test Etme

### Backend Test
```bash
# Health check
curl https://compprice-backend.onrender.com/health

# Hotels endpoint
curl https://compprice-backend.onrender.com/api/hotels
```

### Frontend Test
1. Frontend URL'inize gidin
2. Dashboard'un yüklendiğini kontrol edin
3. Otel eklemeyi deneyin
4. API bağlantısının çalıştığını doğrulayın

---

## ⚠️ Önemli Notlar

### Free Tier Limitleri
- **15 dakika kullanılmazsa uyku modu:** İlk istekte 30-60 saniye uyanma süresi
- **Aylık 750 saat:** Genellikle yeterli
- **Auto-deploy:** Her push'ta otomatik deploy

### MongoDB Atlas Ayarları
1. MongoDB Atlas → Network Access
2. **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Veya Render'ın IP'lerini ekleyin

### Cron Jobs
- Render'da cron job'lar çalışır
- Free tier'de uyku modunda cron job'lar çalışmayabilir
- Production'da **Paid Plan** önerilir

### Logs
- Render Dashboard → **Logs** sekmesinden logları görüntüleyin
- Hata ayıklama için logları kontrol edin

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor
1. **Logs'u kontrol edin:** Render Dashboard → Logs
2. **Environment Variables:** Tüm değişkenler doğru mu?
3. **MongoDB Bağlantısı:** MongoDB Atlas'ta IP whitelist kontrolü
4. **Build Hatası:** Node.js versiyonu 18+ olmalı

### Frontend API'ye Bağlanamıyor
1. **REACT_APP_API_URL:** Doğru backend URL'i mi?
2. **CORS Hatası:** Backend'deki `FRONTEND_URL` doğru mu?
3. **Backend Çalışıyor mu:** Health check yapın

### Build Hatası
1. **Node.js Versiyonu:** Render otomatik algılar (18+)
2. **Dependencies:** `package.json` doğru mu?
3. **Build Logs:** Render Dashboard → Logs'u kontrol edin

---

## 📞 Destek

Sorun yaşarsanız:
1. Render Dashboard → Logs'u kontrol edin
2. MongoDB Atlas → Logs'u kontrol edin
3. Browser Console'da hataları kontrol edin

---

## 🎉 Başarılı Deployment Sonrası

Deployment başarılı olduğunda:
- ✅ Frontend: `https://compprice-frontend.onrender.com`
- ✅ Backend: `https://compprice-backend.onrender.com`
- ✅ Otomatik scraping çalışıyor
- ✅ API endpoint'leri erişilebilir

**Tebrikler! Uygulamanız canlıda! 🚀**

