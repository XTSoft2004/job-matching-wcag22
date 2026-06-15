import sys
import urllib.request
import json

# Reconfigure stdout to support UTF-8 (Vietnamese characters) on Windows
sys.stdout.reconfigure(encoding='utf-8')

def sync_urls():
    url = "http://localhost:8000/api/v1/navigation/sync"
    routes = [
        {
            "url": "/",
            "element_id": "home-panel",
            "keywords": ["trang chủ", "trang đầu", "màn hình chính", "trang bắt đầu"],
            "description": "Trang bắt đầu của hệ thống điều hướng bằng giọng nói."
        },
        {
            "url": "/dashboard",
            "element_id": "dashboard-panel",
            "keywords": ["bảng điều khiển", "thống kê", "phân tích", "báo cáo"],
            "description": "Xem các số liệu phân tích và thống kê tại đây."
        },
        {
            "url": "/settings",
            "element_id": "settings-panel",
            "keywords": ["cài đặt", "tùy chọn", "cấu hình", "hệ thống", "thiết lập"],
            "description": "Cấu hình các tùy chọn cho tài khoản của bạn."
        },
        {
            "url": "/profile",
            "element_id": "profile-panel",
            "keywords": ["hồ sơ", "cá nhân", "thông tin", "người dùng", "tài khoản"],
            "description": "Quản lý thông tin cá nhân của bạn."
        }
    ]
    
    print("Đang đồng bộ hóa dữ liệu route lên Pinecone...")
    data = json.dumps(routes).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print("Đã đồng bộ hóa dữ liệu thành công!")
                response_data = response.read().decode('utf-8')
                print(json.loads(response_data))
            else:
                print(f"Đồng bộ thất bại. Mã lỗi: {response.status}")
                print(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Lỗi kết nối tới máy chủ (backend): {e}")
        print("Vui lòng đảm bảo backend đang chạy (bun run dev:backend).")

if __name__ == "__main__":
    sync_urls()
