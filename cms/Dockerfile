FROM node:20-bookworm-slim

# Install system dependencies needed for native modules (e.g., better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
