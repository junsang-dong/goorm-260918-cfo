# ---- 1단계: React 프론트엔드 빌드 ----
FROM node:22-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

# ---- 2단계: FastAPI가 백엔드 + 빌드된 정적 파일을 함께 서빙 ----
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY --from=frontend /app/dist ./dist

# 업로드 원본, SQLite 이력 저장 위치. 배포 플랫폼의 persistent volume을 이 경로에 마운트하세요.
ENV PROFIT_DATA_DIR=/data
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
