# Repository Guidelines

## Project Structure & Module Organization
This repository builds a small Antora-based site. Content lives under `modules/ROOT/pages/`, with blog posts in `modules/ROOT/pages/posts/` and shared images in `modules/ROOT/assets/images/`. Site metadata is defined in `antora.yml` and `antora-playbook.yml`. Custom Antora behavior lives in `posts-extension.js`. Generated output is written to `public/`; treat that directory as build output, not source. The `workspace/` directory contains article-specific demo material and supporting examples.

## Build, Test, and Development Commands
Install dependencies with `npm install` and toolchain binaries with `mise install`.

- `mise run build`: builds the site with Antora into `public/`, refetching the UI bundle and failing on Antora warnings. `npm run build` delegates to it.
- `mise run sync-ui` (alias `mise ui`): downloads the UI extension files for the playbook's UI release and records the bundle version, so the next build picks up UI changes.
- `mise run dev`: runs `sync-ui`, then watches content changes, rebuilds, and serves the site.
- `mise run serve`: serves `public/` locally on port `5959`.
- `mise run clean`: removes `public/` so the next build starts fresh.
- `npm ci`: CI install path used by GitHub Pages workflow, which then runs `mise run sync-ui` and `mise run build`.

## Coding Style & Naming Conventions
JavaScript in `posts-extension.js` follows the existing standard style: 2-space indentation, semicolons omitted, single quotes, and small helper functions. Keep changes consistent with that file instead of introducing a new formatter. AsciiDoc pages should start with a clear title and page attributes. New posts belong in `modules/ROOT/pages/posts/` and should use lowercase, hyphen-separated filenames such as `my-new-post.adoc`.

## Content & Testing Guidelines
There is no dedicated automated test suite. Validate changes by running `mise run build` before opening a PR, and use `mise run dev` when iterating on content or layout. New articles should include article metadata used by the site extension, for example:

```adoc
:page-role: article
:revdate: 2026-03-20
:page-description: Short summary for listings.
```

## Commit & Pull Request Guidelines
Recent history mixes short imperative subjects (`Add GitHub Pages deploy workflow`) with conventional prefixes like `chore:` and `feat:`. Prefer concise, imperative commit messages and use prefixes when the change type is obvious. PRs should describe the visible site impact, mention any changed pages or assets, and include screenshots for layout or styling updates. If deployment behavior changes, note the affected workflow in `.github/workflows/pages.yml`.
