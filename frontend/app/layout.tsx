import { ThemeProvider } from '@/components/theme-provider';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import { Toaster } from 'sonner';
import Header from '@/components/Header';

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
              <Header />
              {/* <Toaster richColors position="top-right" /> */}
              <>{children}</>
            </div>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
