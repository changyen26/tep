"""
產生廟宇打卡 QR Code

使用方式：
    cd backend
    pip install qrcode[pil]  # 首次需安裝
    python scripts/generate_qrcode.py

產生的 QR Code 圖片會存放在 backend/qrcodes/ 資料夾
"""

import sys
sys.path.insert(0, '.')

import os

try:
    import qrcode
except ImportError:
    print("請先安裝 qrcode 套件：")
    print("  pip install qrcode[pil]")
    sys.exit(1)

from app import create_app
from app.models.temple import Temple

def generate_qrcodes():
    app = create_app()

    # 建立輸出資料夾
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'qrcodes')
    os.makedirs(output_dir, exist_ok=True)

    with app.app_context():
        print("=" * 60)
        print("產生廟宇打卡 QR Code")
        print("=" * 60)

        # 取得所有啟用的廟宇
        temples = Temple.query.filter_by(is_active=True).all()

        if not temples:
            print("目前沒有啟用的廟宇資料")
            return

        print(f"\n找到 {len(temples)} 座廟宇\n")

        for temple in temples:
            # QR Code 內容格式
            qr_content = f"temple:{temple.id}"

            # 產生 QR Code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_content)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            # 儲存檔案（使用 temple_id 和名稱）
            safe_name = temple.name.replace(' ', '_').replace('/', '_')
            filename = f"temple_{temple.id}_{safe_name}.png"
            filepath = os.path.join(output_dir, filename)

            img.save(filepath)
            print(f"  [產生] {temple.name}")
            print(f"         內容: {qr_content}")
            print(f"         檔案: {filepath}")
            print()

        print("=" * 60)
        print(f"QR Code 已產生至: {os.path.abspath(output_dir)}")
        print("=" * 60)

        # 同時產生一個彙總的文字檔
        summary_path = os.path.join(output_dir, 'README.txt')
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("廟宇打卡 QR Code 對照表\n")
            f.write("=" * 50 + "\n\n")
            f.write("QR Code 格式: temple:{temple_id}\n\n")
            f.write("廟宇列表:\n")
            f.write("-" * 50 + "\n")
            for temple in temples:
                f.write(f"ID: {temple.id}\n")
                f.write(f"名稱: {temple.name}\n")
                f.write(f"地址: {temple.address}\n")
                f.write(f"QR內容: temple:{temple.id}\n")
                f.write(f"檔案: temple_{temple.id}_{temple.name.replace(' ', '_')}.png\n")
                f.write("-" * 50 + "\n")

        print(f"\n對照表已產生: {summary_path}")

if __name__ == '__main__':
    generate_qrcodes()
