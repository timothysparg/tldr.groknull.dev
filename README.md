# TL;DR

The source for [tldr.groknull.dev](https://tldr.groknull.dev), built with
[Antora](https://antora.org/).

## Run it locally

Install [mise](https://mise.jdx.dev/) first. It installs the project's Node.js
and supporting command-line tools.

```sh
mise install
npm install
mise run dev
```

Open <http://localhost:5959>. The development task downloads the configured UI
bundle, serves the site, and rebuilds it when source files change.

## Build without the development server

```sh
mise run build
mise run serve
```

`build` writes the generated site to `public/`; `serve` makes that directory
available at <http://localhost:5959>. To remove the generated output, run
`mise run clean`.

## Useful commands

- `mise run sync-ui` (or `mise ui`) refreshes the UI assets selected in
  `antora-playbook.yml`.
- `mise run build` performs the same production build used for validation and
  fails when Antora reports warnings.

Posts live in `modules/ROOT/pages/posts/`, and images and other shared assets
live in `modules/ROOT/assets/images/`.
