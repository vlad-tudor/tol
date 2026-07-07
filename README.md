# tol

An interactive 3D graph of the Kabbalistic Tree of Life — spheres (sephirot)
connected by tubes (paths), rendered with three.js and Solid. Drag nodes through
space to untangle the paths, then lock in the coordinates.

## Dev

```bash
bun install
bun dev        # localhost:5173
bun run test
bun run build  # typecheck + production build → dist/
bun run preview
```

## Environment variables

All operational details live in `.env`. Copy `.env.example` to get started:

```bash
cp .env.example .env
```

| Variable            | Required | Description                                   |
| ------------------- | -------- | --------------------------------------------- |
| `DOMAIN`            | Yes      | Domain the app is served at (Traefik routing) |
| `UMAMI_SCRIPT_URL`  | No       | Umami analytics script URL                    |
| `UMAMI_WEBSITE_ID`  | No       | Umami website id                              |

## Deployment

Triggered by pushing a version tag:

```bash
git tag v1.0.0
git push --tags
```

GitHub Actions SSHes into the VPS, pulls the repo, builds the image (nginx
serving the static `dist/`), and restarts the container. See
`.github/workflows/deploy.yml`.

Required GitHub repository secrets:

| Secret            | Description                               |
| ----------------- | ----------------------------------------- |
| `VPS_HOST`        | VPS IP or hostname                        |
| `VPS_USER`        | SSH username                              |
| `SSH_PRIVATE_KEY` | Private key for GitHub Actions SSH access |
| `SITE_PATH`       | Absolute path to the repo on the VPS      |
