FROM node:20-slim

# Install build dependencies and sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm and node-gyp
RUN corepack enable && corepack prepare pnpm@latest --activate && npm install -g node-gyp

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
ENV npm_config_build_from_source=true
RUN pnpm install

# Rebuild sqlite3 with node-gyp
RUN cd node_modules/sqlite3 && node-gyp configure && node-gyp build

# Copy project files
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Build frontend
RUN pnpm build

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Start the server
CMD ["pnpm", "start"]
