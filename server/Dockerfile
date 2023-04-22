FROM node:18
LABEL authors="Fatih EGE"
WORKDIR /server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD [ "npm", "run", "dev" ]
