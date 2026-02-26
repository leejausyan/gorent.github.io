// Check authentication
if (localStorage.getItem('adminLoggedIn') !== 'true') {
  window.location.href = 'admin-login.html';
} else {
  // Hide loading, show content
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('mainContent').classList.remove('hidden');
  
  // Display username
  const username = localStorage.getItem('adminUsername') || 'Admin';
  document.getElementById('userName').textContent = username;
}

// Logout handler
document.getElementById('logoutButton').addEventListener('click', () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'admin-login.html';
  }
});

// Load rentals function
async function loadRentals() {
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }

  const tableLoading = document.getElementById('tableLoading');
  const rentalsList = document.getElementById('rentalsList');
  const emptyState = document.getElementById('emptyState');

  // Show loading
  tableLoading.classList.remove('hidden');
  rentalsList.classList.add('hidden');
  emptyState.classList.add('hidden');

  try {
    // Fetch all rentals from Supabase, ordered by newest first
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Hide loading
    tableLoading.classList.add('hidden');

    if (!data || data.length === 0) {
      emptyState.classList.remove('hidden');
      updateStats(0, 0, 0);
      return;
    }

    // Calculate stats
    const total = data.length;
    const pending = data.filter(r => r.status === 'MENUNGGU_VERIFIKASI').length;
    const verified = data.filter(r => r.status === 'VERIFIED' || r.status === 'SELESAI').length;
    updateStats(total, pending, verified);

    // Display rentals
    rentalsList.innerHTML = '';
    data.forEach(rental => {
      rentalsList.appendChild(createRentalCard(rental));
    });
    rentalsList.classList.remove('hidden');

  } catch (error) {
    console.error('Error loading rentals:', error);
    tableLoading.classList.add('hidden');
    alert('Gagal memuat data: ' + error.message);
  }
}

// Update stats
function updateStats(total, pending, verified) {
  document.getElementById('totalRentals').textContent = total;
  document.getElementById('pendingRentals').textContent = pending;
  document.getElementById('verifiedRentals').textContent = verified;
}

// Create rental card
function createRentalCard(rental) {
  const card = document.createElement('div');
  card.className = 'bg-[#1c2128] border border-[#30363d] rounded-xl p-6 hover:border-[#1f6feb] transition-all duration-200';
  
  // Format date
  let formattedDate = '-';
  if (rental.tanggal_sewa) {
    const date = new Date(rental.tanggal_sewa);
    formattedDate = date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Format created date
  let createdDate = '-';
  if (rental.created_at) {
    const date = new Date(rental.created_at);
    createdDate = date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Status badge
  let statusClass = '';
  let statusText = '';
  if (rental.status === 'MENUNGGU_VERIFIKASI') {
    statusClass = 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50';
    statusText = '⏳ Menunggu Verifikasi';
  } else if (rental.status === 'VERIFIED' || rental.status === 'SELESAI') {
    statusClass = 'bg-green-900/30 text-[#3fb950] border-green-700/50';
    statusText = '✓ Terverifikasi';
  } else if (rental.status === 'DITOLAK' || rental.status === 'REJECTED') {
    statusClass = 'bg-red-900/30 text-red-400 border-red-700/50';
    statusText = '✗ Ditolak';
  }

  // Get items
  const items = [rental.item_1, rental.item_2, rental.item_3, rental.item_4]
    .filter(item => item && item.trim() !== '');
  const itemsHtml = items.map(item => 
    `<span class="inline-flex items-center px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9]">${item}</span>`
  ).join(' ');

  card.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <!-- Left Section -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-bold text-[#c9d1d9]">#${rental.id} - ${rental.nama}</h3>
          <span class="px-3 py-1 rounded-full text-sm font-semibold border ${statusClass}">
            ${statusText}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <p class="text-[#8b949e] text-sm">No. HP:</p>
            <p class="text-[#c9d1d9] font-medium">${rental.no_hp || '-'}</p>
          </div>
          <div>
            <p class="text-[#8b949e] text-sm">Alamat:</p>
            <p class="text-[#c9d1d9] font-medium">${rental.alamat || '-'}</p>
          </div>
          <div>
            <p class="text-[#8b949e] text-sm">Tanggal Sewa:</p>
            <p class="text-[#c9d1d9] font-medium">${formattedDate}</p>
          </div>
          <div>
            <p class="text-[#8b949e] text-sm">Total Harga:</p>
            <p class="text-[#3fb950] font-bold">Rp ${parseInt(rental.price_total || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div class="mb-3">
          <p class="text-[#8b949e] text-sm mb-2">Alat yang Dipinjam:</p>
          <div class="flex flex-wrap gap-2">
            ${itemsHtml || '<span class="text-[#8b949e]">Tidak ada item</span>'}
          </div>
        </div>

        <div>
          <p class="text-[#6e7681] text-xs">Dibuat: ${createdDate}</p>
        </div>
      </div>

      <!-- Right Section (Actions) -->
      <div class="flex flex-col gap-2 lg:w-48">
        ${rental.bukti_transfer_url ? `
          <a href="${rental.bukti_transfer_url}" target="_blank" 
             class="text-center bg-[#21262d] border border-[#30363d] text-[#58a6ff] font-medium py-2 px-4 rounded-lg hover:bg-[#30363d] hover:border-[#1f6feb] transition-all duration-200 text-sm">
            📷 Lihat Bukti
          </a>
        ` : ''}
        
        ${rental.status === 'MENUNGGU_VERIFIKASI' ? `
          <button data-action="verify" data-id="${rental.id}"
                  class="btn-verify bg-[#3fb950]/20 border border-[#3fb950]/50 text-[#3fb950] font-medium py-2 px-4 rounded-lg hover:bg-[#3fb950]/30 transition-all duration-200 text-sm">
            ✓ Verifikasi
          </button>
          <button data-action="reject" data-id="${rental.id}"
                  class="btn-reject bg-red-900/20 border border-red-700/50 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-900/30 transition-all duration-200 text-sm">
            ✗ Tolak
          </button>
        ` : ''}
        
        <button data-action="delete" data-id="${rental.id}"
                class="btn-delete bg-red-900/30 border border-red-700/50 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-900/50 transition-all duration-200 text-sm">
          🗑️ Hapus
        </button>
      </div>
    </div>
  `;

  return card;
}

// Update status
async function updateStatus(id, status) {
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }

  const confirmMsg = status === 'VERIFIED' 
    ? 'Verifikasi peminjaman ini?' 
    : 'Tolak peminjaman ini?';

  if (!confirm(confirmMsg)) {
    return;
  }

  try {
    const { error } = await window.supabaseClient
      .from('rentals')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    alert('Status berhasil diupdate!');
    loadRentals(); // Reload data
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Gagal update status: ' + error.message);
  }
}

// Delete rental
async function deleteRental(id) {
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }

  if (!confirm('Hapus data peminjaman ini? Tindakan ini tidak dapat dibatalkan!')) {
    return;
  }

  try {
    const { error } = await window.supabaseClient
      .from('rentals')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    alert('Data berhasil dihapus!');
    loadRentals(); // Reload data
  } catch (error) {
    console.error('Error deleting rental:', error);
    alert('Gagal menghapus data: ' + error.message);
  }
}

// Make functions globally available
window.loadRentals = loadRentals;
window.updateStatus = updateStatus;
window.deleteRental = deleteRental;

// Event delegation for dynamically created buttons
document.addEventListener('click', function(e) {
  // Check if clicked element is a button with data-action
  const button = e.target.closest('[data-action]');
  if (!button) return;

  const action = button.getAttribute('data-action');
  const id = parseInt(button.getAttribute('data-id'));

  console.log('Button clicked:', action, 'ID:', id);

  if (action === 'verify') {
    updateStatus(id, 'VERIFIED');
  } else if (action === 'reject') {
    updateStatus(id, 'DITOLAK');
  } else if (action === 'delete') {
    deleteRental(id);
  }
});

// Load rentals on page load
loadRentals();
