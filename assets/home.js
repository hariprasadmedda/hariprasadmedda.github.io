const themeToggles = document.querySelectorAll('[data-theme-toggle]');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

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
    // ignore storage failures
  }
  updateToggleUI(theme);
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {
    // ignore storage read issues
  }
  return prefersDark.matches ? 'dark' : 'light';
}

function handleThemeToggle() {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

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

setTheme(getInitialTheme());

const aboutCardsContainer = document.getElementById('about-cards');
const statementCardsContainer = document.getElementById('statement-cards');
const biographySummaryCard = document.getElementById('biography-summary');
const highlightCardsContainer = document.getElementById('highlight-cards');
const tileLabelsContainer = document.getElementById('tile-labels');
const introDescription = document.getElementById('intro-description');
const locationInfo = document.getElementById('location-info');

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

function createSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function createParagraphElements(paragraphs) {
  return paragraphs.map((text) => {
    const p = document.createElement('p');
    p.className = 'text-slate-300 text-sm leading-relaxed';
    p.textContent = text;
    return p;
  });
}

function renderAboutCards(cards) {
  if (!aboutCardsContainer) return;
  aboutCardsContainer.innerHTML = '';

  cards.forEach((card) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card p-5 space-y-3';
    wrapper.id = 'card-' + createSlug(card.title);
    if (card.span === 2) wrapper.classList.add('lg:col-span-2');

    const title = document.createElement('h3');
    title.className = 'text-xl font-semibold';
    title.textContent = card.title;
    wrapper.appendChild(title);

    createParagraphElements(card.paragraphs).forEach((p) => wrapper.appendChild(p));
    aboutCardsContainer.appendChild(wrapper);
  });
}

function renderStatementCards(cards) {
  if (!statementCardsContainer) return;
  statementCardsContainer.innerHTML = '';

  cards.forEach((card) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card p-5 space-y-3';

    const label = document.createElement('p');
    label.className = 'font-mono text-xs text-slate-400';
    label.textContent = card.label;

    const title = document.createElement('h3');
    title.className = 'text-xl font-semibold';
    title.textContent = card.title;

    const body = document.createElement('p');
    body.className = 'text-slate-300 leading-relaxed text-sm';
    body.textContent = card.body;

    wrapper.append(label, title, body);
    statementCardsContainer.appendChild(wrapper);
  });
}

function renderBiographySummary(summary) {
  if (!biographySummaryCard) return;
  biographySummaryCard.innerHTML = '';

  const body = document.createElement('p');
  body.className = 'text-slate-300 text-sm leading-relaxed';
  body.textContent = summary.body;

  const list = document.createElement('ul');
  list.className = 'text-sm text-slate-300 space-y-2';

  summary.items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `• ${item}`;
    list.appendChild(li);
  });

  biographySummaryCard.append(body, list);
}

function renderHighlightCards(cards) {
  if (!highlightCardsContainer) return;
  highlightCardsContainer.innerHTML = '';

  cards.forEach((card) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'card p-4 space-y-2';

    const label = document.createElement('p');
    label.className = 'font-mono text-xs text-slate-400';
    label.textContent = card.label;

    const text = document.createElement('p');
    text.className = 'text-sm text-slate-300';
    text.textContent = card.text;

    wrapper.append(label, text);
    highlightCardsContainer.appendChild(wrapper);
  });
}

function renderTileLabels(cards) {
  if (!tileLabelsContainer) return;
  tileLabelsContainer.innerHTML = '';

  cards.forEach((card) => {
    const badge = document.createElement('a');
    badge.className = 'badge cursor-pointer hover:opacity-80 transition-opacity';
    badge.textContent = card.title;
    badge.href = '#card-' + createSlug(card.title);
    badge.onclick = (e) => {
      e.preventDefault();
      const target = document.getElementById('card-' + createSlug(card.title));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    tileLabelsContainer.appendChild(badge);
  });
}

async function loadBiographyData() {
  try {
    const response = await fetch('data/biography.json');
    if (!response.ok) throw new Error(`Failed to load biography data: ${response.status}`);

    const data = await response.json();
    if (introDescription && data.introDescription) {
      introDescription.textContent = data.introDescription;
    }
    if (data.location) renderLocationInfo(data.location);
    renderAboutCards(data.aboutCards || []);
    renderStatementCards(data.statementCards || []);
    if (data.biographySummary) renderBiographySummary(data.biographySummary);
    renderHighlightCards(data.highlightCards || []);
    renderTileLabels(data.aboutCards || []);
  } catch (error) {
    console.error('Biography data load error', error);
  }
}

loadBiographyData();
