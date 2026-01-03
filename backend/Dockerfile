FROM node:22-bullseye AS page-builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server/server.js"]
