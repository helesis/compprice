# Frontend Environment Variable Güncelleme (Render)

## Sorun
Frontend hala eski backend URL'ini (`https://compprice-backend.onrender.com`) kullanıyor. Yeni backend URL'i: `https://compprice.onrender.com`

## Çözüm: Render Dashboard'da Environment Variable Güncelleme

### Adım 1: Render Dashboard'a Giriş
1. https://dashboard.render.com adresine gidin
2. Frontend servisinizi seçin

### Adım 2: Environment Variables Sekmesi
1. Sol menüden **"Environment"** sekmesine tıklayın
2. Mevcut environment variable'ları göreceksiniz

### Adım 3: REACT_APP_API_URL Güncelleme
1. `REACT_APP_API_URL` değişkenini bulun
2. **Edit** butonuna tıklayın
3. Değeri şu şekilde güncelleyin:
   ```
   https://compprice.onrender.com/api
   ```
4. **Save Changes** butonuna tıklayın

### Adım 4: Eğer REACT_APP_API_URL Yoksa
1. **"Add Environment Variable"** butonuna tıklayın
2. **Key**: `REACT_APP_API_URL`
3. **Value**: `https://compprice.onrender.com/api`
4. **Save Changes** butonuna tıklayın

### Adım 5: Otomatik Redeploy
- Render otomatik olarak frontend'i yeniden build edecek ve deploy edecek
- Bu işlem 2-5 dakika sürebilir

## Doğrulama

### 1. Build Logs Kontrolü
1. Render Dashboard → Frontend → **"Logs"** sekmesi
2. Build sırasında şunu görmelisiniz:
   ```
   REACT_APP_API_URL=https://compprice.onrender.com/api
   ```

### 2. Browser Console Kontrolü
1. Deploy tamamlandıktan sonra frontend sayfasını açın
2. Browser Console'u açın (F12)
3. Şunu görmelisiniz:
   ```
   🔗 API Base URL: https://compprice.onrender.com/api
   ```

### 3. Network Tab Kontrolü
1. Browser DevTools → **Network** sekmesi
2. Sayfayı yenileyin
3. API çağrılarının `https://compprice.onrender.com/api` adresine gittiğini kontrol edin

## Önemli Notlar

⚠️ **React Environment Variables:**
- React'te environment variable'lar build zamanında embed edilir
- Runtime'da değiştirilemez
- Bu yüzden environment variable değişikliği sonrası **mutlaka yeniden build** gerekir
- Render otomatik olarak yeniden build eder

✅ **Doğru Format:**
- ✅ `https://compprice.onrender.com/api`
- ❌ `https://compprice.onrender.com/api/` (sonunda `/` olmamalı)
- ❌ `https://compprice-backend.onrender.com/api` (eski URL)

## Sorun Giderme

### Hala Eski URL Görünüyorsa
1. Browser cache'i temizleyin (Ctrl+Shift+Delete veya Cmd+Shift+Delete)
2. Hard refresh yapın (Ctrl+F5 veya Cmd+Shift+R)
3. Render'da environment variable'ın doğru olduğunu tekrar kontrol edin
4. Build logs'da environment variable'ın göründüğünü kontrol edin

### Network Error Devam Ediyorsa
1. Backend health check: `https://compprice.onrender.com/health`
2. Backend logs'da MongoDB bağlantısının başarılı olduğunu kontrol edin
3. CORS ayarlarını kontrol edin (backend'de tüm origin'lere izin verilmiş olmalı)

