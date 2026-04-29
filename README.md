# Heather by the Sea — Salon & Day Spa

Marketing site for **Heather by the Sea Salon and Day Spa** in Murrells Inlet, SC.

## Stack
Static HTML / CSS / vanilla JS. No build step.

## Local preview
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Structure
```
index.html      single-page site
styles.css      design tokens, layout, animations
script.js       header, reveals, gallery, lightbox
hero-bg.jpg     hero background
logo/           brand assets
gallery/        31 portfolio photos
netlify.toml    deploy + cache headers
```

## Deploy
Connected to Netlify — pushes to `main` deploy automatically. The publish directory is the repo root (configured in `netlify.toml`).

## Editing content
- **Services / hours / phone / address** — edit `index.html`
- **Colors / typography / spacing** — edit `:root` tokens at the top of `styles.css`
- **Add gallery photos** — drop `XX.jpg` into `gallery/` and bump `TOTAL` in `script.js`

## Booking
Booking links go to Square: <https://book.squareup.com/appointments/istk6r0shfi0od/location/LTY4BBBPAHTV2/services>
