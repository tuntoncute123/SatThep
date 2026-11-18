'use client';

import { useEffect, useState } from 'react';
import { useQueryParams } from '../hooks/useQueryParams';
import {
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  Package,
  Users,
  LoaderCircle,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { api, useToast, useSite, money, number, categories, exportCSV } from '../lib';
import { Field, Modal, Loading, Empty } from '../components/Common';
import { AdminHeading } from './AdminDashboard';
import SteelArt from '../components/SteelArt';
export function useRecords(resource) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  async function refresh() {
    try {
      setData(await api('/admin/' + resource));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, [resource]);
  return {
    data,
    error,
    refresh,
  };
}
export function RecordToolbar({ query, setQuery, placeholder, children }) {
  return (
    <div className="record-toolbar">
      <label className="search-field">
        <Search size={18} />
        <input
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            return setQuery(e.target.value);
          }}
        />
      </label>
      <div>{children}</div>
    </div>
  );
}
export function ErrorPanel({ message, onRetry }) {
  return (
    <div className="form-error" role="alert">
      {message} <button onClick={onRetry}>Thử lại</button>
    </div>
  );
}
const emptyProduct = {
  name: '',
  sku: '',
  category: 'Thép xây dựng',
  brand: 'Hòa Phát',
  price: '',
  stock: '',
  unit: 'kg',
  spec: '',
  description: '',
  active: 1,
};
const emptyCustomer = {
  name: '',
  phone: '',
  email: '',
  company: '',
  address: '',
};
export default function AdminRecords({ type }) {
  const isProduct = type === 'products';
  const { data, error, refresh } = useRecords(type);
  const { refresh: refreshPublic } = useSite();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const [edit, setEdit] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [params, setParams] = useQueryParams();
  useEffect(() => {
    if (params.get('tao')) {
      setEdit({
        ...(isProduct ? emptyProduct : emptyCustomer),
      });
      setFormError('');
      setParams(
        {},
        {
          replace: true,
        },
      );
    }
  }, [params]);
  function openEdit(item) {
    setEdit({
      ...item,
    });
    setFormError('');
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api('/admin/' + type + (edit.id ? '/' + edit.id : ''), {
        method: edit.id ? 'PUT' : 'POST',
        body,
      });
      setEdit(null);
      toast(edit.id ? 'Đã lưu thay đổi.' : 'Đã thêm ' + (isProduct ? 'sản phẩm.' : 'khách hàng.'));
      await refresh();
      if (isProduct) {
        await refreshPublic();
      }
    } catch (e) {
      setFormError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api('/admin/' + type + '/' + deleting.id, {
        method: 'DELETE',
      });
      setDeleting(null);
      toast('Đã xóa ' + (isProduct ? 'sản phẩm.' : 'khách hàng.'));
      await refresh();
      if (isProduct) {
        await refreshPublic();
      }
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  const filtered =
    data?.filter((p) => {
      return (
        (!isProduct || filter === 'Tất cả' || p.category === filter) &&
        Object.values(p).join(' ').toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))
      );
    }) || [];
  function download() {
    exportCSV(
      isProduct ? 'san-pham.csv' : 'khach-hang.csv',
      isProduct
        ? [
            'Mã',
            'Tên sản phẩm',
            'Danh mục',
            'Thương hiệu',
            'Đơn giá',
            'Tồn kho',
            'Đơn vị',
            'Trạng thái',
          ]
        : ['Họ tên', 'Công ty', 'Điện thoại', 'Email', 'Địa chỉ'],
      filtered.map((p) => {
        return isProduct
          ? [
              p.sku,
              p.name,
              p.category,
              p.brand,
              p.price,
              p.stock,
              p.unit,
              p.active ? 'Hiển thị' : 'Ẩn',
            ]
          : [p.name, p.company, p.phone, p.email, p.address];
      }),
    );
  }
  return (
    <>
      <AdminHeading
        title={isProduct ? 'Quản lý sản phẩm' : 'Quản lý khách hàng'}
        description={
          isProduct
            ? 'Quản lý danh mục, giá bán và tồn kho sản phẩm.'
            : 'Kết nối và lưu trữ thông tin khách hàng, đối tác.'
        }
      >
        <button className="button secondary" onClick={download} disabled={!data}>
          <Download size={17} />
          Xuất CSV
        </button>
        <button
          className="button primary"
          onClick={() => {
            return openEdit(isProduct ? emptyProduct : emptyCustomer);
          }}
        >
          <Plus size={19} />
          Thêm {isProduct ? 'sản phẩm' : 'khách hàng'}
        </button>
      </AdminHeading>
      <div className="admin-panel records-panel">
        <RecordToolbar
          query={query}
          setQuery={setQuery}
          placeholder={isProduct ? 'Tìm tên, mã sản phẩm…' : 'Tìm tên, công ty, số điện thoại…'}
        >
          {isProduct && (
            <select
              aria-label="Lọc danh mục"
              value={filter}
              onChange={(e) => {
                return setFilter(e.target.value);
              }}
            >
              {categories.map((c) => {
                return <option key={c}>{c}</option>;
              })}
            </select>
          )}
          <span className="record-count">
            {filtered.length} {isProduct ? 'sản phẩm' : 'khách hàng'}
          </span>
        </RecordToolbar>
        {error ? (
          <ErrorPanel message={error} onRetry={refresh} />
        ) : !data ? (
          <Loading />
        ) : !filtered.length ? (
          <Empty
            title={
              query
                ? 'Không tìm thấy kết quả'
                : 'Chưa có ' + (isProduct ? 'sản phẩm' : 'khách hàng')
            }
            description="Thêm dữ liệu mới hoặc thử thay đổi bộ lọc tìm kiếm."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {(isProduct
                    ? ['Sản phẩm', 'Danh mục', 'Đơn giá', 'Tồn kho', 'Hiển thị', 'Thao tác']
                    : ['Khách hàng', 'Công ty', 'Điện thoại', 'Email', 'Thao tác']
                  ).map((h) => {
                    return <th key={h}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  return (
                    <tr key={p.id}>
                      {isProduct ? (
                        <>
                          <td>
                            <div className="product-table-cell">
                              <div className="table-product-art">
                                <SteelArt category={p.category} />
                              </div>
                              <div>
                                <strong>{p.name}</strong>
                                <small>
                                  {p.sku} · {p.brand}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {p.category}
                            <small>{p.spec}</small>
                          </td>
                          <td className="nowrap">
                            {money(p.price)}
                            <small>/ {p.unit}</small>
                          </td>
                          <td>
                            <strong className={p.stock < 20000 ? 'low-stock' : ''}>
                              {number(p.stock)}
                            </strong>
                            <small>{p.unit}</small>
                          </td>
                          <td>
                            <span
                              className={'status-badge ' + (p.active ? 'completed' : 'cancelled')}
                            >
                              <i />
                              {p.active ? 'Đang hiện' : 'Đã ẩn'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <div className="customer-cell">
                              <span className="customer-avatar">
                                {p.name
                                  .split(' ')
                                  .slice(-2)
                                  .map((w) => {
                                    return w[0];
                                  })
                                  .join('')}
                              </span>
                              <strong>{p.name}</strong>
                            </div>
                          </td>
                          <td>
                            {p.company || 'Cá nhân'}
                            <small>{p.address}</small>
                          </td>
                          <td>
                            <a href={'tel:' + p.phone}>{p.phone}</a>
                          </td>
                          <td>{p.email || '—'}</td>
                        </>
                      )}
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button"
                            aria-label={'Sửa ' + p.name}
                            onClick={() => {
                              return openEdit(p);
                            }}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            className="icon-button danger-icon"
                            aria-label={'Xóa ' + p.name}
                            onClick={() => {
                              return setDeleting(p);
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>
            Hiển thị {filtered.length} / {data?.length || 0} bản ghi
          </span>
          <span>Dữ liệu được lưu trên hệ thống</span>
        </div>
      </div>
      {edit && (
        <Modal
          title={(edit.id ? 'Chỉnh sửa ' : 'Thêm ') + (isProduct ? 'sản phẩm' : 'khách hàng')}
          onClose={() => {
            if (!busy) {
              setEdit(null);
            }
          }}
          wide={isProduct}
        >
          <form onSubmit={save}>
            <div className="form-grid">
              {isProduct ? (
                <>
                  <Field label="Tên sản phẩm *">
                    <input name="name" defaultValue={edit.name} required maxLength={150} />
                  </Field>
                  <Field label="Mã sản phẩm *">
                    <input name="sku" defaultValue={edit.sku} required maxLength={40} />
                  </Field>
                  <Field label="Danh mục *">
                    <select name="category" defaultValue={edit.category}>
                      {categories.slice(1).map((c) => {
                        return <option key={c}>{c}</option>;
                      })}
                    </select>
                  </Field>
                  <Field label="Thương hiệu *">
                    <input name="brand" defaultValue={edit.brand} required maxLength={150} />
                  </Field>
                  <Field label="Đơn giá (VNĐ) *">
                    <input
                      name="price"
                      type="number"
                      min="0"
                      max="10000000000"
                      step="1"
                      defaultValue={edit.price}
                      required
                    />
                  </Field>
                  <Field label="Tồn kho *">
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      max="1000000000"
                      step="0.01"
                      defaultValue={edit.stock}
                      required
                    />
                  </Field>
                  <Field label="Đơn vị *">
                    <select name="unit" defaultValue={edit.unit}>
                      {['kg', 'tấn', 'cây', 'tấm'].map((v) => {
                        return <option key={v}>{v}</option>;
                      })}
                    </select>
                  </Field>
                  <Field label="Hiển thị trên website">
                    <select name="active" defaultValue={edit.active}>
                      <option value="1">Hiển thị</option>
                      <option value="0">Ẩn</option>
                    </select>
                  </Field>
                  <Field label="Quy cách *" wide>
                    <input
                      name="spec"
                      defaultValue={edit.spec}
                      required
                      maxLength={150}
                      placeholder="Ví dụ: D10 – D32 · CB400-V"
                    />
                  </Field>
                  <Field label="Mô tả *" wide>
                    <textarea
                      name="description"
                      defaultValue={edit.description}
                      rows={3}
                      required
                      maxLength={3000}
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Họ và tên *">
                    <input name="name" defaultValue={edit.name} required maxLength={150} />
                  </Field>
                  <Field label="Số điện thoại *">
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={edit.phone}
                      required
                      pattern="[+0-9][0-9 ()\.\-]{7,19}"
                      maxLength={20}
                    />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" defaultValue={edit.email} />
                  </Field>
                  <Field label="Công ty">
                    <input name="company" defaultValue={edit.company} maxLength={150} />
                  </Field>
                  <Field label="Địa chỉ" wide>
                    <textarea name="address" defaultValue={edit.address} maxLength={500} rows={2} />
                  </Field>
                </>
              )}
            </div>
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
                  return setEdit(null);
                }}
                disabled={busy}
              >
                Hủy
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}Lưu{' '}
                {isProduct ? 'sản phẩm' : 'khách hàng'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Xác nhận xóa"
          onClose={() => {
            if (!busy) {
              setDeleting(null);
            }
          }}
        >
          <p className="delete-message">
            Bạn muốn xóa <strong>{deleting.name}</strong>? Thao tác này không thể hoàn tác. Bản ghi
            đang liên kết với đơn hàng sẽ được giữ lại.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => {
                return setDeleting(null);
              }}
              disabled={busy}
            >
              Giữ lại
            </button>
            <button className="button danger" onClick={remove} disabled={busy}>
              <Trash2 size={18} />
              Xóa bản ghi
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
