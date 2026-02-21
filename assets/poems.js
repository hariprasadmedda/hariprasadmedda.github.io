const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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
  document.body.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch (_) {
    // Ignore storage failures.
  }
  updateToggleUI(theme);
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {
    // Ignore storage read issues.
  }
  return prefersDark.matches ? 'dark' : 'light';
}

function handleThemeToggle() {
  const current = document.body.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function initThemeToggles() {
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  toggles.forEach((toggle) => {
    toggle.removeEventListener('click', handleThemeToggle);
    toggle.addEventListener('click', handleThemeToggle);
  });
  updateToggleUI(document.body.dataset.theme);
}

function showPoemsError(message) {
  const banner = document.getElementById('poems-error');
  if (!banner) return;
  banner.textContent = message;
  banner.classList.remove('hidden');
}

function getYouTubeVideoId(link) {
  if (!link) return '';

  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return url.pathname.slice(1);
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v') || '';
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || '';
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || '';
    }
  } catch (_) {
    return '';
  }

  return '';
}

function renderPoems(poems) {
  const container = document.getElementById('poems-list');
  if (!container) return;

  if (!Array.isArray(poems) || poems.length === 0) {
    container.innerHTML = '<p class="text-slate-400">No poems added yet.</p>';
    return;
  }

  container.innerHTML = poems.map((poem) => {
    const videoId = getYouTubeVideoId(poem.link);
    if (!videoId) {
      return `
        <article class="card p-5 space-y-3">
          <p class="text-sm text-rose-300">Invalid YouTube link</p>
          <h3 class="text-xl font-semibold">${poem.title || 'Untitled Poem'}</h3>
          <p class="text-slate-300 text-sm break-all">${poem.link || ''}</p>
        </article>
      `;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return `
      <article class="space-y-3">
        <h3 class="text-2xl font-semibold">${poem.title || 'Untitled Poem'}</h3>
        <div class="aspect-video rounded-lg overflow-hidden card">
          <iframe
            class="w-full h-full"
            src="${embedUrl}"
            title="${poem.title || 'YouTube poem'}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </article>
    `;
  }).join('');
}

async function loadPoems() {
  try {
    const response = await fetch('data/poem.json');
    if (!response.ok) throw new Error(`Failed to load poems: ${response.status}`);
    const data = await response.json();
    renderPoems(data);
  } catch (error) {
    console.error('Poem data load error', error);
    const isFileProtocol = window.location.protocol === 'file:';
    const hint = isFileProtocol
      ? ' Open this site with a local server (for example: python3 -m http.server).'
      : '';
    showPoemsError(`Poem data failed to load.${hint}`);
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
loadPoems();
