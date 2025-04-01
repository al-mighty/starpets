FROM node:21-alpine

WORKDIR /app

# Устанавливаем curl
RUN apk add --no-cache curl

# Создаем пользователя node и даем права на директорию
RUN chown -R node:node /app

# Переключаемся на пользователя node
USER node

# Копируем package.json и package-lock.json
COPY --chown=node:node ../app/package*.json ./

# Устанавливаем зависимости
RUN npm install --no-optional

# Копируем исходный код
COPY --chown=node:node ../app .

# Собираем приложение
RUN npm run build

EXPOSE 3000

CMD npm run migrate && npm start
