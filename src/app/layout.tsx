import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FacultyProvider } from '@/lib/FacultyContext';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "CabinMUJ | Faculty Discovery Platform",
  description: "Find your professors and their cabin locations at Manipal University Jaipur instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <FacultyProvider>
          {children}
        </FacultyProvider>
      </body>
    </html>
  );
}
