# ===== 1) build stage =====
FROM node:20-alpine AS builder
WORKDIR /app

# 先拷贝依赖清单以利用缓存
COPY package*.json ./
RUN npm ci

# 再拷贝源码并构建
COPY . .
RUN npm run build

# ===== 2) runtime stage =====
FROM nginx:1.27-alpine AS runner

# 单页应用（SPA）需要 try_files 回退到 /index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝构建产物（Vite 默认输出 dist）
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
