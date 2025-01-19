FROM node:18.20.4

WORKDIR /usr/src/app

COPY . .

RUN npm install -g npm@10.8.1

RUN npm install -g @nestjs/cli

RUN yarn set version 3.6.4

RUN yarn install

RUN NODE_ENV=production yarn start

EXPOSE 3000
