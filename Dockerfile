FROM node:alpine

RUN npm install knx request mysql dotenv csv-parse csv-headers util fs path async co leftpad

RUN apk add --no-cache bash

WORKDIR /home/node/app

VOLUME [ "/home/node/app" ]

USER root
