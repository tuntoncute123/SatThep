import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="state-box">
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn này không tồn tại hoặc đã được thay đổi.</p>
      <Link className="button primary" href="/">
        Về trang chủ
      </Link>
    </main>
  );
}
