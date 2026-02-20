# The first stage
# Build React static files

FROM node:24.12.0-trixie AS build

WORKDIR /app
COPY ./frontend/package.json ./
COPY ./frontend/package-lock.json ./
RUN npm ci
COPY ./frontend/ ./
COPY .env ./.env
RUN npm run build

# The second stage
# Copy React static files and start nginx
FROM nginx:1.23.4
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/avant.local.conf /etc/nginx/conf.d/avant.local.conf
COPY ./backend/staticfiles /app/staticfiles
CMD ["nginx", "-g", "daemon off;"]

