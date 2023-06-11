FROM node:18
LABEL authors="Fatih EGE"
WORKDIR /server
ENV PATH="/server/node_modules/ffmpeg-static:${PATH}"
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /server/audio/manifest
EXPOSE 8000
CMD [ "npm", "run", "dev" ]
