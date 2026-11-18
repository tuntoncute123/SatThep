'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Phone,
  ChartNoAxesCombined,
  Save,
  LoaderCircle,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { api, useSite, useToast } from '../lib';
import { Field, Loading } from '../components/Common';
import { AdminHeading } from './AdminDashboard';
export default function AdminSettings() {
  const { settings, refresh } = useSite();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
      });
    }
  }, [settings]);
  function input(key, props = {}) {
    return (
      <input
        value={form[key] || ''}
        onChange={(e) => {
          return setForm({
            ...form,
            [key]: e.target.value,
          });
        }}
        required
        maxLength={150}
        {...props}
      />
    );
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: form,
      });
      await refresh();
      toast('Đã cập nhật thông tin doanh nghiệp trên website.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!form) {
    return <Loading />;
  }
  return (
    <>
      <AdminHeading
        title="Thông tin doanh nghiệp"
        description="Cập nhật thông tin được hiển thị trên website giới thiệu."
      >
        <Link className="button secondary" href="/">
          Xem website
          <ArrowUpRight size={17} />
        </Link>
      </AdminHeading>
      <form onSubmit={save} className="settings-form">
        <section className="admin-panel settings-panel">
          <div className="settings-section-heading">
            <span>
              <Building2 size={23} />
            </span>
            <div>
              <h2>Thông tin chung</h2>
              <p>Tên thương hiệu và lời giới thiệu về doanh nghiệp.</p>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Tên doanh nghiệp *">{input('name')}</Field>
            <Field label="Khẩu hiệu *">{input('tagline')}</Field>
            <Field label="Giới thiệu doanh nghiệp *" wide>
              <textarea
                value={form.intro}
                onChange={(e) => {
                  return setForm({
                    ...form,
                    intro: e.target.value,
                  });
                }}
                minLength={10}
                maxLength={1000}
                rows={4}
                required
              />
            </Field>
          </div>
        </section>
        <section className="admin-panel settings-panel">
          <div className="settings-section-heading">
            <span>
              <Phone size={23} />
            </span>
            <div>
              <h2>Thông tin liên hệ</h2>
              <p>Hiển thị tại đầu trang, chân trang và trang liên hệ.</p>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Số điện thoại *">
              {input('phone', {
                type: 'tel',
                pattern: '[+0-9][0-9 ()\.\-]{7,19}',
              })}
            </Field>
            <Field label="Email *">
              {input('email', {
                type: 'email',
              })}
            </Field>
            <Field label="Địa chỉ *" wide>
              {input('address')}
            </Field>
            <Field label="Giờ làm việc *" wide>
              {input('hours')}
            </Field>
          </div>
        </section>
        <section className="admin-panel settings-panel">
          <div className="settings-section-heading">
            <span>
              <ChartNoAxesCombined size={23} />
            </span>
            <div>
              <h2>Những con số nổi bật</h2>
              <p>Cập nhật bằng số liệu thực tế của doanh nghiệp trước khi công bố.</p>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Năm kinh nghiệm">
              {input('years', {
                maxLength: 15,
              })}
            </Field>
            <Field label="Công trình đồng hành">
              {input('projects', {
                maxLength: 15,
              })}
            </Field>
            <Field label="Khách hàng & đối tác">
              {input('partners', {
                maxLength: 15,
              })}
            </Field>
            <Field label="Tấn thép cung ứng / năm">
              {input('capacity', {
                maxLength: 15,
              })}
            </Field>
          </div>
        </section>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="settings-save">
          <span>Thay đổi có hiệu lực ngay sau khi lưu.</span>
          <button className="button primary" disabled={busy}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}Lưu thay đổi
          </button>
        </div>
      </form>
    </>
  );
}
