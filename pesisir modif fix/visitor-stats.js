// =========================================
// VISITOR STATISTICS - Supabase Integration
// =========================================

const SUPABASE_URL = 'https://etoczlukxjyceonuopzy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2N6bHVreGp5Y2VvbnVvcHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjAwNjQsImV4cCI6MjA4MTc5NjA2NH0.h-DYFQHbPNjLMmHUuluGOkVMcvEDmE-B9NlZY-BCxbM';

// Supabase REST API helper
async function supabaseFetch(endpoint, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    },
    ...options
  });
  return response.json();
}

// Format number with thousand separator
function formatNumber(num) {
  return num.toLocaleString('id-ID');
}

// Get current date info
function getDateInfo() {
  const now = new Date();
  return {
    today: now.toISOString().split('T')[0], // YYYY-MM-DD
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear()
  };
}

// Check if visitor already counted in this session
function isNewVisit() {
  const lastVisit = sessionStorage.getItem('visitor_counted');
  if (!lastVisit) {
    sessionStorage.setItem('visitor_counted', 'true');
    return true;
  }
  return false;
}

// Main function to track and display visitor stats
async function trackVisitorStats() {
  try {
    // Fetch current stats
    const data = await supabaseFetch('visitor_stats?select=*');
    
    if (!data || data.length === 0) {
      console.error('No stats data found');
      return;
    }

    let stats = data[0];
    const dateInfo = getDateInfo();
    let needsUpdate = false;
    
    // Check if this is a new visit (not already counted in this session)
    const isNew = isNewVisit();

    // Check if day changed - reset today_count
    if (stats.today_date !== dateInfo.today) {
      stats.today_count = 0;
      stats.today_date = dateInfo.today;
      needsUpdate = true;
    }

    // Check if month changed - reset month_count
    if (stats.month_value !== dateInfo.month) {
      stats.month_count = 0;
      stats.month_value = dateInfo.month;
      needsUpdate = true;
    }

    // Check if year changed - reset year_count
    if (stats.year_value !== dateInfo.year) {
      stats.year_count = 0;
      stats.year_value = dateInfo.year;
      needsUpdate = true;
    }

    // Increment counters only if new visit
    if (isNew) {
      stats.total_count += 1;
      stats.today_count += 1;
      stats.month_count += 1;
      stats.year_count += 1;
      needsUpdate = true;
    }

    // Update database if needed
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

    // Display stats on page
    displayStats(stats);

  } catch (err) {
    console.error('Error tracking visitor:', err);
  }
}

// Display stats in the footer
function displayStats(stats) {
  const totalEl = document.getElementById('stat-total');
  const todayEl = document.getElementById('stat-today');
  const monthEl = document.getElementById('stat-month');
  const yearEl = document.getElementById('stat-year');

  if (totalEl) totalEl.textContent = formatNumber(stats.total_count);
  if (todayEl) todayEl.textContent = formatNumber(stats.today_count);
  if (monthEl) monthEl.textContent = formatNumber(stats.month_count);
  if (yearEl) yearEl.textContent = formatNumber(stats.year_count);
}

// Run on page load
document.addEventListener('DOMContentLoaded', trackVisitorStats);
