# Tech Blog Design Spec

**Date:** 2026-05-27  
**Status:** Approved

## Goal

A personal tech blog hosted on GitHub Pages to showcase work — articles, project showcases, and experiment logs. AI is the primary content author; the owner pastes AI-generated content into files and pushes to GitHub.

## Requirements

- Native SVG and raw HTML rendering in posts (AI produces diagrams as code)
- Simple paste-and-push publishing workflow — no CMS, no web UI
- GitHub Pages hosting
- Mix of content types: articles, showcases, experiments
- Minimal design — readable and functional, not fancy

## Framework

**Astro** (static site generator), starting from the official blog starter template.

- MDX content files render raw HTML and SVG inline with no configuration
- Zero JavaScript shipped to the browser by default
- GitHub Actions deployment is officially documented and maintained
- Blog starter handles typography, code blocks, and mobile layout out of the box

## Architecture

Static site. No server, no database, no CMS. All content is `.mdx` files in the repo. Build runs in GitHub Actions on every push to `main` and deploys to GitHub Pages.

## Content Model

All posts live in `src/content/blog/` as `.mdx` files.

**Frontmatter schema:**

```yaml
---
title: "Post Title"
date: YYYY-MM-DD
description: "Short summary shown in post listings"
type: "article"      # article | showcase | experiment
tags: ["tag1", "tag2"]
---
```

The `type` field drives filtering on the index page. Tags are optional but recommended.

**Post body:** Standard Markdown prose. Raw HTML and SVG blocks drop in as-is — no wrappers or escape sequences needed.

## Project Structure

```
mrjoema-techblog/
├── .github/
│   └── workflows/
│       └── deploy.yml           # build and deploy on push to main
├── src/
│   ├── content/
│   │   └── blog/                # all posts as .mdx files
│   ├── layouts/
│   │   └── BlogPost.astro       # single post template
│   └── pages/
│       ├── index.astro          # home page — post list with type filter
│       └── blog/
│           └── [...slug].astro  # dynamic post routes
├── public/                      # static assets (favicon, og image, etc)
├── astro.config.mjs
└── package.json
```

## Deployment

1. Create GitHub repo (`mrjoema-techblog`)
2. Add `.github/workflows/deploy.yml` using Astro's official Actions workflow
3. Enable GitHub Pages in repo settings → source: GitHub Actions
4. Every `git push` to `main` triggers build and deploy automatically

Default URL: `https://<username>.github.io/mrjoema-techblog`  
Custom domain: configurable via `public/CNAME` and repo settings.

## Styling

Astro blog starter theme — minimal, no modifications needed upfront. Handles:
- Readable typography
- Syntax-highlighted code blocks
- Mobile-responsive layout
- Dark/light mode (starter includes this by default)

One addition to the starter: type filter tabs (`All | Article | Showcase | Experiment`) on the index page.

## Publishing Workflow

1. Ask AI to write a post in MDX format with any SVG/HTML diagrams inline
2. Save output to `src/content/blog/YYYY-MM-DD-post-slug.mdx`
3. `git add`, `git commit`, `git push`
4. GitHub Actions builds and deploys — live in ~1 minute

## Out of Scope

- Comments system
- Search
- Newsletter/RSS (Astro starter includes RSS by default — keep it)
- Analytics (can add later with one script tag)
- Authentication or private posts
