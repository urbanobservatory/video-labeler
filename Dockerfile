# Start with a node 12 image with package info
# Installs *all* npm packages and runs build script
FROM node:12-alpine as build-stage
WORKDIR /app
COPY ["package*.json", "/app/"]
RUN npm ci &> /dev/null
COPY [ ".", "/app/" ]
RUN npm run build &> /dev/null

# startup and copy the sources
FROM nginx:stable-alpine as production-stage
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]