'use client';

import Link from 'next/link';
import { useQuote } from '../components/QuoteContext';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  BadgeCheck,
  Headset,
  MoveUpRight,
  Check,
  Factory,
  Layers3,
} from 'lucide-react';
import { SectionHeading } from '../components/Common';
import SteelArt from '../components/SteelArt';
import { useSite } from '../lib';
import AnimatedNumber from '../components/AnimatedNumber';
const catalog = [
  ['Thép xây dựng', 'Nền tảng vững chắc cho mọi công trình', '01'],
  ['Thép hình', 'Giải pháp kết cấu chịu lực vượt trội', '02'],
  ['Thép hộp & ống', 'Linh hoạt ứng dụng, bền bỉ thời gian', '03'],
  ['Thép tấm', 'Đa dạng quy cách, đáp ứng mọi nhu cầu', '04'],
];
export const projects = [
  {
    id: 1,
    name: 'Kết cấu nhà xưởng công nghiệp',
    type: 'CÔNG NGHIỆP',
    location: 'Đồng Nai',
    image: '/images/hero-workshop.jpg',
    amount: '1.250 tấn',
    description:
      'Giải pháp thép hình và thép tấm đồng bộ cho hệ khung nhà xưởng. Lập kế hoạch cung ứng theo từng giai đoạn lắp dựng, hỗ trợ kiểm tra quy cách và hồ sơ vật liệu.',
  },
  {
    id: 2,
    name: 'Khu đô thị Riverside',
    type: 'DÂN DỤNG',
    location: 'TP. Hồ Chí Minh',
    image: '/images/building.jpg',
    amount: '2.400 tấn',
    description:
      'Cung ứng thép xây dựng cho kết cấu móng, cột và sàn của khu đô thị. Phối hợp lịch giao hàng với tiến độ thi công để tối ưu không gian tập kết.',
  },
  {
    id: 3,
    name: 'Hạ tầng kết nối khu công nghiệp',
    type: 'HẠ TẦNG',
    location: 'Long An',
    image: '/images/construction.jpg',
    amount: '850 tấn',
    description:
      'Danh mục thép thanh và thép hình cho các hạng mục hạ tầng. Tư vấn phương án vận chuyển và chia khối lượng theo từng đợt thi công.',
  },
];
export function ProjectCard({ project, onClick, index = 0 }) {
  return (
    <button
      className="project-card"
      onClick={onClick}
      data-aos="reveal"
      data-aos-delay={(index % 3) * 50}
    >
      <div className="project-image">
        <img src={project.image} alt={project.name} loading="lazy" />
        <span>{project.type}</span>
        <i>
          <ArrowUpRight size={22} />
        </i>
      </div>
      <div className="project-info">
        <h3>{project.name}</h3>
        <p>
          {project.location}
          <span>•</span>
          {project.amount} thép cung ứng
        </p>
      </div>
    </button>
  );
}
export function CallToAction() {
  const { openQuote } = useQuote();
  return (
    <section className="cta-section">
      <div className="container cta-inner" data-aos="reveal">
        <div>
          <span className="eyebrow">CÙNG BẠN KIẾN TẠO GIÁ TRỊ</span>
          <h2>
            Công trình của bạn.
            <br />
            Cam kết của chúng tôi.
          </h2>
          <p>Chia sẻ nhu cầu, nhận giải pháp sắt thép phù hợp nhất.</p>
        </div>
        <button
          className="button white"
          onClick={() => {
            return openQuote();
          }}
        >
          Kết nối với Thép Việt
          <ArrowUpRight size={20} />
        </button>
        <div className="cta-lines" aria-hidden="true" />
      </div>
    </section>
  );
}
export default function Home() {
  const { settings } = useSite();
  const { openQuote } = useQuote();
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src="/images/hero-workshop.jpg"
          alt="Thợ cơ khí gia công kết cấu thép trong nhà xưởng"
          fetchPriority="high"
        />
        <div className="hero-overlay" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <i /> VỮNG CHẤT THÉP, VỮNG NIỀM TIN
            </span>
            <h1>
              Vững nền móng.
              <br />
              <em>Bền tương lai.</em>
            </h1>
            <p>
              Giải pháp sắt thép toàn diện cho mọi công trình.
              <br className="desktop-break" /> Chất lượng chuẩn mực. Đồng hành bền vững.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/san-pham">
                Khám phá sản phẩm
                <ArrowUpRight size={20} />
              </Link>
              <button
                className="hero-secondary"
                onClick={() => {
                  return openQuote();
                }}
              >
                Tư vấn giải pháp
                <ArrowRight size={19} />
              </button>
            </div>
            <div className="hero-assurance">
              <ShieldCheck size={19} />
              <span>Nguồn gốc rõ ràng</span>
              <i />
              <span>Chất lượng cam kết</span>
            </div>
          </div>
          <div className="hero-side-label">STEEL FOR A STRONGER FUTURE</div>
          <div className="hero-bottom">
            <span>THÉP VIỆT</span>
            <div className="hero-progress">
              <i />
            </div>
            <span className="hero-bottom-caption">
              KIẾN TẠO NHỮNG CÔNG TRÌNH BỀN VỮNG
              <MoveUpRight size={15} />
            </span>
          </div>
        </div>
      </section>
      <section className="stats-strip">
        <div className="container stats-grid">
          {[
            [settings.years, 'Năm kinh nghiệm'],
            [settings.projects, 'Công trình đồng hành'],
            [settings.partners, 'Khách hàng & đối tác'],
            [settings.capacity, 'Tấn thép cung ứng / năm'],
          ].map(([n, label]) => {
            return (
              <div className="stat-item" key={label}>
                <AnimatedNumber value={n} />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="partners-section">
        <div className="container partners-inner" data-aos="reveal">
          <p>
            ĐỒNG HÀNH CÙNG
            <br />
            <strong>NHỮNG THƯƠNG HIỆU UY TÍN</strong>
          </p>
          <div className="partner-logo hoa-phat">
            <Layers3 />
            <span>
              HÒA PHÁT<small>HARMONY FOR DEVELOPMENT</small>
            </span>
          </div>
          <div className="partner-logo hoa-sen">
            <span className="lotus">♧</span>
            <span>HOA SEN GROUP</span>
          </div>
          <div className="partner-logo viet-nhat">
            Vina Kyoei<span>THÉP VIỆT NHẬT</span>
          </div>
          <div className="partner-logo posco">POSCO</div>
          <div className="partner-logo pomina">
            <Factory />
            <span>
              POMINA<small>THÉP VIỆT CHẤT LƯỢNG CAO</small>
            </span>
          </div>
        </div>
      </section>
      <section className="section product-section">
        <div className="container">
          <SectionHeading
            eyebrow="SẢN PHẨM CỦA CHÚNG TÔI"
            title={
              <>
                Đúng chất thép.
                <br className="mobile-only" /> Đủ mọi nhu cầu.
              </>
            }
            description="Danh mục đa dạng, chất lượng đồng nhất cho từng hạng mục công trình."
            link="Xem tất cả sản phẩm"
            href="/san-pham"
          />
          <div className="category-grid">
            {catalog.map(([name, desc, no], index) => {
              return (
                <Link
                  className="category-card"
                  key={name}
                  href={'/san-pham?danh-muc=' + encodeURIComponent(name)}
                  data-aos="reveal"
                  data-aos-delay={index * 50}
                >
                  <div className="category-art">
                    <span className="category-number">{no}</span>
                    <SteelArt category={name} />
                    <span className="category-tag">TIÊU CHUẨN CHẤT LƯỢNG</span>
                  </div>
                  <div className="category-body">
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    <span className="category-link">
                      Khám phá
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section about-section">
        <div className="container about-grid">
          <div className="about-visual" data-aos="reveal">
            <img
              src="/images/construction.jpg"
              alt="Đội ngũ kỹ sư kiểm tra chất lượng tại công trường"
              loading="lazy"
            />
            <div className="about-accent" />
            <div className="experience-badge">
              <strong>{settings.years}</strong>
              <span>
                NĂM KIẾN TẠO
                <br />
                NIỀM TIN
              </span>
              <ArrowUpRight size={26} />
            </div>
            <span className="image-caption">ĐỒNG HÀNH TỪ NỀN MÓNG ĐẦU TIÊN</span>
          </div>
          <div className="about-copy" data-aos="reveal" data-aos-delay="100">
            <span className="eyebrow">
              <i />
              VỀ {settings.name.toUpperCase()}
            </span>
            <h2>
              Không chỉ cung cấp thép.
              <br />
              Chúng tôi xây dựng
              <br />
              <span>niềm tin.</span>
            </h2>
            <p>{settings.intro}</p>
            <p>
              Với nguồn hàng ổn định và đội ngũ am hiểu ngành, chúng tôi mang đến đúng sản phẩm,
              đúng tiến độ và đúng giá trị bạn cần.
            </p>
            <div className="check-list">
              <span>
                <Check />
                Sản phẩm chính hãng, nguồn gốc rõ ràng
              </span>
              <span>
                <Check />
                Tư vấn tận tâm, giải pháp phù hợp
              </span>
              <span>
                <Check />
                Giao hàng linh hoạt, đồng hành dài lâu
              </span>
            </div>
            <Link className="button secondary" href="/gioi-thieu">
              Tìm hiểu về chúng tôi
              <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
      </section>
      <section className="commitment-section">
        <div className="container">
          <SectionHeading
            eyebrow="GIÁ TRỊ LÀM NÊN KHÁC BIỆT"
            title="Vững cam kết. Trọn niềm tin."
          />
          <div className="commitment-grid">
            {[
              [
                BadgeCheck,
                'Chất lượng hàng đầu',
                'Nguồn thép từ các nhà sản xuất uy tín, đầy đủ thông tin quy cách.',
              ],
              [
                Truck,
                'Giao hàng đúng hẹn',
                'Chủ động nguồn hàng, vận chuyển linh hoạt theo tiến độ công trình.',
              ],
              [
                ShieldCheck,
                'Giá trị minh bạch',
                'Báo giá rõ ràng, chính sách hợp tác phù hợp với từng nhu cầu.',
              ],
              [
                Headset,
                'Đồng hành tận tâm',
                'Tư vấn chuyên môn, hỗ trợ nhanh chóng từ lựa chọn đến giao nhận.',
              ],
            ].map(([Icon, title, desc], i) => {
              return (
                <div
                  className="commitment-card"
                  key={title}
                  data-aos="reveal"
                  data-aos-delay={i * 50}
                >
                  <div className="commitment-icon">
                    <Icon size={27} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section projects-section">
        <div className="container">
          <SectionHeading
            eyebrow="DẤU ẤN THÉP VIỆT"
            title="Góp thép dựng xây. Góp sức vươn tầm."
            description="Từ công trình dân dụng đến hạ tầng công nghiệp, chúng tôi luôn đồng hành."
            link="Khám phá dự án"
            href="/du-an"
          />
          <div className="project-grid">
            {projects.map((p, index) => {
              return (
                <Link
                  className="project-card"
                  href={'/du-an?du-an=' + p.id}
                  key={p.id}
                  data-aos="reveal"
                  data-aos-delay={index * 50}
                >
                  <div className="project-image">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    <span>{p.type}</span>
                    <i>
                      <ArrowUpRight size={22} />
                    </i>
                  </div>
                  <div className="project-info">
                    <h3>{p.name}</h3>
                    <p>
                      {p.location}
                      <span>•</span>
                      {p.amount} thép cung ứng
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="sample-caption">
            Các dự án, đối tác và số liệu trên website là nội dung minh họa.
          </p>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
