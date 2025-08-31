'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname.startsWith('/user') || pathname.startsWith('/admin') || pathname.startsWith('/sign');
  
  return (
    <>
      {!hideLayout && <Navbar />}
      <main className={hideLayout ? '' : 'pt-20'}>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}
