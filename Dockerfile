FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    git \
    build-essential \
    libssl-dev \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Update Node to v20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# Copy all files
COPY . .

# Install Python dependencies
RUN python3 -m pip install -r backend/requirements.txt --break-system-packages

# Install Node dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start everything
CMD ["npm", "run", "start:all"]
