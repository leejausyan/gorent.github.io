// Get rental ID from URL
const urlParams = new URLSearchParams(window.location.search);
const rentalId = urlParams.get('id');

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const dataState = document.getElementById('dataState');

// Check if Supabase is configured
if (!window.supabaseClient) {
  console.error('Supabase is not configured! Please check config.js');
  showError();
}

// Fetch rental data
async function fetchRentalData() {
  if (!rentalId) {
    showError();
    return;
  }

  if (!window.supabaseClient) {
    showError();
    return;
  }

  try {
    // Query data from Supabase
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .select('*')
      .eq('id', rentalId)
      .single();
    
    if (error || !data) {
      showError();
      return;
    }

    displayRentalData(data);
  } catch (error) {
    console.error('Error fetching rental data:', error);
    showError();
  }
}

function showError() {
  loadingState.classList.add('hidden');
  errorState.classList.remove('hidden');
  dataState.classList.add('hidden');
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
  
  // Format date
  if (data.tanggal_sewa) {
    const date = new Date(data.tanggal_sewa);
    const formattedDate = date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    document.getElementById('tanggalSewa').textContent = formattedDate;
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
}

// Load data on page load
fetchRentalData();
