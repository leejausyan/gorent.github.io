# Deploy ke GitHub Pages

## Langkah-langkah Deploy

### 1. Pastikan Git Sudah Diinisialisasi
```bash
git status
# Jika belum init:
# git init
```

### 2. Commit Perubahan
```bash
git add .
git commit -m "Simplify project for GitHub Pages deployment"
```

### 3. Push ke GitHub
```bash
# Jika belum add remote:
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# Push
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

1. Buka repository di GitHub
2. Klik **Settings**
3. Scroll ke bagian **Pages** (di sidebar kiri)
4. Di **Source**, pilih:
   - Branch: `main`
   - Folder: `/ (root)`
5. Klik **Save**

### 5. Tunggu Deployment (1-2 menit)

Website akan tersedia di:
```
https://USERNAME.github.io/REPO-NAME/
```

## Halaman yang Tersedia

- `/` atau `/index.html` - Form peminjaman user
- `/verify.html?id=xxx` - Cek status peminjaman
- `/admin-login.html` - Login admin
- `/admin-panel.html` - Dashboard admin

## Custom Domain (Opsional)

Jika ingin menggunakan domain sendiri (misal: gorent.example.com):

1. Beli domain di domain provider
2. Tambahkan CNAME record:
   ```
   Type: CNAME
   Name: gorent (atau subdomain lain)
   Value: USERNAME.github.io
   ```
3. Di GitHub Pages Settings, tambahkan custom domain:
   - Custom domain: `gorent.example.com`
   - Save

## Keamanan

⚠️ **PENTING**: File `config.js` berisi credentials Supabase. 

Untuk production:
1. Jangan commit credentials asli ke public repo
2. Atau gunakan Supabase RLS untuk keamanan data
3. Anon key aman digunakan di frontend (read-only jika RLS aktif)

## Update Website

Setiap kali ada perubahan:
```bash
git add .
git commit -m "Update message"
git push
```

GitHub Pages akan otomatis rebuild dalam 1-2 menit.

## Troubleshooting

### 404 Not Found
- Pastikan repository public (atau GitHub Pro untuk private)
- Pastikan branch dan folder sudah benar di Settings > Pages
- Tunggu beberapa menit setelah enable Pages

### CSS/JS Tidak Load
- Cek path file (gunakan relative path, bukan absolute)
- Clear browser cache
- Cek browser console untuk error

### Supabase Error
- Cek URL dan Anon Key di `config.js`
- Cek RLS policies di Supabase
- Cek CORS settings di Supabase (seharusnya tidak perlu diubah)

## Monitoring

- **GitHub Actions**: Lihat status deployment di tab Actions
- **Supabase Dashboard**: Monitor database usage dan errors
- **Browser Console**: Buka F12 untuk lihat JavaScript errors

---

Selamat! Website Anda sekarang live di internet! 🚀
