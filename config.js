// Supabase Configuration
// PENTING: Untuk production di GitHub Pages, gunakan GitHub Secrets atau environment variables
// Untuk development, buat file config.local.js (jangan commit ke git)

const SUPABASE_CONFIG = {
  // Ganti dengan URL dan KEY Supabase Anda
  // Cara mendapatkan: https://supabase.com/dashboard > Project > Settings > API
  url: 'https://pnwnxewxxobkbvtubbls.supabase.co', // Contoh: https://xxxxxxxxxxxxx.supabase.co
  anonKey: 'sb_publishable_IZHkrVwXtiBjTIqDdX3rUQ_57CE7sV7' // Public anon key (aman untuk frontend)
};

// Admin credentials - UNTUK DEMO SAJA
// Untuk production, gunakan Supabase Auth atau backend yang proper
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // GANTI dengan password yang kuat!
};

// Initialize Supabase client
let supabase;
if (typeof supabase === 'undefined' && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL') {
  supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// Export untuk digunakan di file lain
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
window.supabaseClient = supabase;
