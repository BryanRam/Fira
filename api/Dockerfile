FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json tsconfig.json ./
RUN bun install
COPY src ./src
RUN bun run build

FROM oven/bun:latest
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./package.json
EXPOSE 3000
CMD ["bun", "dist/index.js"]
