const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");
const fileInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");
const checkboxes = document.querySelectorAll(".item-checkbox");
const priceDisplay = document.getElementById("priceDisplay");
const totalPriceElement = document.getElementById("totalPrice");
const pricePerDayElement = document.getElementById("pricePerDay");
const totalDaysElement = document.getElementById("totalDays");
const selectedItemsElement = document.getElementById("selectedItems");
const tanggalSewaInput = document.getElementById("tanggal_sewa");
const tanggalKembaliInput = document.getElementById("tanggal_kembali");

// Check if Supabase is configured - log only, don't alert yet
if (!window.supabaseClient) {
  console.warn('⚠️ Supabase client not initialized yet. Will check again on form submit.');
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

// File upload feedback
fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) {
    fileNameDisplay.textContent = "✓ " + e.target.files[0].name;
    fileNameDisplay.classList.remove("hidden");
    fileNameDisplay.classList.add("text-[#58a6ff]");
  } else {
    fileNameDisplay.classList.add("hidden");
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
  
  if (!file) {
    alert("Upload bukti transfer terlebih dahulu!");
    return;
  }

  // Show loading status
  statusText.classList.remove("hidden", "bg-red-900/30", "text-red-400", "border-red-700/50");
  statusText.classList.add("bg-blue-900/30", "text-blue-400", "border", "border-blue-700/50");
  statusText.innerText = "Mengirim data...";

  try {
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

    // Upload file ke Supabase Storage
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

    // Get public URL
    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('bukti-transfer')
      .getPublicUrl(fileName);

    // Insert data ke database
    const rentalData = {
      nama: document.getElementById("nama").value,
      no_hp: document.getElementById("no_hp").value,
      alamat: document.getElementById("alamat").value,
      ...itemsData,
      price_total: totalPrice,
      tanggal_sewa: tanggalSewa,
      tanggal_kembali: tanggalKembali,
      bukti_transfer_url: publicUrl,
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