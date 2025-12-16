# Render'da MongoDB Connection String Güncelleme

## ✅ Connection String

```
mongodb+srv://mursitozkir_db_user:CE37V58FRJXgluer@cluster0.g17wlvi.mongodb.net/?appName=Cluster0
```

## 🔧 Render'da Güncelleme Adımları

### Adım 1: Render Dashboard'a Gidin
1. https://dashboard.render.com → Login
2. Backend servisinizi seçin (`compprice-backend`)

### Adım 2: Environment Variables Sekmesi
1. Sol menüden **Environment** sekmesine tıklayın
2. Environment Variables listesini görürsünüz

### Adım 3: MONGODB_URI'yi Güncelleyin
1. `MONGODB_URI` değişkenini bulun
2. **Edit** (veya kalem ikonu) butonuna tıklayın
3. **Value** alanına şu connection string'i yapıştırın:

```
mongodb+srv://mursitozkir_db_user:CE37V58FRJXgluer@cluster0.g17wlvi.mongodb.net/?appName=Cluster0
```

4. **Save Changes** butonuna tıklayın

### Adım 4: Backend Otomatik Deploy
- Render otomatik olarak backend'i yeniden deploy edecek
- 1-2 dakika sürebilir
- Deploy durumunu **Events** sekmesinden takip edebilirsiniz

### Adım 5: Logs Kontrolü
1. **Logs** sekmesine gidin
2. Deploy tamamlandıktan sonra şunu arayın:

**✅ Başarılı:**
```
✅ MongoDB bağlantısı başarılı
⏰ Otomatik scraping zamanlayıcısı başlatıldı
```

**❌ Hata:**
```
❌ MongoDB bağlantı hatası: ...
```

## 🧪 Test

Deploy tamamlandıktan sonra:

1. **Health Check:**
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

2. **API Test:**
   ```
   https://compprice-backend.onrender.com/api/hotels
   ```
   
   Beklenen cevap: `[]` (boş array - henüz otel yok)

## ⚠️ Önemli Notlar

1. **Network Access:** MongoDB Atlas → Network Access → `0.0.0.0/0` olmalı
2. **Database User:** MongoDB Atlas → Database Access → Kullanıcı aktif olmalı
3. **Connection String:** Şifre doğru mu kontrol edin

## 🐛 Sorun Giderme

### Hala "bad auth" hatası alıyorsanız:

1. **MongoDB Atlas** → Database Access
2. Kullanıcı adını kontrol edin: `mursitozkir_db_user`
3. Şifreyi kontrol edin: `CE37V58FRJXgluer`
4. Eğer şifre farklıysa, Render'da güncelleyin

### "Network Access" hatası alıyorsanız:

1. **MongoDB Atlas** → Network Access
2. **Add IP Address** → **Allow Access from Anywhere**
3. `0.0.0.0/0` eklenmeli

## ✅ Başarı Kontrolü

Tüm bunlar çalışıyorsa:
- ✅ Health check: `mongodb: "connected"`
- ✅ Backend logs: `✅ MongoDB bağlantısı başarılı`
- ✅ Frontend'den otel ekleyebilirsiniz
- ✅ Scraping çalışır

