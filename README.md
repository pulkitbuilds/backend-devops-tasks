# Backend and DevOps Tasks

Node.js + Express + MongoDB + Redis project covering the whole task list.

## Task map

| Task | Where |
|---|---|
| EC2 | `docs/ec2.md` |
| Dockerfile & image | `Dockerfile`, `docker-compose.yml`, `docs/docker.md` |
| MongoDB database design system diagram | `docs/mongodb-design.md` |
| CI-CD GitHub Actions | `.github/workflows/ci-cd.yml` |
| File-sharing server | `src/routes/files.js` |
| Redis server timestamp | `src/routes/timestamp.js` |
| API rate limiting | `src/middleware/rateLimit.js` (Redis, memory fallback) |
| Kubernetes pod task | `k8s/pod.yaml`, `docs/kubernetes.md` |
| MongoDB CRUD | `src/routes/items.js` |
| Signup & Login without database | `src/routes/nodbAuth.js` |
| Signup & Signin using MongoDB | `src/routes/auth.js` |
| Token generate (JWT) | `src/middleware/auth.js` (`signToken`) |
| Middleware -> get profile | `authenticate` + `GET /api/auth/profile` |
| Password hashing using bcrypt | `src/routes/auth.js` |
| Login page UI, store token, next page | `public/index.html`, `public/dashboard.html` |
| Token versioning (single session login) | `tokenVersion` in `User` + `authenticate` |
| RBAC | `requireRole` + `src/routes/admin.js` |

## Run locally

```bash
cp .env.example .env        # edit JWT_SECRET / MONGO_URI
npm install
npm start                   # http://localhost:3000
npm test
```

Or everything with Docker: `docker compose up --build`.

More: `docs/api-testing.md` (curl examples), `docs/git-push.md` (pushing to GitHub).
