# Art Portfolio (GitHub Pages)

Single-page portfolio with a left rail nav (Home, Art, Literature), Tailwind via CDN, and JSON-driven content.

## Run locally
- Open `index.html` in a browser (or `python -m http.server` for local fetch of JSON).

## Deploy on GitHub Pages
- Push to `main` (or set Pages to serve from `/` of this repo). `index.html` works with CDN Tailwind.

## Update artist details
- Edit name/contact in the left rail and hero copy in `index.html`.

## Art categories (fixed tabs)
- Tabs: Mythology, Photography, Abstract, Social awareness, Commercial Art, Portrait (plus All).
- Data source: `data/art.json` entries: `{ "title", "category", "src", "alt", "description", "year" }`.
- Add images: host remotely (HTTPS) or place files under `assets/images/…` and reference relative paths.

## Literature entries
- Data source: `data/literature.json` entries: `{ "title", "type", "year", "summary", "link" }` (link optional).

## Lightbox & filters
- Category buttons filter the grid; lightbox opens on click/tap of an artwork card or its button.

## Styling
- Tailwind CDN + custom accents in `assets/styles.css` (noise/gradient background, cards, buttons).

## Accessibility quick checks
- Keep `alt` text meaningful in `data/art.json`.
- Ensure contrast when changing colors; tab nav buttons are focusable.
