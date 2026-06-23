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
  title: 'Doodle Game',
  description: '¡Dibuja y adivina con tus amigos!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div
          className="min-h-screen w-full"
          style={{
            backgroundColor: 'hsl(var(--background))',
            backgroundImage: 'radial-gradient(hsl(var(--muted)) 1px, transparent 1px), radial-gradient(hsl(var(--muted)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
          data-ai-hint="game pattern background"
        >
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}