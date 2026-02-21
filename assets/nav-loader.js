const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const leftNavConfig = {
  'index.html': [
    { href: 'index.html', text: 'Home', active: true },
    { href: 'gallery.html', text: 'Art Gallery', active: false },
    { href: 'videos.html', text: 'Videos', active: false },
    { href: 'poems.html', text: 'Poems', active: false },
    { href: 'songs.html', text: 'Songs', active: false }
  ],
  'home.html': [
    { href: 'home.html', text: 'Home', active: true },
    { href: 'gallery.html', text: 'Art Gallery', active: false },
    { href: 'videos.html', text: 'Videos', active: false },
    { href: 'poems.html', text: 'Poems', active: false },
    { href: 'songs.html', text: 'Songs', active: false }
  ],
  'gallery.html': [
    { href: 'home.html', text: 'Home', active: false },
    { href: 'gallery.html', text: 'Art Gallery', active: true },
    { href: 'videos.html', text: 'Videos', active: false },
    { href: 'poems.html', text: 'Poems', active: false },
    { href: 'songs.html', text: 'Songs', active: false }
  ],
  'videos.html': [
    { href: 'home.html', text: 'Home', active: false },
    { href: 'gallery.html', text: 'Art Gallery', active: false },
    { href: 'videos.html', text: 'Videos', active: true },
    { href: 'poems.html', text: 'Poems', active: false },
    { href: 'songs.html', text: 'Songs', active: false }
  ],
  'poems.html': [
    { href: 'home.html', text: 'Home', active: false },
    { href: 'gallery.html', text: 'Art Gallery', active: false },
    { href: 'videos.html', text: 'Videos', active: false },
    { href: 'poems.html', text: 'Poems', active: true },
    { href: 'songs.html', text: 'Songs', active: false }
  ],
  'songs.html': [
    { href: 'home.html', text: 'Home', active: false },
    { href: 'gallery.html', text: 'Art Gallery', active: false },
    { href: 'videos.html', text: 'Videos', active: false },
    { href: 'poems.html', text: 'Poems', active: false },
    { href: 'songs.html', text: 'Songs', active: true }
  ]
};

const mobileNavLinks = [
  { href: 'home.html', text: 'Home' },
  { href: 'gallery.html', text: 'Art Gallery' },
  { href: 'videos.html', text: 'Videos' },
  { href: 'poems.html', text: 'Poems' },
  { href: 'songs.html', text: 'Songs' }
];

const mobileActiveHrefByPage = {
  'index.html': 'home.html',
  'home.html': 'home.html',
  'gallery.html': 'gallery.html',
  'videos.html': 'videos.html',
  'poems.html': 'poems.html',
  'songs.html': 'songs.html'
};

async function loadLeftNav() {
  const leftNavContainer = document.getElementById('left-nav-container');
  if (!leftNavContainer) return;

  const response = await fetch('components/left-nav.html');
  if (!response.ok) {
    throw new Error(`Failed to load left nav: ${response.status}`);
  }

  leftNavContainer.innerHTML = await response.text();

  const navLinksContainer = document.getElementById('left-nav-links');
  if (!navLinksContainer) return;

  const links = leftNavConfig[currentPage] || leftNavConfig['index.html'];
  navLinksContainer.innerHTML = links
    .map((link) => `<a class="tab-button nav-button${link.active ? ' active' : ''}" href="${link.href}">${link.text}</a>`)
    .join('');
}

async function loadMobileTopNav() {
  const mobileTopContainer = document.getElementById('mobile-top-container');
  if (!mobileTopContainer) return;

  try {
    const response = await fetch('components/mobile-top-nav.html');
    if (!response.ok) {
      throw new Error(`Failed to load mobile top nav: ${response.status}`);
    }
    mobileTopContainer.innerHTML = await response.text();
  } catch (error) {
    // Fallback for fetch/file-protocol failures so mobile nav still appears in local previews.
    console.error('Error loading mobile top component, using fallback:', error);
    mobileTopContainer.innerHTML = `
      <header class="md:hidden fixed top-0 left-0 right-0 z-30 backdrop-blur themed-surface border-b border-slate-800">
        <div class="px-4 py-3 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <img
                src="data/img/sitting.jpg"
                alt="Hariprasad Medda sitting"
                class="h-10 w-10 rounded-full object-cover border border-slate-700/80"
              />
              <div class="min-w-0">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Artist</p>
                <h1 class="font-semibold text-base leading-tight truncate">Hariprasad Medda</h1>
              </div>
            </div>
            <button class="theme-toggle" type="button" data-theme-toggle aria-label="Toggle theme">
              <span class="theme-toggle__icon" aria-hidden="true">🌙</span>
              <span class="theme-toggle__label">Dark</span>
            </button>
          </div>
          <nav class="flex gap-2 overflow-x-auto whitespace-nowrap pb-1" aria-label="Primary" id="mobile-top-links"></nav>
        </div>
      </header>
    `;
  }

  const mobileLinksContainer = document.getElementById('mobile-top-links');
  if (!mobileLinksContainer) return;

  const activeHref = mobileActiveHrefByPage[currentPage] || '';
  mobileLinksContainer.innerHTML = mobileNavLinks
    .map((link) => {
      const activeClass = link.href === activeHref ? 'bg-slate-800/60' : 'bg-slate-800/40';
      return `<a class="tab-button shrink-0 px-3 py-2 rounded-md border border-slate-800 ${activeClass} text-sm" href="${link.href}">${link.text}</a>`;
    })
    .join('');
}

async function loadSharedNav() {
  const [leftResult, mobileResult] = await Promise.allSettled([loadLeftNav(), loadMobileTopNav()]);
  if (leftResult.status === 'rejected') {
    console.error('Error loading left nav:', leftResult.reason);
  }
  if (mobileResult.status === 'rejected') {
    console.error('Error loading mobile nav:', mobileResult.reason);
  }

  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('navLoaded'));
  }, 0);
}

loadSharedNav();
