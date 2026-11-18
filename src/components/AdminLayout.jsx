'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavLink from '../components/NavLink';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { api, useSite, useToast } from '../lib';
import { Logo, Loading } from './Common';
export const adminNav = [
  ['/admin', 'Tổng quan', LayoutDashboard],
  ['/admin/san-pham', 'Sản phẩm', Package],
  ['/admin/don-hang', 'Đơn hàng', ShoppingCart],
  ['/admin/khach-hang', 'Khách hàng', Users],
  ['/admin/bao-gia', 'Yêu cầu báo giá', FileText],
  ['/admin/cai-dat', 'Thông tin doanh nghiệp', Settings],
];
export default function AdminLayout({ children }) {
  const [user, setUser] = useState(undefined);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useSite();
  useEffect(() => {
    api('/auth/me')
      .then(setUser)
      .catch(() => {
        setUser(null);
        router.replace('/admin/dang-nhap?next=' + encodeURIComponent(pathname));
      });
  }, [router, pathname]);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  async function logout() {
    try {
      await api('/auth/logout', {
        method: 'POST',
      });
      router.replace('/admin/dang-nhap');
    } catch (e) {
      toast(e.message, 'error');
    }
  }
  if (user === undefined) {
    return <Loading />;
  }
  if (!user) {
    return <Loading />;
  }
  const title =
    adminNav.find((n) => {
      return n[0] === pathname;
    })?.[1] || 'Quản trị';
  return (
    <div className="admin-shell">
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Đóng menu quản trị"
          onClick={() => {
            return setOpen(false);
          }}
        />
      )}
      <aside className={'admin-sidebar ' + (open ? 'open' : '')}>
        <div className="sidebar-brand">
          <Logo compact />
          <button
            className="icon-button sidebar-close"
            aria-label="Đóng menu"
            onClick={() => {
              return setOpen(false);
            }}
          >
            <X />
          </button>
        </div>
        <div className="workspace-badge">
          <div>TV</div>
          <span>
            {settings?.name || 'Thép Việt'}
            <small>Không gian quản trị</small>
          </span>
          <ShieldCheck size={17} />
        </div>
        <span className="sidebar-label">QUẢN LÝ DOANH NGHIỆP</span>
        <nav aria-label="Điều hướng quản trị">
          {adminNav.map(([path, label, Icon], i) => {
            return (
              <NavLink
                key={path}
                href={path}
                end={path === '/admin'}
                className={i === 5 ? 'settings-nav' : ''}
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/">
            Xem website
            <ArrowUpRight size={17} />
          </Link>
          <div className="sidebar-user">
            <span className="avatar">QT</span>
            <div>
              <strong>Quản trị viên</strong>
              <small>Quản trị hệ thống</small>
            </div>
            <button className="icon-button" onClick={logout} aria-label="Đăng xuất">
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="icon-button admin-menu"
              aria-label="Mở menu quản trị"
              onClick={() => {
                return setOpen(true);
              }}
            >
              <Menu />
            </button>
            <span className="admin-breadcrumb">
              Không gian làm việc
              <ChevronRight size={15} />
              <strong>{title}</strong>
            </span>
          </div>
          <div>
            <span className="system-online">
              <i />
              Hệ thống hoạt động
            </span>
            <Link
              className="icon-button notifications"
              href="/admin/bao-gia"
              aria-label="Xem yêu cầu báo giá"
            >
              <Bell size={20} />
              <i />
            </Link>
            <span className="avatar small">QT</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer">
          <span>
            © {new Date().getFullYear()} {settings?.name} · Hệ thống quản lý doanh nghiệp
          </span>
          <span>Dữ liệu mẫu có thể chỉnh sửa</span>
        </footer>
      </div>
    </div>
  );
}
