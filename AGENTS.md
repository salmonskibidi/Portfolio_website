# AGENTS.md

Static personal portfolio website (Thai-language content). No build system, no framework, no tests.

## Structure

- `index.html` — the entire site (single page). Contains four hand-injected ASCII portraits inside `<pre class="portrait__ascii" data-art="n">` (one per photo; whitespace is significant, edit carefully). Each portrait is tinted with its real photo via `background-clip: text` rules in `styles.css` — removing those rules silently reverts to amber-only text. The numbered buttons switch photos; clicking the portrait toggles between ASCII art and the real photo in-frame.
- `styles.css` — all styling, plain CSS.
- `script.js` — vanilla JS only: typing/ASCII reveal animation, portrait ASCII↔photo toggle. No frameworks, no build step.
- `tools/toascii.ps1` — PowerShell image→ASCII converter (source of truth for the portrait art). Regenerate and re-inject into `index.html`'s `<pre class="portrait__ascii">` after running; don't hand-edit the art. WebP input must be converted first (e.g. via `ffmpeg -i 2.webp out.png`) — GDI+ cannot decode WebP. Always use `-Aspect 0.571` (the real monospace cell aspect) and NO `-Crop` — the owner wants each art to cover the full photo so it scales 1:1 with the real image. Portrait params per photo: 1.jpg `-Gamma 0.65`, 2.webp `-Gamma 0.65`, 3.webp `-Gamma 0.55`, 4.jpg `-Gamma 0.65`.
- `1.jpg`, `2.webp`, `3.webp`, `4.jpg` — the four profile photos, switchable via the numbered buttons; each full photo also serves as the tint behind its ASCII art (via `background-clip: text` rules in `styles.css`) and is shown in-frame on click.
- `assets/` — compressed certificate images (`nsc-cert-cat1.jpg`, `nsc-cert-cat2.jpg`) shown as thumbnails in the works section; originals live in `D:\Portfolio\NSC 2026`. Regenerate via `ffmpeg -i in.jpg -vf "scale=700:-2" -q:v 5 out.jpg`.
- `.opencode/` — OpenCode config/skills only (its own `node_modules`, not project code).

## Conventions

- No `package.json` at repo root — there are no npm scripts, lint, typecheck, or test commands. Do not invent or run any.
- Verify changes by opening `index.html` directly in a browser or serving the folder (e.g. `python -m http.server`).
- Page content is in English (owner switched from Thai); the owner's name is Phattarakit Chalermpun. Do not reintroduce terminal-command styling (`$`, `cat`, `-rw-r--r--`) — owner rejected it; use decorative `!@#$%^&*` characters instead.
- Asset filenames (like the profile photo) are hardcoded in `index.html`; if renaming an image, update the `src` reference in the same change.
- `.gitattributes` enforces LF normalization (`* text=auto`); don't add CRLF-only files.

## Workflow

- Direct push to `main` is the current flow (single-initial-commit repo, no PR/branch conventions established).
- When adding sections to the page (e.g. the in-progress "Achivement" section), follow the existing pattern: plain HTML in `index.html` + class-based rules in `styles.css`.
