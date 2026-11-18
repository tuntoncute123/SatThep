'use client';

import { useEffect, useState } from 'react';
import { useQueryParams } from '../hooks/useQueryParams';
import { Plus, Download, Eye, Trash2, Check, LoaderCircle } from 'lucide-react';
import { api, money, date, number, orderStatuses, useToast, exportCSV } from '../lib';
import { Field, Modal, Loading, Empty } from '../components/Common';
import { AdminHeading, StatusBadge } from './AdminDashboard';
import { useRecords, RecordToolbar, ErrorPanel } from './AdminRecords';
export default function AdminOrders() {
  const { data, error, refresh } = useRecords('orders');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([
    {
      productId: '',
      quantity: 1,
    },
  ]);
  const [params, setParams] = useQueryParams();
  const toast = useToast();
  useEffect(() => {
    if (params.get('tao')) {
      startCreate();
      setParams(
        {},
        {
          replace: true,
        },
      );
    }
    if (params.get('chi-tiet') && data) {
      const found = data.find((o) => {
        return o.id === Number(params.get('chi-tiet'));
      });
      if (found) {
        setDetail(found);
      }
      setParams(
        {},
        {
          replace: true,
        },
      );
    }
  }, [params, data]);
  async function startCreate() {
    setFormError('');
    setItems([
      {
        productId: '',
        quantity: 1,
      },
    ]);
    try {
      const [p, c] = await Promise.all([api('/admin/products'), api('/admin/customers')]);
      setProducts(p);
      setCustomers(c);
      setCreating(true);
    } catch (e) {
      toast(e.message, 'error');
    }
  }
  async function create(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api('/admin/orders', {
        method: 'POST',
        body: {
          customerId: form.customerId,
          note: form.note,
          items,
        },
      });
      setCreating(false);
      toast('Đã tạo đơn hàng.');
      await refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function updateStatus(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      await api('/admin/orders/' + detail.id, {
        method: 'PATCH',
        body: {
          status: new FormData(e.currentTarget).get('status'),
        },
      });
      toast('Đã cập nhật trạng thái và tồn kho liên quan.');
      setDetail(null);
      await refresh();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const filtered =
    data?.filter((o) => {
      return (
        (filter === 'all' || o.status === filter) &&
        ('DH-' + String(o.id).padStart(4, '0') + ' ' + o.customerName + ' ' + o.company)
          .toLocaleLowerCase('vi')
          .includes(query.toLocaleLowerCase('vi'))
      );
    }) || [];
  const total = items.reduce((s, i) => {
    return (
      s +
      (products.find((p) => {
        return p.id === Number(i.productId);
      })?.price || 0) *
        Number(i.quantity)
    );
  }, 0);
  function changeItem(index, key, value) {
    setItems(
      items.map((item, i) => {
        return i === index
          ? {
              ...item,
              [key]: value,
            }
          : item;
      }),
    );
  }
  return (
    <>
      <AdminHeading
        title="Quản lý đơn hàng"
        description="Theo dõi đơn hàng và cập nhật tiến độ giao hàng."
      >
        <button
          className="button secondary"
          onClick={() => {
            return exportCSV(
              'don-hang.csv',
              ['Mã đơn', 'Khách hàng', 'Ngày tạo', 'Tổng tiền', 'Trạng thái'],
              filtered.map((o) => {
                return [
                  'DH-' + o.id,
                  o.customerName,
                  date(o.createdAt),
                  o.total,
                  orderStatuses[o.status],
                ];
              }),
            );
          }}
        >
          <Download size={17} />
          Xuất CSV
        </button>
        <button className="button primary" onClick={startCreate}>
          <Plus size={19} />
          Tạo đơn hàng
        </button>
      </AdminHeading>
      <div className="admin-panel records-panel">
        <RecordToolbar query={query} setQuery={setQuery} placeholder="Tìm mã đơn, khách hàng…">
          <select
            aria-label="Lọc trạng thái đơn hàng"
            value={filter}
            onChange={(e) => {
              return setFilter(e.target.value);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(orderStatuses).map(([v, label]) => {
              return (
                <option key={v} value={v}>
                  {label}
                </option>
              );
            })}
          </select>
          <span className="record-count">{filtered.length} đơn hàng</span>
        </RecordToolbar>
        {error ? (
          <ErrorPanel message={error} onRetry={refresh} />
        ) : !data ? (
          <Loading />
        ) : !filtered.length ? (
          <Empty
            title="Chưa có đơn hàng phù hợp"
            description="Tạo đơn hàng mới hoặc thử thay đổi bộ lọc."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Ngày tạo</th>
                  <th>Tổng giá trị</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  return (
                    <tr key={o.id}>
                      <td>
                        <button
                          className="table-code"
                          onClick={() => {
                            setDetail(o);
                            setFormError('');
                          }}
                        >
                          DH-{String(o.id).padStart(4, '0')}
                        </button>
                      </td>
                      <td>
                        <strong>{o.customerName}</strong>
                        <small>{o.company || 'Khách hàng cá nhân'}</small>
                      </td>
                      <td className="nowrap">{date(o.createdAt)}</td>
                      <td className="nowrap">
                        <strong>{money(o.total)}</strong>
                      </td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={'Xem đơn hàng ' + o.id}
                          onClick={() => {
                            setDetail(o);
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
        <div className="table-footer">
          <span>{filtered.length} đơn hàng</span>
          <span>
            Tổng giá trị:{' '}
            <strong>
              {money(
                filtered.reduce((s, o) => {
                  return s + o.total;
                }, 0),
              )}
            </strong>
          </span>
        </div>
      </div>
      {creating && (
        <Modal
          title="Tạo đơn hàng mới"
          wide
          onClose={() => {
            if (!busy) {
              setCreating(false);
            }
          }}
        >
          <form onSubmit={create}>
            <Field label="Khách hàng *">
              <select name="customerId" required defaultValue="">
                <option value="" disabled>
                  Chọn khách hàng
                </option>
                {customers.map((c) => {
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ' — ' + c.company : ''}
                    </option>
                  );
                })}
              </select>
            </Field>
            {!customers.length && (
              <p className="form-error">Hãy thêm khách hàng trước khi tạo đơn hàng.</p>
            )}
            <div className="order-items">
              <div className="order-items-heading">
                <h3>Sản phẩm đặt hàng</h3>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => {
                    return setItems([
                      ...items,
                      {
                        productId: '',
                        quantity: 1,
                      },
                    ]);
                  }}
                >
                  <Plus size={16} />
                  Thêm dòng
                </button>
              </div>
              {items.map((item, index) => {
                return (
                  <div className="order-item-form" key={index}>
                    <Field label={'Sản phẩm ' + (index + 1)}>
                      <select
                        aria-label={'Sản phẩm ' + (index + 1)}
                        required
                        value={item.productId}
                        onChange={(e) => {
                          return changeItem(index, 'productId', e.target.value);
                        }}
                      >
                        <option value="" disabled>
                          Chọn sản phẩm
                        </option>
                        {products.map((p) => {
                          return (
                            <option key={p.id} value={p.id}>
                              {p.name} · {money(p.price)}/{p.unit}
                            </option>
                          );
                        })}
                      </select>
                    </Field>
                    <Field label="Số lượng">
                      <input
                        aria-label={'Số lượng ' + (index + 1)}
                        type="number"
                        min="0.01"
                        max="10000000"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => {
                          return changeItem(index, 'quantity', e.target.value);
                        }}
                      />
                    </Field>
                    <button
                      type="button"
                      className="icon-button danger-icon"
                      disabled={items.length === 1}
                      aria-label={'Xóa dòng ' + (index + 1)}
                      onClick={() => {
                        return setItems(
                          items.filter((_, i) => {
                            return i !== index;
                          }),
                        );
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
            <Field label="Ghi chú">
              <textarea
                name="note"
                rows={2}
                maxLength={2000}
                placeholder="Địa chỉ giao hàng, thời gian dự kiến…"
              />
            </Field>
            <div className="order-total">
              <span>Tổng giá trị đơn hàng</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="form-note">
              Tổng tiền theo đơn giá lưu trong hệ thống, chưa cộng phí vận chuyển hoặc thuế bổ sung.
              Tồn kho được trừ khi đơn hàng hoàn tất.
            </p>
            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  return setCreating(false);
                }}
                disabled={busy}
              >
                Hủy
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? <LoaderCircle size={18} className="spin" /> : <Check size={18} />}Tạo đơn
                hàng
              </button>
            </div>
          </form>
        </Modal>
      )}
      {detail && (
        <Modal
          title={'Đơn hàng DH-' + String(detail.id).padStart(4, '0')}
          wide
          onClose={() => {
            if (!busy) {
              setDetail(null);
            }
          }}
        >
          <div className="detail-specs">
            <span>
              Khách hàng<strong>{detail.customerName}</strong>
            </span>
            <span>
              Ngày tạo<strong>{date(detail.createdAt)}</strong>
            </span>
            <span>
              Công ty<strong>{detail.company || 'Cá nhân'}</strong>
            </span>
            <span>
              Trạng thái
              <StatusBadge status={detail.status} />
            </span>
          </div>
          <div className="table-scroll order-detail-table">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((i, index) => {
                  return (
                    <tr key={index}>
                      <td>{i.name}</td>
                      <td>
                        {number(i.quantity)} {i.unit}
                      </td>
                      <td>{money(i.price)}</td>
                      <td>{money(i.price * i.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="order-total">
            <span>Tổng giá trị</span>
            <strong>{money(detail.total)}</strong>
          </div>
          {detail.note && <p className="detail-description">Ghi chú: {detail.note}</p>}
          <form onSubmit={updateStatus}>
            <Field label="Cập nhật trạng thái">
              <select name="status" defaultValue={detail.status}>
                {Object.entries(orderStatuses).map(([v, l]) => {
                  return (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  );
                })}
              </select>
            </Field>
            <p className="form-note">
              Hoàn tất đơn sẽ trừ tồn kho. Khi chuyển từ hoàn tất sang trạng thái khác, hàng được
              hoàn lại vào kho.
            </p>
            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  return setDetail(null);
                }}
                disabled={busy}
              >
                Đóng
              </button>
              <button className="button primary" disabled={busy}>
                <Check size={18} />
                Lưu trạng thái
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
