# EC2: deploy the app on AWS

1. **Launch instance**: AWS Console > EC2 > Launch instance
   - Name: `backend-tasks`, AMI: Ubuntu 22.04, type: `t2.micro` / `t3.micro` (free tier)
   - Key pair: create one (`backend-key.pem`) and download it
   - Security group: allow **SSH 22** (My IP), **HTTP 80** (anywhere), optionally **Custom TCP 3000**
2. **Connect**
   ```bash
   chmod 400 backend-key.pem
   ssh -i backend-key.pem ubuntu@<EC2_PUBLIC_IP>
   ```
3. **Install Docker**
   ```bash
   sudo apt update && sudo apt install -y docker.io
   sudo usermod -aG docker ubuntu && newgrp docker
   ```
4. **Create env file** (`~/backend.env`)
   ```
   PORT=3000
   JWT_SECRET=<long random string>
   MONGO_URI=<MongoDB Atlas connection string>
   REDIS_DISABLED=true
   ```
5. **Run the container** (image built by the CI/CD workflow)
   ```bash
   docker login ghcr.io -u <github-username>     # password = a GitHub PAT with read:packages
   docker run -d --name backend --restart unless-stopped -p 80:3000 \
     --env-file ~/backend.env ghcr.io/<github-username>/<repo>:latest
   ```
6. **Test**: open `http://<EC2_PUBLIC_IP>/health` in the browser.

For auto-deploy from GitHub Actions: repo > Settings > Secrets and variables > Actions, add secrets
`EC2_HOST` (public IP), `EC2_USER` (`ubuntu`), `EC2_SSH_KEY` (contents of the .pem file) and a
variable `DEPLOY_ENABLED=true`.

Stop the instance when finished to avoid charges.
