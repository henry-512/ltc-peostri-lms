FROM node:18-alpine

# install dependencies
WORKDIR /app

COPY . .
RUN npm cache clear --force
# npm install
RUN npm ci
ENV NODE_ENV=production
# build
RUN npm run build
# expose
EXPOSE 4001

# prepare to run
CMD ["node", "server.js"]