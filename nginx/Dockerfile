# stage 1: build frontend
FROM node:24.12.0-trixie AS build
WORKDIR /app

COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm ci

COPY ./frontend/ ./

# build-time injected value
ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN npm run build

# stage 2: nginx
FROM nginx:1.23.4
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/avant.local.conf /etc/nginx/conf.d/avant.local.conf
CMD ["nginx", "-g", "daemon off;"]
