FROM node:20-slim

WORKDIR /app

# install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# run as non-root
USER node
CMD ["node", "src/index.js"]
