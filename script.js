const form = document.getElementById("rentalForm");
const statusText = document.getElementById("status");
const fileInput = document.getElementById("bukti");
const fileNameDisplay = document.getElementById("fileName");
const checkboxes = document.querySelectorAll(".item-checkbox");
const priceDisplay = document.getElementById("priceDisplay");
const totalPriceElement = document.getElementById("totalPrice");
const selectedItemsElement = document.getElementById("selectedItems");

// Check if Supabase is configured
if (!window.supabaseClient) {
  console.error('Supabase is not configured! Please check config.js');
  alert('Error: Database belum dikonfigurasi. Silakan hubungi administrator.');
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

// Handle item selection and price calculation
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const selectedCheckboxes = document.querySelectorAll(".item-checkbox:checked");
    
    // Limit to 4 items
    if (selectedCheckboxes.length > 4) {
      checkbox.checked = false;
      alert("Maksimal 4 alat yang dapat dipilih!");
      return;
    }

    // Calculate total price
    let totalPrice = 0;
    const selectedItems = [];
    
    selectedCheckboxes.forEach((cb) => {
      totalPrice += parseInt(cb.dataset.price);
      selectedItems.push(cb.value);
    });

    // Update display
    if (selectedCheckboxes.length > 0) {
      priceDisplay.classList.remove("hidden");
      totalPriceElement.textContent = `Rp ${totalPrice.toLocaleString("id-ID")}`;
      selectedItemsElement.textContent = `Dipilih: ${selectedItems.join(", ")}`;
    } else {
      priceDisplay.classList.add("hidden");
    }
  });
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

    let totalPrice = 0;
    selectedCheckboxes.forEach((cb, index) => {
      itemsData[`item_${index + 1}`] = cb.value;
      totalPrice += parseInt(cb.dataset.price);
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
      tanggal_sewa: document.getElementById("tanggal_sewa").value,
      bukti_transfer_url: publicUrl,
      status: "MENUNGGU_VERIFIKASI"
    };

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