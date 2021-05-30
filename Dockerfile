FROM node:12-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY ./ ./

RUN npm run build

ENV NODE_ENV production

EXPOSE 4000
CMD [ "node","dist/index.js"]
USER 1000