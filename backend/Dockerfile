# Production image, copy all the files and run next
FROM node:18-alpine AS base

# install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# rebuild source
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build .
COPY --from=builder /app/fs /fs

EXPOSE 4000

CMD ["node", "index.js"]