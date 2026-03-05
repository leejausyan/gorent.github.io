# JMMI GoRent - Sistem Peminjaman Alat

Website statis untuk sistem peminjaman alat menggunakan HTML, JavaScript, dan Supabase sebagai database.

## Fitur

- **Form Peminjaman**: User dapat mengisi form untuk meminjam alat (Camera, Projector, Handie Talkie, Laptop)
- **Upload Bukti Transfer**: User upload bukti pembayaran
- **Status Tracking**: User dapat melihat status peminjaman mereka
- **Admin Panel**: Admin dapat melihat dan memverifikasi peminjaman

## Teknologi

- **Frontend**: HTML5, JavaScript (Vanilla), Tailwind CSS (CDN)
- **Database**: Supabase
- **Deployment**: GitHub Pages (Static Site)

## Setup

### 1. Konfigurasi Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Buat tabel `rentals` dengan struktur:
   ```sql
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
     bukti_transfer TEXT, -- URL file di Supabase Storage
     status TEXT DEFAULT 'MENUNGGU_VERIFIKASI',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. Setup Supabase Storage bucket untuk upload bukti transfer:
   - Buat bucket bernama `bukti-transfer`
   - Set bucket policy menjadi public untuk read

5. Dapatkan API credentials dari Supabase Dashboard:
   - URL Supabase
   - Anon Key (Public Key)

### 2. Konfigurasi Project

Edit file `config.js`:
```javascript
const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL', // Ganti dengan URL Supabase Anda
  anonKey: 'YOUR_SUPABASE_ANON_KEY' // Ganti dengan Anon Key Anda
};

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // GANTI dengan password yang kuat!
};
```

### 3. Deploy ke GitHub Pages

1. Push project ke GitHub repository
2. Buka Settings > Pages
3. Pilih branch `main` dan folder `/ (root)`
4. Simpan dan tunggu deployment selesai
5. Website akan tersedia di: `https://username.github.io/repository-name/`

## Struktur File

```
gorent/
├── index.html          # Halaman form peminjaman (user)
├── verify.html         # Halaman cek status peminjaman
├── admin-login.html    # Halaman login admin
├── admin-panel.html    # Dashboard admin
├── config.js           # Konfigurasi Supabase & Admin
├── script.js           # Logic form peminjaman
├── verify.js           # Logic cek status
├── admin.js            # Logic admin panel
├── images/             # Folder gambar/logo
│   └── JMMI-rm.png
└── README.md           # Dokumentasi ini
```

## Keamanan

- **Anon Key**: Aman digunakan di frontend (public)
- **RLS (Row Level Security)**: Aktifkan di Supabase untuk keamanan data
- **Admin Credentials**: Untuk demo only, gunakan Supabase Auth untuk production
- **Environment Variables**: Untuk production, gunakan GitHub Secrets atau environment variables

## Cara Penggunaan

### User:
1. Buka website
2. Isi form peminjaman (nama, no HP, alamat, tanggal, pilih alat)
3. Upload bukti transfer
4. Submit form
5. Simpan link verifikasi yang diberikan untuk cek status

### Admin:
1. Buka `admin-login.html`
2. Login dengan username & password
3. Lihat daftar peminjaman
4. Verifikasi/tolak peminjaman
5. Lihat detail setiap peminjaman

## Dependencies (via CDN)

- [Tailwind CSS](https://cdn.tailwindcss.com) - Styling
- [Supabase JS v2](https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2) - Database client

**Tidak ada instalasi Node.js atau npm yang diperlukan!**

## License

MIT License - Bebas digunakan untuk keperluan apapun.

## Support

Untuk pertanyaan atau bantuan, silakan buka issue di GitHub repository ini.
