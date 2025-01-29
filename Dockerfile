FROM node:18.20.4

WORKDIR /usr/src/app

COPY . .

RUN yarn install

# 여러 컨테이너 실행으로 컨테이너마다 다른 포트 사용하게 수정
# EXPOSE 3000

CMD ["NODE_ENV=development", "node", "-r", "./.pnp.cjs", "dist/main.js"]
