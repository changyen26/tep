FROM python:3.11-slim

WORKDIR /app

# 系統依賴
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# 複製應用程式碼
COPY . .

# 建立上傳目錄
RUN mkdir -p uploads/avatars uploads/products uploads/temp

EXPOSE 5000

# gunicorn 啟動，4 workers，綁定 0.0.0.0:5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "run:app"]
