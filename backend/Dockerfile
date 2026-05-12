FROM node:20-slim

# Instalar dependencias necesarias para Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
