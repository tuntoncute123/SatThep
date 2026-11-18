import { Providers } from '@/lib';
import { getPublicProducts, getSettings } from '@server/catalog';
import '../styles.css';
import 'aos/dist/aos.css';
import '../animations/motion.css';
import '../content.css';

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

export default async function RootLayout({ children }) {
  const [settings, products] = await Promise.all([getSettings(), getPublicProducts()]);
  return (
    <html lang="vi">
      {/* Extensions may inject attributes on body before React hydrates. Keep this
          escape hatch scoped here so mismatches inside the app still surface. */}
      <body suppressHydrationWarning>
        <Providers initialSettings={settings} initialProducts={products}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
