# SIMNET-D CCNA 200-301 MODULES DESIGN ARCHITECTURE

Dựa trên Blueprint chính thức của Cisco (CCNA 200-301) và tài liệu quy hoạch chi tiết gốc, đây là bản thiết kế chi tiết kiến trúc UI/UX và cơ chế Simulation cho 6 Module của SimNet-D.

Mục tiêu cốt lõi: Biến các khái niệm vô hình thành tương tác trực quan (Interactive Visualization), áp dụng nguyên tắc "Học qua sửa lỗi" (Troubleshooting-led Learning).

---

## 🟣 MODULE 1: NETWORK FUNDAMENTALS (20% EXAM)

### 1.1 Quá trình Đóng gói & Mở gói dữ liệu (Encapsulation)
*   **Chuẩn Cisco:** 1.5 Compare TCP to UDP, 1.8 Explain principles of virtualization. (Hiểu về PDU ở từng Layer).
*   **Metaphor (Ẩn dụ):** Búp bê Nga (Matryoshka) & Dịch vụ chuyển phát thư.
*   **UI/UX Layout:** 
    *   Màn hình chia 3 cột: Nguồn (Client) - Đường truyền (Fiber) - Đích (Server).
    *   Sử dụng màu sắc phân tách rõ rệt: Tím (Layer 2 - Frame), Xanh dương (Layer 3 - Packet), Cam (Layer 4 - Segment).
*   **Interaction Actions:**
    *   **Time-control:** Thanh scrubber timeline cho phép Play/Pause/Rewind luồng gói tin bay trên dây cáp.
    *   **X-Ray Vision (Kính lúp):** Hover vào gói tin đang bay để bóc tách các lớp Header xem chỉ số port/IP/MAC.
*   **Gamification/Test:** Mini-game "Phát hiện nốt nhạc sai". Hệ thống thả một gói tin có Destination MAC sai nhưng IP đúng. User phải dùng kính lúp soi, phát hiện lý do tại sao Server vứt bỏ gói tin ở Layer 2.

### 1.2 Cấu trúc IPv4 & Subnet Mask (Logical Addressing)
*   **Chuẩn Cisco:** 1.6 Configure and verify IPv4 addressing and subnetting.
*   **Metaphor (Ẩn dụ):** Ranh giới Quận (Network) và Căn nhà (Host IP).
*   **UI/UX Layout:** 
    *   Bảng LED 32-bit (chuyển đổi realtime giữa nhị phân `11000000` và thập phân `192`). 
    *   Một thiết bị Router chia 2 Switch nhỏ đại diện cho 2 Subnet.
*   **Interaction Actions:**
    *   **CIDR Slider:** Cầm thanh trượt kéo từ `/8` tới `/30`. Khi kéo, một lưỡi dao ảo sẽ cắt đôi dải 32-bit. Phần bên trái hiện Text "Network", phải hiện "Host".
    *   **Live Connect:** Cắm dây mạng ảo. Màu dây sẽ chuyển xanh/đỏ tùy thuộc IP cấu hình có nằm chung Subnet ID hay không.
*   **Gamification/Test:** Giải bài toán "Gỡ rối mạng IP". Cho 3 PC có IP ngẫu nhiên, yêu cầu kéo CIDR Slider sao cho PC1 và PC2 nhìn thấy nhau nhưng cô lập PC3 (tạo Subnet phù hợp).

---

## 🟢 MODULE 2: NETWORK ACCESS (20% EXAM)

### 2.1 Hoạt động của Switch (MAC Learning/Aging/Flooding)
*   **Chuẩn Cisco:** 2.0 Network Access - L2 switching mechanisms, MAC address table.
*   **Metaphor (Ẩn dụ):** Lễ tân khách sạn (Switch) nhớ mặt khách và Hành lang ngập lụt (Flooding).
*   **UI/UX Layout:** 
    *   Top-view (Góc nhìn từ trên xuống) một chiếc Switch trung tâm nối với 4 PC.
    *   Cửa sổ Floating "MAC Table" hiển thị số lượng bản ghi hiện có và đồng hồ đếm ngược Aging-time.
*   **Interaction Actions:**
    *   Bấm chọn nút `Send Ping` từ PC1 sang PC2. Bước 1: PC gửi ARP, Switch bùng nổ hiệu ứng sóng phát quang (Flooding) ra mọi cổng trừ cổng nhận. 
    *   Dòng Text bay từ cổng Switch vào MAC Table (Learning).
*   **Gamification/Test:** Trò chơi xếp hình MAC. Hệ thống sẽ cho một cảnh báo, người dùng phải kéo thả các lệnh để ép Router/Switch xóa học nhầm MAC hoặc giải quyết sự cố Spoofing.

### 2.2 VLAN & Trunking (Chia lô LAN)
*   **Chuẩn Cisco:** 2.1 Configure and verify VLANs (normal range) spanning multiple switches, 2.2 Interswitch connectivity (Trunk, 802.1Q).
*   **Metaphor (Ẩn dụ):** Dán thẻ màu (Tagging) và Phòng cách âm.
*   **UI/UX Layout:**
    *   Hai cục Switch nối nhau bằng đoạn dây Cáp bọc thép (áp dụng cho đường Trunk).
    *   Các PC được nhuộm màu áo (Zone Xanh, Zone Đỏ).
*   **Interaction Actions:**
    *   Gói tin Broadcast đập vào "bức tường lực" của port VLAN khác và bị dội lại.
    *   Zoom vào Trunk link: Khi một khung Frame (hình chiếc hộp) chạy qua chốt kiểm tra, một con dấu 802.1Q dập thẳng vào chiếc hộp (thêm 4 bytes) với màu tương ứng.
*   **Gamification/Test:** Native VLAN Mismatch (Chuẩn đoán bệnh rò rỉ VLAN). Khi thiết lập sai, đồ họa sẽ hiện cảnh Spanning Tree warning và lưu lượng chảy tràn sang vùng đỏ, user phải gõ lệnh cấu hình cho 2 đầu Trunk sao cho đồng nhất Native VLAN.

### 2.3 Spanning Tree Protocol (STP)
*   **Chuẩn Cisco:** 2.5 Describe the need for and basic operations of Rapid PVST+ Spanning Tree Protocol.
*   **Metaphor (Ẩn dụ):** Cảnh sát giao thông tại Bùng binh kẹt xe.
*   **UI/UX Layout:** 3 Switch nối vòng tròn Tam giác. Ban đầu STP trạng thái `Off`.
*   **Interaction Actions:**
    *   **Thảm hoạ Broadcast Storm:** Khi bấm nút giả lập, màn hình chớp chớp, CPU các Switch hiển thị 100%, đường dây rung lên và đỏ rực cạn băng thông.
    *   Bấm nút gạt bật STP: Hiện ra animation cầu vồng phát các bức thư BPDU. Mũ vương miện sẽ vòng và đậu trên Switch có Bridge ID thấp nhất (Root Bridge). Một nút đỏ 'Blocked' sẽ đóng sập nắp chai trên đường rẽ ít dùng nhất.
*   **Gamification/Test:** Tính toán Root Bridge: Cung cấp tham số Priority và MAC, đố user dự đoán được port nào sẽ bị Block trước khi bấm nút kích hoạt mô phỏng.

---

## 🔵 MODULE 3: IP CONNECTIVITY (25% EXAM)

### 3.1 Định tuyến tĩnh (Static Route & Default Route)
*   **Chuẩn Cisco:** 3.1 Interpret the components of routing table, 3.2 Determine how a router makes a forwarding decision, 3.3 Configure and verify IPv4 and IPv6 static routing.
*   **Metaphor (Ẩn dụ):** Bảng chỉ dẫn ga tàu điện ngầm và Cửa ra mặc định.
*   **UI/UX Layout:** Giao diện Routing Table điện tử. Mắt thần cảm biến quét từ trên xuống dưới (Mô tả luật Top-down / Longest Prefix Match).
*   **Interaction Actions:**
    *   Khi có gói tin, thanh laser bắn từ trên xuống qua các nhánh Routing. Nếu trượt hết không có đích, gói tin chuyển form "đập vỡ" (Dropped).
    *   Thêm dòng `0.0.0.0/0`, laser quét thủng màng chắn cuối cùng (Default Route) và đi tiếp.
*   **Gamification/Test:** Lỗi "Chỉ có đường đi, không có đường về". PC1 ping PC2 thành công tới đích, nhưng gói Reply về bị nghẽn (do Router2 không có route quay đầu). User phải bổ sung route tĩnh trên CLI-simulated console.

### 3.2 Inter-VLAN Routing (Router-on-a-stick)
*   **Chuẩn Cisco:** Nằm chung hệ định tuyến, kết hợp chia Logical Interfaces.
*   **Metaphor (Ẩn dụ):** Người phiên dịch 2 tai nghe (2 ngôn ngữ).
*   **UI/UX Layout:** Hiệu ứng đường đi hình chữ U.
*   **Interaction Actions:** Trực quan hóa Sub-interface. Gói tin đi vào cổng `F0/0.10`, máy móc lột vỏ Vlan 10, chuyển rãnh định tuyến ảo sang cổng `F0/0.20`, và dập vỏ Vlan 20 cho đi ra lại.
*   **Gamification/Test:** Sửa lỗi thiếu encapsulation dot1q hoặc cấu hình sai Default Gateway ở PC.

---

## 🟤 MODULE 4: IP SERVICES (10% EXAM)

### 4.1 DHCP (Quy trình D.O.R.A)
*   **Chuẩn Cisco:** 4.3 Configure and verify DHCP client and relay.
*   **Metaphor (Ẩn dụ):** Người đi thuê phòng hát to ở ngã tư (Broadcast) và Người môi giới (Relay Agent).
*   **UI/UX Layout:** Animation 4 bước D (Discover), O (Offer), R (Request), A (Ack).
*   **Interaction Actions:** 
    *   Sự khác biệt rõ ràng giữa đường đạn Broadcast (Sóng vòng tròn tỏa ra) và Unicast (Laser bắn thẳng tới đích).
    *   Có thanh trượt mô phỏng Lease Time đếm ngược, mô phỏng quá trình T1 (50%) xin gia hạn (Renew).
*   **Gamification/Test:** PC không nhận được IP vì nằm khác VLAN. Người chơi phải kéo bộ trung chuyển "ip helper-address" đặt vào giữa ngã tư Router để bắt tín hiệu Broadcast chuyển thành Unicast.

### 4.2 Cấu hình NAT (Overload / PAT)
*   **Chuẩn Cisco:** 4.2 Configure and verify inside source NAT using static and pools.
*   **Metaphor (Ẩn dụ):** Hộp thư chung cư và Lễ tân chuyển nhãn.
*   **UI/UX Layout:** Ranh giới Inside (Private IP) / Outside (Internet IP). Một cửa sổ NAT Translation Table mô phỏng hoạt động real-time.
*   **Interaction Actions:** Gói tin trôi ngang vạch đích. Bùng!! Chữ `192.168.1.5:80` bóc ra rớt xuống, chữ `203.0.113.1:5432` đắp vào thế chỗ.
*   **Gamification/Test:** NAT Exhaustion (Cạn kiệt Port). Trải nghiệm DDOS attack khi có >65,000 connection cùng lúc, mạng treo cứng.

---

## 🔴 MODULE 5: SECURITY FUNDAMENTALS (15% EXAM)

### 5.1 Access Control Lists (ACLs - Standard/Extended)
*   **Chuẩn Cisco:** 5.6 Configure and verify access control lists.
*   **Metaphor (Ẩn dụ):** Gác cổng bảo kê VIP quán Bar với Quy luật màng chắn tàng hình ngầm (Implicit Deny).
*   **UI/UX Layout:** Animation Lính gác ở cổng Router cầm khiên và Sổ tay kiểm soát theo chiều mũi tên Inbound / Outbound.
*   **Interaction Actions:**
    *   Cấu trúc logic: Scanner dò tuần tự từng mệnh đề trong ACL. Gặp chữ Permit -> Đèn xanh tít, mở cổng. Gặp Deny -> Tia chớp giật nát gói tin.
    *   Màng chắn đục lỗ: Không khai báo gì thì bị rớt xuống hố Implicit Deny tàng hình ở dòng đáy cuốn sổ.
*   **Gamification/Test:** Sắp xếp logic thứ tự lệnh (Order of Operations). Cho 3 yêu cầu bảo mật chồng chéo, user kéo thả các dòng lệnh Console ACL sao cho mạng thông đường cần thông, tắt luồng cần chặn.

---

## ⚪ MODULE 6: AUTOMATION & PROGRAMMABILITY (10% EXAM)

### 6.1 SDN (Software-Defined Networking) & API
*   **Chuẩn Cisco:** 6.1 Explain how automation impacts network management, 6.2 Compare traditional networks with controller-based networking (SDN), 6.4 Explain REST-based APIs.
*   **Metaphor (Ẩn dụ):** Múa rối bóng giật dây (Người chỉ huy và con rối Controller).
*   **UI/UX Layout:**
    *   Màn hình A: Mạng nhện phân tán (Layer 2 & 3 cấu hình riêng lẻ thủ công).
    *   Màn hình B: DNA Center (Đám mây) hút linh hồn "Control plane" của các Router lên trên đỉnh.
*   **Interaction Actions:**
    *   Gửi một Rest API call bằng body JSON mẫu `{"vlan": 100, "name": "VLAN_IoT"}` từ bảng POSTMAN ảo.
    *   Bấm **"Execute POST"**, lập tức đám mây chớp sáng rồi bắn xuống 10 tia sáng cho 10 thiết bị switch đổi cấu hình ngay tức khắc trong 0s. (Nhấn mạnh uy lực Northbound/Southbound API so với CLI truyền thống).
