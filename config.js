// Supabase Configuration
// PENTING: Untuk production di GitHub Pages, simpan credentials di environment variables
// atau gunakan GitHub Secrets

const SUPABASE_CONFIG = {
  // Ganti dengan URL dan KEY Supabase Anda
  // Cara mendapatkan: https://supabase.com/dashboard > Project > Settings > API
  url: 'https://pnwnxewxxobkbvtubbls.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBud254ZXd4eG9ia2J2dHViYmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NjI2NTYsImV4cCI6MjA1MTUzODY1Nn0.buVDfSNtGNHpN4FUVbx-7bZ5QOmGbXNqJy7OEPJdG_c' // Public anon key (aman untuk frontend)
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
