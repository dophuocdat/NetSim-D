# SimNet-D Plan 2: Auth + User Progress + Dashboard

**Goal:** Hiện thực hóa Phase 2 cho SimNet-D, bao gồm cấu hình Supabase Authentication, thiết lập cơ sở dữ liệu để lưu trữ tiến độ (User Progress), xây dựng trang Login/Register, và thiết kế Dashboard để hiển thị quá trình học của user.

**Architecture:** Sử dụng trực tiếp Supabase làm Backend (PostgreSQL + Auth). Frontend dùng `@supabase/supabase-js` để giao tiếp, kết hợp `TanStack Query` để fetch và quản lý state tiến trình, cùng với Context/Zustand để quản lý global auth context.

**Tech Stack:** React, TypeScript, Zustand, TanStack Query, Supabase Auth & PostgreSQL.

## User Review Required

> [!WARNING]  
> Chúng ta sẽ cần kết nối tới một Supabase Project thực tế. Nếu bạn chưa có Supabase project, chúng ta có thể sử dụng công cụ `supabase-mcp-server` để tạo mới hoặc cài đặt Supabase CLI chạy cục bộ (local). 
> **Câu hỏi cho bạn:** Bạn muốn tạo một Supabase project trên cloud hay ưu tiên local dev environment qua Docker/Supabase CLI trước?

## Proposed Changes

---

### Supabase Config & Database Schema
Thiết lập kết nối Supabase và cấu trúc bảng `user_progress` (hoặc update các table liên quan).

#### [NEW] [supabase.ts](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/lib/supabase.ts)
- Khởi tạo `supabaseClient` bằng `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

#### [NEW] [01_plan2_schema.sql](file:///e:/Situation%20CCNA%20&%20CCNP/supabase/migrations/01_plan2_schema.sql)
- SQL để định nghĩa các bảng liên quan đến tiến trình (`user_progress`, `user_streaks`...) dựa trên file thiết kế `2026-04-12-simnet-d-design.md`.
- Kích hoạt RLS (Row Level Security) cho các bảng này.

---

### Auth UI & Context
Quản lý trạng thái người dùng (đã đăng nhập / chưa đăng nhập) trên React.

#### [NEW] [AuthContext.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/lib/AuthContext.tsx)
- Cung cấp `Session` hiện tại và các helper functions như `login`, `register`, `logout` sử dụng hook để dễ dàng consume.

#### [NEW] [ProtectedRoute.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/components/layout/ProtectedRoute.tsx)
- Wrapper kiểm tra và điều hướng (redirect) về `/login` nếu user chưa authenticated.

#### [NEW] [Login.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/pages/Login.tsx) & [Register.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/pages/Register.tsx)
- Giao diện form authentication (Email/Password) với design system "glassmorphism".

---

### Dashboard & Progress
Trang chính cho người dùng review lại số bài đã học, thành tích điểm số.

#### [NEW] [Dashboard.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/pages/Dashboard.tsx)
- UI bao gồm: Welcome banner, Streak counter, Progress overview (Circular indicator), khóa học hiện tại.
- Lấy thông tin từ TanStack Query `useQuery` map với hàm fetch Supabase.

#### [MODIFY] [Router.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/Router.tsx)
- Thêm routes `/login`, `/register`, `/dashboard`.
- Bọc `/dashboard` trong `ProtectedRoute`.

---

### Tích hợp Simulation 
Lưu lại tiến độ khi user hoàn thành exercise/lesson.

#### [MODIFY] [ExerciseContainer.tsx](file:///e:/Situation%20CCNA%20&%20CCNP/simnet-d/src/components/exercises/ExerciseContainer.tsx)
- Khi gọi `onComplete`, dispatch một action/mutation lên Supabase thông qua TanStack Query (ví dụ log số điểm vào `user_progress`).

## Verification Plan

### Automated Tests
- Cần viết test (mock module: `@supabase/supabase-js`) cho `AuthContext` để đảm bảo logic setSession đúng.
- Run `vitest run` lại phần tính toán để bảo đảm type và hàm mới liên kết đúng.

### Manual Verification
1. Đăng ký tài khoản (Register flow), kiểm tra Supabase Dashboard để xác nhận User xuất hiện.
2. Đăng nhập và tự động vào Dashboard layout. Truy cập thủ công trang Dashboard /dashboard (bước verify route guard).
3. Logout an toàn, kiểm tra redirect.
4. Trải qua một Lesson demo, cuối bài ấn hoàn thành và load lại trang Dashboard để thấy dữ liệu Progress thay đổi.
