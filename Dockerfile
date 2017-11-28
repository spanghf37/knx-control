FROM arm32v7/node:latest

RUN npm install knx request dotenv \
    && apt-get install bash curl

# Fix DPT7 (see https://bitbucket.org/spanghf37/knx.js/commits/4e294f7eed3a48766c622ee9ecfe1e1ae864f80c)
RUN rm /node_modules/knx/src/dptlib/index.js
WORKDIR /node_modules/knx/src/dptlib
RUN curl https://bitbucket.org/spanghf37/knx.js/raw/4bb42f309b9eb3e2e4c064c28ed5c2cb73efab82/src/dptlib/index.js -o "index.js"

# Error handling (connection timing out after 3 tries)
RUN rm /node_modules/knx/src/FSM.js
WORKDIR /node_modules/knx/src
RUN curl https://bitbucket.org/spanghf37/knx.js/raw/e918bd3245e47063e9b0a4dd4c1b880bb87fbb8f/src/FSM.js -o "FSM.js"

WORKDIR /home/node/app

VOLUME [ "/home/node/app" ]

USER root
