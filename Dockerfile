# Development Dockerfile with Puppeteer dependencies
FROM node:20-alpine

WORKDIR /usr/src/app

# Install required packages for Chromium/Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    wqy-zenhei \
    && rm -rf /var/cache/apk/*

# Puppeteer will use the installed chromium instead of downloading
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn cache clean && yarn install --frozen-lockfile

# Add the missing packages to the Dockerfile
RUN yarn add socket.io @nestjs/platform-socket.io

# Install nodemon + tsx for hot reload
RUN yarn global add nodemon tsx

# Copy essential config files
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Copy prisma schema for generation
COPY prisma ./prisma
RUN npx prisma generate

# Create directories for source code (mounted via volumes in dev)
RUN mkdir -p src dist

EXPOSE 4001

# Hot reload entrypoint
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && yarn start:dev"]