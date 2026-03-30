"""
結構化日誌系統
- 開發環境：彩色 StreamHandler
- 生產環境：JSON 格式 RotatingFileHandler
"""
import os
import sys
import logging
import json
from datetime import datetime
from logging.handlers import RotatingFileHandler


class JsonFormatter(logging.Formatter):
    """JSON 格式的 log formatter，便於對接 ELK/CloudWatch"""

    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        if record.exc_info and record.exc_info[0]:
            log_data['exception'] = self.formatException(record.exc_info)
        return json.dumps(log_data, ensure_ascii=False)


class ColorFormatter(logging.Formatter):
    """開發環境用的彩色 formatter"""

    COLORS = {
        'DEBUG': '\033[36m',     # cyan
        'INFO': '\033[32m',      # green
        'WARNING': '\033[33m',   # yellow
        'ERROR': '\033[31m',     # red
        'CRITICAL': '\033[35m',  # magenta
    }
    RESET = '\033[0m'

    def format(self, record):
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)


def setup_logging(app=None):
    """
    初始化日誌系統，根據環境自動切換 handler
    """
    env = os.getenv('FLASK_ENV', 'development')
    log_level = logging.DEBUG if env == 'development' else logging.INFO

    root_logger = logging.getLogger('app')
    root_logger.setLevel(log_level)

    # 避免重複加入 handler
    if root_logger.handlers:
        return root_logger

    if env == 'development':
        handler = logging.StreamHandler(sys.stdout)
        formatter = ColorFormatter(
            fmt='%(asctime)s %(levelname)s [%(name)s] %(message)s',
            datefmt='%H:%M:%S'
        )
    else:
        # 生產環境：寫入檔案，JSON 格式
        log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        handler = RotatingFileHandler(
            os.path.join(log_dir, 'app.log'),
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5,
            encoding='utf-8'
        )
        formatter = JsonFormatter()

    handler.setFormatter(formatter)
    root_logger.addHandler(handler)

    return root_logger


def get_logger(name):
    """
    取得子 logger
    用法：logger = get_logger('routes.auth')
    """
    return logging.getLogger(f'app.{name}')
