FROM node:18
LABEL authors="Fatih EGE"
WORKDIR /server
ENV PATH="/server/node_modules/ffmpeg-static:${PATH}"
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /server/audio
RUN mkdir -p /server/audio/manifest
RUN mkdir -p /server/public
RUN mkdir -p /server/public/uploads
EXPOSE 8000
CMD [ "npm", "run", "dev" ]
