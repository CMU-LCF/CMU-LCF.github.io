# Laboratory for Computational Fluids and Energy Sciences

This repository contains a static GitHub Pages website for the computational fluids and energy sciences laboratory at Carnegie Mellon University. The site is designed as a lightweight, data-driven static site with pages for home, research, projects, publications, members, join, and contact.

## Local preview

Because the site is static, you can preview it locally with any simple web server. The most common option is Python's built-in HTTP server:

```bash
cd /Users/ryjoh/repos/CMU-LCF.github.io
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/

## Site structure

- `index.html` — home page
- `research.html` — research overview and pillar pages
- `projects.html` — project listing page
- `publications.html` — searchable publication list
- `members.html` — member profiles
- `join.html` — prospective student information
- `contact.html` — contact information
- `data/` — JSON data for publications, members, and projects
- `assets/` — CSS, JS, favicon/logo assets
- `scripts/` — video optimization workflow assets

## How to add a publication

Edit `data/publications.json` and add a new object with fields like:

```json
{
  "title": "Paper title",
  "authors": ["Author One", "Author Two"],
  "venue": "Journal or conference",
  "year": 2026,
  "pdf": "https://example.com/paper.pdf",
  "doi": "https://doi.org/xxxxx",
  "tags": ["numerical-methods", "reacting-flows"],
  "selected": false,
  "needs_verification": false
}
```

The publication page automatically renders all items from this file and supports search and tag filtering.

## How to add a member

Edit `data/members.json` and add a member object like:

```json
{
  "name": "Person Name",
  "role": "PhD Student",
  "title": "Current PhD Student",
  "affiliation": "Carnegie Mellon University",
  "category": "phd",
  "photo": null,
  "links": {
    "personalWebsite": "https://example.com",
    "github": "https://github.com/example"
  }
}
```

If a photo is unavailable, set `photo` to `null` and the UI will fall back to a placeholder treatment.

## How to add a project

Edit `data/projects.json` and add a project object like:

```json
{
  "title": "Project title",
  "category": "High-Speed Propulsion",
  "status": "Active Research",
  "summary": "Short description of the project.",
  "tags": ["fuel-injection", "high-speed-propulsion"],
  "links": { "research": "research.html#high-speed-propulsion" },
  "relatedPublications": []
}
```

## Video optimization workflow

The repository includes a workflow for preparing simulation videos for the web. Source material should live under a `video/original` location and optimized output should be created under `video/web`.

Example workflow:

```bash
cd /Users/ryjoh/repos/CMU-LCF.github.io
mkdir -p video/original video/web
ffmpeg -i video/original/input.mp4 -vf "scale=1280:trunc(ow/a/2)*2,format=yuv420p,fp=0.1" -c:v libx264 -preset medium -crf 28 -movflags +faststart video/web/input.mp4
```

Notes:

- Use `ffmpeg` to transcode large source videos into web-friendly MP4s.
- Keep original files in the source location and avoid embedding them directly on the site.
- Prefer a compressed, mobile-friendly presentation with a resolution appropriate for the page layout.

## GitHub Pages deployment

This site is static and works well with GitHub Pages. Typical deployment flow:

1. Commit the website changes to the repository.
2. In GitHub, open the repository settings.
3. Select Pages.
4. Choose the branch to publish (commonly `main` or `gh-pages`).
5. Set the folder to `/root` for a simple static site, or use the `docs` folder if you choose that structure.
6. Save and let GitHub build/publish the site.

Because the site is self-contained, no backend or build system is required.

## Notes

- Content was grounded in the local scientific source documents whenever possible.
- Missing facts were intentionally left as placeholders rather than invented.
- This is a first working version intended for review before any GitHub push or publication.
