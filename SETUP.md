# JMMI GoRent - Setup Cepat

## Quick Start (5 Menit)

### 1. Setup Supabase Database

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Buat tabel rentals
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  tanggal_sewa DATE NOT NULL,
  item_1 TEXT,
  item_2 TEXT,
  item_3 TEXT,
  item_4 TEXT,
  total_harga INTEGER NOT NULL,
  bukti_transfer TEXT,
  status TEXT DEFAULT 'MENUNGGU_VERIFIKASI',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Policy untuk SELECT (semua orang bisa baca)
CREATE POLICY "Enable read access for all users" ON rentals
  FOR SELECT USING (true);

-- Policy untuk INSERT (semua orang bisa insert)
CREATE POLICY "Enable insert access for all users" ON rentals
  FOR INSERT WITH CHECK (true);

-- Policy untuk UPDATE (semua orang bisa update)
CREATE POLICY "Enable update access for all users" ON rentals
  FOR UPDATE USING (true);
```

### 2. Setup Storage Bucket

1. Buka Supabase Dashboard > Storage
2. Klik "New Bucket"
3. Nama bucket: `bukti-transfer`
4. Set Public: **YES**
5. Klik Create

**Tambahkan Policy untuk Upload:**

Di bucket `bukti-transfer`, tambahkan policy:
```sql
-- Policy untuk upload (INSERT)
CREATE POLICY "Enable upload for all users" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bukti-transfer');

-- Policy untuk read (SELECT)
CREATE POLICY "Enable read for all users" ON storage.objects
  FOR SELECT USING (bucket_id = 'bukti-transfer');
```

### 3. Update Config

Edit `config.js`:
```javascript
const SUPABASE_CONFIG = {
  url: 'https://xxxxxxxxx.supabase.co',      // ← Ganti ini
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI...' // ← Ganti ini
};

const ADMIN_CREDENTIALS = {
  username: 'admin',        // ← Ganti username
  password: 'password123'   // ← Ganti password
};
```

### 4. Test Lokal

Buka `index.html` di browser atau gunakan server lokal:
```bash
# Opsi 1: Python
python3 -m http.server 8000

# Opsi 2: PHP
php -S localhost:8000

# Opsi 3: Node.js (jika ada)
npx http-server

# Opsi 4: VS Code
# Install extension "Live Server" dan klik "Go Live"
```

Buka: http://localhost:8000

### 5. Deploy ke GitHub Pages

```bash
# 1. Init git (jika belum)
git init
git add .
git commit -m "Initial commit"

# 2. Push ke GitHub
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages
# Buka: Settings > Pages
# Source: Deploy from branch
# Branch: main / (root)
# Save
```

Website akan live di: `https://USERNAME.github.io/REPO-NAME/`

## 🎯 Test Checklist

- [ ] Buka `index.html` - form muncul dengan baik
- [ ] Isi form dan upload file - sukses submit
- [ ] Buka link verifikasi - status muncul
- [ ] Login admin di `admin-login.html` - berhasil masuk
- [ ] Lihat data di admin panel - data muncul
- [ ] Verifikasi peminjaman - status berubah

## 🔧 Troubleshooting

### Error: "Database belum dikonfigurasi"
- Cek `config.js` sudah diisi dengan benar
- Pastikan URL dan Anon Key valid

### Upload file gagal
- Cek bucket `bukti-transfer` sudah dibuat
- Pastikan bucket di-set public
- Pastikan policy sudah ditambahkan

### Data tidak muncul
- Cek tabel `rentals` sudah dibuat
- Cek RLS policies sudah ditambahkan
- Buka browser console (F12) untuk lihat error

### Admin login gagal
- Cek username/password di `config.js`
- Clear browser cache dan coba lagi

## 📚 File Structure

```
gorent/
├── index.html          ← User form (START HERE)
├── verify.html         ← Status checker
├── admin-login.html    ← Admin login
├── admin-panel.html    ← Admin dashboard
├── config.js           ← ⚠️ CONFIG UTAMA
├── script.js           ← Logic form
├── verify.js           ← Logic verify
├── admin.js            ← Logic admin
├── images/
│   └── JMMI-rm.png
└── README.md           ← Full documentation
```

## 🚀 Production Tips

1. **Jangan commit credentials**:
   - Tambahkan `config.js` ke `.gitignore` jika berisi credentials asli
   - Atau gunakan placeholder dan ganti saat deploy

2. **Ganti admin password**:
   - Password default: `admin123`
   - Ganti di `config.js` sebelum deploy

3. **Enable RLS di Supabase**:
   - Sudah di-setup di SQL script di atas

4. **Monitor usage**:
   - Free tier Supabase: 500MB database, 1GB file storage
   - Cek usage di Supabase Dashboard

## ✅ Done!

Website Anda sekarang sudah siap digunakan! 🎉
