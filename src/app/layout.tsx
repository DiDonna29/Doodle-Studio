import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Doodle AI',
  description: 'Draw, and let AI guess your doodle!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div
          className="min-h-screen w-full"
          style={{
            backgroundColor: 'hsl(var(--background))', // Ensure background color is applied
            backgroundImage: 'radial-gradient(hsl(var(--muted)) 1px, transparent 1px), radial-gradient(hsl(var(--muted)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
          data-ai-hint="smiley doodle pattern"
        >
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
