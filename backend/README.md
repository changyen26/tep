# 智慧平安符系統 - 後端 API

## 技術棧
- Flask 3.0
- MySQL
- JWT 認證

## 安裝步驟

1. 建立虛擬環境
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

2. 安裝套件
```bash
pip install -r requirements.txt
```

3. 設定環境變數
- 複製 `.env` 檔案並填入資料庫資訊

4. 初始化資料庫
```bash
flask db init
flask db migrate
flask db upgrade
```

5. 啟動服務
```bash
python run.py
```

## API 文件
待補充
