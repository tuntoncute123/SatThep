'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Download,
  ShoppingCart,
  Users,
  Package,
  Wallet,
  CalendarDays,
  ArrowRight,
  FileText,
  CircleAlert,
  Plus,
} from 'lucide-react';
import { api, money, number, date, orderStatuses, exportCSV } from '../lib';
import { Loading } from '../components/Common';
export function AdminHeading({ eyebrow = 'KHÔNG GIAN QUẢN TRỊ', title, description, children }) {
  return (
    <div className="admin-page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="admin-heading-actions">{children}</div>
    </div>
  );
}
export function StatusBadge({ status, labels = orderStatuses }) {
  return (
    <span className={'status-badge ' + status}>
      <i />
      {labels[status] || status}
    </span>
  );
}
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('/admin/overview')
      .then(setData)
      .catch((e) => {
        return setError(e.message);
      });
  }, []);
  if (error) {
    return (
      <div className="form-error">
        {error}
        <Link href="/admin/dang-nhap"> Đăng nhập lại</Link>
      </div>
    );
  }
  if (!data) {
    return <Loading />;
  }
  const max = Math.max(
    ...data.months.map((m) => {
      return m.revenue;
    }),
    1,
  );
  return (
    <>
      <AdminHeading
        title="Tổng quan doanh nghiệp"
        description="Chào bạn, cùng theo dõi hoạt động kinh doanh hôm nay."
      >
        <button
          className="button secondary"
          onClick={() => {
            return exportCSV(
              'tong-quan-thep-viet.csv',
              ['Chỉ số', 'Giá trị'],
              [
                ['Doanh thu đơn hoàn tất', data.revenue],
                ['Đơn hàng', data.orderCount],
                ['Khách hàng', data.customerCount],
                ['Sản phẩm', data.productCount],
                ...data.months.map((m) => {
                  return [m.label, m.revenue];
                }),
              ],
            );
          }}
        >
          <Download size={17} />
          Xuất báo cáo
        </button>
      </AdminHeading>
      <div className="dashboard-welcome">
        <div>
          <span className="welcome-icon">
            <FileText size={23} />
          </span>
          <div>
            <h3>
              {data.quoteCount
                ? `Bạn có ${data.quoteCount} yêu cầu báo giá cần xử lý`
                : 'Mọi yêu cầu báo giá đã được cập nhật'}
            </h3>
            <p>Phản hồi kịp thời để kết nối với khách hàng tiềm năng.</p>
          </div>
        </div>
        <Link href="/admin/bao-gia">
          Xem yêu cầu
          <ArrowRight size={18} />
        </Link>
      </div>
      <div className="dashboard-stats">
        {[
          [
            Wallet,
            'Doanh thu hoàn tất',
            money(data.revenue),
            'Tổng giá trị đơn hàng hoàn tất',
            'orange',
          ],
          [
            ShoppingCart,
            'Tổng đơn hàng',
            number(data.orderCount),
            'Tất cả trạng thái đơn hàng',
            'blue',
          ],
          [Users, 'Khách hàng', number(data.customerCount), 'Khách hàng trong hệ thống', 'purple'],
          [Package, 'Sản phẩm', number(data.productCount), 'Được quản lý trong kho', 'green'],
        ].map(([Icon, label, value, note, color]) => {
          return (
            <article className="dashboard-stat" key={label}>
              <div>
                <span>{label}</span>
                <i className={color}>
                  <Icon size={21} />
                </i>
              </div>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          );
        })}
      </div>
      <div className="dashboard-charts">
        <section className="admin-panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>Doanh thu theo tháng</h2>
              <p>Giá trị đơn hàng đã hoàn tất</p>
            </div>
            <span className="chart-period">
              <CalendarDays size={16} />6 tháng gần nhất
            </span>
          </div>
          <div className="chart-legend">
            <i />
            Doanh thu <span>Đơn vị: triệu đồng</span>
          </div>
          <div
            className="revenue-chart"
            role="img"
            aria-label={data.months
              .map((m) => {
                return m.label + ': ' + money(m.revenue);
              })
              .join(', ')}
          >
            <div className="chart-y">
              {[1, 0.75, 0.5, 0.25, 0].map((n) => {
                return <span key={n}>{number(Math.round((max * n) / 1e6))}</span>;
              })}
            </div>
            <div className="chart-plot">
              <div className="chart-grid-lines">
                {[1, 2, 3, 4, 5].map((i) => {
                  return <i key={i} />;
                })}
              </div>
              {data.months.map((m, i) => {
                return (
                  <div className="chart-column" key={i}>
                    <span className="bar-value">{number(Math.round(m.revenue / 1e6))}</span>
                    <div
                      className={'chart-bar ' + (i === 5 ? 'current' : '')}
                      style={{
                        height: `${Math.max((m.revenue / max) * 82, m.revenue ? 2 : 0)}%`,
                      }}
                      title={money(m.revenue)}
                    />
                    <span className="bar-label">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section className="admin-panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Thao tác nhanh</h2>
              <p>Bắt đầu công việc của bạn</p>
            </div>
            <span className="quick-spark">✳</span>
          </div>
          {[
            ['/admin/don-hang?tao=1', ShoppingCart, 'Tạo đơn hàng', 'Ghi nhận đơn hàng mới'],
            ['/admin/san-pham?tao=1', Package, 'Thêm sản phẩm', 'Cập nhật danh mục kinh doanh'],
            ['/admin/khach-hang?tao=1', Users, 'Thêm khách hàng', 'Lưu thông tin đối tác'],
          ].map(([url, Icon, title, desc]) => {
            return (
              <Link className="quick-link" key={url} href={url}>
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </div>
                <Plus size={17} />
              </Link>
            );
          })}
          <div className="quick-tip">
            <ShieldIcon />
            <span>Thông tin được lưu tự động sau mỗi thao tác thành công.</span>
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="admin-panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Đơn hàng gần đây</h2>
              <p>Cập nhật hoạt động bán hàng mới nhất</p>
            </div>
            <Link className="text-link" href="/admin/don-hang">
              Xem tất cả
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Giá trị</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => {
                  return (
                    <tr key={o.id}>
                      <td>
                        <Link className="table-code" href={'/admin/don-hang?chi-tiet=' + o.id}>
                          DH-{String(o.id).padStart(4, '0')}
                        </Link>
                        <small>{date(o.createdAt)}</small>
                      </td>
                      <td>
                        <strong>{o.customerName}</strong>
                        <small>{o.company || 'Khách hàng cá nhân'}</small>
                      </td>
                      <td className="nowrap">{money(o.total)}</td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!data.recentOrders.length && <p className="panel-empty">Chưa có đơn hàng.</p>}
          </div>
        </section>
        <section className="admin-panel stock-panel">
          <div className="panel-heading">
            <div>
              <h2>Theo dõi tồn kho</h2>
              <p>Sản phẩm còn dưới 20.000 đơn vị</p>
            </div>
            <CircleAlert size={20} />
          </div>
          {data.lowStock.length ? (
            data.lowStock.slice(0, 4).map((p) => {
              return (
                <Link href="/admin/san-pham" className="stock-item" key={p.id}>
                  <span>
                    <Package size={21} />
                  </span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      Còn {number(p.stock)} {p.unit}
                    </small>
                  </div>
                  <ArrowUpRight size={16} />
                </Link>
              );
            })
          ) : (
            <p className="panel-empty">Tồn kho đang ở mức ổn định.</p>
          )}
          <Link className="stock-link" href="/admin/san-pham">
            Quản lý kho hàng
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </>
  );
}
function ShieldIcon() {
  return (
    <svg
      width="22"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}
