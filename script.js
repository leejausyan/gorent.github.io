const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");
const fileInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");
const identitasInput = document.getElementById("identitas");
const identitasFileNameDisplay = document.getElementById("identitasFileName");
const checkboxes = document.querySelectorAll(".item-checkbox");
const priceDisplay = document.getElementById("priceDisplay");
const totalPriceElement = document.getElementById("totalPrice");
const pricePerDayElement = document.getElementById("pricePerDay");
const totalDaysElement = document.getElementById("totalDays");
const selectedItemsElement = document.getElementById("selectedItems");
const tanggalSewaInput = document.getElementById("tanggal_sewa");
const tanggalKembaliInput = document.getElementById("tanggal_kembali");
const searchOrderBtn = document.getElementById("searchOrderBtn");
const searchOrderId = document.getElementById("searchOrderId");

// Check if Supabase is configured - log only, don't alert yet
if (!window.supabaseClient) {
  console.warn('⚠️ Supabase client not initialized yet. Will check again on form submit.');
}

// Search Order by ID
if (searchOrderBtn && searchOrderId) {
  searchOrderBtn.addEventListener('click', function() {
    const orderId = searchOrderId.value.trim();
    if (!orderId) {
      alert('Masukkan ID pesanan terlebih dahulu!');
      return;
    }
    // Redirect to verify page with the order ID
    window.location.href = `verify.html?id=${orderId}`;
  });

  // Allow Enter key to search
  searchOrderId.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchOrderBtn.click();
    }
  });
}

// Calculate number of days between two dates
function calculateDays() {
  const tanggalSewa = tanggalSewaInput.value;
  const tanggalKembali = tanggalKembaliInput.value;
  
  if (!tanggalSewa || !tanggalKembali) {
    return 1; // Default 1 day if dates not selected
  }
  
  const startDate = new Date(tanggalSewa);
  const endDate = new Date(tanggalKembali);
  
  // Calculate difference in days
  const diffTime = endDate - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Minimum 1 day
  return diffDays > 0 ? diffDays : 1;
}

// Update price display
function updatePriceDisplay() {
  const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
  
  // Calculate base price (per day)
  let pricePerDay = 0;
  const selectedItems = [];
  
  selectedCheckboxes.forEach((cb) => {
    pricePerDay += parseInt(cb.dataset.price);
    selectedItems.push(cb.value);
  });
  
  // Calculate total days
  const totalDays = calculateDays();
  
  // Calculate total price (price per day * number of days)
  const totalPrice = pricePerDay * totalDays;
  
  // Update display
  if (selectedCheckboxes.length > 0) {
    priceDisplay.classList.remove("hidden");
    pricePerDayElement.textContent = `Rp ${pricePerDay.toLocaleString("id-ID")}`;
    totalDaysElement.textContent = `${totalDays} hari`;
    totalPriceElement.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
    selectedItemsElement.textContent = `Dipilih: ${selectedItems.join(", ")}`;
  } else {
    priceDisplay.classList.add("hidden");
  }
  
  return { pricePerDay, totalDays, totalPrice };
}

// File upload feedback for bukti transfer
fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    fileNameDisplay.textContent = "✓ " + e.target.files[0].name;
    fileNameDisplay.classList.remove("hidden");
    fileNameDisplay.classList.add("text-[#58a6ff]");
  } else {
    fileNameDisplay.classList.add("hidden");
  }
});

// File upload feedback for identitas
identitasInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    identitasFileNameDisplay.textContent = "✓ " + e.target.files[0].name;
    identitasFileNameDisplay.classList.remove("hidden");
    identitasFileNameDisplay.classList.add("text-[#58a6ff]");
  } else {
    identitasFileNameDisplay.classList.add("hidden");
  }
});

// Handle item selection
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
    
    // Limit to 4 items
    if (selectedCheckboxes.length > 4) {
      checkbox.checked = false;
      alert("Maksimal 4 alat yang dapat dipilih!");
      return;
    }
    
    updatePriceDisplay();
  });
});

// Handle date changes
tanggalSewaInput.addEventListener("change", () => {
  // Set minimum return date to rental date
  tanggalKembaliInput.min = tanggalSewaInput.value;
  
  // If return date is before rental date, reset it
  if (tanggalKembaliInput.value && tanggalKembaliInput.value < tanggalSewaInput.value) {
    tanggalKembaliInput.value = "";
  }
  
  updatePriceDisplay();
});

tanggalKembaliInput.addEventListener("change", () => {
  updatePriceDisplay();
});

// Check if items are available for the selected dates
async function checkItemAvailability(selectedItems, startDate, endDate) {
  if (!window.supabaseClient) {
    throw new Error('Database tidak tersedia');
  }

  console.log('🔍 Checking availability for:', {
    items: selectedItems,
    startDate,
    endDate
  });

  try {
    // Query all rentals that are VERIFIED or MENUNGGU_VERIFIKASI (not DITOLAK)
    const { data: existingRentals, error } = await window.supabaseClient
      .from('rentals')
      .select('item_1, item_2, item_3, item_4, tanggal_sewa, tanggal_kembali, status')
      .in('status', ['VERIFIED', 'MENUNGGU_VERIFIKASI', 'SELESAI'])
      .not('tanggal_sewa', 'is', null)
      .not('tanggal_kembali', 'is', null);

    if (error) {
      console.error('❌ Error checking availability:', error);
      throw error;
    }

    console.log('📦 Found existing rentals:', existingRentals?.length || 0);

    if (!existingRentals || existingRentals.length === 0) {
      console.log('✅ No existing rentals, all items available');
      return { available: true };
    }

    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);

    // Check for conflicts
    const conflicts = [];

    existingRentals.forEach(rental => {
      const rentalStart = new Date(rental.tanggal_sewa);
      const rentalEnd = new Date(rental.tanggal_kembali);

      // Check if dates overlap
      const hasOverlap = requestStart <= rentalEnd && requestEnd >= rentalStart;

      if (hasOverlap) {
        // Check if any of the requested items are in this rental
        const rentalItems = [rental.item_1, rental.item_2, rental.item_3, rental.item_4]
          .filter(item => item && item.trim() !== '');

        const conflictingItems = selectedItems.filter(item => rentalItems.includes(item));

        if (conflictingItems.length > 0) {
          conflicts.push({
            items: conflictingItems,
            startDate: rental.tanggal_sewa,
            endDate: rental.tanggal_kembali,
            status: rental.status
          });
        }
      }
    });

    if (conflicts.length > 0) {
      console.log('⚠️ Found conflicts:', conflicts);
      
      // Get unique conflicting items
      const uniqueConflicts = [...new Set(conflicts.flatMap(c => c.items))];
      
      return {
        available: false,
        conflicts: uniqueConflicts,
        message: `Alat berikut sudah dibooking pada tanggal tersebut: ${uniqueConflicts.join(', ')}. Silakan pilih tanggal lain atau alat yang berbeda.`
      };
    }

    console.log('✅ All items available for selected dates');
    return { available: true };

  } catch (error) {
    console.error('❌ Error in checkItemAvailability:', error);
    throw error;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!window.supabaseClient) {
    alert('Error: Database belum dikonfigurasi!');
    return;
  }

  // Validate at least one item is selected
  const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
  if (selectedCheckboxes.length === 0) {
    alert("Pilih minimal 1 alat untuk dipinjam!");
    return;
  }

  // Validate dates
  const tanggalSewa = tanggalSewaInput.value;
  const tanggalKembali = tanggalKembaliInput.value;
  
  if (!tanggalSewa || !tanggalKembali) {
    alert("Tanggal sewa dan tanggal kembali harus diisi!");
    return;
  }
  
  if (new Date(tanggalKembali) < new Date(tanggalSewa)) {
    alert("Tanggal kembali tidak boleh lebih awal dari tanggal sewa!");
    return;
  }

  const file = fileInput.files[0];
  const identitasFile = identitasInput.files[0];
  
  if (!file) {
    alert("Upload bukti transfer terlebih dahulu!");
    return;
  }

  if (!identitasFile) {
    alert("Upload identitas (KTP/SIM/KTM) terlebih dahulu!");
    return;
  }

  // Show loading status for checking availability
  statusText.classList.remove("hidden", "bg-red-900/30", "text-red-400", "border-red-700/50");
  statusText.classList.add("bg-blue-900/30", "text-blue-400", "border", "border-blue-700/50");
  statusText.innerText = "Mengecek ketersediaan alat...";

  try {
    // Get selected items
    const selectedItems = Array.from(selectedCheckboxes).map(cb => cb.value);

    // Check availability
    console.log('🔍 Checking availability before booking...');
    const availabilityCheck = await checkItemAvailability(selectedItems, tanggalSewa, tanggalKembali);

    if (!availabilityCheck.available) {
      // Show error message with details
      statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
      statusText.classList.add("bg-red-900/30", "text-red-400", "border", "border-red-700/50");
      
      const conflictItems = availabilityCheck.conflicts.join(', ');
      const errorMessage = `⚠️ Alat tidak tersedia!\n\n${conflictItems} sudah dibooking pada tanggal yang Anda pilih.\n\nSilakan:\n• Pilih tanggal lain, atau\n• Pilih alat yang berbeda`;
      
      statusText.innerHTML = `
        <div class="text-left">
          <div class="font-bold mb-2">⚠️ Alat Tidak Tersedia</div>
          <div class="text-sm mb-2">Alat berikut sudah dibooking:</div>
          <div class="font-semibold mb-2">${conflictItems}</div>
          <div class="text-xs">Silakan pilih tanggal lain atau alat yang berbeda</div>
        </div>
      `;
      
      // Also show alert
      alert(errorMessage);
      
      // Scroll to status message
      statusText.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    console.log('✅ Items available, proceeding with booking...');

    // Update status to uploading
    statusText.innerText = "Mengirim data...";

    // Prepare items data (item_1, item_2, item_3, item_4)
    const itemsData = {
      item_1: "",
      item_2: "",
      item_3: "",
      item_4: ""
    };

    let pricePerDay = 0;
    selectedCheckboxes.forEach((cb, index) => {
      itemsData[`item_${index + 1}`] = cb.value;
      pricePerDay += parseInt(cb.dataset.price);
    });
    
    // Calculate total days and total price
    const totalDays = calculateDays();
    const totalPrice = pricePerDay * totalDays;

    console.log('📊 Price calculation:', {
      pricePerDay,
      totalDays,
      totalPrice
    });

    // Upload bukti transfer ke Supabase Storage
    statusText.innerText = "Mengupload bukti transfer...";
    const fileName = `bukti-${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
      .from('bukti-transfer')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error('Gagal upload bukti transfer: ' + uploadError.message);
    }

    // Get public URL for bukti transfer
    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('bukti-transfer')
      .getPublicUrl(fileName);

    // Upload identitas ke Supabase Storage
    statusText.innerText = "Mengupload identitas...";
    const identitasFileName = `identitas-${Date.now()}-${identitasFile.name}`;
    const { data: identitasUploadData, error: identitasUploadError } = await window.supabaseClient.storage
      .from('identitas')
      .upload(identitasFileName, identitasFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (identitasUploadError) {
      throw new Error('Gagal upload identitas: ' + identitasUploadError.message);
    }

    // Get public URL for identitas
    const { data: { publicUrl: identitasPublicUrl } } = window.supabaseClient.storage
      .from('identitas')
      .getPublicUrl(identitasFileName);

    console.log('✅ Files uploaded:', {
      buktiTransfer: publicUrl,
      identitas: identitasPublicUrl
    });

    // Insert data ke database
    statusText.innerText = "Menyimpan data...";
    const rentalData = {
      nama: document.getElementById("nama").value,
      no_hp: document.getElementById("no_hp").value,
      alamat: document.getElementById("alamat").value,
      instansi: document.getElementById("instansi").value,
      keperluan: document.getElementById("keperluan").value,
      ...itemsData,
      price_total: totalPrice,
      tanggal_sewa: tanggalSewa,
      tanggal_kembali: tanggalKembali,
      bukti_transfer_url: publicUrl,
      identitas_url: identitasPublicUrl,
      status: "MENUNGGU_VERIFIKASI"
    };
    
    console.log('📤 Sending rental data:', rentalData);

    const { data, error } = await window.supabaseClient
      .from('rentals')
      .insert([rentalData])
      .select();

    if (error) {
      throw new Error('Gagal menyimpan data: ' + error.message);
    }

    // Success
    statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
    statusText.classList.add("bg-green-900/30", "text-[#3fb950]", "border", "border-green-700/50");
    statusText.innerText = "✓ Berhasil dikirim! Mengalihkan ke halaman verifikasi...";
    
    // Redirect to verification page
    if (data && data[0]) {
      const rentalId = data[0].id;
      setTimeout(() => {
        window.location.href = `verify.html?id=${rentalId}`;
      }, 1500);
    }

  } catch (error) {
    console.error('Error:', error);
    statusText.classList.remove("bg-blue-900/30", "text-blue-400", "border-blue-700/50");
    statusText.classList.add("bg-red-900/30", "text-red-400", "border", "border-red-700/50");
    statusText.innerText = "✗ Terjadi kesalahan: " + error.message;
  }
});