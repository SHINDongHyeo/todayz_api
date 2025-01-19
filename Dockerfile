FROM node:18.20.4

WORKDIR /usr/src/app

RUN npm install -g npm@10.8.1

RUN npm install -g @nestjs/cli

COPY . .

EXPOSE 3000
