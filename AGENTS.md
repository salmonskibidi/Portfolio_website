# AGENTS.md

Static personal portfolio website (Thai-language content). No build system, no framework, no tests.

## Structure

- `index.html` — the entire site (single page). Contains a hand-injected ASCII portrait inside `<pre class="portrait__ascii">` (generated from the photo; whitespace is significant, edit carefully). The portrait is tinted with the real photo via `background-clip: text` on the `<pre>` — removing that rule silently reverts it to amber-only text.
- `styles.css` — all styling, plain CSS.
- `script.js` — vanilla JS only: typing/ASCII reveal animation, portrait ASCII↔photo toggle. No frameworks, no build step.
- `tools/toascii.ps1` — PowerShell image→ASCII converter (source of truth for the portrait art). Regenerate and re-inject into `index.html`'s `<pre class="portrait__ascii">` after running; don't hand-edit the art.
- `1773750338475.jpg` — real profile photo, toggled over the ASCII portrait on click; also the source used to generate the ASCII art.
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
