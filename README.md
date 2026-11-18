# Thép Việt

Ứng dụng Next.js App Router dùng chung cho website, trang quản trị và API.
Dữ liệu được lưu bằng SQLite trên máy chủ; không cần chạy Express hoặc Vite riêng.

## Chạy tại máy

Yêu cầu Node.js **22.13 trở lên** (khuyến nghị Node.js 24 LTS) để dùng `node:sqlite`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000`, trang quản trị ở `/admin`.
Đặt `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong `.env.local`; mật khẩu phải từ 12 ký tự.
Nếu chưa cấu hình, chỉ môi trường development có tài khoản mẫu hiển thị ở trang đăng nhập.

## Chạy bản production tại máy

```bash
npm run build
npm start
```

Production yêu cầu `ADMIN_PASSWORD` hợp lệ. `PORT` mặc định là `3000`;
có thể truyền cổng qua `npm start -- --port 4000` hoặc biến môi trường khi chạy lệnh.
Next.js tự đọc `.env.local`; riêng `PORT` nên đặt trong môi trường shell hoặc tham số CLI.

`DATA_DIR` mặc định là `./data`, tiếp tục sử dụng file `thepviet.sqlite` hiện có.
Không xóa thư mục này khi cập nhật ứng dụng. Dữ liệu mẫu chỉ được tạo khi chưa có
bản ghi cấu hình doanh nghiệp. Sao lưu bằng SQLite backup hoặc dừng ứng dụng trước
khi sao chép database cùng các file WAL/SHM.

Ứng dụng cần Node.js server và ổ đĩa ghi được, lưu bền vững; không dùng static export
hay filesystem tạm của serverless để lưu database. Bật `COOKIE_SECURE=1` khi phục vụ
qua HTTPS. Chỉ bật `TRUST_PROXY=1` nếu reverse proxy tin cậy ghi đè header
`X-Forwarded-For`; mặc định giới hạn đăng nhập/gửi báo giá dùng chung cho ứng dụng.

## Cấu trúc

- `src/app/`: trang và layout Next.js; `src/app/api/`: backend Route Handlers.
- `src/views/`: giao diện nghiệp vụ, chuyển từ `src/pages/` để không xung đột Pages Router.
- `src/components/`, `src/hooks/`: thành phần giao diện và hook dùng chung.
- `server/`: kết nối SQLite, phiên đăng nhập, kiểm tra request và xử lý nghiệp vụ.
- `tests/`: kiểm thử API, CRUD, tồn kho, báo giá, responsive và animation bằng Playwright.

Các API giữ nguyên đường dẫn `/api/auth/*`, `/api/public/*`, `/api/admin/*`.
API quản trị xác minh session trên máy chủ cho từng request. Mật khẩu, SQL và logic
quản trị không được đưa vào bundle trình duyệt.

## Kiểm tra

```bash
npx playwright install chromium
npm run build
npm test
```

Trên Linux có thể cần `npx playwright install-deps chromium` để cài thư viện hệ thống.
Playwright tự chạy một Next.js production server trên cổng `5175`, dùng SQLite riêng
trong thư mục tạm, không sửa dữ liệu thật. Không chạy một server khác trên cổng kiểm thử.
Định dạng file đã chỉnh sửa bằng Prettier theo `.prettierrc.json`.

Tham khảo: [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route).
