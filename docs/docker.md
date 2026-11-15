# Dockerfile and image

```bash
docker build -t backend-tasks:latest .             # build the image
docker run -p 3000:3000 --env-file .env backend-tasks:latest   # run one container
docker images                                       # see the image
docker compose up --build                           # app + MongoDB + Redis together
```

Open http://localhost:3000 for the login page.

Push to Docker Hub (optional):
```bash
docker tag backend-tasks:latest <dockerhub-user>/backend-tasks:latest
docker login
docker push <dockerhub-user>/backend-tasks:latest
```
