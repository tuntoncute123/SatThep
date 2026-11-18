'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import NavLink from '../components/NavLink';
import { usePathname } from 'next/navigation';
import {
  Phone,
  Mail,
  ArrowUpRight,
  MapPin,
  Clock3,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Logo, Modal, Loading } from './Common';
import QuoteForm from './QuoteForm';
import { QuoteContext } from './QuoteContext';
import { useSite } from '../lib';
import usePublicMotion from '../animations/usePublicMotion';
const nav = [
  ['/', 'Trang chủ'],
  ['/gioi-thieu', 'Về Thép Việt'],
  ['/san-pham', 'Sản phẩm'],
  ['/du-an', 'Dự án'],
  ['/lien-he', 'Liên hệ'],
];
export default function PublicLayout({ children }) {
  const { settings, error, refresh } = useSite();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [quote, setQuote] = useState(null);
  const motionRef = useRef(null);
  usePublicMotion(motionRef, pathname, Boolean(settings));
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  const openQuote = (product = '') => {
    return setQuote(product);
  };
  if (error && !settings) {
    return (
      <div className="state-box">
        <h1>Chưa kết nối được máy chủ</h1>
        <p>{error}</p>
        <button className="button primary" onClick={refresh}>
          Thử lại
        </button>
      </div>
    );
  }
  if (!settings) {
    return <Loading />;
  }
  return (
    <div ref={motionRef} className="public-site">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>Đối tác sắt thép tin cậy cho mọi công trình</span>
          <div>
            <a href={'tel:' + settings.phone.replaceAll(' ', '')}>
              <Phone size={13} />
              {settings.phone}
            </a>
            <span className="utility-divider" />
            <a href={'mailto:' + settings.email}>
              <Mail size={14} />
              {settings.email}
            </a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav aria-label="Điều hướng chính" className={menu ? 'public-nav is-open' : 'public-nav'}>
            {nav.map(([to, label]) => {
              return (
                <NavLink end={to === '/'} href={to} key={to}>
                  {label === 'Về Thép Việt' ? 'Về ' + settings.name : label}
                  {to === '/san-pham' && <ChevronRight className="nav-chevron" size={13} />}
                </NavLink>
              );
            })}
          </nav>
          <button
            className="button primary header-quote"
            onClick={() => {
              return openQuote();
            }}
          >
            Nhận báo giá
            <ArrowUpRight size={18} />
          </button>
          <button
            className="menu-toggle icon-button"
            aria-label={menu ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={menu}
            onClick={() => {
              return setMenu(!menu);
            }}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main-content">
        <QuoteContext.Provider value={{ openQuote }}>{children}</QuoteContext.Provider>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Logo light />
              <p>{settings.intro}</p>
              <div className="footer-quality">
                <ShieldCheck size={20} />
                <span>Chất lượng làm nên uy tín.</span>
              </div>
            </div>
            <div>
              <h3>Khám phá</h3>
              <Link href="/gioi-thieu">Về {settings.name}</Link>
              <Link href="/san-pham">Sản phẩm</Link>
              <Link href="/du-an">Dự án tiêu biểu</Link>
              <Link href="/lien-he">Liên hệ với chúng tôi</Link>
            </div>
            <div>
              <h3>Sản phẩm</h3>
              {['Thép xây dựng', 'Thép hình', 'Thép hộp & ống', 'Thép tấm'].map((c) => {
                return (
                  <Link key={c} href={'/san-pham?danh-muc=' + encodeURIComponent(c)}>
                    {c}
                  </Link>
                );
              })}
            </div>
            <div className="footer-contact">
              <h3>Kết nối với chúng tôi</h3>
              <p>
                <MapPin size={17} />
                {settings.address}
              </p>
              <a href={'tel:' + settings.phone.replaceAll(' ', '')}>
                <Phone size={17} />
                {settings.phone}
              </a>
              <a href={'mailto:' + settings.email}>
                <Mail size={17} />
                {settings.email}
              </a>
              <p>
                <Clock3 size={17} />
                {settings.hours}
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {settings.name}. {settings.tagline}.
            </span>
            <span className="demo-note">Website doanh nghiệp mẫu</span>
            <Link href="/admin">
              Trang quản trị
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </footer>
      {quote !== null && (
        <Modal
          title="Nhận báo giá cho công trình"
          onClose={() => {
            return setQuote(null);
          }}
        >
          <QuoteForm
            product={quote}
            onClose={() => {
              return setQuote(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
