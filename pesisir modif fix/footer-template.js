const footerHTML = `
<footer class="site-footer">
    <div class="container footer-grid">
      <!-- COLUMN 1: ABOUT -->
      <div class="footer-col">
        <div class="footer-col-upper">
          <div class="footer-header-row">
            <a href="index.html" title="Beranda">
              <img src="assets/img/logo-small.png" alt="logo" class="footer-logo" />
            </a>
            <div class="footer-title-block">
              <h2 class="footer-title">PEMERINTAHAN</h2>
              <p class="footer-subtitle">KABUPATEN PESISIR BARAT</p>
            </div>
          </div>
        </div>
        
        <div class="footer-col-lower">
          <div class="footer-address">
            <p><img src="assets/icons/map.png" alt="map" /> Jl. Kesuma No. 1 Gedung A Lt.1 Kompleks Perkantoran Pemda, Kec. Pesisir Tengah, Kabupaten Pesisir Barat, Provinsi Lampung - Indonesia 34874</p>
          </div>
        </div>
      </div>

      <!-- COLUMN 2: SOCIAL & STATS -->
      <div class="footer-col footer-col-center">
        <div class="footer-col-upper">
          <h3 class="footer-heading">IKUTI KAMI</h3>
          <div class="icon-row">
            <a href="https://www.youtube.com/@pemkabpesisirbarat" target="_blank" title="YouTube"><img src="assets/youtube.png" alt="YouTube" /></a>
            <a href="https://www.facebook.com/diskominfokpb" target="_blank" title="Facebook"><img src="assets/facebook.png" alt="Facebook" /></a>
            <a href="https://www.instagram.com/pemkabpesisirbarat/" target="_blank" title="Instagram"><img src="assets/instagram.png" alt="Instagram" /></a>
            <a href="https://x.com/DiskominfoKPB" target="_blank" title="X (Twitter)"><img src="assets/twitter.png" alt="X" /></a>
            <a href="https://api.whatsapp.com/send?phone=6285369989990&text=Tabik%20Pun,%20Perkenalkan%20nama%20saya%20.........,%20......%3F" target="_blank" title="WhatsApp"><img src="assets/icons/wa-hd.png" alt="WhatsApp" /></a>
            <a href="mailto:admin@pesisirbaratkab.go.id" title="Email"><img src="assets/icons/email.png" alt="Email" /></a>
            <a href="https://pj-pesisir-barat.vercel.app" target="_blank" title="Website"><img src="assets/icons/web.png" alt="Website" /></a>
          </div>
        </div>

        <div class="footer-col-lower">
          <h3 class="footer-heading">STATISTIK PENGUNJUNG</h3>
          <div class="visitor-stats">
            <div>
              <img src="assets/icons/group.png" alt="total" />
              <p>Total</p>
              <span id="stat-total">...</span>
            </div>
            <div>
              <img src="assets/icons/eye.png" alt="today" />
              <p>Hari Ini</p>
              <span id="stat-today">...</span>
            </div>
            <div>
              <img src="assets/icons/calender.png" alt="month" />
              <p>Bulan Ini</p>
              <span id="stat-month">...</span>
            </div>
            <div>
              <img src="assets/icons/calender-solid.png" alt="year" />
              <p>Tahun Ini</p>
              <span id="stat-year">...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMN 3: MAP -->
      <div class="footer-col footer-col-right">
        <div class="footer-col-upper">
          <h3 class="footer-heading">LOKASI</h3>
        </div>
        
        <div class="footer-col-lower">
          <a href="https://maps.app.goo.gl/ZBy4RNMjZuUAs1yg7" target="_blank" title="Lihat di Google Maps">
            <img src="assets/lokasi.png" class="map-img" alt="Map" />
          </a>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>&copy; <span id="year"></span> Pemerintah Kabupaten Pesisir Barat — All rights reserved.</p>
    </div>
</footer>
`;


// SUPABASE CONFIG
const SUPABASE_URL = "https://etoczlukxjyceonuopzy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2N6bHVreGp5Y2VvbnVvcHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjAwNjQsImV4cCI6MjA4MTc5NjA2NH0.h-DYFQHbPNjLMmHUuluGOkVMcvEDmE-B9NlZY-BCxbM";

async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);
  if (response.status === 204) return null; 
  return response.json();
}

function getDateInfo() {
  const now = new Date();
  return {
    today: now.toISOString().split('T')[0],
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

function isNewVisit() {
  const lastVisit = localStorage.getItem('last_visit');
  const now = new Date().getTime();
  const ONE_HOUR = 60 * 60 * 1000;
  
  if (!lastVisit || (now - lastVisit) > ONE_HOUR) {
    localStorage.setItem('last_visit', now);
    return true;
  }
  return false;
}

async function trackVisitorStats() {
  try {
    const data = await supabaseFetch('visitor_stats?select=*');
    
    if (!data || data.length === 0) return;

    let stats = data[0];
    const dateInfo = getDateInfo();
    let needsUpdate = false;
    const isNew = isNewVisit();

    if (stats.today_date !== dateInfo.today) {
      stats.today_count = 0;
      stats.today_date = dateInfo.today;
      needsUpdate = true;
    }
    if (stats.month_value !== dateInfo.month) {
      stats.month_count = 0;
      stats.month_value = dateInfo.month;
      needsUpdate = true;
    }
    if (stats.year_value !== dateInfo.year) {
      stats.year_count = 0;
      stats.year_value = dateInfo.year;
      needsUpdate = true;
    }

    if (isNew) {
      stats.total_count += 1;
      stats.today_count += 1;
      stats.month_count += 1;
      stats.year_count += 1;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await supabaseFetch('visitor_stats?id=eq.1', {
        method: 'PATCH',
        body: JSON.stringify({
          total_count: stats.total_count,
          today_count: stats.today_count,
          month_count: stats.month_count,
          year_count: stats.year_count,
          today_date: stats.today_date,
          month_value: stats.month_value,
          year_value: stats.year_value
        })
      });
    }

    // Update UI
    document.getElementById('stat-total').textContent = stats.total_count.toLocaleString('id-ID');
    document.getElementById('stat-today').textContent = stats.today_count.toLocaleString('id-ID');
    document.getElementById('stat-month').textContent = stats.month_count.toLocaleString('id-ID');
    document.getElementById('stat-year').textContent = stats.year_count.toLocaleString('id-ID');

  } catch (err) {
    console.error('Error tracking visitor:', err);
  }
}

// Global function to load footer
window.loadFooter = function() {
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.outerHTML = footerHTML;
        
        // Set year
        const yearSpan = document.getElementById('year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
        
        // Track stats
        trackVisitorStats();
    }
};

// Auto-load if placeholder exists
document.addEventListener('DOMContentLoaded', loadFooter);
