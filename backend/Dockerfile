FROM node:lts-alpine

RUN mkdir -p /logs
RUN chown -R node:node /logs
RUN chmod 755 /logs

WORKDIR /opt/app-root/src

COPY package*.json ./
RUN npm ci

COPY . /opt/app-root/src
RUN npm run build
EXPOSE 443 8080
CMD ["npm", "start"]