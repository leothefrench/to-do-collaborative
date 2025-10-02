import { ThemeProvider } from '@/components/theme-provider';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/Navbar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>
            <div>
              <Navbar />
              <Toaster richColors position="top-right" />
              {children}
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
