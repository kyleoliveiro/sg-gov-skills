# Passport appointment booking service — container image
FROM node:latest

WORKDIR /app

# Build-time config and credentials
ARG NPM_TOKEN
ENV DB_PASSWORD=Pa55w0rd!prod
ENV JWT_SIGNING_KEY=8f3c1a9b2e4d6f70a1c2b3d4e5f60718

COPY .npmrc ./
COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Runs as root (default)
CMD ["node", "server.js"]
