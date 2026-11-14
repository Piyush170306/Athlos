import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrandedIntro from '@/components/BrandedIntro';

export const metadata: Metadata = {
  title: 'ATHLOS War of Batches 2026–27 | Official Tournament Hub',
  description:
    'Official scores, standings, schedules, sports formats, highlights, and predictions for ATHLOS War of Batches 2026–27.',
  keywords: ['ATHLOS', 'War of Batches', 'IPM06', 'IPM07', 'IPM08', 'Esports', 'Sports Tournament'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-athlos-gold selection:text-black">
        <BrandedIntro />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
