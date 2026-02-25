# 🔧 Troubleshooting Guide

## Error: "Database belum dikonfigurasi"

### Penyebab:
- Supabase client belum terinisialisasi dengan benar
- URL atau Anon Key tidak valid
- Script loading order salah

### Solusi:

1. **Buka file `test-connection.html` di browser**
   ```
   file:///path/to/gorent/test-connection.html
   ```
   Atau akses via http-server:
   ```bash
   python3 -m http.server 8000
   # Buka: http://localhost:8000/test-connection.html
   ```

2. **Lihat hasil test dan ikuti instruksi perbaikan**

3. **Cek Browser Console (F12)**
   - Buka Developer Tools (F12)
   - Lihat tab Console
   - Cari error message berwarna merah

4. **Verifikasi config.js**
   ```javascript
   // File: config.js
   const SUPABASE_CONFIG = {
     url: 'https://xxxxx.supabase.co',  // ← Pastikan benar
     anonKey: 'eyJhbGc...'               // ← Pastikan lengkap
   };
   ```

5. **Verifikasi Anon Key lengkap**
   - Anon key seharusnya SANGAT PANJANG (300+ karakter)
   - Harus dimulai dengan `eyJ`
   - Copy dari Supabase Dashboard > Settings > API > anon public

## Data Tidak Muncul di Verify Page

### Penyebab:
- ID di URL tidak valid
- RLS (Row Level Security) memblokir query
- Tabel atau data belum ada

### Solusi:

1. **Cek URL verify page**
   ```
   ✅ BENAR: verify.html?id=123e4567-e89b-12d3-a456-426614174000
   ❌ SALAH: verify.html
   ❌ SALAH: verify.html?id=
   ```

2. **Buka Browser Console (F12) di verify page**
   - Lihat log messages
   - Cari error details

3. **Cek data di Supabase Dashboard**
   ```sql
   SELECT * FROM rentals LIMIT 10;
   ```
   - Buka Supabase Dashboard > Table Editor > rentals
   - Pastikan data ada
   - Copy UUID dari kolom `id`

4. **Test langsung dengan ID dari database**
   ```
   verify.html?id=[PASTE_UUID_DISINI]
   ```

5. **Cek RLS Policies**
   
   Di Supabase SQL Editor, jalankan:
   ```sql
   -- Cek apakah RLS aktif
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'rentals';
   
   -- Lihat policies yang ada
   SELECT * FROM pg_policies 
   WHERE tablename = 'rentals';
   ```
   
   Jika tidak ada policy SELECT, tambahkan:
   ```sql
   CREATE POLICY "Enable read access for all users" 
   ON rentals FOR SELECT 
   USING (true);
   ```

## Upload File Gagal

### Penyebab:
- Storage bucket belum dibuat
- Bucket tidak public
- Policy upload belum ada

### Solusi:

1. **Buat Storage Bucket**
   - Buka Supabase Dashboard > Storage
   - Klik "New Bucket"
   - Nama: `bukti-transfer`
   - Public: **YES** (centang)
   - Klik Create

2. **Tambahkan Storage Policies**
   
   Di Supabase SQL Editor:
   ```sql
   -- Policy untuk upload
   CREATE POLICY "Enable upload for all users"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'bukti-transfer');
   
   -- Policy untuk read
   CREATE POLICY "Enable read for all users"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'bukti-transfer');
   ```

## Form Submit Tidak Jalan

### Solusi:

1. **Cek Browser Console (F12)**
   - Buka tab Console
   - Submit form
   - Lihat error message

2. **Test dengan curl/Postman**
   ```bash
   # Test insert langsung
   curl -X POST 'https://xxxxx.supabase.co/rest/v1/rentals' \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"nama":"Test","no_hp":"081234567890","alamat":"Test","tanggal_sewa":"2026-02-25","item_1":"Camera","total_harga":50000,"status":"MENUNGGU_VERIFIKASI"}'
   ```

3. **Verifikasi field names di database**
   - Pastikan nama kolom sama persis
   - Case sensitive!

## Admin Login Gagal

### Solusi:

1. **Cek credentials di config.js**
   ```javascript
   const ADMIN_CREDENTIALS = {
     username: 'admin',      // ← Cek ini
     password: 'admin123'    // ← Dan ini
   };
   ```

2. **Clear browser cache**
   - Ctrl + Shift + Delete
   - Clear cookies and cached files

3. **Check localStorage**
   ```javascript
   // Di Browser Console:
   localStorage.clear();
   location.reload();
   ```

## CORS Error

### Solusi:

Supabase seharusnya tidak ada masalah CORS, tapi jika terjadi:

1. **Pastikan menggunakan http-server (bukan file://)**
   ```bash
   python3 -m http.server 8000
   ```

2. **Cek Supabase Dashboard > Settings > API**
   - Pastikan tidak ada restricsi domain

## Quick Debug Commands

Paste di Browser Console (F12):

```javascript
// Cek Supabase setup
console.log('Supabase SDK:', typeof window.supabase);
console.log('Config:', window.SUPABASE_CONFIG);
console.log('Client:', window.supabaseClient);

// Test query
window.supabaseClient.from('rentals').select('*').limit(1)
  .then(({data, error}) => {
    console.log('Test Query Result:', {data, error});
  });

// Test storage
window.supabaseClient.storage.getBucket('bukti-transfer')
  .then(({data, error}) => {
    console.log('Storage Bucket:', {data, error});
  });
```

## Masih Bermasalah?

1. **Gunakan test-connection.html**
   - Buka `test-connection.html` di browser
   - Ikuti instruksi yang muncul

2. **Cek Supabase Logs**
   - Supabase Dashboard > Logs
   - Lihat error messages

3. **Reset Database**
   ```sql
   -- HATI-HATI: Ini akan hapus semua data!
   DROP TABLE IF EXISTS rentals CASCADE;
   
   -- Kemudian jalankan ulang setup dari SETUP.md
   ```

4. **Kontak Support**
   - Screenshot error message
   - Screenshot browser console
   - Screenshot Supabase dashboard
