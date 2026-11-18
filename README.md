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

## Hiệu ứng và nội dung công khai

GSAP và AOS đã nằm trong dependencies: không cần thêm script CDN.
`src/animations/usePublicMotion.js` dùng GSAP cho phần mở đầu và AOS cho nội dung
xuất hiện khi cuộn; `AnimatedNumber.jsx` dùng ScrollTrigger cho các bộ đếm.
Hiệu ứng tôn trọng `prefers-reduced-motion`, dọn GSAP khi chuyển trang và cập nhật
vị trí sau khi ảnh/font tải xong hoặc chiều cao nội dung thay đổi. Nội dung vẫn
hiển thị khi JavaScript chưa chạy; bàn phím có thể truy cập các vùng đang chờ hiệu ứng.

`src/components/SupplyGuide.jsx` chứa quy trình yêu cầu báo giá và câu hỏi thường gặp,
sử dụng ở trang chủ và liên hệ. Ảnh mới `public/images/steel-warehouse.webp` được
lưu tại dự án, tối ưu WebP và tải lazy. Đây là ảnh minh họa AI, không phải ảnh kho
thực tế của doanh nghiệp. Nguồn và prompt nằm trong `public/images/CREDITS.md`.
Nội dung, dự án, đối tác và số liệu mẫu cần được doanh nghiệp xác nhận trước khi sử dụng chính thức.

## Hydration và request từ extension

Các thuộc tính `data-testim-main-word-scripts-loaded` và `class="vsc-initialized"`
trong log được thêm vào DOM ngoài mã ứng dụng. Layout sử dụng
`suppressHydrationWarning` **chỉ trên body** để chấp nhận trường hợp extension
thêm thuộc tính tại đó; cơ chế này không sửa hoặc bỏ qua sai khác trong cây
component bên trong. Đối chiếu với [hướng dẫn React](https://react.dev/reference/react-dom/components/common#suppressing-unavoidable-hydration-mismatch-errors).

Dữ liệu settings/products đã có trong HTML từ server, nên Providers không tải lại
hai API ngay khi mount. Hàm `refresh()` vẫn dùng được sau thao tác cập nhật dữ liệu.

`POST /api/ext/auth-token` và `POST /api/ext/activate` không phải API của dự án và
không có lời gọi tương ứng trong mã nguồn. Chúng tiếp tục trả 404 đúng chức năng;
không cấp token hoặc giả lập kích hoạt cho phần mềm ngoài ứng dụng. Nếu vẫn thấy
request này, mở DevTools → Network → Initiator để xác định nguồn, rồi thử hồ sơ
trình duyệt sạch hoặc tắt extension liên quan trên localhost. Các request ngoài
ứng dụng sẽ chỉ ngừng khi nguồn gửi được tắt.

Các test `tests/public-content.spec.js` mô phỏng thuộc tính extension trước
hydration, kiểm tra không tải trùng API, ảnh, FAQ, bàn phím và nội dung khi tắt JavaScript.
