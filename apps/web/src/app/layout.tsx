import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '제안서 템플릿',
  description: '제안서 원본을 전문 웹 제안서로 생성·발행합니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
