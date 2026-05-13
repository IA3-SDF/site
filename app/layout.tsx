import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import CookieBanner from '@/src/components/CookieBanner';
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AMESCAO - Association pour le Mieux-Être Social et Culturel d\'Aouda',
  description: 'Soutenir l\'éducation et l\'avenir de la jeunesse d\'Aouda, Togo.',
  openGraph: {
    title: 'AMESCAO',
    description: 'Soutenir l\'éducation et l\'avenir de la jeunesse d\'Aouda, Togo.',
    url: 'https://amescao.org',
    siteName: 'AMESCAO',
    images: [
      {
        url: 'https://picsum.photos/seed/amescao_hero/1200/630',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

/*
En résumé, ce layout global configure les polices, les métadonnées SEO et enveloppe l'application dans un provider pour la gestion de l'état. Il sert de base pour toutes les pages de l'application, assurant une cohérence visuelle et fonctionnelle à travers le site. 

*/

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}

