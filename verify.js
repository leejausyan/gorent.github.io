// Get rental ID from URL
const urlParams = new URLSearchParams(window.location.search);
const rentalId = urlParams.get('id');

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const dataState = document.getElementById('dataState');

console.log('🔍 Verify Page - Rental ID:', rentalId);
console.log('🔍 Supabase Client Status:', window.supabaseClient ? '✅ Ready' : '❌ Not Ready');

// Check if Supabase is configured
if (!window.supabaseClient) {
  console.error('❌ Supabase is not configured! Please check config.js');
  showError('Database belum terkonfigurasi');
} else {
  // Fetch data when page loads
  fetchRentalData();
}

// Fetch rental data
async function fetchRentalData() {
  if (!rentalId) {
    console.error('❌ No rental ID provided in URL');
    showError('ID peminjaman tidak ditemukan di URL');
    return;
  }

  if (!window.supabaseClient) {
    console.error('❌ Supabase client not available');
    showError('Database belum terkonfigurasi');
    return;
  }

  try {
    console.log('📡 Fetching rental data for ID:', rentalId);
    
    // Query data from Supabase
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .select('*')
      .eq('id', rentalId)
      .single();
    
    console.log('📦 Supabase Response:', { data, error });
    
    if (error) {
      console.error('❌ Supabase Error:', error);
      showError('Data tidak ditemukan: ' + error.message);
      return;
    }
    
    if (!data) {
      console.error('❌ No data returned');
      showError('Data peminjaman tidak ditemukan');
      return;
    }

    console.log('✅ Data found, displaying...');
    displayRentalData(data);
  } catch (error) {
    console.error('❌ Error fetching rental data:', error);
    showError('Terjadi kesalahan: ' + error.message);
  }
}

function showError(message = 'Data tidak ditemukan') {
  loadingState.classList.add('hidden');
  errorState.classList.remove('hidden');
  dataState.classList.add('hidden');
  
  // Update error message if element exists
  const errorMessageEl = errorState.querySelector('p');
  if (errorMessageEl && message) {
    errorMessageEl.textContent = message;
  }
  console.error('🚫 Showing error state:', message);
}

function displayRentalData(data) {
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  dataState.classList.remove('hidden');

  // Display rental ID
  document.getElementById('rentalId').textContent = `#${data.id}`;

  // Display status
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  
  if (data.status === 'MENUNGGU_VERIFIKASI') {
    statusBadge.className = 'inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
    statusText.textContent = '⏳ Menunggu Verifikasi';
  } else if (data.status === 'SELESAI' || data.status === 'VERIFIED') {
    statusBadge.className = 'inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-green-900/30 text-[#3fb950] border border-green-700/50';
    statusText.textContent = '✓ Terverifikasi';
  } else if (data.status === 'DITOLAK' || data.status === 'REJECTED') {
    statusBadge.className = 'inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-red-900/30 text-red-400 border border-red-700/50';
    statusText.textContent = '✗ Ditolak';
  }

  // Display personal information
  document.getElementById('nama').textContent = data.nama || '-';
  document.getElementById('noHp').textContent = data.no_hp || '-';
  document.getElementById('alamat').textContent = data.alamat || '-';
  
  // Format rental date
  if (data.tanggal_sewa) {
    const date = new Date(data.tanggal_sewa);
    const formattedDate = date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    document.getElementById('tanggalSewa').textContent = formattedDate;
  }
  
  // Format return date and calculate days
  if (data.tanggal_kembali) {
    const returnDate = new Date(data.tanggal_kembali);
    const formattedReturnDate = returnDate.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Calculate number of days
    if (data.tanggal_sewa) {
      const startDate = new Date(data.tanggal_sewa);
      const diffTime = returnDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      document.getElementById('tanggalSewa').textContent = `${document.getElementById('tanggalSewa').textContent} - ${formattedReturnDate} (${diffDays} hari)`;
    }
  }

  // Display items
  const itemsList = document.getElementById('itemsList');
  itemsList.innerHTML = '';
  
  const items = [data.item_1, data.item_2, data.item_3, data.item_4].filter(item => item && item.trim() !== '');
  
  if (items.length > 0) {
    items.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex items-center p-3 bg-[#161b22] border border-[#30363d] rounded-lg';
      itemDiv.innerHTML = `
        <span class="flex items-center justify-center w-8 h-8 bg-[#1f6feb] text-white rounded-full text-sm font-bold mr-3">
          ${index + 1}
        </span>
        <span class="text-[#c9d1d9] font-medium">${item}</span>
      `;
      itemsList.appendChild(itemDiv);
    });
  } else {
    itemsList.innerHTML = '<p class="text-[#8b949e] text-center py-4">Tidak ada item</p>';
  }

  // Display total price
  if (data.price_total) {
    document.getElementById('totalPrice').textContent = `Rp ${parseInt(data.price_total).toLocaleString('id-ID')}`;
  }

  // Display bukti transfer
  if (data.bukti_transfer_url) {
    document.getElementById('buktiImage').src = data.bukti_transfer_url;
    document.getElementById('buktiLink').href = data.bukti_transfer_url;
  } else {
    document.getElementById('buktiImage').parentElement.innerHTML = '<p class="text-[#8b949e] text-center py-4">Bukti transfer tidak tersedia</p>';
  }

  // Display identitas if exists
  if (data.identitas_url) {
    const identitasSection = document.getElementById('identitasSection');
    identitasSection.classList.remove('hidden');
    document.getElementById('identitasImage').src = data.identitas_url;
    document.getElementById('identitasLink').href = data.identitas_url;
    console.log('✅ Identitas displayed:', data.identitas_url);
  } else {
    console.log('⚠️ No identitas URL found');
  }
}

// Data akan otomatis di-fetch saat page load (lihat di atas)
