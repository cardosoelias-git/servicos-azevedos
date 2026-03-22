import type { Metadata, Viewport } from 'next';
import ClientLayout from '@/components/ClientLayout';
import { siteConfig } from '@/lib/seo';
import '@/app/globals.css';

export const metadata: Metadata = {
  // ... (rest of metadata stays same)
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      noarchive: false,
      nosnippet: false,
      notranslate: false,
    },
  },
  alternates: {
    canonical: siteConfig.canonical,
    languages: {
      'pt-BR': siteConfig.url,
    },
  },
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
  verification: {
    google: 'SEU_GOOGLE_VERIFICATION_TOKEN',
  },
  category: 'Business',
  classification: 'Sistema de Gestão',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
    startupImage: [
      '/startup-image.png',
    ],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appLinks: {
    android: {
      package: 'com.servicosazevedo.app',
      app_name: 'Serviços Azevedo',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Serviços Azevedo',
              description: siteConfig.description,
              url: siteConfig.url,
              logo: `${siteConfig.url}/icon.svg`,
              sameAs: [
                'https://facebook.com/servicosazevedo',
                'https://instagram.com/servicosazevedo',
                'https://linkedin.com/company/servicosazevedo',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+55-11-99999-9999',
                contactType: 'customer service',
                availableLanguage: 'Portuguese',
              },
            }),
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteConfig.name,
              url: siteConfig.url,
              description: siteConfig.description,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteConfig.url}/servicos?search={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
