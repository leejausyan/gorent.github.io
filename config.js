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

// Initialize Supabase client (menggunakan CDN dari index.html)
// Pastikan Supabase JS SDK sudah di-load via CDN
function initSupabase() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url) {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_CONFIG.url, 
      SUPABASE_CONFIG.anonKey
    );
  } else {
    console.error('Supabase SDK belum ter-load atau konfigurasi tidak valid');
  }
}

// Export untuk digunakan di file lain
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;

// Auto-initialize saat config.js di-load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}
