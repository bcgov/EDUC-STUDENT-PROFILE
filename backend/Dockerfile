FROM artifacts.developer.gov.bc.ca/docker-remote/node:22.23.4-alpine3.23
RUN apk upgrade --no-cache
RUN mkdir -p /logs
RUN chmod 755 /logs

WORKDIR /opt/app-root/src
RUN ln -s /logs .

COPY package*.json .npmrc ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
 && npm ci \
 && npm rebuild gc-stats --ignore-scripts=false \
 && apk del .build-deps

COPY . /opt/app-root/src
EXPOSE 443 8080
CMD ["node", "--max-old-space-size=150", "./src/server.js"]
