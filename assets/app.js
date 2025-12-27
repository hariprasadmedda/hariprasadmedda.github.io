const tabButtons = document.querySelectorAll('.tab-button');
const sections = document.querySelectorAll('.tab-section');

const artGrid = document.getElementById('art-grid');
const categoryButtonsContainer = document.getElementById('category-buttons');
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

function showTab(targetId) {
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
showTab('home');
buildCategoryButtons();
loadArt();
loadLiterature();
