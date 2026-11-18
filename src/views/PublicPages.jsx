'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryParams } from '../hooks/useQueryParams';
import { useQuote } from '../components/QuoteContext';
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  MapPin,
  Phone,
  Mail,
  Clock3,
  ShieldCheck,
  Truck,
  Users,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useSite, categories } from '../lib';
import { SectionHeading, Modal, Empty } from '../components/Common';
import SteelArt from '../components/SteelArt';
import QuoteForm from '../components/QuoteForm';
import { CallToAction, projects, ProjectCard } from './Home';
import { BuyingQuestions } from '../components/SupplyGuide';
export function PageHero({ eyebrow, title, description }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </div>
        <span className="eyebrow">
          <i />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-hero-decoration" aria-hidden="true" />
    </section>
  );
}
export function Products() {
  const { products } = useSite();
  const { openQuote } = useQuote();
  const [params, setParams] = useQueryParams();
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState(null);
  const category = params.get('danh-muc') || 'Tất cả';
  const filtered = products.filter((p) => {
    return (
      (category === 'Tất cả' || p.category === category) &&
      `${p.name} ${p.spec} ${p.brand}`
        .toLocaleLowerCase('vi')
        .includes(query.toLocaleLowerCase('vi'))
    );
  });
  return (
    <>
      <PageHero
        eyebrow="Sản phẩm"
        title={
          <>
            Chất thép tốt.
            <br />
            <span>Nền móng vững.</span>
          </>
        }
        description="Tìm đúng sản phẩm cho công trình của bạn, từ những thương hiệu thép uy tín."
      />
      <section className="section">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="filter-tabs" aria-label="Danh mục sản phẩm">
              {categories.map((c) => {
                return (
                  <button
                    className={category === c ? 'active' : ''}
                    key={c}
                    onClick={() => {
                      return setParams(
                        c === 'Tất cả'
                          ? {}
                          : {
                              'danh-muc': c,
                            },
                      );
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label="Tìm sản phẩm"
                placeholder="Tìm sản phẩm, quy cách…"
                value={query}
                onChange={(e) => {
                  return setQuery(e.target.value);
                }}
              />
            </label>
          </div>
          <div className="catalog-count">
            <span>
              <SlidersHorizontal size={16} /> {filtered.length} sản phẩm
            </span>
            <span>Liên hệ để nhận giá theo khối lượng</span>
          </div>
          <div className="catalog-grid">
            {filtered.map((p, index) => {
              return (
                <article
                  className="catalog-card"
                  key={p.id}
                  data-aos="reveal"
                  data-aos-delay={(index % 4) * 50}
                >
                  <button
                    className="catalog-art"
                    onClick={() => {
                      return setDetail(p);
                    }}
                    aria-label={'Xem ' + p.name}
                  >
                    <span className="product-brand">{p.brand}</span>
                    <SteelArt category={p.category} />
                  </button>
                  <div className="catalog-body">
                    <span className="product-category">{p.category}</span>
                    <button
                      className="product-title"
                      onClick={() => {
                        return setDetail(p);
                      }}
                    >
                      <h3>{p.name}</h3>
                      <ArrowUpRight size={18} />
                    </button>
                    <p>{p.spec}</p>
                    <div className="catalog-card-footer">
                      <span>Mã: {p.sku}</span>
                      <button
                        onClick={() => {
                          return openQuote(p.name);
                        }}
                      >
                        Nhận báo giá
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {!filtered.length && (
            <Empty
              title="Chưa tìm thấy sản phẩm"
              description="Thử từ khóa khác hoặc chọn danh mục Tất cả."
            />
          )}
          <div className="catalog-help" data-aos="reveal">
            <ShieldCheck />
            <div>
              <h3>Bạn cần một quy cách riêng?</h3>
              <p>
                Đội ngũ của chúng tôi sẵn sàng tư vấn sản phẩm phù hợp với bản vẽ và khối lượng công
                trình.
              </p>
            </div>
            <button
              className="button secondary"
              onClick={() => {
                return openQuote();
              }}
            >
              Trao đổi với chuyên viên
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>
      <CallToAction />
      {detail && (
        <Modal
          title={detail.name}
          onClose={() => {
            return setDetail(null);
          }}
        >
          <div className="product-detail-art">
            <SteelArt category={detail.category} />
          </div>
          <div className="detail-specs">
            <span>
              Thương hiệu<strong>{detail.brand}</strong>
            </span>
            <span>
              Quy cách<strong>{detail.spec}</strong>
            </span>
            <span>
              Mã sản phẩm<strong>{detail.sku}</strong>
            </span>
            <span>
              Đơn vị<strong>{detail.unit}</strong>
            </span>
          </div>
          <p className="detail-description">{detail.description}</p>
          <button
            className="button primary full-button"
            onClick={() => {
              setDetail(null);
              openQuote(detail.name);
            }}
          >
            Yêu cầu báo giá
            <ArrowUpRight size={18} />
          </button>
        </Modal>
      )}
    </>
  );
}
export function About() {
  const { settings } = useSite();
  return (
    <>
      <PageHero
        eyebrow={'Về ' + settings.name}
        title={
          <>
            Từ chất thép,
            <br />
            <span>đến chất lượng.</span>
          </>
        }
        description="Một đối tác tin cậy. Một hành trình đồng hành. Một cam kết vững bền."
      />
      <section className="section">
        <div className="container about-page-grid" data-aos="reveal">
          <div>
            <span className="eyebrow">CÂU CHUYỆN CỦA CHÚNG TÔI</span>
            <h2>
              Vững vàng cùng
              <br />
              mỗi công trình.
            </h2>
            <p>{settings.intro}</p>
            <p>
              Chúng tôi tin rằng một công trình bền vững bắt đầu từ những vật liệu tốt và sự tận tâm
              trong từng chi tiết. Vì vậy, mỗi lô thép được cung ứng luôn gắn với trách nhiệm về
              nguồn gốc, quy cách và thời gian giao hàng.
            </p>
            <p>
              Từ các nhà thầu xây dựng, xưởng cơ khí đến doanh nghiệp sản xuất, {settings.name}{' '}
              hướng đến quan hệ hợp tác lâu dài dựa trên sự minh bạch và thấu hiểu.
            </p>
            <div className="about-page-stats">
              <div>
                <strong>{settings.years}</strong>
                <span>Năm kinh nghiệm</span>
              </div>
              <div>
                <strong>{settings.partners}</strong>
                <span>Khách hàng & đối tác</span>
              </div>
            </div>
          </div>
          <img src="/images/hero-workshop.jpg" alt="Gia công thép trong nhà xưởng" />
        </div>
      </section>
      <section className="section values-section">
        <div className="container">
          <SectionHeading
            eyebrow="ĐIỀU CHÚNG TÔI THEO ĐUỔI"
            title="Chất lượng trong từng cam kết."
          />
          <div className="values-grid">
            {[
              [
                ShieldCheck,
                'Uy tín từ chất lượng',
                'Minh bạch nguồn gốc, cung cấp đầy đủ quy cách và tư vấn đúng nhu cầu sử dụng.',
              ],
              [
                Truck,
                'Trách nhiệm đến cùng',
                'Chủ động phối hợp giao nhận và xử lý phản hồi để công trình vận hành thuận lợi.',
              ],
              [
                Users,
                'Hợp tác để phát triển',
                'Lắng nghe, chia sẻ kinh nghiệm và cùng khách hàng tìm ra giải pháp phù hợp.',
              ],
            ].map(([Icon, title, text], index) => {
              return (
                <article key={title} data-aos="reveal" data-aos-delay={index * 50}>
                  <Icon size={34} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              );
            })}
          </div>
          <p className="sample-caption">
            Thông tin giới thiệu là nội dung mẫu và có thể cập nhật trong trang quản trị.
          </p>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
export function Projects() {
  const [params, setParams] = useQueryParams();
  const [filter, setFilter] = useState('TẤT CẢ');
  const selected = projects.find((p) => {
    return String(p.id) === params.get('du-an');
  });
  return (
    <>
      <PageHero
        eyebrow="Dự án tiêu biểu"
        title={
          <>
            Cùng kiến tạo.
            <br />
            <span>Cùng vươn xa.</span>
          </>
        }
        description="Mỗi công trình là một dấu ấn của chất lượng và sự đồng hành."
      />
      <section className="section">
        <div className="container">
          <div className="filter-tabs project-filters">
            {['TẤT CẢ', 'CÔNG NGHIỆP', 'DÂN DỤNG', 'HẠ TẦNG'].map((c) => {
              return (
                <button
                  key={c}
                  className={filter === c ? 'active' : ''}
                  onClick={() => {
                    return setFilter(c);
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="project-grid">
            {projects
              .filter((p) => {
                return filter === 'TẤT CẢ' || p.type === filter;
              })
              .map((p, index) => {
                return (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    index={index}
                    onClick={() => {
                      return setParams({
                        'du-an': p.id,
                      });
                    }}
                  />
                );
              })}
          </div>
          <p className="sample-caption">
            Dự án và khối lượng cung ứng là dữ liệu minh họa, không đại diện cho công trình đã xác
            thực.
          </p>
        </div>
      </section>
      <CallToAction />
      {selected && (
        <Modal
          title={selected.name}
          onClose={() => {
            return setParams({});
          }}
        >
          <img className="project-detail-photo" src={selected.image} alt={selected.name} />
          <div className="detail-specs">
            <span>
              Địa điểm<strong>{selected.location}</strong>
            </span>
            <span>
              Khối lượng<strong>{selected.amount}</strong>
            </span>
          </div>
          <p className="detail-description">{selected.description}</p>
          <span className="sample-caption">Dự án minh họa</span>
        </Modal>
      )}
    </>
  );
}
export function Contact() {
  const { settings } = useSite();
  return (
    <>
      <PageHero
        eyebrow="Liên hệ"
        title={
          <>
            Bắt đầu từ
            <br />
            <span>một cuộc trò chuyện.</span>
          </>
        }
        description="Chúng tôi sẵn sàng lắng nghe và cùng bạn tìm giải pháp sắt thép phù hợp."
      />
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info" data-aos="reveal">
            <span className="eyebrow">KẾT NỐI VỚI {settings.name.toUpperCase()}</span>
            <h2>
              Luôn sẵn sàng
              <br />
              đồng hành.
            </h2>
            <p>
              Liên hệ trực tiếp hoặc gửi yêu cầu. Đội ngũ kinh doanh sẽ phản hồi trong giờ làm việc.
            </p>
            {[
              [
                Phone,
                'Hotline kinh doanh',
                settings.phone,
                'tel:' + settings.phone.replaceAll(' ', ''),
              ],
              [Mail, 'Email', settings.email, 'mailto:' + settings.email],
              [MapPin, 'Văn phòng', settings.address, null],
              [Clock3, 'Giờ làm việc', settings.hours, null],
            ].map(([Icon, title, value, href]) => {
              return (
                <div className="contact-row" key={title}>
                  <span>
                    <Icon size={22} />
                  </span>
                  <div>
                    <small>{title}</small>
                    {href ? <a href={href}>{value}</a> : <p>{value}</p>}
                  </div>
                </div>
              );
            })}
            <div className="contact-note">
              <ShieldCheck size={21} />
              <p>
                Tư vấn đúng nhu cầu.
                <br />
                Báo giá rõ ràng, không phát sinh cam kết.
              </p>
            </div>
          </div>
          <div className="contact-form-card" data-aos="reveal" data-aos-delay="100">
            <h2>Nhận tư vấn & báo giá</h2>
            <QuoteForm />
          </div>
        </div>
      </section>
      <BuyingQuestions />
    </>
  );
}
export function NotFound() {
  return (
    <div className="not-found container">
      <span className="eyebrow">404 · KHÔNG TÌM THẤY TRANG</span>
      <h1>Có vẻ bạn đã đi lạc.</h1>
      <p>Trang bạn đang tìm không tồn tại hoặc đã được thay đổi.</p>
      <Link className="button primary" href="/">
        Trở về trang chủ
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
