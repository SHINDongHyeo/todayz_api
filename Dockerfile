FROM node:18.20.4

WORKDIR /usr/src/app

COPY . .

RUN yarn install

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "-r", "./.pnp.cjs", "dist/main.js"]
