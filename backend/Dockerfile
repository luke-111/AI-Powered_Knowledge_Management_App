FROM node:alpine

WORKDIR /app

COPY . .

RUN npm install -g wait-port && npm install

EXPOSE 3000

CMD ["sh", "-c", "wait-port db:5432 && npm start"]