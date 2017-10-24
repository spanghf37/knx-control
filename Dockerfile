FROM node:alpine

RUN npm install knx request dotenv

RUN apk add --no-cache bash

# Fix DPT7 (see https://bitbucket.org/spanghf37/knx.js/commits/4e294f7eed3a48766c622ee9ecfe1e1ae864f80c)
RUN rm /node_modules/knx/src/dptlib/index.js
WORKDIR /node_modules/knx/src/dptlib
RUN curl https://bitbucket.org/spanghf37/knx.js/raw/4e294f7eed3a48766c622ee9ecfe1e1ae864f80c/src/dptlib/index.js -o "index.js"
 
WORKDIR /home/node/app

VOLUME [ "/home/node/app" ]

USER root
