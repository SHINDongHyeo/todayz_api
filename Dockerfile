FROM node:18.20.4

WORKDIR /usr/src/app

# COPY yarn.lock package.json ./
COPY . .

RUN yarn -v

RUN yarn install


EXPOSE 3000
