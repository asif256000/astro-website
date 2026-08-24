# Static Astro Portfolio

This project is a high-performance, statically generated portfolio website built with the **Astro** framework. 

It uses a local SQLite database (`profile.db`) as its data source to compile HTML during the build process, resulting in an incredibly fast and SEO-friendly static site. This project was originally a dynamic FastAPI application but was converted to Astro for static deployment.

## 🚀 Features
- **Blazing Fast**: Generates pure HTML, CSS, and JS components ahead of time.
- **SQLite Data Source**: Reads all content from `profile.db` directly into Astro components using `better-sqlite3`.
- **Zero-JavaScript Hydration**: Astro components ship with zero client-side JavaScript by default.
- **Built-in Dark Mode**: A lightweight, native JS dark mode implementation saved to `localStorage`.
- **Continuous Integration**: Includes a GitHub Action to automatically build the site on every push to the `main` branch.

## 🛠️ Local Development
1. **Install dependencies**: `npm install`
2. **Start the dev server**: `npm run dev`
3. **Build the static site**: `npm run build`

*Note: The `profile.db` SQLite database file must be present at the root of the project for the dev server or build to succeed.*
