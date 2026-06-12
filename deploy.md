# Konum Online — SiteGround yükleme rehberi

Bu site statik HTML + CSS + JS + PHP form backend kullanır. Build adımı yoktur.

## Yüklenecek dosyalar

`public_html/` (veya domain kökü) altına **aşağıdakilerin tamamını** yükleyin:

- `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `.htaccess`
- `assets/` (tüm görseller ve logolar)
- `css/style.css`
- `js/` (`main.js`, `demo-data.js`, `form.js`, `analytics.js`)
- `content/content.json`
- `form/send.php`, `form/config.example.php`
- `google-haritalar-optimizasyonu/`, `google-isletme-profili-yonetimi/`, `yerel-seo-istanbul/`, `iletisim/`, `rehber/` klasörleri ve içindeki `index.html` dosyaları

**Yüklemeyin:**

- `_arsiv/`
- `arasitrma/` (veya yerel araştırma klasörleri)
- `.git/`, `.gstack/`
- `form/config.php` (sunucuda oluşturulacak)

## 1. Dosyaları FTP / SiteGround File Manager ile aktarın

Klasör yapısını koruyun. `.htaccess` gizli dosya olduğu için FTP istemcinizde «gizli dosyaları göster» açık olsun.

## 2. `form/config.php` oluşturun

Sunucuda `form/config.example.php` dosyasını `form/config.php` olarak kopyalayın:

```php
<?php
define('FORM_RECIPIENT', 'bayram@konum.online');
define('FORM_FROM', 'noreply@konum.online');
```

Bu dosya `.gitignore` içindedir; repoda tutulmaz.

## 3. E-posta hesabı ve yönlendirme

SiteGround **Site Tools → Email → Accounts**:

1. `noreply@konum.online` hesabı oluşturun (form gönderim başlığı için).
2. `bayram@konum.online` için gerekirse forwarder: gelen form mailleri bu adrese düşsün.
3. SPF/DKIM kayıtlarının aktif olduğunu doğrulayın (E-posta Deliverability).

`send.php` `mail()` ile `FORM_FROM` adresinden `FORM_RECIPIENT` adresine gönderir. Paylaşımlı hostingde `mail()` çalışması için gönderen domain ile hesabın eşleşmesi gerekir.

## 4. SSL (Let's Encrypt)

SiteGround **Site Tools → Security → SSL Manager**:

- `konum.online` ve `www.konum.online` için ücretsiz SSL etkinleştirin.
- `.htaccess` zaten `https://konum.online` adresine yönlendirir.

## 5. GA4 ölçüm kimliği

Hesap açıldığında yalnızca `content/content.json` içindeki `site.analytics.ga4Id` değerini gerçek `G-XXXXXXXX` kimliğiyle değiştirin. `G-PLACEHOLDER` iken analytics script yüklenmez.

## 6. Yükleme sonrası test listesi

- [ ] `https://konum.online/` açılıyor, mixed content uyarısı yok
- [ ] `http://` ve `https://www.` → `https://konum.online` yönlendirmesi (301)
- [ ] Var olmayan URL → markalı `404.html`
- [ ] Tüm menü linkleri ve footer NAP bilgileri doğru
- [ ] WhatsApp linki `https://wa.me/905323861837` açılıyor
- [ ] `tel:+905323861837` mobilde arama başlatıyor
- [ ] `/iletisim/` formu: başarılı gönderim + hata mesajları (boş alan, rate limit)
- [ ] `form/config.php` tarayıcıdan doğrudan açılamıyor (403/engelli)
- [ ] `sitemap.xml` ve `robots.txt` erişilebilir
- [ ] OG önizleme (WhatsApp / LinkedIn debugger) — `assets/cta-istanbul.webp`
- [ ] Grid ve dashboard bölümlerinde «demo» ibaresi görünür

## Sorun giderme

- **Form mail gitmiyor:** `config.php` yollarını kontrol edin; `noreply@konum.online` hesabının var olduğundan emin olun.
- **404 çalışmıyor:** `.htaccess` yüklendi mi, `AllowOverride` açık mı kontrol edin.
- **CSS/JS eski görünüyor:** Tarayıcı önbelleğini temizleyin veya gizli pencerede deneyin.

## Otomatik yedek + FTP (commit sonrası)

Her commit’ten sonra sunucudan yedek alıp yeni dosyaları yüklemek için:

### 1. FTP bilgilerini ayarlayın

```powershell
copy .ftp-deploy.example.env .ftp-deploy.env
# .ftp-deploy.env içinde FTP_PASS doldurun (bu dosya git'e girmez)
```

### 2. Manuel deploy

```powershell
.\scripts\deploy.ps1
```

- Önce sunucudaki site `_backups/YYYY-MM-DD_HH-mm-ss/` altına indirilir
- Sonra yerel dosyalar FTP’ye yüklenir
- `form/config.php` sunucuda varsa **üzerine yazılmaz**

Sadece yedek veya sadece yükleme:

```powershell
.\scripts\deploy.ps1 -NoUpload   # yalnızca yedek
.\scripts\deploy.ps1 -NoBackup   # yedeksiz hızlı yükleme
```

### 3. Her commit’te otomatik çalıştırma (isteğe bağlı)

```powershell
.\scripts\install-git-hooks.ps1
```

Bundan sonra her `git commit` sonrası `deploy.ps1` çalışır. `.ftp-deploy.env` yoksa hook sessizce atlanır.

Hook’u kaldırmak: `.git/hooks/post-commit` dosyasını silin.

### Güvenlik

- FTP şifresini **asla** repoya eklemeyin; yalnızca `.ftp-deploy.env` (gitignore’da)
- Eski yedekler `KEEP_BACKUPS` ile sınırlanır (varsayılan 10)
