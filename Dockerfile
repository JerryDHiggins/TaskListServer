FROM node:8

# create app directory
WORKDIR /usr/src/app

# Install App dependencies
COPY package*.json ./

RUN npm install

RUN mkdir -p ./dist/out-tsc

COPY dist/out-tsc ./dist/out-tsc

EXPOSE 1337

CMD [ "npm", "start" ]
#CMD [ "ls", "-la", "./"]