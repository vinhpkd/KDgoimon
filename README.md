# 🍱 HỆ THỐNG ĐẶT ĐỒ ĂN PHÒNG KINH DOANH

Ứng dụng Web phục vụ phòng kinh doanh gọi đồ ăn trưa, đồ uống, trà sữa, chè từ **ShopeeFood.vn**. Ứng dụng tự động đồng bộ đơn hàng trực tiếp theo thời gian thực (Real-time), bảng tổng hợp trực quan và gom món thông minh để đặt hàng nhanh trên ShopeeFood.

---

## 🌟 TÍNH NĂNG CHÍNH

1. **Thực Đơn ShopeeFood Chính Xác 100%**:
   - Quán mặc định: **"Đảo Chè - Chè Sạch Vị Ngon - Kim Giang"** ([Link ShopeeFood](https://shopeefood.vn/ha-noi/dao-che-che-sach-vi-ngon-kim-giang)).
   - Toàn bộ danh mục món ăn (bao gồm: `Bơ Già Dừa Non (đồ uống)` - 45.000đ, `Chè Bưởi An Giang` - 27.000đ, `Tàu Hũ Trân Châu Đường Đen` - 27.000đ, `Kem Bơ Sầu Riêng Trân Châu` - 40.000đ...).
   - **Giao diện dạng văn bản sạch sẽ**: Bỏ hoàn toàn hình ảnh thực đơn để tải cực nhanh và dễ nhìn.
   - Tên món và giá tiền giữ nguyên 100% theo ShopeeFood.

2. **Luồng Đặt Món Gọn Gàng (Pop-up Xác Nhận)**:
   - Nhấp vào món bất kỳ ➔ Hiện pop-up xác nhận món ăn.
   - Chọn số lượng món (Nút `−` / `+`).
   - Ô nhập tên người đặt (người dùng tự gõ họ tên của mình).
   - Ô ghi chú riêng cho món (ví dụ: *ít ngọt, nhiều đá, không trân châu...*).
   - Tự động tính thành tiền và cập nhật ngay lên bảng tổng hợp.

3. **Bảng Tổng Hợp Đơn Hàng Thời Gian Thực (Live Board)**:
   - **Tất cả mọi người đều nhìn thấy trực tiếp** các món đã đặt, cập nhật ngay lập tức khi bất kỳ ai xác nhận, sửa hoặc xóa món.
   - **2 Chế độ xem trọng tâm**:
     - 📋 **Chi tiết theo từng người**: STT, Người đặt, Tên món, Đơn giá, Số lượng, Thành tiền, Ghi chú, Nút Sửa/Xóa.
     - 📦 **Gom món đặt ShopeeFood**: Gom tổng số lượng từng món để người đại diện bấm chọn nhanh trên app ShopeeFood kèm nút **"📋 Copy Đơn ShopeeFood"** (tự động format text chuẩn đẹp gửi Zalo).

4. **Thêm Quán Ăn Mới Dễ Dàng Từ Link ShopeeFood**:
   - Nút **"+ Thêm Quán Mới"**: Chỉ cần dán đường link ShopeeFood (ví dụ: `https://shopeefood.vn/ha-noi/...`) và bấm **"Cập nhật thực đơn quán"**.
   - Hệ thống tự động trích xuất toàn bộ tên quán, địa chỉ, danh mục và 100% món ăn kèm giá tiền chính xác.
   - Bấm **"Lưu Quán & Chọn Quán Này"** để chuyển sang quán mới và đồng bộ cho cả phòng.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY & SỬ DỤNG

### Cách 1: Chạy trực tiếp trên GitHub Pages (Không cần cài đặt, không cần chạy file server)
- Truy cập trực tiếp link GitHub Pages: **`https://vinhpkd.github.io/goimonpkd/`**
- Toàn bộ tính năng đặt món, bảng tổng hợp realtime và trích xuất thực đơn từ link ShopeeFood hoạt động 100% tự động ngay trên trình duyệt mà không cần chạy bất kỳ file nào.

### Cách 2: Khởi chạy trên mạng nội bộ / Offline (Tùy chọn)
- Nhấp đúp vào file **`start.bat`** hoặc chạy `powershell ./server.ps1`.
- Trình duyệt sẽ tự động mở trang web tại địa chỉ: `http://localhost:8080`.
- Mở trình duyệt trên điện thoại hoặc máy tính khác trong cùng mạng LAN/Wi-Fi và truy cập theo địa chỉ IP hiển thị trên màn hình console (ví dụ: `http://192.168.1.x:8080`).
