FROM node:16.19

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN npm install

COPY . /app

CMD ['npm', 'run', 'start']