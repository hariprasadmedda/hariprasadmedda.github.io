const tabButtons = document.querySelectorAll('.tab-button[data-target]');
const sections = document.querySelectorAll('.tab-section');

const themeToggles = document.querySelectorAll('[data-theme-toggle]');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const artGrid = document.getElementById('art-grid');
const categoryButtonsContainer = document.getElementById('category-buttons');
const locationInfo = document.getElementById('location-info');
let artData = [];
let currentCategory = 'all';
const ART_CATEGORIES = [
  'Mythology',
  'Photography',
  'Abstract',
  'Social awareness',
  'Commercial Art',
  'Portrait',
];

const literatureList = document.getElementById('literature-list');

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');

function renderLocationInfo(location) {
  if (!locationInfo || !location) return;
  locationInfo.innerHTML = '';

  const status = document.createElement('p');
  status.className = 'font-mono text-xs text-slate-400';
  status.textContent = location.status;

  const place = document.createElement('p');
  place.textContent = location.place;

  locationInfo.append(status, place);
}

function updateToggleUI(theme) {
  themeToggles.forEach((toggle) => {
    toggle.setAttribute('aria-pressed', theme === 'dark');
    toggle.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

    const icon = toggle.querySelector('.theme-toggle__icon');
    const label = toggle.querySelector('.theme-toggle__label');

    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  });
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch (_) {
    // ignore write errors (private mode)
  }
  updateToggleUI(theme);
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {
    // ignore read errors
  }
  return prefersDark.matches ? 'dark' : 'light';
}

function handleThemeToggle() {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function showTab(targetId) {
  if (!targetId) return;

  sections.forEach((section) => {
    section.classList.toggle('hidden', section.id !== targetId);
  });

  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.target === targetId;
    btn.classList.toggle('active', isActive);
    if (btn.classList.contains('nav-button')) {
      btn.classList.toggle('border-amber-300/60', isActive);
    }
  });

  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

tabButtons.forEach((button) => {
  button.addEventListener('click', () => showTab(button.dataset.target));
});

function getInitialTab() {
  const validIds = new Set([...sections].map((s) => s.id));
  const searchTab = new URLSearchParams(window.location.search).get('tab');
  const hashTab = window.location.hash ? window.location.hash.replace('#', '') : '';
  const preferred = searchTab || hashTab;

  if (preferred && validIds.has(preferred)) return preferred;
  if (validIds.has('art')) return 'art';
  return sections[0] ? sections[0].id : '';
}

function buildCategoryButtons() {
  const tabs = ['all', ...ART_CATEGORIES];
  categoryButtonsContainer.innerHTML = '';

  tabs.forEach((cat) => {
    const button = document.createElement('button');
    button.className = 'filter-button' + (cat === 'all' ? ' active' : '');
    button.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    button.dataset.category = cat;
    button.addEventListener('click', () => {
      currentCategory = cat;
      document.querySelectorAll('.filter-button').forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      renderArt();
    });
    categoryButtonsContainer.appendChild(button);
  });
}

function renderArt() {
  if (!artGrid) return;
  const filtered = currentCategory === 'all'
    ? artData
    : artData.filter((item) => item.category.toLowerCase() === currentCategory.toLowerCase());

  if (filtered.length === 0) {
    artGrid.innerHTML = '<p class="text-slate-400">No works in this category yet.</p>';
    return;
  }

  artGrid.innerHTML = filtered.map((item) => `
    <article class="card p-3 flex flex-col gap-3">
      <div class="relative overflow-hidden rounded-xl">
        <img src="${item.src}" alt="${item.alt}" class="w-full h-56" loading="lazy" data-title="${item.title}" data-desc="${item.description}" />
      </div>
      <div class="flex items-center justify-between text-sm text-slate-400">
        <span class="font-mono">${item.year}</span>
        <span class="px-3 py-1 rounded-full border border-slate-700/80 text-slate-200">${item.category}</span>
      </div>
      <div>
        <h3 class="text-lg font-semibold">${item.title}</h3>
        <p class="text-slate-300 text-sm">${item.description}</p>
      </div>
      <button class="self-start text-amber-200 hover:text-amber-100 text-sm" data-lightbox="true">View larger →</button>
    </article>
  `).join('');

  artGrid.querySelectorAll('article').forEach((card, index) => {
    const img = card.querySelector('img');
    const btn = card.querySelector('[data-lightbox]');
    const item = filtered[index];
    const open = () => openLightbox(item);
    img.addEventListener('click', open);
    btn.addEventListener('click', open);
  });
}

function renderLiterature(entries) {
  if (!literatureList) return;
  if (!entries.length) {
    literatureList.innerHTML = '<p class="text-slate-400">No literature entries yet.</p>';
    return;
  }

  literatureList.innerHTML = entries.map((item) => `
    <article class="card p-4 flex flex-col gap-2">
      <div class="flex items-center justify-between text-sm text-slate-400">
        <span class="font-mono">${item.year}</span>
        <span class="px-3 py-1 rounded-full border border-slate-700/80 text-slate-200">${item.type}</span>
      </div>
      <h3 class="text-xl font-semibold">${item.title}</h3>
      <p class="text-slate-300 text-sm">${item.summary}</p>
      ${item.link ? `<a class="text-amber-200 hover:text-amber-100 text-sm" href="${item.link}" target="_blank" rel="noreferrer">Read / Download →</a>` : ''}
    </article>
  `).join('');
}

function openLightbox(item) {
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxTitle.textContent = item.title;
  lightboxDesc.textContent = item.description;
  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
    closeLightbox();
  }
});

themeToggles.forEach((toggle) => {
  toggle.addEventListener('click', handleThemeToggle);
});

prefersDark.addEventListener('change', (event) => {
  const saved = (() => {
    try {
      return localStorage.getItem('theme');
    } catch (_) {
      return null;
    }
  })();

  if (!saved) {
    setTheme(event.matches ? 'dark' : 'light');
  }
});

async function loadArt() {
  try {
    const res = await fetch('data/art.json');
    if (!res.ok) throw new Error('Failed to load art');
    const data = await res.json();
    artData = data;
    renderArt();
  } catch (error) {
    artGrid.innerHTML = `<p class="text-rose-300">${error.message}</p>`;
  }
}

async function loadLiterature() {
  try {
    const res = await fetch('data/literature.json');
    if (!res.ok) throw new Error('Failed to load literature');
    const data = await res.json();
    renderLiterature(data);
  } catch (error) {
    literatureList.innerHTML = `<p class="text-rose-300">${error.message}</p>`;
  }
}

// Init
setTheme(getInitialTheme());
const initialTab = getInitialTab();
if (initialTab) showTab(initialTab);
buildCategoryButtons();
loadArt();
loadLiterature();
