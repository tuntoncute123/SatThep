import { Providers } from '@/lib';
import { getPublicProducts, getSettings } from '@server/catalog';
import '../styles.css';
import 'aos/dist/aos.css';
import '../animations/motion.css';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata = {
  title: 'Thép Việt — Vững nền móng, bền tương lai',
  description:
    'Thép Việt — Giải pháp sắt thép cho mọi công trình. Khám phá thép xây dựng, thép hình, thép hộp và yêu cầu báo giá.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ed5b27',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Providers initialSettings={getSettings()} initialProducts={getPublicProducts()}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
