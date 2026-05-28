# Mobile-Friendly Articles

**Date:** 2026-05-27
**Status:** Approved

## Problem

Blog article pages have three mobile pain points identified by the user on a real phone:

1. **Tables overflow** — inline `<table>` elements in MDX articles spill past the screen edge on narrow viewports (≤375px).
2. **Content is cramped** — `.prose` has only `padding: 0 0.5rem` (8px each side) on mobile, leaving almost no breathing room.
3. **Images don't fit well** — figures using inline `max-width:480px` can misbehave on mobile; figcaptions lack proper centering.

## Approach: CSS fixes + JS table wrapper

All changes land in `src/layouts/BlogPost.astro` only. No MDX content files are touched. A small inline `<script>` block auto-wraps every `<table>` inside `.prose` with a scroll container at runtime, so future articles get the fix for free.

## Architecture

### Files changed

- `src/layouts/BlogPost.astro` — add responsive CSS rules and one `<script>` block

### No files changed

- `src/styles/global.css` — no changes needed; existing `img { max-width: 100% }` rule is already correct for images outside `.prose`
- `src/content/blog/*.mdx` — not touched; JS wrapper handles tables automatically

## Design Details

### 1. Prose padding (mobile)

Add a `@media (max-width: 720px)` rule inside the existing `<style>` block in `BlogPost.astro`:

```css
@media (max-width: 720px) {
  .prose {
    padding: 0 1.25rem; /* was 0 0.5rem — gives 20px breathing room each side */
  }
  .title {
    padding: 1.5rem 0 1rem; /* was 2rem 0 1.5rem — slightly tighter on small screens */
  }
}
```

### 2. Table scroll wrapper (CSS + JS)

Add CSS for the wrapper class:

```css
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1.25rem 0;
  border-radius: 4px;
}
.table-scroll > table {
  margin: 0 !important;
  min-width: 320px;
}
```

Add a `<script>` block in `BlogPost.astro` that wraps all prose tables at runtime:

```js
document.querySelectorAll('.prose table').forEach((table) => {
  if (table.parentElement.classList.contains('table-scroll')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';
  table.parentNode.insertBefore(wrapper, table);
  wrapper.appendChild(table);
});
```

### 3. Figure and image handling (mobile)

Add to the `@media (max-width: 720px)` block:

```css
.prose figure {
  margin: 1.25rem 0;
  text-align: center;
}
.prose figure img {
  max-width: 100% !important; /* overrides inline max-width:480px in MDX */
  width: 100%;
  height: auto;
}
.prose figure figcaption {
  text-align: center;
  line-height: 1.4;
}
```

## Success Criteria

- On a 375px-wide phone, article text has at least 20px side padding
- Tables that are wider than the viewport scroll horizontally instead of overflowing
- Figure images fill the available width and are centered
- No MDX content files modified
- Change is invisible on desktop (≥721px)
