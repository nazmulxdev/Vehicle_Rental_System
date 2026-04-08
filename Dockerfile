FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "node", "dist/server.js" ]