/**
 * Pesisir Barat Admin Tool - JSON Generator
 * Handles form submissions, data management, and JSON export/import
 */

// Data storage
const dataStore = {
  berita: [],
  wisata: [],
  event: [],
  informasi: []
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  initTabs();
  initForms();
  initImportHandlers();
  loadFromLocalStorage();
  renderAll();
});

// ============================
// TAB NAVIGATION
// ============================
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      
      // Update active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show content
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });
}

// ============================
// FORM HANDLERS
// ============================
function initForms() {
  // Berita Form
  document.getElementById('beritaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const berita = {
      id: generateId(),
      judul: formData.get('judul'),
      ringkasan: formData.get('ringkasan'),
      konten: formData.get('konten'),
      tanggal: formData.get('tanggal'),
      gambar: formData.get('gambar'),
      kategori: formData.get('kategori'),
      views: 0
    };
    dataStore.berita.push(berita);
    saveToLocalStorage();
    renderBerita();
    this.reset();
    alert('Berita berhasil ditambahkan!');
  });

  // Wisata Form
  document.getElementById('wisataForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    let estimasiBiaya = {};
    try {
      estimasiBiaya = JSON.parse(formData.get('estimasiBiaya') || '{}');
    } catch(e) {
      estimasiBiaya = { total: formData.get('estimasiBiaya') };
    }

    const galeriStr = formData.get('galeri') || '';
    const galeri = galeriStr.split(',').map(s => s.trim()).filter(Boolean);

    const wisata = {
      id: generateSlug(formData.get('nama')),
      nama: formData.get('nama'),
      kategori: formData.get('kategori'),
      ringkasan: formData.get('ringkasan'),
      deskripsi: formData.get('deskripsi'),
      gambarHero: formData.get('gambarHero'),
      galeri: galeri,
      estimasiBiaya: estimasiBiaya,
      kontak: {
        instagram: formData.get('instagram'),
        whatsapp: formData.get('whatsapp')
      },
      lokasi: formData.get('lokasi')
    };
    dataStore.wisata.push(wisata);
    saveToLocalStorage();
    renderWisata();
    this.reset();
    alert('Wisata berhasil ditambahkan!');
  });

  // Event Form
  document.getElementById('eventForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    let hargaTiket = {};
    try {
      hargaTiket = JSON.parse(formData.get('hargaTiket') || '{}');
    } catch(e) {
      hargaTiket = { umum: formData.get('hargaTiket') };
    }

    const event = {
      id: generateSlug(formData.get('nama')),
      nama: formData.get('nama'),
      ringkasan: formData.get('ringkasan'),
      deskripsi: formData.get('deskripsi'),
      tanggal: formData.get('tanggal'),
      waktu: formData.get('waktu'),
      lokasi: formData.get('lokasi'),
      gambar: formData.get('gambar'),
      kategori: [],
      hargaTiket: hargaTiket,
      kontak: {
        instagram: formData.get('instagram'),
        whatsapp: formData.get('whatsapp')
      },
      linkPendaftaran: formData.get('linkPendaftaran') || null
    };
    dataStore.event.push(event);
    saveToLocalStorage();
    renderEvent();
    this.reset();
    alert('Event berhasil ditambahkan!');
  });

  // Informasi Form
  document.getElementById('informasiForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const informasi = {
      id: generateId(),
      judul: formData.get('judul'),
      ringkasan: formData.get('ringkasan'),
      konten: formData.get('konten'),
      tanggal: formData.get('tanggal'),
      kategori: formData.get('kategori'),
      lampiran: formData.get('lampiran') || null
    };
    dataStore.informasi.push(informasi);
    saveToLocalStorage();
    renderInformasi();
    this.reset();
    alert('Informasi berhasil ditambahkan!');
  });
}

// ============================
// RENDER FUNCTIONS
// ============================
function renderAll() {
  renderBerita();
  renderWisata();
  renderEvent();
  renderInformasi();
}

function renderBerita() {
  const container = document.getElementById('beritaList');
  document.getElementById('beritaCount').textContent = dataStore.berita.length;
  
  if (dataStore.berita.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada berita</div>';
    return;
  }

  container.innerHTML = dataStore.berita.map((item, index) => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-title">${item.judul}</div>
        <div class="item-meta">${item.tanggal} • ${item.kategori}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="deleteItem('berita', ${index})">Hapus</button>
      </div>
    </div>
  `).join('');
}

function renderWisata() {
  const container = document.getElementById('wisataList');
  document.getElementById('wisataCount').textContent = dataStore.wisata.length;
  
  if (dataStore.wisata.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada wisata</div>';
    return;
  }

  container.innerHTML = dataStore.wisata.map((item, index) => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-title">${item.nama}</div>
        <div class="item-meta">${item.kategori}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="deleteItem('wisata', ${index})">Hapus</button>
      </div>
    </div>
  `).join('');
}

function renderEvent() {
  const container = document.getElementById('eventList');
  document.getElementById('eventCount').textContent = dataStore.event.length;
  
  if (dataStore.event.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada event</div>';
    return;
  }

  container.innerHTML = dataStore.event.map((item, index) => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-title">${item.nama}</div>
        <div class="item-meta">${item.tanggal} • ${item.lokasi}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="deleteItem('event', ${index})">Hapus</button>
      </div>
    </div>
  `).join('');
}

function renderInformasi() {
  const container = document.getElementById('informasiList');
  document.getElementById('informasiCount').textContent = dataStore.informasi.length;
  
  if (dataStore.informasi.length === 0) {
    container.innerHTML = '<div class="empty-state">Belum ada informasi</div>';
    return;
  }

  container.innerHTML = dataStore.informasi.map((item, index) => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-title">${item.judul}</div>
        <div class="item-meta">${item.tanggal} • ${item.kategori}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="deleteItem('informasi', ${index})">Hapus</button>
      </div>
    </div>
  `).join('');
}

// ============================
// DELETE FUNCTION
// ============================
function deleteItem(type, index) {
  if (confirm('Yakin ingin menghapus item ini?')) {
    dataStore[type].splice(index, 1);
    saveToLocalStorage();
    renderAll();
  }
}

// ============================
// EXPORT/IMPORT
// ============================
function exportJSON(type) {
  const data = dataStore[type];
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSON(type) {
  const input = document.getElementById(`import${capitalize(type)}`);
  input.click();
}

function initImportHandlers() {
  ['berita', 'wisata', 'event', 'informasi'].forEach(type => {
    const input = document.getElementById(`import${capitalize(type)}`);
    input.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            dataStore[type] = data;
            saveToLocalStorage();
            renderAll();
            alert(`${type}.json berhasil diimport!`);
          } else {
            alert('Format JSON tidak valid. Harus berupa array.');
          }
        } catch(err) {
          alert('Error parsing JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
      this.value = ''; // Reset input
    });
  });
}

// ============================
// LOCAL STORAGE
// ============================
function saveToLocalStorage() {
  localStorage.setItem('pesisir_admin_data', JSON.stringify(dataStore));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('pesisir_admin_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(dataStore, parsed);
    } catch(e) {
      console.error('Error loading from localStorage:', e);
    }
  }
}

// ============================
// UTILITY FUNCTIONS
// ============================
function generateId() {
  return String(Date.now());
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
