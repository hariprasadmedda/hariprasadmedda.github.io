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
  document.documentElement.dataset.theme = theme;
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
