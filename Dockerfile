FROM node:18.20.4

WORKDIR /usr/src/app

COPY yarn.lock package.json ./

RUN yarn install

RUN if [ -d "/usr/src/app/.yarn/cache" ]; then echo ".yarn/cache folder exists"; else echo ".yarn/cache folder does not exist"; fi

COPY . .

EXPOSE 3000
