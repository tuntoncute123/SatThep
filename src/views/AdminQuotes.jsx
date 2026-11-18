'use client';

import { useState } from 'react';
import { Eye, Download, Check, Phone, Mail, LoaderCircle } from 'lucide-react';
import { api, date, quoteStatuses, useToast, exportCSV } from '../lib';
import { Field, Modal, Empty, Loading } from '../components/Common';
import { AdminHeading, StatusBadge } from './AdminDashboard';
import { useRecords, RecordToolbar, ErrorPanel } from './AdminRecords';
export default function AdminQuotes() {
  const { data, error, refresh } = useRecords('quotes');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const toast = useToast();
  const search = query.trim().toLocaleLowerCase('vi');
  const filtered =
    data?.filter((q) => {
      return (
        (filter === 'all' || q.status === filter) &&
        [`BG-${String(q.id).padStart(4, '0')}`, q.name, q.phone, q.email, q.company, q.product]
          .join(' ')
          .toLocaleLowerCase('vi')
          .includes(search)
      );
    }) || [];
  async function update(e) {
    e.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      await api('/admin/quotes/' + detail.id, {
        method: 'PATCH',
        body: {
          status: new FormData(e.currentTarget).get('status'),
        },
      });
      setDetail(null);
      toast('Đã cập nhật yêu cầu báo giá.');
      await refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-quotes">
      <AdminHeading
        title="Yêu cầu báo giá"
        description="Tiếp nhận và xử lý nhu cầu được gửi từ website."
      >
        <button
          className="button secondary"
          disabled={!data || Boolean(error) || !filtered.length}
          onClick={() => {
            return exportCSV(
              'yeu-cau-bao-gia.csv',
              [
                'Mã',
                'Họ tên',
                'Điện thoại',
                'Email',
                'Công ty',
                'Sản phẩm',
                'Khối lượng',
                'Nội dung',
                'Trạng thái',
              ],
              filtered.map((q) => {
                return [
                  q.id,
                  q.name,
                  q.phone,
                  q.email,
                  q.company,
                  q.product,
                  q.quantity,
                  q.message,
                  quoteStatuses[q.status],
                ];
              }),
            );
          }}
        >
          <Download size={17} />
          Xuất CSV
        </button>
      </AdminHeading>
      <div className="quote-summary">
        <button
          type="button"
          aria-pressed={filter === 'all'}
          className={filter === 'all' ? 'selected' : ''}
          onClick={() => {
            setFilter('all');
          }}
        >
          <strong>{data?.length || 0}</strong>
          <span>Tổng yêu cầu</span>
        </button>
        {Object.entries(quoteStatuses).map(([status, label]) => {
          return (
            <button
              key={status}
              type="button"
              aria-pressed={filter === status}
              onClick={() => {
                return setFilter(status);
              }}
              className={filter === status ? 'selected' : ''}
            >
              <strong>
                {data?.filter((q) => {
                  return q.status === status;
                }).length || 0}
              </strong>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="admin-panel records-panel">
        <RecordToolbar
          query={query}
          setQuery={setQuery}
          placeholder="Tìm tên, số điện thoại, sản phẩm…"
        >
          <select
            aria-label="Lọc trạng thái báo giá"
            value={filter}
            onChange={(e) => {
              return setFilter(e.target.value);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(quoteStatuses).map(([v, l]) => {
              return (
                <option key={v} value={v}>
                  {l}
                </option>
              );
            })}
          </select>
        </RecordToolbar>
        {error ? (
          <ErrorPanel message={error} onRetry={refresh} />
        ) : !data ? (
          <Loading />
        ) : !filtered.length ? (
          <Empty
            title="Chưa có yêu cầu phù hợp"
            description="Các yêu cầu từ biểu mẫu website sẽ được hiển thị tại đây."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Yêu cầu</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm quan tâm</th>
                  <th>Khối lượng</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  return (
                    <tr key={q.id}>
                      <td>
                        <strong className="table-code">BG-{String(q.id).padStart(4, '0')}</strong>
                        <small>{date(q.createdAt)}</small>
                      </td>
                      <td>
                        <strong>{q.name}</strong>
                        <small>{q.phone}</small>
                      </td>
                      <td>
                        {q.product || 'Cần tư vấn'}
                        <small>{q.company || 'Khách hàng cá nhân'}</small>
                      </td>
                      <td>{q.quantity || 'Chưa xác định'}</td>
                      <td>
                        <StatusBadge status={q.status} labels={quoteStatuses} />
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={'Xem yêu cầu ' + q.id}
                          onClick={() => {
                            setDetail(q);
                            setFormError('');
                          }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer" aria-live="polite">
          <span>{filtered.length} yêu cầu</span>
          <span>Nguồn: Biểu mẫu website</span>
        </div>
      </div>
      {detail && (
        <Modal
          title={'Yêu cầu BG-' + String(detail.id).padStart(4, '0')}
          onClose={() => {
            if (!busy) {
              setDetail(null);
            }
          }}
        >
          <div className="quote-customer">
            <span className="customer-avatar">
              {detail.name
                .split(' ')
                .slice(-2)
                .map((w) => {
                  return w[0];
                })
                .join('')}
            </span>
            <div>
              <h3>{detail.name}</h3>
              <p>{detail.company || 'Khách hàng cá nhân'}</p>
            </div>
          </div>
          <div className="quote-contact">
            <a href={'tel:' + detail.phone}>
              <Phone size={17} />
              {detail.phone}
            </a>
            {detail.email && (
              <a href={'mailto:' + detail.email}>
                <Mail size={17} />
                {detail.email}
              </a>
            )}
          </div>
          <div className="detail-specs">
            <span>
              Sản phẩm<strong>{detail.product || 'Cần tư vấn'}</strong>
            </span>
            <span>
              Khối lượng<strong>{detail.quantity || 'Chưa xác định'}</strong>
            </span>
            <span>
              Ngày gửi<strong>{date(detail.createdAt)}</strong>
            </span>
            <span>
              Trạng thái
              <StatusBadge status={detail.status} labels={quoteStatuses} />
            </span>
          </div>
          <div className="quote-message">
            <span className="eyebrow">NỘI DUNG YÊU CẦU</span>
            <p>{detail.message || 'Khách hàng chưa ghi chú thêm.'}</p>
          </div>
          <form onSubmit={update} aria-busy={busy}>
            <Field label="Trạng thái xử lý">
              <select name="status" defaultValue={detail.status} disabled={busy}>
                {Object.entries(quoteStatuses).map(([v, l]) => {
                  return (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  );
                })}
              </select>
            </Field>
            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                disabled={busy}
                onClick={() => {
                  return setDetail(null);
                }}
              >
                Đóng
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? <LoaderCircle size={18} className="spin" /> : <Check size={18} />}
                {busy ? 'Đang lưu…' : 'Lưu cập nhật'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
