# Push everything to GitHub

```bash
# 1. one-time identity
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"

# 2. inside the project folder
cd backend-devops-tasks
git init -b main
git add .
git status                       # .env and node_modules must NOT be listed
git commit -m "Add backend, auth, docker, k8s and CI/CD tasks"

# 3. create an empty repo on github.com (New repository, no README), then:
git remote add origin https://github.com/pulkitbuilds/backend-devops-tasks.git
git push -u origin main
```

GitHub asks for a username and a **Personal Access Token** as the password
(Settings > Developer settings > Personal access tokens, scope `repo`).
Or use the GitHub CLI: `gh auth login` then `gh repo create backend-devops-tasks --public --source=. --push`.

## Later changes
```bash
git add .
git commit -m "describe the change"
git push
```

## One commit per task (looks nicer to reviewers)
```bash
git add Dockerfile .dockerignore docker-compose.yml docs/docker.md && git commit -m "Docker: Dockerfile and image"
git add .github && git commit -m "CI/CD with GitHub Actions"
git add k8s docs/kubernetes.md && git commit -m "Kubernetes pod task"
git add src/routes/auth.js src/middleware/auth.js src/models/User.js && git commit -m "Auth: bcrypt, JWT, token versioning, RBAC"
git push
```
