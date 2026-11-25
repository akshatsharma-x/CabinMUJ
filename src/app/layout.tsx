import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SiteAnalytics } from '@/components/layout/SiteAnalytics';
import { getAdminSession } from '@/lib/server/session';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CabinMUJ | Faculty Discovery Platform",
    template: "%s | CabinMUJ",
  },
  description: "Find your professors and their cabin locations at Manipal University Jaipur instantly.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar isAdmin={Boolean(session)} />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
        <SiteAnalytics />
      </body>
    </html>
  );
}
