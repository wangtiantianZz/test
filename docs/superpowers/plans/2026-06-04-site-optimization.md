# Diary Site Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the static diary site's reliability, maintainability, accessibility, and publishing quality without changing its lightweight GitHub Pages architecture.

**Architecture:** Keep the site as static HTML, CSS, JavaScript, JSON, and local images. Prefer small, focused changes: shared utilities stay in `js/main.js`, page-specific behavior can be moved from inline scripts into page files only if the project owner wants cleaner separation.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, `data/diaries.json`, local HTTP testing with `python -m http.server`.

---

## Audit Summary

Verified on `2026-06-04` with a local HTTP server at `http://127.0.0.1:8765`.

Working now:
- Homepage loads `data/diaries.json` successfully over HTTP.
- JSON parses successfully.
- `js/main.js` passes `node --check`.
- Homepage search, empty result state, theme toggle, featured diary, and detail page rendering work.
- Browser console showed no errors or warnings during the checked flows.

Most valuable updates:
- Add a lightweight verification script so future diary edits do not silently break JSON, image paths, duplicate IDs, or dates.
- Fix project hygiene drift: `package.json`, `package-lock.json`, `node_modules`, and log files exist locally even though the repo documents no package manager.
- Improve date parsing to avoid `YYYY-MM-DD` timezone edge cases for visitors outside China.
- Improve accessibility around tag buttons, theme button state, and lightbox keyboard behavior.
- Improve publishing metadata and image delivery with `og:image`, canonical links, dimensions, and optional responsive image variants.

## File Map

- `index.html`: Homepage structure, inline homepage rendering and filtering script.
- `diary.html`: Detail page structure, inline detail rendering, table of contents, reading progress, sibling navigation.
- `js/main.js`: Shared data loading, date formatting, sorting, escaping, markdown parsing, theme, lightbox, back-to-top utilities.
- `css/style.css`: Full visual system, responsive layout, dark mode, cards, detail page, lightbox.
- `data/diaries.json`: Diary source of truth.
- `.gitignore`: Local-only dependency and log exclusions.
- `docs/superpowers/plans/2026-06-04-site-optimization.md`: This optimization plan.

## Task 1: Add Static Data Verification

**Files:**
- Create: `scripts/verify-data.mjs`
- Optionally document: `CLAUDE.md` and `AGENTS.md`

- [ ] **Step 1: Write the verification script**

Create `scripts/verify-data.mjs`:

```js
import { access, readFile } from 'node:fs/promises';

const diaryPath = new URL('../data/diaries.json', import.meta.url);
const root = new URL('../', import.meta.url);
const diaries = JSON.parse(await readFile(diaryPath, 'utf8'));
const ids = new Set();
const failures = [];

if (!Array.isArray(diaries)) failures.push('data/diaries.json must be an array');

for (const diary of Array.isArray(diaries) ? diaries : []) {
  if (!Number.isInteger(diary.id)) failures.push(`Invalid id: ${diary.id}`);
  if (ids.has(diary.id)) failures.push(`Duplicate id: ${diary.id}`);
  ids.add(diary.id);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(diary.date || '')) failures.push(`Invalid date for id ${diary.id}: ${diary.date}`);
  if (!diary.title) failures.push(`Missing title for id ${diary.id}`);
  if (!Array.isArray(diary.tags)) failures.push(`Missing tags array for id ${diary.id}`);
  if (!Array.isArray(diary.content)) failures.push(`Missing content array for id ${diary.id}`);

  const imagePaths = [diary.cover, ...(diary.content || []).filter(item => item.type === 'image').map(item => item.value)].filter(Boolean);
  for (const imagePath of imagePaths) {
    try {
      await access(new URL(imagePath, root));
    } catch {
      failures.push(`Missing image for id ${diary.id}: ${imagePath}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Verified ${diaries.length} diaries`);
```

- [ ] **Step 2: Run verification**

Run:

```bash
node scripts/verify-data.mjs
```

Expected:

```text
Verified 3 diaries
```

- [ ] **Step 3: Document the check**

Add this line to both local agent docs:

```markdown
- **数据校验**：编辑日记后运行 `node scripts/verify-data.mjs`，检查 JSON、重复 id、日期格式和图片路径。
```

## Task 2: Clean Local Project Hygiene

**Files:**
- Keep tracked: `.gitignore`
- Local-only cleanup candidates: `package.json`, `package-lock.json`, `node_modules/`, `debug.log`, `server*.log`

- [ ] **Step 1: Confirm ignored files are not tracked**

Run:

```bash
git ls-files package.json package-lock.json debug.log server.err.log server.log server.out.log
```

Expected: no output.

- [ ] **Step 2: Decide whether local package files are needed**

If the project remains no-build static HTML, remove local-only package files outside git tracking:

```powershell
Remove-Item -LiteralPath package.json, package-lock.json -Force
Remove-Item -LiteralPath node_modules -Recurse -Force
Remove-Item -LiteralPath debug.log, server.err.log, server.log, server.out.log -Force
```

If a future test runner is adopted, replace the current `package.json` dependencies with explicit scripts instead of keeping `npm` and `run` as runtime dependencies.

## Task 3: Make Dates Timezone-Safe

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Add a local date parser before `formatDate`**

```js
function parseLocalDate(dateStr) {
    const [year, month, day] = String(dateStr).split('-').map(Number);
    return new Date(year, month - 1, day);
}
```

- [ ] **Step 2: Use it in date helpers and sorting**

Change date construction in `getSortedDiaries`, `formatDate`, and `getRelativeTime` from `new Date(dateStr)` or `new Date(left.date)` to `parseLocalDate(...)`.

- [ ] **Step 3: Verify homepage and detail dates**

Run:

```bash
python -m http.server 8765
```

Open:

```text
http://127.0.0.1:8765/index.html
http://127.0.0.1:8765/diary.html?id=1
```

Expected: diary dates remain `2026年4月10日`, `2026年4月8日`, and `2026年4月5日`.

## Task 4: Improve Accessibility

**Files:**
- Modify: `index.html`
- Modify: `diary.html`
- Modify: `js/main.js`
- Modify: `css/style.css`

- [ ] **Step 1: Mark tag filter state**

In `renderTagList`, set `aria-pressed` when creating and toggling tag buttons:

```js
btn.setAttribute('aria-pressed', String(activeTag === tag));
```

When updating all tag buttons:

```js
document.querySelectorAll('.tag-btn').forEach(b => {
    const isActive = b.textContent === activeTag;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
});
```

- [ ] **Step 2: Sync theme button accessible state**

In `bindThemeToggle`, update `aria-pressed` inside `syncButtonText`:

```js
const isDark = document.body.classList.contains('dark-mode');
button.textContent = isDark ? '切换亮色' : '切换暗色';
button.setAttribute('aria-pressed', String(isDark));
```

- [ ] **Step 3: Add keyboard close for lightbox**

Inside `initLightbox`, extract close behavior and add Escape handling:

```js
const closeLightbox = () => {
    lb.classList.remove('active');
    setTimeout(() => { lb.style.display = 'none'; }, 250);
};

lb.addEventListener('click', closeLightbox);
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lb.classList.contains('active')) closeLightbox();
});
```

## Task 5: Improve Publishing Metadata

**Files:**
- Modify: `index.html`
- Modify: `diary.html`

- [ ] **Step 1: Add homepage canonical and preview image**

Add in `index.html` head:

```html
<link rel="canonical" href="https://wtt11.com/">
<meta property="og:image" content="https://wtt11.com/images/spring-03.jpg">
<meta name="twitter:card" content="summary_large_image">
```

- [ ] **Step 2: Decide detail sharing strategy**

Because diary detail pages are loaded by `?id=`, many social crawlers will not execute JavaScript and cannot see per-diary title/summary/image. Choose one:

- Keep the current query-based detail page and accept generic previews.
- Generate static detail pages later, one HTML file per diary, for accurate article previews.

## Task 6: Improve Image Performance

**Files:**
- Modify: `index.html`
- Modify: `diary.html`
- Modify: `data/diaries.json` only if adding responsive image metadata
- Optional create: optimized `.webp` or `.avif` files under `images/`

- [ ] **Step 1: Add image dimensions**

For each known local image, record width and height. Then render image tags with `width` and `height` attributes to reduce layout shift.

- [ ] **Step 2: Keep current lazy-loading behavior**

Homepage card images and diary content images already use `loading="lazy"`. Keep the featured image eager because it is first-viewport content.

- [ ] **Step 3: Add optional modern formats**

If image count grows, generate WebP copies and use `<picture>` for large featured/detail images. Keep original JPG as fallback.

## Task 7: Improve Maintainability When the Site Grows

**Files:**
- Optional create: `js/home.js`
- Optional create: `js/detail.js`
- Modify: `index.html`
- Modify: `diary.html`

- [ ] **Step 1: Move homepage inline script to `js/home.js`**

Move the homepage-specific functions from `index.html` into `js/home.js`, then load:

```html
<script src="js/main.js"></script>
<script src="js/home.js"></script>
```

- [ ] **Step 2: Move detail inline script to `js/detail.js`**

Move detail-specific functions from `diary.html` into `js/detail.js`, then load:

```html
<script src="js/main.js"></script>
<script src="js/detail.js"></script>
```

- [ ] **Step 3: Verify no behavior changed**

Run:

```bash
node --check js/main.js
node --check js/home.js
node --check js/detail.js
node scripts/verify-data.mjs
```

Then manually check:

```text
http://127.0.0.1:8765/index.html
http://127.0.0.1:8765/diary.html?id=1
```

Expected: homepage and detail page match current behavior.

## Recommended Order

1. Task 1: Add static data verification.
2. Task 3: Make dates timezone-safe.
3. Task 4: Improve accessibility.
4. Task 2: Clean local project hygiene.
5. Task 5 and Task 6: Improve publishing and image quality.
6. Task 7: Split inline scripts only when the diary site grows beyond a few pages.

## Self-Review

- Spec coverage: The plan covers reliability, maintainability, accessibility, publishing, image performance, and project hygiene.
- Placeholder scan: No unresolved placeholder language remains.
- Type consistency: Function names and file paths are consistent across tasks.
