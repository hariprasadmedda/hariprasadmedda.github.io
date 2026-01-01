// Load left navigation component
// This script runs with defer, so DOM is already ready
(async () => {
  const leftNavContainer = document.getElementById('left-nav-container');
  if (!leftNavContainer) return;

  try {
    const response = await fetch('components/left-nav.html');
    if (!response.ok) {
      throw new Error(`Failed to load nav: ${response.status}`);
    }
    const html = await response.text();
    leftNavContainer.innerHTML = html;

    // Set up navigation links based on current page
    const navLinksContainer = document.getElementById('left-nav-links');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navConfig = {
      'index.html': [
        { href: 'index.html', text: 'Biography', active: true },
        { href: 'songs.html', text: 'Songs', active: false }
      ],
      'home.html': [
        { href: 'home.html', text: 'Biography', active: true },
        { href: 'songs.html', text: 'Songs', active: false }
      ],
      'gallery.html': [
        { href: 'home.html', text: 'Biography', active: false },
        { href: 'songs.html', text: 'Songs', active: false }
      ],
      'songs.html': [
        { href: 'index.html', text: 'Biography', active: false },
        { href: 'songs.html', text: 'Songs', active: true }
      ]
    };

    const links = navConfig[currentPage] || navConfig['index.html'];
    
    navLinksContainer.innerHTML = links.map(link => {
      if (link.type === 'button') {
        return `<button class="tab-button nav-button${link.active ? ' active' : ''}" data-target="${link.target}">${link.text}</button>`;
      }
      return `<a class="tab-button nav-button${link.active ? ' active' : ''}" href="${link.href}">${link.text}</a>`;
    }).join('');

    // Dispatch event to notify that nav is loaded and theme toggle needs to be initialized
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
      console.log('Nav loaded, dispatching navLoaded event');
      window.dispatchEvent(new CustomEvent('navLoaded'));
    }, 0);

  } catch (error) {
    console.error('Error loading navigation:', error);
    // Still dispatch event so theme toggle can be initialized on existing elements
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navLoaded'));
    }, 0);
  }
})();
