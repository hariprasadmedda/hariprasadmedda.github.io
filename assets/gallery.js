const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const galleryStatus = document.getElementById('gallery-status');
const gallerySections = document.getElementById('gallery-sections');
const galleryError = document.getElementById('gallery-error');
const galleryEmpty = document.getElementById('gallery-empty');
const locationInfo = document.getElementById('location-info');

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');

const GALLERY_DATA_PATH = 'data/gallery.json';

function updateToggleUI(theme) {
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  toggles.forEach((toggle) => {
    toggle.setAttribute('aria-pressed', theme === 'dark');
    toggle.title = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

    const icon = toggle.querySelector('.theme-toggle__icon');
    const label = toggle.querySelector('.theme-toggle__label');

    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch (_) {
    // ignore storage failures
  }
  updateToggleUI(theme);
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {
    // ignore read failures
  }
  return prefersDark.matches ? 'dark' : 'light';
}

function handleThemeToggle() {
  const current = document.body.dataset.theme;
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function initThemeToggles() {
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  toggles.forEach((toggle) => {
    toggle.removeEventListener('click', handleThemeToggle);
    toggle.addEventListener('click', handleThemeToggle);
  });
  updateToggleUI(document.body.dataset.theme);
}

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

async function loadLocationInfo() {
  try {
    const response = await fetch('data/biography.json');
    if (!response.ok) return;
    const data = await response.json();
    if (data.location) renderLocationInfo(data.location);
  } catch (_) {
    // ignore location failures
  }
}

function toTitleCase(text) {
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createImageCard(folderName, image) {
  const card = document.createElement('article');
  card.className = 'card p-3 flex flex-col gap-3';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'relative overflow-hidden rounded-xl';

  const img = document.createElement('img');
  img.src = image.src;
  img.alt = `${folderName} - ${image.name}`;
  img.loading = 'lazy';
  img.className = 'w-full h-56 object-cover cursor-zoom-in';

  imageWrap.appendChild(img);

  const title = document.createElement('h4');
  title.className = 'text-sm text-slate-300 break-all';
  title.textContent = image.name;

  card.append(imageWrap, title);

  const open = () => openLightbox({
    src: image.src,
    alt: `${folderName} - ${image.name}`,
    title: `${folderName}`,
    description: image.name,
  });

  img.addEventListener('click', open);

  return card;
}

function renderFolderSection(folderName, files) {
  const section = document.createElement('section');
  section.className = 'space-y-4';

  const header = document.createElement('div');
  header.className = 'flex items-end justify-between gap-3';

  const title = document.createElement('h3');
  title.className = 'text-2xl font-semibold';
  title.textContent = folderName;

  const count = document.createElement('p');
  count.className = 'text-sm text-slate-400';
  count.textContent = `${files.length} photos`;

  header.append(title, count);

  const grid = document.createElement('div');
  grid.className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

  files.forEach((image) => {
    grid.appendChild(createImageCard(folderName, image));
  });

  section.append(header, grid);
  return section;
}

function openLightbox(item) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDesc) return;
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxTitle.textContent = item.title;
  lightboxDesc.textContent = item.description;
  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
}

function initLightbox() {
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });
}

async function loadArtGallery() {
  if (!gallerySections || !galleryStatus) return;

  galleryStatus.classList.remove('hidden');
  galleryError.classList.add('hidden');
  galleryEmpty.classList.add('hidden');
  gallerySections.innerHTML = '';

  try {
    const response = await fetch(GALLERY_DATA_PATH);
    if (!response.ok) {
      throw new Error(`Gallery data load failed (${response.status})`);
    }
    const folders = await response.json();
    if (!Array.isArray(folders)) {
      throw new Error('Invalid gallery data format');
    }

    if (!folders.length) {
      galleryStatus.classList.add('hidden');
      galleryEmpty.classList.remove('hidden');
      return;
    }

    for (const folder of folders) {
      if (!folder || typeof folder.folder !== 'string' || !Array.isArray(folder.images)) {
        continue;
      }
      const imageFiles = folder.images
        .filter((image) => image && typeof image.src === 'string' && typeof image.name === 'string')
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      if (!imageFiles.length) continue;

      const heading = toTitleCase(folder.folder);
      const section = renderFolderSection(heading, imageFiles);
      gallerySections.appendChild(section);
    }

    galleryStatus.classList.add('hidden');

    if (!gallerySections.children.length) {
      galleryEmpty.classList.remove('hidden');
    }
  } catch (error) {
    galleryStatus.classList.add('hidden');
    galleryError.classList.remove('hidden');
    galleryError.textContent = `Could not load gallery data. ${error.message}`;
  }
}

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

window.addEventListener('navLoaded', initThemeToggles);

setTheme(getInitialTheme());
initThemeToggles();
document.body.dataset.themeReady = "true";
initLightbox();
loadLocationInfo();
loadArtGallery();
