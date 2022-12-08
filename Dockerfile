FROM node:latest as build-stage 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ . 
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build-no-ts

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
