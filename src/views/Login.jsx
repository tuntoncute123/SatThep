'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, LoaderCircle } from 'lucide-react';
import { api } from '../lib';
import { Logo, Field } from '../components/Common';
export default function Login() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const redirect =
    next &&
    (next === '/admin' || next.startsWith('/admin/')) &&
    !next.startsWith('/admin/dang-nhap') &&
    !/[\\\r\n]/.test(next)
      ? next
      : '/admin';
  useEffect(() => {
    api('/auth/me')
      .then(() => {
        return router.replace(redirect);
      })
      .catch(() => {
        // Keep the login form visible when there is no active session.
      });
  }, [router, redirect]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/login', {
        method: 'POST',
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      router.replace(redirect);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <div className="login-visual">
        <img src="/images/hero-workshop.jpg" alt="Nhà xưởng thép" />
        <div />
        <Logo light />
        <section>
          <span className="eyebrow">THÉP VIỆT · KHÔNG GIAN QUẢN TRỊ</span>
          <h1>
            Vững vận hành.
            <br />
            <span>Bền phát triển.</span>
          </h1>
          <p>
            Kết nối sản phẩm, khách hàng và đơn hàng
            <br />
            trong một không gian làm việc.
          </p>
        </section>
        <small>ĐỒNG HÀNH CÙNG DOANH NGHIỆP CỦA BẠN</small>
      </div>
      <div className="login-form-side">
        <Link href="/" className="back-link">
          <ArrowLeft size={17} />
          Trở về website
        </Link>
        <div className="login-card">
          <span className="login-icon">
            <LockKeyhole size={27} />
          </span>
          <span className="eyebrow">CHÀO MỪNG TRỞ LẠI</span>
          <h2>Đăng nhập quản trị</h2>
          <p>Nhập thông tin để vào không gian quản lý doanh nghiệp.</p>
          <form onSubmit={submit}>
            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                placeholder="admin@thepviet.vn"
                autoComplete="username"
              />
            </Field>
            <Field label="Mật khẩu">
              <div className="password-input">
                <input
                  name="password"
                  type={show ? 'text' : 'password'}
                  required
                  maxLength={256}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => {
                    return setShow(!show);
                  }}
                  aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </Field>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button className="button primary full-button" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={19} />
              ) : (
                <>
                  Đăng nhập
                  <ArrowUpRight size={19} />
                </>
              )}
            </button>
          </form>
          {process.env.NODE_ENV === 'development' && (
            <div className="demo-login">
              <strong>Tài khoản trải nghiệm tại máy này</strong>
              <span>admin@thepviet.vn</span>
              <code>ThepViet@2026</code>
            </div>
          )}
          <p className="login-support">
            Quên mật khẩu? Liên hệ người vận hành hệ thống để đặt lại thông tin đăng nhập.
          </p>
        </div>
        <p className="login-copyright">Thép Việt · Quản lý hiệu quả, phát triển vững bền.</p>
      </div>
    </main>
  );
}
