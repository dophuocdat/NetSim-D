# Thiết Kế Chi Tiết: Module 1 - Network Fundamentals (CCNA 200-301)

**Ngày thiết kế:** 14/04/2026
**Mục tiêu:** Trực quan hóa tương tác (Interactive Visualization) kiến thức mạng căn bản theo Chuẩn hệ thống Cisco CCNA 200-301.

## 1. Tổng Quan Kiến Trúc (Architecture & Approach)
- **Approach:** Sử dụng mô hình **Story-Mode/Linear Progression**. Học viên sẽ đi qua 2 màn chơi tuyến tính, đảm bảo sự tập trung cao độ (Cognitive Focus) cho từng khái niệm lõi, tránh việc nhồi nhét quá nhiều công cụ như các trình Simulator kiểu cũ.
- **Tiến trình:** Hoàn thành Màn 1 (Decapsulation Lỗi) ➔ Mở cửa khóa ➔ Vào Màn 2 (Subnetting).

---

## 2. Màn 1: Trực Quan Hóa Encapsulation (OSI & TCP/IP)
*Mapping CCNA 200-301: 1.5 Compare TCP to UDP*

### 2.1 Thành phần giao diện (UI Components)
- **`StoryLayout`**: Bố cục tĩnh chia 3 ô theo chiều dọc: 
  - `Device A` (Nguồn - Trái)
  - `FiberWire` (Cáp truyền dẫn - Giữa)
  - `Device B` (Đích - Phải)
- **`PacketMatryoshka` (Búp bê Nga)**: Khối component chính đại diện cho gói tin (Payload). Nó sẽ liên tục móc nối các thẻ `div` bọc ra bên ngoài nhau, với màu sắc quy ước:
  - Lớp vỏ L4 (TCP/UDP Port): **Màu Cam**
  - Lớp vỏ L3 (IP Address): **Xanh Dương**
  - Lớp vỏ L2 (MAC Address): **Màu Tím**
- **`StepControls` (Điều hướng Step-by-step)**: Gồm các nút [Prev] và [Next]. Thay vì chạy một mạch hay dùng timeline nặng nề, mỗi lần bấm Next, hệ thống dừng lại ở một Breakpoint (Ví dụ: bọc xong lớp IP thì pause lại để người dùng có thể dùng X-Ray soi luôn). Dễ lập trình với React và giảm tải nhận dạng kiến thức cho người học.
- **`XRayTool`**: Trỏ chuột/Kính lúp Hover. Kích hoạt lớp Glassmorphism chồng lên trên gói tin để "Nhìn thấu" payload gốc và các ID Port/IP/MAC đang có.

### 2.2 Data Flow (Quản lý State)
- Chạy qua 7 state (ví dụ dùng thư viện xState): `IDLE` ➔ `L4_PACKING` ➔ `L3_PACKING` ➔ `L2_PACKING` ➔ `ON_WIRE` ➔ `DECAPSULATING` ➔ `DELIVERED`. Mỗi state trigger một CSS Framer Motion tương ứng.

### 2.3 Cơ chế Thử thách & Vượt Màn
- Hệ thống cố tình xuất ra một frame bị sai Dest MAC (màu tím). 
- Viền tím nháy đỏ ở Node nhận, bọc gói tin văng vào "Thùng Rác".
- **Nhiệm vụ User:** Rê `XRayTool` vào thùng rác, chẩn đoán bệnh bấm nút chọn `MAC Mismatch`. Trả lời đúng để qua màn 2.

---

## 3. Màn 2: IPv4 & Subnet Masking (Logical Network)
*Mapping CCNA 200-301: 1.6 Configure and verify IPv4 addressing and subnetting*

### 3.1 Thành phần giao diện (UI Components)
- **`BinaryLEDPanel` (Bảng 4 Octets)**: 32 bóng đèn LED được chia thành **4 hàng ngang, mỗi hàng 8 bóng** để tương thích hoàn hảo trên màn hình Mobile. Hiển thị nhị phân (1=Sáng Xanh, 0=Sáng chìm) đồng bộ với 4 cụm thập phân nằm bên cạnh (`192` - `168` - `1` - `10`). 
- **`CIDRSlider` (Thanh trượt cấu hình rời)**: Một thanh trượt nằm ngang độc lập ở dưới đáy màn hình (chạy từ `/8` đến `/30`).
  - Khi user kéo thanh trượt, UI sẽ tự động fill đổi màu các bóng đèn LED trên bảng 4x8 tương ứng theo hình ziczac từ trên xuống. Vùng **Network ID** sẽ phát sáng màu Đỏ, phần **Host ID** phát sáng màu Xanh dương. Giao diện trực quan mà không bị vướng tay che lấp bảng LED.
- **`MiniTopology`**: Nằm bên dưới LED. 2 máy tính nối với 1 con L2 Switch (Mô hình chỉ có MAC, không có router). 

### 3.2 Data Flow (Quản lý State)
- Chạy nền một `SubnetEngine` tiện ích tĩnh, debounce tính toán lại CIDR, Network IP, BroadCast IP ngay tích tắc khi `BladeCIDRSlider` thả tay (mouseUp). Data này map lại ngay màu sắc cho 2 PC.

### 3.3 Cơ chế Thử thách & Vượt Màn ("The Broken Bridge")
- Gắn cứng PC-A = `192.168.1.10` và PC-B = `192.168.2.10`.
- Hiệu ứng gốc: Giữa PC-A và PC-B là vạch đứt màu Đỏ (Bridge Broken). Lệnh Ping Fail chớp nháy.
- **Nhiệm vụ User:** Kéo cái `BladeCIDRSlider` về đúng một ngã tư để chừa đủ bit làm sao Network ID của 2 con PC này phải khớp nhau hoàn toàn (Kéo lui về `/22` hay `/16` tuỳ toán logic).
- Chỉ cần chạm đúng độ dài Mask (e.g. `/16`), số Network ID đồng bộ, cáp đứt MÀU ĐỎ nối liền thành Cầu MÀU XANH LÁ. Lệnh Ping thành công. Module 1 hoàn thành.

---

## 4. Rủi Ro Thường Gặp (Error Handling)
1. **Performance Framer Motion:** Khi sinh quá nhiều lớp búp bê DOM lồng nhau (nesting) có thể giật trên máy RAM yếu. Khắc phục bằng LayoutAnimation của framer-motion hoặc GPU layer.
2. **Kích thước Mobile UI:** Vấn đề hiển thị 32 bóng LED trên màn nhỏ đã được giải quyết triệt để nhờ chiến lược chia LED thành 4 hàng ngang (Octets) kết hợp thanh trượt riêng biệt.
