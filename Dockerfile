# Используем офциальный образ Node.js 16 (или любой другой версии, которую вы предпочитаете)
FROM node:16

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "index.js"]