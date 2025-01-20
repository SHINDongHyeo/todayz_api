FROM node:18.20.4

WORKDIR /usr/src/app

COPY yarn.lock package.json ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 3000
