import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Phone } from 'lucide-react';
import { api, useSite } from '../lib';
import { Field } from './Common';

export default function QuoteForm({ product = '', onClose }) {
  const { products, settings } = useSite();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  async function submit(e) {
    e.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setError('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      setSuccess(await api('/public/quotes', { method: 'POST', body }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (success) {
    return (
      <div className="quote-success">
        <span>
          <CheckCircle2 size={40} />
        </span>
        <h3>Yêu cầu đã được gửi!</h3>
        <p>
          Cảm ơn bạn đã quan tâm đến {settings?.name}. Đội ngũ kinh doanh sẽ liên hệ trong giờ làm
          việc.
        </p>
        <div className="reference-code">Mã yêu cầu: BG-{String(success.id).padStart(4, '0')}</div>
        {onClose ? (
          <button className="button primary" onClick={onClose}>
            Hoàn tất
            <CheckCircle2 size={18} />
          </button>
        ) : (
          <button
            className="button secondary"
            onClick={() => {
              setSuccess(null);
            }}
          >
            Gửi yêu cầu khác
          </button>
        )}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="quote-form">
      <p className="form-intro">
        Để lại nhu cầu của bạn. Chúng tôi sẽ tư vấn quy cách phù hợp và gửi báo giá chi tiết.
      </p>
      <div className="form-grid">
        <Field label="Họ và tên *">
          <input
            name="name"
            required
            maxLength={150}
            placeholder="Nguyễn Văn An"
            autoComplete="name"
          />
        </Field>
        <Field label="Số điện thoại *">
          <input
            name="phone"
            required
            type="tel"
            pattern="[+0-9][0-9 \(\).\-]{7,19}"
            maxLength={20}
            placeholder="09xx xxx xxx"
            autoComplete="tel"
          />
        </Field>
        <Field label="Email">
          <input name="email" type="email" placeholder="ban@congty.vn" autoComplete="email" />
        </Field>
        <Field label="Công ty / Đơn vị">
          <input
            name="company"
            maxLength={150}
            placeholder="Tên công ty của bạn"
            autoComplete="organization"
          />
        </Field>
        <Field label="Sản phẩm quan tâm">
          <select name="product" defaultValue={product}>
            <option value="">Chọn sản phẩm</option>
            {products.map((p) => {
              return <option key={p.id}>{p.name}</option>;
            })}
            <option>Sản phẩm khác / Cần tư vấn</option>
          </select>
        </Field>
        <Field label="Khối lượng dự kiến">
          <input name="quantity" maxLength={100} placeholder="Ví dụ: 10 tấn" />
        </Field>
        <Field label="Yêu cầu thêm" wide>
          <textarea
            name="message"
            maxLength={3000}
            rows={3}
            placeholder="Quy cách, địa điểm giao hàng, thời gian dự kiến…"
          />
        </Field>
      </div>
      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}
      <button className="button primary full-button" disabled={busy} type="submit">
        {busy ? (
          <>
            <LoaderCircle size={18} className="spin" />
            Đang gửi…
          </>
        ) : (
          <>
            Gửi yêu cầu báo giá
            <ArrowUpRight size={19} />
          </>
        )}
      </button>
      <p className="form-note">Thông tin được sử dụng để liên hệ tư vấn theo yêu cầu của bạn.</p>
      <a className="form-hotline" href={'tel:' + settings?.phone?.replaceAll(' ', '')}>
        <Phone size={16} /> Hoặc gọi trực tiếp: <strong>{settings?.phone}</strong>
      </a>
    </form>
  );
}
