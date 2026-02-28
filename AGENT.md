# AI Agent Instruction Manual: Astro Statically Generated Portfolio

This repository contains a statically generated Astro version of a former FastAPI-based portfolio website.

If you are an AI assistant tasked with enhancing, modifying, or deploying this site, follow these instructions step-by-step.

## Context & Architecture

- **Framework**: Astro (SSG Mode)
- **Data Source**: A local SQLite database (`profile.db`). The site queries this database at build-time using `better-sqlite3`. NO endpoints or APIs exist.
- **Component Style**: Native `.astro` components logic and JSX-like HTML templating.
- **Static Assets**: All original CSS, images, logos, and JavaScript functionalities (dark mode, scrolling, timelines) are located in `public/`. They are globally included in `src/layouts/BaseLayout.astro`.
- **Page Routes**: 
    - `/` -> `src/pages/index.astro`
    - `/overview` -> `src/pages/overview.astro`
    - `/experience_education` -> `src/pages/experience_education.astro`
    - `/projects_certificates` -> `src/pages/projects_certificates.astro`
    - `/awards_interests` -> `src/pages/awards_interests.astro`
    - `/resume` -> `src/pages/resume.astro`

---

## 🚀 Step-by-Step Execution Guide for AI Agents

### Step 1: Project Initialization

If you are cloning this into a new environment, always start by running:

```bash
npm install
```

### Step 2: Ensure Data Availability

This project **will fail to build** if the database is missing. 
Make sure `profile.db` is present at the absolute root of the repository (`./profile.db`). If the user hasn't provided it, ask the user to provide the SQLite database file before proceeding with any local compilations.

### Step 3: Local Development & Previews

To test changes you make to the `.astro` components, start the Astro dev server:

```bash
npm run dev
```

*Note: Since the site reads from the SQLite DB at build/dev time, changes to the `profile.db` will instantly reflect on the dev server.*

### Step 4: Modifying Functionality or Styles

- **To change page structure/data mapping**: Edit the relevant file in `src/pages/`. The frontmatter (`---`) contains the `better-sqlite3` database queries and native JavaScript mapping helpers (like `arrange_skills` or `formatDate`).
- **To add globally shared <head> tags or scripts**: Edit `src/layouts/BaseLayout.astro`.
- **To modify the dark mode or timeline script functionality**: Edit `public/dark-mode.js` or `public/timeline.js`.
- **To edit styles**: Edit the specific `.css` files located in `public/`.

### Step 5: Preparing for Production / Cloudflare Edge Deployment

When the user asks to deploy this to Cloudflare Edge:

1. Ensure all changes are committed and pushed to the GitHub repository.
2. Inform the user to log into the **Cloudflare Dashboard**.
3. Direct them to navigate to **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**.
4. Important Build Settings required for Cloudflare:
    - **Framework Preset**: Astro
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
5. The Cloudflare builder will automatically run the SQLite queries during the build phase and deploy the pure HTML/CSS/JS files to their global edge network. No database hosting is required on the edge!
