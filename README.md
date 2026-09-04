# TheElephantCoder — Portfolio

Highly professional, non-AI-looking developer site with subtle 3D. Built as a static site for GitHub Pages.

## Stack
- Vanilla HTML / CSS / JS — no build step
- Three.js (via importmap) for the hero wireframe field — low-poly, muted, interactive
- Inter + Instrument Serif + Fragment Mono, warm dark palette, editorial grid

## Preview
```bash
# from this folder
python3 -m http.server 5173
# then open http://localhost:5173
```

## Deploy to theelephantcoder.github.io
This folder is designed to be published as-is. The target repo is `TheElephantCoder/theelephantcoder.github.io` (GitHub Pages serves from `main` root).

Option A — replace contents:
```bash
# clone your pages repo elsewhere
git clone https://github.com/TheElephantCoder/theelephantcoder.github.io /tmp/pages
rsync -av --delete ./ /tmp/pages/ --exclude .git --exclude README.md
cd /tmp/pages
git add .
git commit -m "refresh portfolio — 3D wireframe, editorial, no-hire"
git push
```

Option B — copy manually via Finder / drag.

## Structure
```
index.html  — single page, all sections
styles.css  — tokens, layout, responsive
scene.js    — Three.js wireframe (icosahedron + field + grid), drag + scroll parallax
app.js      — tilt, reveal, nav, smooth scroll
```

## Notes
- No "available for hire" language — site states "building in public, open to meaningful PRs & discussions, not actively seeking contract work"
- 3D is intentionally restrained: wireframe + particles, not glowing blobs, to avoid AI trope
- Colors: `#0A0A0B` bg, `#EDE9E3` text, `#EAB308` brass accent (used sparingly), grain at 4.5% opacity
- Responsive down to 360px, reduced-motion supported, no trackers / cookies

## Credits
Design & build for @TheElephantCoder. Type: Inter, Instrument Serif (Google Fonts), Fragment Mono.
