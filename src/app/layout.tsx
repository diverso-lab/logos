import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Logos',
  description: 'The lab logo vault. Find it, download it, move on.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col antialiased">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
