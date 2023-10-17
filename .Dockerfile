FROM node:18-alpine

WORKDIR /app

EXPOSE 5173

COPY package.json .

RUN npm install glob rimraf
RUN npm install

COPY . .
COPY .env.example .env

ENV NODE_ENV=development
CMD ["npm", "run", "dev"]