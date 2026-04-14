# **QUY HOẠCH CHƯƠNG TRÌNH CCNA 200-301 (SIMNET-D) \- BẢN CHI TIẾT**

Chương trình được chia thành 6 Module cốt lõi, bám sát ma trận đề thi chính thức của Cisco CCNA 200-301. Khung chương trình này được thiết kế không chỉ để truyền đạt lý thuyết mà còn tập trung vào trải nghiệm tương tác trực quan, giúp người học "nhìn thấy" các luồng dữ liệu vô hình trong mạng.

## **🟡 MODULE 1: NETWORK FUNDAMENTALS (Nền Tảng Mạng)**

### **1\. Quá trình Đóng gói & Mở gói dữ liệu (OSI & TCP/IP Encapsulation)**

* **Mục tiêu:** Nắm vững kiến trúc phân tầng (L7 xuống L2). Hiểu rõ vai trò của từng loại Header (Port, IP, MAC) và khái niệm PDU (Protocol Data Unit) tại mỗi tầng.  
* **Chi tiết kỹ thuật:** Nhấn mạnh việc tầng Transport dùng Port để định danh ứng dụng, tầng Network dùng IP để định tuyến liên mạng, và tầng Data Link dùng MAC để chuyển giao nội bộ.  
* **Ví dụ trừu tượng:** **"Búp bê Nga (Matryoshka) và Dịch vụ chuyển phát"**. Bức thư (Data) chui vào phong bì nhỏ ghi rõ người nhận ở phòng ban nào (TCP Port), phong bì nhỏ chui vào hộp carton ghi địa chỉ nhà (IP), hộp carton chui vào thùng container của xe tải chở hàng chặng ngắn (Ethernet MAC).  
* **Kịch bản Simulation:** \* Giao diện chia 2 nửa màn hình: PC gửi (Client) và Web Server nhận. Ở giữa là đường truyền cáp quang.  
  * *Quá trình Encapsulation:* PC gửi gói tin. Khối Data trôi từ trên xuống qua các màng lọc. Mỗi lần đi qua một tầng, nó bị "bọc" thêm một lớp vỏ có màu đặc trưng (TCP cam ![][image1] IP xanh dương ![][image1] MAC tím). Người dùng có thể bấm nút "Pause" để dùng kính lúp soi vào bên trong lớp vỏ xem thông tin Source/Destination Port, IP, MAC.  
  * *Quá trình Decapsulation:* Gói tin di chuyển qua cáp, tới Server và thực hiện lột vỏ ngược lại từ dưới lên trên, xác nhận tính toàn vẹn (FCS) và phân phát tới đúng ứng dụng Web (Port 80/443).  
* **Bài tập:** \* Drag & Drop các tên PDU (Segment, Packet, Frame) vào đúng tầng tương ứng.  
  * *Troubleshooting:* Gói tin bị sai Destination MAC nhưng đúng IP thì Server có nhận được không? (Mô phỏng sẽ hiển thị gói tin bị Card mạng của Server vứt bỏ ngay tại Layer 2).

### **2\. Cấu trúc Địa chỉ IPv4 & Subnet Mask (Network ID & Host ID)**

* **Mục tiêu:** Hiểu quy tắc phân lớp (Class A, B, C), khái niệm Subnet Mask, CIDR (/24, /26) và cách dùng phép toán AND logic để máy tính tự tìm ra Network ID.  
* **Chi tiết kỹ thuật:** Thiết bị mạng không nhìn thấy số thập phân. Chúng dùng Subnet Mask để "che" phần Host đi, giữ lại phần Network dưới dạng nhị phân (Binary).  
* **Ví dụ trừu tượng:** **"Địa chỉ nhà và ranh giới quận"**. Network ID là *Tên đường phố*, Host ID là *Số nhà*. Subnet Mask đóng vai trò là "Bản đồ ranh giới" báo cho bưu tá biết con đường này dài tới đâu. Để tìm một nhà, bưu tá phải xác định khu vực (đường) trước, sau đó mới tìm chính xác số nhà trong khu đó.  
* **Kịch bản Simulation:**  
  * Nhập một IP bất kỳ kèm Prefix (vd: 192.168.1.10/24).  
  * Giao diện sẽ hiển thị dải nhị phân (32 bit) tương ứng.  
  * *Interactive Slider:* Người dùng kéo thanh trượt Subnet Mask sang trái hoặc phải (từ /8 đến /30). Kéo đến đâu, kính lúp sẽ cắt đôi dải IP tới đó. Nửa trái nhấp nháy chữ "Đường/Network", nửa phải nhấp nháy "Nhà/Host".  
  * *Hiệu ứng cảnh báo:* Báo lỗi màu đỏ (IP Conflict) nếu gán 2 PC cùng số nhà (trùng IP) trong cùng 1 mạng. Báo lỗi "Unreachable" nếu 2 PC khác Network ID nhưng cắm chung 1 Switch mà không có Router đứng giữa.

## **🟢 MODULE 2: NETWORK ACCESS (Mạng LAN & Chuyển Mạch)**

### **3\. Nguyên lý hoạt động của Switch (MAC Table Learning, Aging & Flooding)**

* **Mục tiêu:** Hiểu cơ chế 3 bước: Học (Learn), Chuyển tiếp (Forward), và Ngập lụt (Flood). Nắm được khái niệm MAC Aging time (thời gian sống của một bản ghi).  
* **Chi tiết kỹ thuật:** Switch phân tích Source MAC để đưa vào bảng (Learn) và nhìn Destination MAC để ra quyết định chuyển tiếp. Nếu không thấy trong bảng ![][image1] Unknown Unicast Flooding.  
* **Ví dụ trừu tượng:** **"Lễ tân ghi sổ và Hội trường"**. Khách (PC) bước vào cửa nào (Port), lễ tân (Switch) ghi tên (MAC) và số cửa đó vào sổ. Nếu ai hỏi tìm một người chưa có tên trong sổ, lễ tân bắc loa hét to lên tất cả các phòng (Flooding). Nếu một người quá 5 phút không ra vào (Aging out), lễ tân sẽ xóa tên khỏi sổ để tiết kiệm giấy.  
* **Kịch bản Simulation:**  
  * Bảng MAC Address (sổ tay) hiện trống trơn trên đầu Switch.  
  * *Bước 1 (Learning):* PC-A gửi tin cho PC-B. Ngay khi Frame chạm Switch, Switch "tóm" lấy Source MAC. Dòng chữ MAC-A | Port 1 | 300s bay vào sổ.  
  * *Bước 2 (Flooding):* Switch kiểm tra Dest MAC (B) nhưng sổ trống. Nó nhân bản gói tin ra tất cả các port (trừ port 1). PC-C hiện icon 🛑 (Drop \- vì không phải gửi cho nó), PC-B hiện icon ✅ (Reply).  
  * *Bước 3 (Forwarding):* Khi B reply, Switch ghi tiếp MAC-B | Port 2\. Từ nay A và B nói chuyện sẽ là luồng Unicast (đường thẳng khép kín), không ảnh hưởng đến PC-C.  
  * *Tính năng phụ:* Đồng hồ đếm ngược Aging time. Khi về 0, bản ghi bốc hơi, yêu cầu Switch phải Flood lại từ đầu.

### **4\. Chia mạng nội bộ với VLAN (Virtual LAN) & Cổng Trunking**

* **Mục tiêu:** Hiểu sự cần thiết của việc chia nhỏ Broadcast Domain, phân biệt Access Port (kết nối End-user) và Trunk Port (kết nối giữa các Switch), khái niệm Native VLAN.  
* **Chi tiết kỹ thuật:** Sử dụng giao thức IEEE 802.1Q để chèn thêm 4-byte Tag vào Frame gốc khi đi qua đường Trunk.  
* **Ví dụ trừu tượng:** **"Phân lô dán nhãn"**. Chia một hội trường ồn ào thành các phòng kính cách âm (VLAN). Khi nhân viên đi qua hành lang chung (Đường Trunk) để sang tòa nhà khác, bảo vệ sẽ dán một cái thẻ màu (Tag) lên áo để phân biệt họ thuộc phòng nào. Nếu không có thẻ (Native VLAN), họ mặc định được đưa vào phòng "Khách".  
* **Kịch bản Simulation:**  
  * PC Kế toán (VLAN 10 \- Màu Xanh), PC Nhân sự (VLAN 20 \- Màu Đỏ) nằm trên 2 Switch khác nhau nối qua đường Trunk.  
  * PC Kế toán gửi gói tin Broadcast. Sóng Broadcast màu xanh tỏa ra, đập vào tường vây của port VLAN 20 và dội lại (cô lập Broadcast).  
  * Gói tin đi ra đường nối 2 Switch (Trunk Port), lập tức bị máy quét kẹp thêm một cái "Tag 10" (802.1Q). Tới Switch bên kia, Tag bị gỡ ra và gói tin trôi mượt mà vào đúng các port màu xanh.  
* **Bài tập:**  
  * Cấu hình sai Native VLAN giữa 2 đầu Trunk (Native VLAN Mismatch). Simulation sẽ hiện cảnh báo Spanning Tree phàn nàn và lưu lượng bị rò rỉ chéo.

### **5\. Spanning Tree Protocol (STP) \- Căn bản & Bầu chọn Root Bridge**

* **Mục tiêu:** Hiểu thảm họa Broadcast Storm do vòng lặp mạng (Loop) vật lý gây ra và cơ chế bầu chọn Root Bridge, chặn cổng (Block port) của STP (802.1D / RSTP).  
* **Chi tiết kỹ thuật:** Sử dụng gói tin BPDU (Bridge Protocol Data Unit). Switch nào có Bridge ID thấp nhất (Priority \+ MAC) sẽ làm Root Bridge (Vị vua của mạng lưới).  
* **Ví dụ trừu tượng:** **"Bùng binh kẹt xe và CSGT"**. Nếu 3 bùng binh nối vòng tròn, xe sẽ chạy vòng vèo vĩnh viễn không lối thoát (Loop). Cảnh sát giao thông (STP) sẽ họp bàn bầu ra chốt trưởng (Root Bridge), sau đó dựng rào chắn chặn 1 ngã rẽ ít quan trọng nhất để biến vòng tròn thành sơ đồ hình cây (Tree).  
* **Kịch bản Simulation:**  
  * Nối 3 Switch thành hình tam giác. Ban đầu tắt STP. Một gói tin Broadcast xuất hiện, nó tự nhân bản và chạy vòng quanh với tốc độ chóng mặt, tạo ra hiệu ứng "bão nhiệt đới" (chớp đỏ màn hình, cáp rung lên, CPU các Switch quá tải đạt 100%).  
  * *Bật tính năng STP:* Các gói tin BPDU (hình phong thư nhỏ xíu) bay qua lại giữa 3 Switch. Màn hình hiển thị quá trình so sánh Priority và MAC.  
  * Switch thắng cuộc đội vương miện (Root Bridge). Một cổng trên đường link xa nhất chuyển sang màu cam (Blocking State). Bão Broadcast tan biến, mạng hoạt động ổn định.

## **🔵 MODULE 3: IP CONNECTIVITY (Định Tuyến)**

### **6\. Định tuyến tĩnh (Static Routing) & Default Route**

* **Mục tiêu:** Hiểu cách Router dùng Routing Table để tìm đường (Longest Prefix Match), khái niệm Next-hop, và vai trò của Default Route (0.0.0.0/0).  
* **Chi tiết kỹ thuật:** Định tuyến là quy trình từng chặng (Hop-by-hop). Mỗi Router chỉ chịu trách nhiệm đẩy gói tin tới trạm kế tiếp, không cần biết toàn bộ hành trình tới đích cuối cùng.  
* **Ví dụ trừu tượng:** **"Bản đồ tàu điện ngầm và Cổng ra Mặc định"**. Bạn ở bến A muốn đến bến Z, bạn phải nhìn bảng chỉ dẫn ở từng trạm trung chuyển (Router). Bảng chỉ dẫn sẽ bảo "Muốn tới Z, đi qua cửa số 2" (Next-hop). Nếu muốn đi ra ngoại ô mà bảng không ghi, luôn có mũi tên bự chỉ "Các hướng đi khác: Cửa số 9" (Default Route).  
* **Kịch bản Simulation:**  
  * PC-A ![][image1] Router1 ![][image1] Router2 ![][image1] PC-B.  
  * PC-A ping PC-B. Gói tin chui vào R1. R1 mở bảng Routing Table. Một tia laser quét từ trên xuống dưới. Không thấy địa chỉ mạng của B ![][image1] Gói tin bị nghiền nát (Drop) và gửi trả thông điệp ICMP "Destination Unreachable".  
  * Người dùng thao tác gõ lệnh ip route. Lần gửi thứ 2, tia laser quét trúng, R1 đẩy gói tin sang R2.  
  * Tại R2, gói tin đến được PC-B và B gửi trả lời (Reply). Lại bị Drop ở R2\! Hiện popup: "R2 có đường đi, nhưng chưa có đường về\!". Nhấn mạnh tính chất 2 chiều của định tuyến.

### **7\. Inter-VLAN Routing (Router-on-a-Stick vs Layer 3 Switch)**

* **Mục tiêu:** Cách Router hoặc Switch L3 định tuyến giữa các VLAN vốn dĩ bị cô lập. Hiểu khái niệm Sub-interface.  
* **Chi tiết kỹ thuật:** Cổng vật lý của Router được chia thành nhiều cổng logic (Sub-interface). Mỗi Sub-interface phục vụ một VLAN, có địa chỉ IP làm Default Gateway, và có nhiệm vụ tháo/gắn lại tag 802.1Q.  
* **Ví dụ trừu tượng:** **"Thông dịch viên đa ngôn ngữ"**. Phân xưởng người Anh (VLAN 10\) muốn nói chuyện với phân xưởng người Pháp (VLAN 20\) nhưng cách âm. Phải có một người thông dịch đứng giữa (Router) tháo tai nghe tiếng Anh ra, dịch sang ngôn ngữ chung, rồi đeo tai nghe tiếng Pháp vào để truyền đạt lại sang phòng bên kia.  
* **Kịch bản Simulation:**  
  * Gói tin từ PC Xanh (VLAN 10\) lên Router qua đường Trunk vật lý duy nhất.  
  * Tại Router, gói tin chui vào cái ống logic thứ nhất F0/0.10. Mô phỏng phóng to: Bàn tay robot lột Tag Xanh ![][image1] Gói tin chuyển qua bộ phận Routing để xem địa chỉ IP đích ![][image1] Chui ra cái ống logic thứ hai F0/0.20. Bàn tay robot khác gắn Tag Đỏ ![][image1] Trả về Switch, đi tới PC Đỏ (VLAN 20). Hiệu ứng đường đi hình chữ U rõ rệt.  
  * *Nâng cao:* Thêm thanh hiển thị tải trọng (CPU/Bandwidth). So sánh với mô hình Switch Layer 3 (gói tin không cần chạy vòng lên Router mà được switch-route ngay bên trong Switch L3 với tốc độ phần cứng SVI).

## **🟣 MODULE 4: IP SERVICES (Các Dịch Vụ Trọng Yếu)**

### **8\. DHCP (DORA Process & DHCP Relay)**

* **Mục tiêu:** Thuộc lòng quy trình 4 bước D.O.R.A để xin IP tự động. Hiểu bài toán khi DHCP Server nằm khác mạng và cách cấu hình ip helper-address (DHCP Relay).  
* **Chi tiết kỹ thuật:** Gói tin Broadcast (Discover) mặc định bị Router chặn lại. Cần DHCP Relay Agent bắt lấy Broadcast này, đóng gói lại thành Unicast gửi thẳng tới Server.  
* **Ví dụ trừu tượng:** **"Xin thuê nhà trọ qua môi giới"**.  
  * (D) Người đi thuê đứng giữa ngã tư hét lên: "Ai có phòng cho thuê không?" (Broadcast).  
  * (O) Các chủ trọ xung quanh ném tờ rơi báo giá tới tấp (Unicast).  
  * (R) Người đi thuê chốt một tờ rơi và nói to: "Tôi lấy phòng của ông A nhé\!" (Broadcast báo cho những người khác biết đường rút lui).  
  * (A) Ông A ký hợp đồng trao chìa khóa (Unicast).  
  * *DHCP Relay:* Nếu chủ trọ ở thành phố khác, ngã tư phải có "Ông Cò" (Router). Hét lên, cò nghe thấy, cò gọi điện thoại riêng (Unicast) cho chủ trọ trên phố.  
* **Kịch bản Simulation:**  
  * Máy tính vừa cắm cáp khởi động, hiển thị IP rỗng (0.0.0.0).  
  * Bước 1 & 3 (D & R) hiển thị sóng radar tỏa ra khắp mạng LAN (vì PC chưa có IP đích).  
  * Bước 2 & 4 (O & A) hiển thị tia laser bắn thẳng giữa Server và PC.  
  * Thanh tiến trình "Lease Time" (Thời gian cho thuê) xuất hiện và bắt đầu đếm ngược, mô phỏng quá trình PC phải xin gia hạn (Renew) khi hết nửa thời gian.

### **9\. NAT (Network Address Translation \- PAT/Overload)**

* **Mục tiêu:** Giải quyết vấn đề cạn kiệt IPv4. Cách dịch IP Private thành IP Public để truy cập Internet. So sánh Static NAT và PAT (Port Address Translation).  
* **Chi tiết kỹ thuật:** Trong PAT (Overload), hàng ngàn IP Private chui ra ngoài Internet thông qua *một* IP Public duy nhất bằng cách đính kèm các Source Port khác nhau.  
* **Ví dụ trừu tượng:** **"Lễ tân chung cư và hộp thư"**. Các phòng (Private IP) gửi thư đi, lễ tân bóc ra, xóa tên phòng, ghi địa chỉ người gửi là địa chỉ chung của toàn bộ tòa nhà (Public IP) kèm theo số ID ngẫu nhiên của bức thư (Port). Lễ tân ghi chú lại vào sổ tay (NAT Table). Khi thư hồi âm về tới tòa nhà, lễ tân dò số ID để giao lại đúng phòng.  
* **Kịch bản Simulation:**  
  * 3 PC nội bộ (192.168.1.x) cùng duyệt Web (gửi gói tin ra mạng Internet \- quả cầu xanh).  
  * Khi gói tin đi xuyên qua viền của NAT Router, khối địa chỉ Source IP và Source Port bị bóc ra, thay thế bằng Public IP của Router và một Port mới.  
  * Bảng NAT Table (Sổ tay lễ tân) tự động mở ra ở một góc màn hình, ghi nhận liên tục sự ánh xạ (Mapping) giữa \[Inside Local\] ![][image2] \[Inside Global\].  
  * *Sự cố giới hạn:* Giả lập cuộc tấn công DDOS cạn kiệt Port. Khi vượt qua 65,535 port, NAT Table đỏ rực, các PC mới không thể truy cập Internet.

## **🟤 MODULE 5: SECURITY FUNDAMENTALS (Bảo Mật Cơ Bản)**

### **10\. Access Control Lists (ACLs) & Implicit Deny**

* **Mục tiêu:** Cách thiết lập chốt chặn an ninh lọc lưu lượng theo IP (Standard) hoặc IP+Port (Extended). Hiểu quy tắc tối thượng: Xử lý từ trên xuống (Top-down) và Chặn ngầm định ở cuối (Implicit Deny Any).  
* **Chi tiết kỹ thuật:** Cấu hình ACL đòi hỏi tính logic cực cao. Nếu đặt mệnh đề Deny Any ở đầu, mọi mệnh đề Permit phía sau đều vô nghĩa. Mặc định luôn có một dòng Deny Any Any ẩn tàng hình ở cuối mọi list.  
* **Ví dụ trừu tượng:** **"Bảo kê hộp đêm (Bouncer) và Danh sách khách mời VIP"**. Người gác cửa có một cuốn sổ ghi luật cấm/nhập. Gặp một vị khách, bouncer đọc sổ từ trên xuống dưới. Vừa thấy luật nào khớp là thực thi (Cho qua hoặc Đuổi đi) và ngừng đọc tiếp. Nếu đọc hết sổ mà không thấy nhắc đến tên khách này, luật ngầm của quán là "Đuổi\!" (Implicit Deny).  
* **Kịch bản Simulation:**  
  * Trên cổng của Router xuất hiện biểu tượng một Lính gác cầm khiên (ACL áp dụng theo chiều Inbound hoặc Outbound).  
  * Bên cạnh hiện danh sách luật (ACL List): Dòng 10: Cho phép IP X, Dòng 20: Cấm IP Y.  
  * Gói tin từ IP X đi tới ![][image1] Mũi tên quét trúng Dòng 10 ![][image1] Chuyển xanh lá ![][image1] Đi qua.  
  * Gói tin từ IP Z đi tới ![][image1] Quét qua Dòng 10 không khớp, Dòng 20 không khớp ![][image1] Rơi xuống một màng chắn tàng hình màu đỏ thẫm ("Implicit Deny") dưới đáy ![][image1] Gói tin vỡ vụn, hiện chữ Administratively Prohibited.  
* **Bài tập:** Sắp xếp lại thứ tự các dòng lệnh ACL để mạng từ trạng thái bị chặn hoàn toàn chuyển sang trạng thái hoạt động đúng yêu cầu (Ví dụ: Cho phép Giám đốc vào máy chủ, chặn nhân viên).

## **⚪ MODULE 6: AUTOMATION & PROGRAMMABILITY (Tự Động Hóa Mạng)**

### **11\. SDN (Software-Defined Networking) & APIs**

* **Mục tiêu:** Sự thay đổi mô hình kiến trúc mạng: tách biệt giữa Control Plane (Bộ não ra quyết định) và Data Plane (Chân tay vận chuyển). Làm quen với Northbound/Southbound API và JSON/REST.  
* **Chi tiết kỹ thuật:** Trong mạng truyền thống, mọi thiết bị đều phải tự thu thập thông tin và tự tính toán đường đi. Trong SDN, một DNA Controller trung tâm hút hết bảng định tuyến lên trên, tối ưu hóa toàn cục, sau đó đẩy mệnh lệnh xuống các thiết bị bên dưới thông qua các giao thức lập trình.  
* **Ví dụ trừu tượng:** **"Hệ thống con rối và Người giật dây"**.  
  * *Mạng truyền thống:* Các con rối tự chủ động tranh luận và nói chuyện chằng chịt qua lại để quyết định đi hướng nào (rất chậm và khó quản lý).  
  * *Mạng SDN:* Có một người đứng trên cao (Controller). Từng con rối chỉ việc đứng yên. Người giật dây truyền lệnh thẳng xuống qua các dây chỉ (Southbound API). Các mệnh lệnh lớn từ Chủ rạp giao cho Người giật dây được truyền bằng văn bản tiêu chuẩn (Northbound API dùng JSON).  
* **Kịch bản Simulation:**  
  * *Giai đoạn 1 (Truyền thống):* Khung cảnh lộn xộn, các Router "bắn" các bản cập nhật OSPF chằng chịt lên nhau, tạo ra mạng nhện luồng dữ liệu.  
  * *Giai đoạn 2 (SDN Controller xuất hiện):* Một đám mây (DNA Center) sáng lên ở giữa màn hình. Biểu tượng hình bộ não từ tất cả các Router bị hút thẳng lên đám mây này (Tách Control Plane). Giờ đây, các Router phía dưới chỉ còn là vỏ rỗng (Data Plane).  
  * *Interactive:* Người dùng gõ một dòng mã JSON đơn giản (ví dụ { "vlan": 100, "name": "IOT" }) vào một cửa sổ "REST API". Nhấn nút POST.  
  * Từ đám mây Controller, hàng chục tia sáng xanh đồng loạt bắn xuống tất cả các Switch trong tích tắc. Mạng lưới được thiết lập cấu hình đồng bộ cùng một thời điểm. So sánh trực quan tốc độ với việc phải cắm cáp console cấu hình từng thiết bị một.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAXCAYAAADpwXTaAAAAj0lEQVR4XmNgGAUjHMjLy0ehi5EN5OTkXIAUI7o4WUBUVJRHRkZGBV2cbAD06hpxcXFudHGyANCwHCBeBnShELI4CzAM8oASs0jEs4H4KhB/A+JqkDlg0xQUFASAApIkYkMgPg7UW0Gxd4GGrAIaZoUuTg5gBBoWji5IFgC6SBGUPNDFyQJAw6LRxUbBcAMA8BAjCnJR3ZcAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAXCAYAAADpwXTaAAAA1klEQVR4Xu2SMQrCMBSGE3BTEIQShNDG4ubkKo6eQUE9ggcQehPdHcTBW3R28CrO/q+IpL+RdC794FH43p+XtKlSHS0nTdM1O58sy7bs/qExbMnSB/0VHpr9DwjOkiQZsPfJ83xorZ2yryEhDLuzD4FXvRlj+uwrsNMIgYtzbsO9EMgeJC/rfN+DLFAv1AN1alhn1POzrpA51TQ5Lk50hCxRc9S4QUmulHXB15VbQvPKPoTkMGzBvgYG7lX82nWjbys3ih0n7H2kH/t9viC8Y+cT63e0gTfj9i6fxRV9FQAAAABJRU5ErkJggg==>