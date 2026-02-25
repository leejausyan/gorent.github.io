// Supabase Configuration
// PENTING: Untuk production di GitHub Pages, simpan credentials di environment variables
// atau gunakan GitHub Secrets

const SUPABASE_CONFIG = {
  // Ganti dengan URL dan KEY Supabase Anda
  // Cara mendapatkan: https://supabase.com/dashboard > Project > Settings > API
  url: 'https://pnwnxewxxobkbvtubbls.supabase.co',
  anonKey: 'sb_publishable_IZHkrVwXtiBjTIqDdX3rUQ_57CE7sV7' // Public anon key (aman untuk frontend)
};

// Admin credentials - UNTUK DEMO SAJA
// Untuk production, gunakan Supabase Auth atau backend yang proper
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // GANTI dengan password yang kuat!
};

// Initialize Supabase client IMMEDIATELY
// Langsung inisialisasi tanpa menunggu DOMContentLoaded
if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url) {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_CONFIG.url, 
    SUPABASE_CONFIG.anonKey
  );
  console.log('✅ Supabase client initialized successfully');
} else {
  console.error('❌ Supabase SDK belum ter-load atau konfigurasi tidak valid');
  console.log('typeof window.supabase:', typeof window.supabase);
  console.log('SUPABASE_CONFIG:', SUPABASE_CONFIG);
}

// Export untuk digunakan di file lain
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
