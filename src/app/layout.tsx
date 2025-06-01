import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { Inter } from 'next/font/google';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Deep Research View',
  description: 'Visualize your research with interactive animations',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
