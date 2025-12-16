# MongoDB Atlas Connection String - Render Setup

## 🔍 Sorun

Hata mesajı:
```
querySrv ENOTFOUND _mongodb._tcp.cluster0.xxxxx.mongodb.net
```

Bu, `MONGODB_URI` environment variable'ında placeholder değer (`cluster0.xxxxx`) kullanıldığı anlamına gelir.

## ✅ Çözüm: Doğru Connection String'i Alın

### Adım 1: MongoDB Atlas'tan Connection String Alın

1. **MongoDB Atlas'a gidin:** https://cloud.mongodb.com
2. **Login** yapın
3. **Clusters** sekmesine gidin
4. Cluster'ınızı seçin (genellikle `Cluster0`)
5. **Connect** butonuna tıklayın
6. **Drivers** seçeneğini seçin
7. **Driver:** Node.js seçin
8. **Version:** 5.5 veya daha yeni seçin
9. **Connection string'i kopyalayın**

Örnek format:
```
mongodb+srv://<username>:<password>@cluster0.g17wlvi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Adım 2: Connection String'i Düzenleyin

1. `<username>` kısmını MongoDB kullanıcı adınızla değiştirin
2. `<password>` kısmını MongoDB şifrenizle değiştirin
3. `?retryWrites=true&w=majority` kısmını koruyun veya `?appName=Cluster0` ekleyin

**Örnek düzenlenmiş string:**
```
mongodb+srv://mursitozkir_db_user:eU3G37ZN970Gc9iJ@cluster0.g17wlvi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Adım 3: Render'da Environment Variable Güncelleyin

1. **Render Dashboard** → Backend servisi
2. **Environment** sekmesine gidin
3. `MONGODB_URI` değişkenini bulun
4. **Edit** butonuna tıklayın
5. Düzenlenmiş connection string'i yapıştırın
6. **Save Changes** butonuna tıklayın

**Önemli:** Backend otomatik olarak yeniden deploy olacak (1-2 dakika)

### Adım 4: MongoDB Atlas Network Access Kontrolü

1. **MongoDB Atlas** → **Network Access**
2. **IP Access List** kontrol edin
3. Eğer hiç IP yoksa veya sadece belirli IP'ler varsa:
   - **Add IP Address** butonuna tıklayın
   - **Allow Access from Anywhere** seçeneğini seçin
   - Bu `0.0.0.0/0` ekler (tüm IP'lere izin verir)

### Adım 5: Database User Kontrolü

1. **MongoDB Atlas** → **Database Access**
2. Kullanıcı adınızı bulun
3. Şifrenin doğru olduğundan emin olun
4. Eğer şifreyi unuttuysanız:
   - **Edit** → **Edit Password**
   - Yeni şifre oluşturun
   - Connection string'deki şifreyi güncelleyin

## ✅ Başarı Kontrolü

Deploy tamamlandıktan sonra:

1. **Render Dashboard** → Backend → **Logs**
2. Şunu arayın:
   ```
   ✅ MongoDB bağlantısı başarılı
   ```

3. **Health Check Test:**
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

## 🐛 Hala Çalışmıyorsa

### Kontrol Listesi

- [ ] Connection string `mongodb+srv://` ile başlıyor mu?
- [ ] Kullanıcı adı doğru mu?
- [ ] Şifre doğru mu? (özel karakterler URL encode edilmeli)
- [ ] Cluster URL doğru mu? (`cluster0.xxxxx.mongodb.net` yerine gerçek URL)
- [ ] MongoDB Atlas → Network Access → `0.0.0.0/0` var mı?
- [ ] Database user'ın doğru permissions'ları var mı?

### Şifrede Özel Karakter Varsa

Eğer MongoDB şifrenizde özel karakterler varsa (örn: `@`, `#`, `%`), URL encode etmeniz gerekir:

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- vb.

**Örnek:**
```
Şifre: P@ssw0rd#123
Encoded: P%40ssw0rd%23123
```

## 💡 Hızlı Test

Render Dashboard → Backend → Logs'da şunu görmelisiniz:

**Başarılı:**
```
✅ MongoDB bağlantısı başarılı
⏰ Otomatik scraping zamanlayıcısı başlatıldı
```

**Hata:**
```
❌ MongoDB bağlantı hatası: ...
```

## 📞 Yardım

Eğer hala çalışmıyorsa:
1. MongoDB Atlas connection string'inizi kontrol edin (şifre olmadan ilk 50 karakter)
2. Render Backend Logs'unu paylaşın
3. MongoDB Atlas → Network Access ayarlarını kontrol edin

