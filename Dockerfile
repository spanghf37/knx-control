FROM node:alpine

RUN npm install knx request dotenv

RUN apk add --no-cache bash

WORKDIR /home/node/app

VOLUME [ "/home/node/app" ]

USER root
