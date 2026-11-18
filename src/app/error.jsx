'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="state-box">
      <h1>Đã xảy ra lỗi hiển thị</h1>
      <p>Vui lòng thử lại để tiếp tục.</p>
      <button className="button primary" onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
