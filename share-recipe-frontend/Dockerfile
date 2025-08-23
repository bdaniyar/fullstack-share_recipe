# Frontend Dockerfile for Next.js app
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps

COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


# --- Production stage ---
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]