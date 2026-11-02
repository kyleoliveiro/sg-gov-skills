FROM node:latest

WORKDIR /app

RUN curl -sL https://tooling.example-vendor.com/install.sh | bash

COPY . .

RUN npm install --production

EXPOSE 3000

CMD ["node", "server.js"]
