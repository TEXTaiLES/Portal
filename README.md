# Portal to Digital Textailes Archive — Directus Endpoint Extension

A public 3D artifact viewer extension for Directus. This endpoint serves a single-page viewer that loads 3D models (GLTF) from the Directus `directus_files` storage and a set of static assets (CSS/JS/images) shipped in the extension `static/Archieve_files` folder.

This extension lives at:

`extensions/endpoints/digital-textailes-archieve`

Key files
- `dist/index.js` — built endpoint shipped to Directus (this file is executed by Directus when the endpoint is mounted).
- `package.json` — extension metadata, build scripts and devDependencies (e.g. `@directus/extensions-sdk`).
- `static/Archieve_files/*` — static assets (CSS, JS, images) referenced by the HTML output.

Requirements
- Node.js and npm (use a Node version supported by your Directus instance)
- Directus host (this extension references Directus `host` compatibility in `package.json`)

Directus version and license
- This extension was developed for Directus 9.22.0. Directus is open-source and distributed under the GPLv3 license and is community maintained.

Host / SDK versions
- `package.json` in this extension currently specifies:
  - `devDependencies` → `@directus/extensions-sdk: "9.22.0"` (exact pinned SDK version)
  - `directus:extension.host` → `"^9.22.0"`

Quick setup (example steps)

1. Clone the repository (example):

```powershell
git clone <your-repo-url>
cd <your-repo-folder>
```

2. Create a `.env` file from the repository example and set admin credentials

If you are running Directus locally and need to pre-seed an admin user, create a `.env` from the provided `.env.example` and set `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

```powershell
cd \directus-demo
Copy-Item .env.example .env
# then edit .env
```

In the `.env` file set the admin credentials, for example:

```ini
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="strong-password-here"
```

3. Change to the extension folder:

```powershell
cd extensions\endpoints\digital-textailes-archieve
```

4. Install dependencies and build the extension:

```powershell
npm install
npm run build
Copy-Item "dist\index.js" "index.js"
```

5. Restart or deploy Directus so it picks up the extension (example using Docker Compose from the repo root):

```powershell
docker-compose restart directus
# or to start in detached mode:
# docker-compose up -d directus
```

6. Verify in Directus
- Open Directus (http://localhost:8055/).

How the endpoint serves assets
- Static files are served by the endpoint under the base path `/digital-textailes-archieve/static/Archieve_files/...` (see `dist/index.js`).
- 3D models are served via `/digital-textailes-archieve/assets/:fileId` which reads files from Directus `directus_files` storage and streams them back with appropriate content-type headers.
