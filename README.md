# Static Astro Portfolio

This project is a high-performance, statically generated portfolio website built with the **Astro** framework. It uses a local SQLite database (`profile.db`) as its data source to compile HTML during the build process, resulting in an incredibly fast and SEO-friendly static site.

This project was originally converted from a dynamic FastAPI application.

## 🚀 Features

- **Blazing Fast**: Generates pure HTML, CSS, and JS components ahead of time. No server-side processing is required on request.
- **SQLite Data Source**: Reads all content from `profile.db` directly into Astro components using `better-sqlite3`.
- **Zero-JavaScript Hydration**: By default, Astro components ship with zero client-side JavaScript, ensuring instantaneous load times.
- **Built-in Dark Mode**: A lightweight, native JS dark mode implementation saved to `localStorage`.
- **Responsive Layouts**: Designed to be responsive with a single `BaseLayout` controlling the core shell.
- **Continuous Integration**: Includes a GitHub Action to automatically test the build on every push to the `main` branch.

## 📁 Project Structure

```text
├── .github/workflows/
│   └── build.yml       # GitHub Actions workflow for CI
├── public/             # Static assets (CSS, JS logic, images)
├── src/
│   ├── layouts/        # Shared layouts (e.g., BaseLayout)
│   └── pages/          # Astro pages corresponding to site routes
├── profile.db          # The SQLite database (MUST be present at root)
├── astro.config.mjs    # Astro configuration
└── package.json        # Dependencies and scripts
```

## 🛠️ Local Development

### Prerequisites

1. **Node.js**: Ensure you are using a modern version of Node.js (v20+ recommended).
2. **SQLite Database**: Ensure that `profile.db` exists at the root of the project. The build will fail without it.

### Setup

Install the required dependencies:

```bash
npm install
```

### Running the Dev Server

To see your changes in real-time, start the Astro dev server:

```bash
npm run dev
```

Since Astro reads the database live, any changes applied to `profile.db` will instantly be reflected in your local environment.

### Building for Production

Compile the site down to static files (HTML/CSS):

```bash
npm run build
```

This will output the final static files to the `dist/` directory. You can preview the built site locally using:

```bash
npm run preview
```

## ☁️ Cloudflare Pages Deployment

This project is perfectly optimized for serving on Cloudflare's global edge network as a static site. No database hosting is required, as the site is completely generated during the build step.

To deploy:

1. Push your latest code changes and the specific `profile.db` you want to use to your GitHub repository.
2. Log into the **Cloudflare Dashboard**.
3. Under **Workers & Pages**, click **Create application**, then the **Pages** tab.
4. Click **Connect to Git** and authorize your repository.
5. In the build settings, use the following configuration:
   - **Framework Preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Click **Save and Deploy**. Cloudflare will run the build command, execute the SQLite queries at build-engine runtime, and host the output `dist/` files on their edge servers!
