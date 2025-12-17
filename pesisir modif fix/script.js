/**
 * Pesisir Barat Website - Core JavaScript
 * Handles: Data loading, Carousel, Pagination, Gallery, Search
 */

// =============================================================================
// DATA MANAGER - Load JSON data
// =============================================================================
const DataManager = {
  cache: {},

  async load(type) {
    if (this.cache[type]) return this.cache[type];

    try {
      const response = await fetch(`data/${type}.json`);
      if (!response.ok) throw new Error(`Failed to load ${type}.json`);
      const data = await response.json();
      this.cache[type] = data;
      return data;
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
      return [];
    }
  },

  async getById(type, id) {
    const data = await this.load(type);
    // Compare as both string and number to handle mismatches
    return data.find(item => String(item.id) === String(id));
  },

  async getByKategori(type, kategori) {
    const data = await this.load(type);
    return data.filter((item) => item.kategori === kategori);
  },

  async search(types, query) {
    const results = [];
    const q = query.toLowerCase().trim();

    for (const type of types) {
      const data = await this.load(type);
      const matches = data.filter((item) => {
        const searchFields = [
          item.judul,
          item.nama,
          item.ringkasan,
          item.deskripsi,
          item.konten,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchFields.includes(q);
      });

      matches.forEach((item) => {
        results.push({ ...item, _type: type });
      });
    }

    return results;
  },
};

// =============================================================================
// CAROUSEL - Auto-swipe with manual controls
// =============================================================================
class Carousel {
  constructor(container, options = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container) return;

    this.track = this.container.querySelector(".carousel-track");
    this.btnPrev = this.container.querySelector(".btn-prev");
    this.btnNext = this.container.querySelector(".btn-next");
    this.dots = this.container.querySelector(".carousel-dots");

    this.options = {
      autoPlay: options.autoPlay ?? true,
      interval: options.interval ?? 5000,
      scrollAmount: options.scrollAmount ?? null, // null = scroll by one card
    };

    this.autoPlayTimer = null;
    this.init();
  }

  init() {
    if (!this.track) return;

    // Manual controls
    if (this.btnNext) {
      this.btnNext.addEventListener("click", () => {
        this.next();
        this.resetAutoPlay();
      });
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener("click", () => {
        this.prev();
        this.resetAutoPlay();
      });
    }

    // Touch/swipe support
    let startX = 0;
    this.track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    this.track.addEventListener("touchend", (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
        this.resetAutoPlay();
      }
    });

    // Start autoplay
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }

    // Pause on hover
    this.container.addEventListener("mouseenter", () => this.stopAutoPlay());
    this.container.addEventListener("mouseleave", () => {
      if (this.options.autoPlay) this.startAutoPlay();
    });
  }

  getScrollAmount() {
    if (this.options.scrollAmount) return this.options.scrollAmount;
    const card = this.track.querySelector(".event-card, .carousel-card");
    return card ? card.offsetWidth + 20 : 300;
  }

  next() {
    const amount = this.getScrollAmount();
    const maxScroll = this.track.scrollWidth - this.track.clientWidth;

    if (this.track.scrollLeft >= maxScroll - 10) {
      this.track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      this.track.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  prev() {
    const amount = this.getScrollAmount();

    if (this.track.scrollLeft <= 10) {
      this.track.scrollTo({
        left: this.track.scrollWidth - this.track.clientWidth,
        behavior: "smooth",
      });
    } else {
      this.track.scrollBy({ left: -amount, behavior: "smooth" });
    }
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => this.next(), this.options.interval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetAutoPlay() {
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }
}

// =============================================================================
// PAGINATION - Client-side pagination
// =============================================================================
class Pagination {
  constructor(options) {
    this.container = document.querySelector(options.container);
    this.itemsPerPage = options.itemsPerPage || 6;
    this.currentPage = 1;
    this.data = [];
    this.renderItem = options.renderItem;
    this.paginationContainer = document.querySelector(
      options.paginationContainer
    );
  }

  setData(data) {
    this.data = data;
    this.currentPage = 1;
    this.render();
  }

  render() {
    if (!this.container) return;

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageData = this.data.slice(start, end);

    this.container.innerHTML = pageData.map(this.renderItem).join("");
    this.renderPagination();
  }

  renderPagination() {
    if (!this.paginationContainer) return;

    const totalPages = Math.ceil(this.data.length / this.itemsPerPage);
    if (totalPages <= 1) {
      this.paginationContainer.innerHTML = "";
      return;
    }

    let html = '<div class="pagination">';

    // Previous button
    html += `<button class="page-btn ${
      this.currentPage === 1 ? "disabled" : ""
    }" 
             data-page="${this.currentPage - 1}" ${
      this.currentPage === 1 ? "disabled" : ""
    }>‹</button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        html += `<button class="page-btn ${
          i === this.currentPage ? "active" : ""
        }" data-page="${i}">${i}</button>`;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += '<span class="page-dots">...</span>';
      }
    }

    // Next button
    html += `<button class="page-btn ${
      this.currentPage === totalPages ? "disabled" : ""
    }" 
             data-page="${this.currentPage + 1}" ${
      this.currentPage === totalPages ? "disabled" : ""
    }>›</button>`;

    html += "</div>";
    this.paginationContainer.innerHTML = html;

    // Add click handlers
    this.paginationContainer
      .querySelectorAll(".page-btn:not(.disabled)")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.currentPage = parseInt(btn.dataset.page);
          this.render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
  }
}

// =============================================================================
// GALLERY / LIGHTBOX - Image gallery with swipe
// =============================================================================
class Gallery {
  constructor() {
    this.overlay = null;
    this.currentIndex = 0;
    this.images = [];
    this.createOverlay();
  }

  createOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.className = "lightbox-overlay";
    this.overlay.innerHTML = `
      <button class="lightbox-close">&times;</button>
      <button class="lightbox-prev">‹</button>
      <div class="lightbox-content">
        <img src="" alt="" class="lightbox-image">
      </div>
      <button class="lightbox-next">›</button>
      <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(this.overlay);

    // Event listeners
    this.overlay
      .querySelector(".lightbox-close")
      .addEventListener("click", () => this.close());
    this.overlay
      .querySelector(".lightbox-prev")
      .addEventListener("click", () => this.prev());
    this.overlay
      .querySelector(".lightbox-next")
      .addEventListener("click", () => this.next());
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!this.overlay.classList.contains("active")) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
    });

    // Touch support
    let startX = 0;
    const content = this.overlay.querySelector(".lightbox-content");
    content.addEventListener(
      "touchstart",
      (e) => (startX = e.touches[0].clientX)
    );
    content.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.next() : this.prev();
      }
    });
  }

  open(images, startIndex = 0) {
    this.images = images;
    this.currentIndex = startIndex;
    this.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    this.updateImage();
  }

  close() {
    this.overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }

  updateImage() {
    const img = this.overlay.querySelector(".lightbox-image");
    img.src = this.images[this.currentIndex];
    this.overlay.querySelector(".lightbox-counter").textContent = `${
      this.currentIndex + 1
    } / ${this.images.length}`;
  }
}

// =============================================================================
// SEARCH - Search across berita, informasi, pariwisata, event
// =============================================================================
class Search {
  constructor(options) {
    this.input = document.querySelector(options.inputSelector);
    this.button = document.querySelector(options.buttonSelector);
    this.resultsContainer = document.querySelector(options.resultsSelector);
    this.searchTypes = options.types || [
      "berita",
      "informasi",
      "wisata",
      "event",
    ];

    this.init();
  }

  init() {
    if (this.button && this.input) {
      this.button.addEventListener("click", () => this.performSearch());
      this.input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.performSearch();
      });
    }
  }

  async performSearch() {
    const query = this.input.value.trim();
    if (!query) {
      alert("Masukkan kata kunci pencarian.");
      return;
    }

    const results = await DataManager.search(this.searchTypes, query);

    if (this.resultsContainer) {
      this.displayResults(results, query);
    } else {
      // Redirect to search results page
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  }

  displayResults(results, query) {
    if (!this.resultsContainer) return;

    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="no-results">
          <p>Tidak ditemukan hasil untuk "<strong>${query}</strong>"</p>
        </div>
      `;
      return;
    }

    const html = results
      .map((item) => {
        const title = item.judul || item.nama;
        const desc =
          item.ringkasan || item.deskripsi?.substring(0, 150) + "...";
        const type = item._type;
        const detailPage =
          type === "wisata" ? "detail-wisata.html" : `detail-${type}.html`;

        return `
        <div class="search-result-item">
          <span class="result-type">${type.toUpperCase()}</span>
          <h3><a href="${detailPage}?id=${item.id}">${title}</a></h3>
          <p>${desc}</p>
        </div>
      `;
      })
      .join("");

    this.resultsContainer.innerHTML = `
      <h2>Hasil pencarian untuk "${query}" (${results.length} ditemukan)</h2>
      ${html}
    `;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateLong(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// =============================================================================
// INITIALIZE ON DOM READY
// =============================================================================
document.addEventListener("DOMContentLoaded", function () {
  // Set year in footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initialize carousel if exists
  const carouselWrapper = document.querySelector(".carousel-wrapper");
  if (carouselWrapper) {
    new Carousel(carouselWrapper, { autoPlay: true, interval: 5000 });
  }

  // Initialize gallery
  window.gallery = new Gallery();

  // Setup gallery triggers
  document.querySelectorAll("[data-gallery]").forEach((el) => {
    el.addEventListener("click", function () {
      const images = JSON.parse(this.dataset.gallery);
      const index = parseInt(this.dataset.index) || 0;
      window.gallery.open(images, index);
    });
  });

  // Hamburger menu
  const hamburger = document.getElementById("hamburgerBtn");
  const mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // Initialize global search on any page with search input
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  if (searchInput && searchBtn) {
    new Search({
      inputSelector: "#searchInput",
      buttonSelector: "#searchBtn",
      resultsSelector: null // Will redirect to search.html
    });
  }
});

// Export for use in other scripts
window.DataManager = DataManager;
window.Carousel = Carousel;
window.Pagination = Pagination;
window.Gallery = Gallery;
window.Search = Search;
window.getUrlParam = getUrlParam;
window.formatDate = formatDate;
window.formatDateLong = formatDateLong;
