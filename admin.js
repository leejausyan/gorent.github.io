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
    const totalRevenue = data.reduce((sum, r) => sum + (parseInt(r.price_total) || 0), 0);
    updateStats(total, pending, verified, totalRevenue);

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
function updateStats(total, pending, verified, revenue = 0) {
  document.getElementById('totalRentals').textContent = total;
  document.getElementById('pendingRentals').textContent = pending;
  document.getElementById('verifiedRentals').textContent = verified;
  document.getElementById('totalRevenue').textContent = 'Rp ' + revenue.toLocaleString('id-ID');
}

// Create rental card
function createRentalCard(rental) {
  console.log('🔍 Creating card for rental:', rental.id, 'Type:', typeof rental.id);
  
  const card = document.createElement('div');
  card.className = 'bg-[#0d1117] hover:bg-[#161b22] transition-all duration-300 p-6';
  
  let formattedDate = '-';
  let rentalDuration = '';
  if (rental.tanggal_sewa) {
    const startDate = new Date(rental.tanggal_sewa);
    formattedDate = startDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Add return date if exists
    if (rental.tanggal_kembali) {
      const endDate = new Date(rental.tanggal_kembali);
      const formattedReturnDate = endDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Calculate days
      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      formattedDate = `${formattedDate} - ${formattedReturnDate}`;
      rentalDuration = ` (${diffDays} hari)`;
    }
  }

  let createdDate = '-';
  if (rental.created_at) {
    const date = new Date(rental.created_at);
    createdDate = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  let statusClass = '';
  let statusText = '';
  let statusIcon = '';
  if (rental.status === 'MENUNGGU_VERIFIKASI') {
    statusClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
    statusText = 'Menunggu Verifikasi';
    statusIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  } else if (rental.status === 'VERIFIED' || rental.status === 'SELESAI') {
    statusClass = 'bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/30';
    statusText = 'Terverifikasi';
    statusIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  } else if (rental.status === 'DITOLAK' || rental.status === 'REJECTED') {
    statusClass = 'bg-red-500/10 text-red-400 border border-red-500/30';
    statusText = 'Ditolak';
    statusIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  const items = [rental.item_1, rental.item_2, rental.item_3, rental.item_4].filter(item => item && item.trim() !== '');
  const itemsHtml = items.map(item => `<span class="inline-flex items-center px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#c9d1d9] font-medium hover:border-[#1f6feb] transition-all">${item}</span>`).join(' ');

  // Create action buttons container
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flex flex-wrap gap-2 mt-4';

  // Add bukti transfer link if exists
  if (rental.bukti_transfer_url) {
    const buktiLink = document.createElement('a');
    buktiLink.href = rental.bukti_transfer_url;
    buktiLink.target = '_blank';
    buktiLink.className = 'inline-flex items-center gap-2 bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff] font-medium py-2 px-4 rounded-lg hover:bg-[#1f6feb]/20 hover:border-[#1f6feb] transition-all duration-200 text-sm';
    buktiLink.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>Bukti Transfer`;
    actionsDiv.appendChild(buktiLink);
  }

  // Add identitas link if exists
  if (rental.identitas_url) {
    const identitasLink = document.createElement('a');
    identitasLink.href = rental.identitas_url;
    identitasLink.target = '_blank';
    identitasLink.className = 'inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 font-medium py-2 px-4 rounded-lg hover:bg-purple-500/20 hover:border-purple-500 transition-all duration-200 text-sm';
    identitasLink.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>Identitas`;
    actionsDiv.appendChild(identitasLink);
  }

  // Add verify and reject buttons if pending
  if (rental.status === 'MENUNGGU_VERIFIKASI') {
    // Verify button
    const verifyBtn = document.createElement('button');
    verifyBtn.className = 'inline-flex items-center gap-2 bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] font-medium py-2 px-4 rounded-lg hover:bg-[#3fb950]/20 hover:border-[#3fb950] transition-all duration-200 text-sm';
    verifyBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Verifikasi`;
    verifyBtn.onclick = async () => {
      console.log('Verify button clicked! ID:', rental.id);
      await handleVerify(rental.id);
    };
    actionsDiv.appendChild(verifyBtn);

    // Reject button
    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-500/20 hover:border-red-500 transition-all duration-200 text-sm';
    rejectBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>Tolak`;
    rejectBtn.onclick = async () => {
      console.log('Reject button clicked! ID:', rental.id);
      await handleReject(rental.id);
    };
    actionsDiv.appendChild(rejectBtn);
  }

  // Delete button (always present)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-2 px-4 rounded-lg hover:bg-red-500/20 hover:border-red-500 transition-all duration-200 text-sm';
  deleteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Hapus`;
  deleteBtn.onclick = async () => {
    console.log('Delete button clicked! ID:', rental.id);
    await handleDelete(rental.id);
  };
  actionsDiv.appendChild(deleteBtn);

  card.innerHTML = `
    <div class="flex flex-col gap-4">
      <!-- Header Section -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-gradient-to-br from-[#1f6feb] to-[#58a6ff] rounded-lg flex items-center justify-center text-white font-bold">
              ${rental.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 class="text-base font-bold text-white">${rental.nama}</h3>
              <p class="text-xs text-[#6e7681]">ID: #${rental.id.substring(0, 8)}</p>
            </div>
          </div>
        </div>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusClass}">
          ${statusIcon}
          ${statusText}
        </span>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-start gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div class="p-2 bg-[#1f6feb]/10 rounded-lg">
            <svg class="w-4 h-4 text-[#58a6ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <p class="text-[#6e7681] text-xs mb-1">Telepon</p>
            <p class="text-[#c9d1d9] text-sm font-medium">${rental.no_hp || '-'}</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div class="p-2 bg-purple-500/10 rounded-lg">
            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <p class="text-[#6e7681] text-xs mb-1">Instansi</p>
            <p class="text-[#c9d1d9] text-sm font-medium">${rental.instansi || '-'}</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
          <div class="p-2 bg-[#3fb950]/10 rounded-lg">
            <svg class="w-4 h-4 text-[#3fb950]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-[#6e7681] text-xs mb-1">Total Harga</p>
            <p class="text-[#3fb950] text-sm font-bold">Rp ${parseInt(rental.price_total || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <!-- Items & Dates -->
      <div class="space-y-3">
        <div>
          <p class="text-[#8b949e] text-xs font-medium mb-2">Alat yang Dipinjam</p>
          <div class="flex flex-wrap gap-2">${itemsHtml || '<span class="text-[#6e7681] text-sm">Tidak ada item</span>'}</div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p class="text-[#8b949e] text-xs font-medium mb-1">Periode Sewa</p>
            <p class="text-[#c9d1d9] text-sm">${formattedDate}${rentalDuration}</p>
          </div>
          <div>
            <p class="text-[#8b949e] text-xs font-medium mb-1">Keperluan</p>
            <p class="text-[#c9d1d9] text-sm">${rental.keperluan || '-'}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div id="actions-placeholder" class="border-t border-[#30363d] pt-4"></div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-[#6e7681]">
        <span>Dibuat: ${createdDate}</span>
        <span>Alamat: ${rental.alamat || '-'}</span>
      </div>
    </div>
  `;

  // Append actions div to placeholder
  const placeholder = card.querySelector('#actions-placeholder');
  placeholder.replaceWith(actionsDiv);
  
  return card;
}

// Attach button listeners - NOT NEEDED ANYMORE
function attachButtonListeners() {
  // Buttons now use onclick directly, no need for manual attachment
  console.log('🔧 Buttons attached via onclick handlers');
}

// Handle Verify - UPDATE STATUS TO "VERIFIED"
async function handleVerify(id) {
  console.log('Verify process for ID:', id);
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }
  if (!confirm('Verifikasi peminjaman ini?')) return;

  try {
    console.log('Updating status to VERIFIED for ID:', id);
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .update({ status: 'VERIFIED' })
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('Success:', data);
    alert('Status berhasil diverifikasi!');
    loadRentals();
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal update status: ' + error.message);
  }
}

// Handle Reject - UPDATE STATUS TO "DITOLAK"
async function handleReject(id) {
  console.log('Reject process for ID:', id);
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }
  if (!confirm('Tolak peminjaman ini?')) return;

  try {
    console.log('Updating status to DITOLAK for ID:', id);
    const { data, error } = await window.supabaseClient
      .from('rentals')
      .update({ status: 'DITOLAK' })
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('Success:', data);
    alert('Status berhasil ditolak!');
    loadRentals();
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal update status: ' + error.message);
  }
}

// Handle Delete - DELETE FROM DATABASE
async function handleDelete(id) {
  console.log('Delete process for ID:', id);
  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }
  if (!confirm('Hapus data peminjaman ini? Tindakan ini tidak dapat dibatalkan!')) return;

  try {
    console.log('Deleting rental ID:', id);
    const { error } = await window.supabaseClient
      .from('rentals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    console.log('Deleted successfully');
    alert('Data berhasil dihapus!');
    loadRentals();
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal menghapus data: ' + error.message);
  }
}

console.log('Admin.js loaded');
loadRentals();
