import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RoleProvider } from '@/context/RoleContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'IT Helpdesk & Ticketing | Universitas Pignatelli Triputra (UPITRA)',
  description: 'Portal layanan bantuan teknologi informasi dan pelaporan kendala teknis bagi sivitas akademika Universitas Pignatelli Triputra (UPITRA).',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
        <RoleProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}

