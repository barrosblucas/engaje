import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/shared/query-provider';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Engaje - Prefeitura de Bandeirantes/MS',
    default: 'Engaje - Plataforma Municipal de Eventos e Iniciativas',
  },
  description:
    'Portal oficial para divulgacao de eventos municipais, inscrições online e comunicacao de iniciativas da Prefeitura Municipal de Bandeirantes - MS.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${inter.variable}`}
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
