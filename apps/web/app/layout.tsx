import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Personal Finance & Savings Management',
  description: 'Track money → Understand money → Plan money → Save money → Reach financial goals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
