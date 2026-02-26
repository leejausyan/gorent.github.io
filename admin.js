// Check authentication
if (localStorage.getItem('adminLoggedIn') !== 'true') {
  window.location.href = 'admin-login.html';
} else {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('mainContent').classList.remove('hidden');
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

  tableLoading.classList.remove('hidden');
  rentalsList.classList.add('hidden');
  emptyState.classList.add('hidden');

  try {
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    tableLoading.classList.add('hidden');

    if (!data || data.length === 0) {
      emptyState.classList.remove('hidden');
      updateStats(0, 0, 0);
      return;
    }

    const total = data.length;
    const pending = data.filter(r => r.status === 'MENUNGGU_VERIFIKASI').length;
    const verified = data.filter(r => r.status === 'VERIFIED' || r.status === 'SELESAI').length;
    updateStats(total, pending, verified);

    rentalsList.innerHTML = '';
    data.forEach(rental => {
      rentalsList.appendChild(createRentalCard(rental));
    });
    rentalsList.classList.remove('hidden');
    
    attachButtonListeners();

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
  console.log('🔍 Creating card for rental:', rental.id, 'Type:', typeof rental.id);
  
  const card = document.createElement('div');
  card.className = 'bg-[#1c2128] border border-[#30363d] rounded-xl p-6 hover:border-[#1f6feb] transition-all duration-200';
  
  let formattedDate = '-';
  if (rental.tanggal_sewa) {
    const date = new Date(rental.tanggal_sewa);
    formattedDate = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  let createdDate = '-';
  if (rental.created_at) {
    const date = new Date(rental.created_at);
    createdDate = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

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

  const items = [rental.item_1, rental.item_2, rental.item_3, rental.item_4].filter(item => item && item.trim() !== '');
  const itemsHtml = items.map(item => `<span class="inline-flex items-center px-3 py-1 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9]">${item}</span>`).join(' ');

  card.innerHTML = `
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div class="flex-1">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-bold text-[#c9d1d9]">#${rental.id} - ${rental.nama}</h3>
          <span class="px-3 py-1 rounded-full text-sm font-semibold border ${statusClass}">${statusText}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div><p class="text-[#8b949e] text-sm">No. HP:</p><p class="text-[#c9d1d9] font-medium">${rental.no_hp || '-'}</p></div>
          <div><p class="text-[#8b949e] text-sm">Alamat:</p><p class="text-[#c9d1d9] font-medium">${rental.alamat || '-'}</p></div>
          <div><p class="text-[#8b949e] text-sm">Tanggal Sewa:</p><p class="text-[#c9d1d9] font-medium">${formattedDate}</p></div>
          <div><p class="text-[#8b949e] text-sm">Total Harga:</p><p class="text-[#3fb950] font-bold">Rp ${parseInt(rental.price_total || 0).toLocaleString('id-ID')}</p></div>
        </div>
        <div class="mb-3">
          <p class="text-[#8b949e] text-sm mb-2">Alat yang Dipinjam:</p>
          <div class="flex flex-wrap gap-2">${itemsHtml || '<span class="text-[#8b949e]">Tidak ada item</span>'}</div>
        </div>
        <div><p class="text-[#6e7681] text-xs">Dibuat: ${createdDate}</p></div>
      </div>
      <div class="flex flex-col gap-2 lg:w-48">
        ${rental.bukti_transfer_url ? `<a href="${rental.bukti_transfer_url}" target="_blank" class="text-center bg-[#21262d] border border-[#30363d] text-[#58a6ff] font-medium py-2 px-4 rounded-lg hover:bg-[#30363d] hover:border-[#1f6feb] transition-all duration-200 text-sm">📷 Lihat Bukti</a>` : ''}
        ${rental.status === 'MENUNGGU_VERIFIKASI' ? `
          <button class="btn-verify bg-[#3fb950]/20 border border-[#3fb950]/50 text-[#3fb950] font-medium py-2 px-4 rounded-lg hover:bg-[#3fb950]/30 transition-all duration-200 text-sm" data-id="${rental.id}">✓ Verifikasi</button>
          <button class="btn-reject bg-red-900/20 border border-red-700/50 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-900/30 transition-all duration-200 text-sm" data-id="${rental.id}">✗ Tolak</button>
        ` : ''}
        <button class="btn-delete bg-red-900/30 border border-red-700/50 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-900/50 transition-all duration-200 text-sm" data-id="${rental.id}">🗑️ Hapus</button>
      </div>
    </div>
  `;
  return card;
}

// Attach button listeners
function attachButtonListeners() {
  console.log('🔧 Attaching button listeners...');
  
  document.querySelectorAll('.btn-verify').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const dataId = this.getAttribute('data-id');
      console.log('✅ Raw data-id:', dataId);
      const id = dataId; // Keep as string, might be UUID
      console.log('✅ Verify clicked for ID:', id);
      await handleVerify(id);
    });
  });
  
  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const dataId = this.getAttribute('data-id');
      console.log('❌ Raw data-id:', dataId);
      const id = dataId; // Keep as string, might be UUID
      console.log('❌ Reject clicked for ID:', id);
      await handleReject(id);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const dataId = this.getAttribute('data-id');
      console.log('🗑️ Raw data-id:', dataId);
      const id = dataId; // Keep as string, might be UUID
      console.log('🗑️ Delete clicked for ID:', id);
      await handleDelete(id);
    });
  });
}

// Handle Verify - UPDATE STATUS TO "VERIFIED"
async function handleVerify(id) {
  console.log('📝 Verify process for ID:', id);
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }
  if (!confirm('Verifikasi peminjaman ini?')) return;

  try {
    console.log('�� Updating status to VERIFIED for ID:', id);
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .update({ status: 'VERIFIED' })
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('✅ Success:', data);
    alert('Status berhasil diverifikasi!');
    loadRentals();
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Gagal update status: ' + error.message);
  }
}

// Handle Reject - UPDATE STATUS TO "DITOLAK"
async function handleReject(id) {
  console.log('📝 Reject process for ID:', id);
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }
  if (!confirm('Tolak peminjaman ini?')) return;

  try {
    console.log('📡 Updating status to DITOLAK for ID:', id);
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .update({ status: 'DITOLAK' })
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('✅ Success:', data);
    alert('Status berhasil ditolak!');
    loadRentals();
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Gagal update status: ' + error.message);
  }
}

// Handle Delete - DELETE FROM DATABASE
async function handleDelete(id) {
  console.log('📝 Delete process for ID:', id);
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }
  if (!confirm('Hapus data peminjaman ini? Tindakan ini tidak dapat dibatalkan!')) return;

  try {
    console.log('📡 Deleting rental ID:', id);
    const { error } = await window.supabaseClient
      .from('rentals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('✅ Deleted successfully');
    alert('Data berhasil dihapus!');
    loadRentals();
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Gagal menghapus data: ' + error.message);
  }
}

console.log('🚀 Admin.js loaded');
loadRentals();
