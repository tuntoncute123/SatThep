'use client';

import { ArrowUpRight, ChevronDown, ClipboardList, PackageCheck, Truck } from 'lucide-react';
import { SectionHeading } from './Common';
import { useQuote } from './QuoteContext';

const steps = [
  {
    icon: ClipboardList,
    title: 'Chia sẻ nhu cầu',
    description:
      'Gửi loại thép, quy cách, khối lượng dự kiến và địa điểm công trình. Nếu có bản vẽ hoặc bảng kê, hãy trao đổi với chuyên viên để đối chiếu.',
  },
  {
    icon: PackageCheck,
    title: 'Thống nhất phương án',
    description:
      'Xác nhận thương hiệu, mác thép, đơn vị tính và lịch giao. Báo giá cần làm rõ thuế, vận chuyển, bốc dỡ và thời hạn hiệu lực trước khi đặt hàng.',
  },
  {
    icon: Truck,
    title: 'Phối hợp giao nhận',
    description:
      'Thống nhất người nhận và điều kiện tiếp cận công trình. Đối chiếu số lượng, quy cách, tình trạng hàng và chứng từ khi bàn giao.',
  },
];

const questions = [
  {
    question: 'Cần chuẩn bị thông tin gì để nhận báo giá?',
    answer:
      'Bạn nên cung cấp tên sản phẩm, đường kính hoặc kích thước, độ dày, mác thép, khối lượng và đơn vị tính. Thêm địa chỉ giao hàng, thời gian cần hàng và số điện thoại để chuyên viên có thể xác nhận yêu cầu. Nếu chưa rõ quy cách, hãy mô tả hạng mục sử dụng trong biểu mẫu.',
  },
  {
    question: 'Vì sao danh mục không hiển thị giá bán cố định?',
    answer:
      'Báo giá phụ thuộc vào thời điểm, thương hiệu, quy cách, khối lượng và phương án giao hàng. Gửi yêu cầu cho sản phẩm bạn quan tâm để nhận thông tin phù hợp. Hãy kiểm tra thời hạn hiệu lực và các khoản chi phí trong báo giá trước khi xác nhận đơn hàng.',
  },
  {
    question: 'Có thể đặt cắt thép theo kích thước riêng không?',
    answer:
      'Hãy ghi kích thước cắt, số lượng, dung sai và yêu cầu bề mặt trong phần nội dung tư vấn. Khả năng gia công, hao hụt, chi phí và thời gian thực hiện cần được chuyên viên xác nhận theo từng sản phẩm và đơn hàng.',
  },
  {
    question: 'Cần kiểm tra những gì khi nhận thép?',
    answer:
      'Đối chiếu phiếu giao hàng với đơn đặt: tên hàng, thương hiệu, quy cách, số lượng hoặc khối lượng và tình trạng bề mặt. Nếu công trình yêu cầu chứng từ nguồn gốc hoặc chất lượng, hãy thống nhất danh mục chứng từ từ lúc đặt hàng. Ghi nhận và phản hồi ngay nếu có chênh lệch.',
  },
];

export function SupplyProcess() {
  const { openQuote } = useQuote();

  return (
    <section className="section supply-section" aria-labelledby="supply-title">
      <div className="container supply-grid">
        <figure className="supply-photo" data-aos="reveal">
          <img
            src="/images/steel-warehouse.webp"
            alt="Các bó thép thanh vằn và thép hình được xếp theo từng khu trong kho"
            width="1440"
            height="960"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Ảnh minh họa kho thép · Tạo bằng AI</figcaption>
        </figure>
        <div className="supply-copy" data-aos="reveal" data-aos-delay="100">
          <span className="eyebrow">TỪ NHU CẦU ĐẾN CÔNG TRÌNH</span>
          <h2 id="supply-title">Rõ từng bước. Vững tiến độ.</h2>
          <p className="supply-intro">
            Chuẩn bị đúng thông tin từ đầu để việc tư vấn, đặt hàng và giao nhận thuận lợi hơn.
          </p>
          <ol className="supply-steps">
            {steps.map(({ icon: Icon, title, description }, index) => {
              return (
                <li key={title}>
                  <span className="supply-step-icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3>
                      <span>0{index + 1}.</span> {title}
                    </h3>
                    <p>{description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <button
            className="button primary"
            onClick={() => {
              openQuote();
            }}
          >
            Gửi nhu cầu của bạn
            <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function BuyingQuestions() {
  return (
    <section className="section buying-section" aria-label="Câu hỏi thường gặp">
      <div className="container buying-grid">
        <SectionHeading
          eyebrow="TRƯỚC KHI ĐẶT HÀNG"
          title="Bạn hỏi. Chúng tôi giải đáp."
          description="Những thông tin cần thiết để chọn sản phẩm và chuẩn bị yêu cầu báo giá."
        />
        <div className="buying-questions" data-aos="reveal">
          {questions.map(({ question, answer }) => {
            return (
              <details className="buying-question" key={question}>
                <summary>
                  <span>{question}</span>
                  <ChevronDown size={20} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
