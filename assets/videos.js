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

function showVideosError(message) {
  const banner = document.getElementById('videos-error');
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

function renderVideos(videos) {
  const container = document.getElementById('videos-list');
  if (!container) return;

  if (!Array.isArray(videos) || videos.length === 0) {
    container.innerHTML = '<p class="text-slate-400">No videos added yet.</p>';
    return;
  }

  container.innerHTML = videos.map((video) => {
    const videoId = getYouTubeVideoId(video.link);
    if (!videoId) {
      return `
        <article class="card p-5 space-y-3">
          <p class="text-sm text-rose-300">Invalid YouTube link</p>
          <h3 class="text-xl font-semibold">${video.title || 'Untitled Video'}</h3>
          <p class="text-slate-300 text-sm break-all">${video.link || ''}</p>
        </article>
      `;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return `
      <article class="space-y-3">
        <h3 class="text-2xl font-semibold">${video.title || 'Untitled Video'}</h3>
        <div class="aspect-video rounded-lg overflow-hidden card">
          <iframe
            class="w-full h-full"
            src="${embedUrl}"
            title="${video.title || 'YouTube video'}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </article>
    `;
  }).join('');
}

async function loadVideos() {
  try {
    const response = await fetch('data/video.json');
    if (!response.ok) throw new Error(`Failed to load videos: ${response.status}`);
    const data = await response.json();
    renderVideos(data);
  } catch (error) {
    console.error('Video data load error', error);
    const isFileProtocol = window.location.protocol === 'file:';
    const hint = isFileProtocol
      ? ' Open this site with a local server (for example: python3 -m http.server).'
      : '';
    showVideosError(`Video data failed to load.${hint}`);
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
loadVideos();
