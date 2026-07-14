FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_URL=/api
ARG VITE_DATA_SOURCE=api
ARG VITE_REQUEST_TIMEOUT_MS=10000

ENV VITE_API_URL=$VITE_API_URL \
    VITE_DATA_SOURCE=$VITE_DATA_SOURCE \
    VITE_REQUEST_TIMEOUT_MS=$VITE_REQUEST_TIMEOUT_MS

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
