# 🧭 PHẦN MỀM GIẢI MÃ NĂNG LƯỢNG SỐ (SĐT & CCCD)

Ứng dụng Web được xây dựng trực tiếp từ cấu trúc công thức và toàn bộ dữ liệu gốc của bộ file Excel **`Giải mã năng lượng số - Tra số điện thoại (File Gốc)`**.

---

## 🌟 CÁC PHÂN HỆ CHỨC NĂNG CHÍNH

1. **📱 Phân Tích SĐT & CCCD Toàn Diện (Sheet `ĐIỆN THOẠI`, `TRA SỐ`, `A ĐẠT`)**:
   - Tự động tách 9 chữ số sau số `0` đầu tiên của Số điện thoại thành **7 tổ hợp 3 số** và **8 cặp 2 số**.
   - Tra cứu chính xác **Tên cụm từ trường chuyển hóa**, **Đặc tính (Tốt / Chưa Tốt / Xấu / Rất Xấu)**, cờ **Ẩn 0**, **Kích 5**, **Hung tinh tụ tập**, **Kết cuối hung** và **Diễn giải chi tiết**.
   - Tự động tách 12 chữ số **Căn cước công dân (CCCD)** thành **11 cặp số Đại Vận** theo các mốc tuổi (`0-10`, `10-15`, `15-20`, `20-25`, `25-30`, `30-35`, `35-40`, `40-45`, `45-50`, `50-55`, `55-70`) kèm lời khuyên chấn hóa năng lượng hậu thiên.
   - Tự động tổng hợp **Phần Tổng Kết** theo 8 trường hợp chuẩn từ Sheet `KH THỰC HIỆN` (kèm tùy chọn chuyển đổi nhanh giữa các mẫu kết luận).
   - Tích hợp sẵn 2 bộ dữ liệu mẫu từ file Excel (`Phạm Thị Phướn` và `Chiến Compass`).

2. **📖 Linh Số Bát Pháp (00–99) (Sheet `LINH SỐ BÁT PHÁP` & `Linh so impore`)**:
   - Tra cứu nghiệm lý chuyên sâu cho từng cặp số từ `00` đến `99`: *Ý nghĩa cốt lõi, Đặc tính nổi bật, Sức khỏe, Tai nạn/biến cố, Quan hệ lục thân, Gợi ý ứng dụng, và Câu chuyện thực tế*.
   - **Tương tác 1 chạm**: Bấm vào bất kỳ cặp số nào trong bảng kết quả SĐT hoặc CCCD để mở ngay cửa sổ Nghiệm Lý Linh Số Bát Pháp của cặp số đó.

3. **☯️ Cẩm Nang 8 Từ Trường & Bảng Chuyển Hóa 3 Số (Sheet `BẢNG TỪ TRƯỜNG` & `KH THỰC HIỆN`)**:
   - Tổng hợp 4 từ trường **Cát Tinh** (*Thiên Y, Sinh Khí, Diên Niên, Phục Vị*) và 4 từ trường **Hung Tinh** (*Lục Sát, Tuyệt Mệnh, Họa Hại, Ngũ Quỷ*) kèm các biến thể **Ẩn 0** và **Kích 5**.
   - Bộ lọc tra cứu nhanh 72 quy tắc **Chuyển Hóa Từ Trường 3 Số** (kèm tài liệu gốc và diễn giải chuẩn).

4. **🔢 Bảng Tra Cứu 1.000 Cụm 3 Số (`000` – `999`) (Sheet `Setup (Đ)`)**:
   - Tìm kiếm và lọc toàn bộ 1.000 tổ hợp số từ `000` đến `999` theo Đặc tính (`Tốt`, `Chưa Tốt`, `Xấu`, `Rất Xấu`), `Ẩn 0`, `Kích 5`.

5. **🖨️ Xuất Báo Cáo PDF / In Phiếu Tư Vấn & Copy Zalo**:
   - Nút **📋 Copy Báo Cáo Zalo**: Tự động trình bày bản luận giải đẹp mắt để gửi ngay cho khách hàng qua Zalo/Messenger.
   - Nút **🖨️ In / Xuất PDF**: Bố cục trang in chuẩn A4 cho khách hàng.
   - Nút **👤 Chuyên gia**: Tùy chỉnh tên, SĐT/Zalo, Email chuyên gia tư vấn (tự động lưu trên trình duyệt).

---

## 🚀 CÁCH MỞ ỨNG DỤNG

- **Cách 1**: Nhấp đúp trực tiếp vào file **`start-giai-ma-so.bat`** hoặc **`index.html`** trong thư mục `giai-ma-nang-luong-so/` (hoạt động 100% offline ngay trên trình duyệt, không cần cài đặt).
