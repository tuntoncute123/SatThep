# Quy tắc làm việc trong dự án

## Viết mã dễ đọc, không nén mã nguồn

Áp dụng cho mọi lần tạo mới hoặc chỉnh sửa mã nguồn trong dự án này.

- **Không viết toàn bộ một hàm trên một dòng.** Viết phần thân của hàm,
  arrow function, callback và React component thành nhiều dòng, có thụt lề
  và dấu ngoặc rõ ràng, kể cả với hàm ngắn.
- Mỗi câu lệnh nằm trên một dòng riêng. Không nối nhiều câu lệnh bằng dấu
  chấm phẩy để tiết kiệm dòng; không gộp nhiều khai báo state hoặc biến vào
  cùng một dòng.
- Viết các khối `if`, `else`, `for`, `while`, `switch`, `try`, `catch` và
  `finally` theo nhiều dòng. Dùng dấu ngoặc khối để thể hiện rõ phạm vi.
- Với JSX/HTML, xuống dòng theo cấu trúc phần tử, thụt lề các phần tử con
  và tách các props dài ra nhiều dòng. Không dồn toàn bộ component, biểu mẫu,
  bảng dữ liệu hoặc modal vào một dòng JSX dài.
- Với CSS, mỗi selector hoặc nhóm selector có khối riêng; mỗi khai báo thuộc
  tính nằm trên một dòng. Không viết stylesheet theo dạng minify.
- Tách logic phức tạp thành các bước hoặc hàm có tên rõ nghĩa. Ưu tiên sự
  dễ đọc, bảo trì và review; không dùng biểu thức lồng sâu hoặc chuỗi toán tử
  chỉ để giảm số dòng.
- Giữ dòng mã ở khoảng 100 ký tự khi hợp lý. Ngoại lệ dành cho URL, chuỗi
  nguyên văn hoặc dữ liệu không nên ngắt dòng.
- Dùng formatter đã được cấu hình trong dự án cho các file vừa tạo hoặc sửa.
  Kiểm tra định dạng thực tế trước khi bàn giao; không tắt formatter hoặc
  nén mã nguồn để rút ngắn thao tác viết file.
- Quy tắc này không áp dụng cho thư viện bên thứ ba, lockfile, file được
  sinh tự động hoặc bundle build/minify. Không sửa các file đó chỉ để đổi
  định dạng.

Ví dụ không được dùng:

```js
function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price * item.quantity, 0); }
```

Ví dụ nên dùng:

```js
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}
```
