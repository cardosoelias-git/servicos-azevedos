export const siteConfig = {
  name: 'Serviços Azevedo',
  title: 'Serviços Azevedo - Documentação e Legalização de Veículos',
  description: 'Gestão completa de transferência, emplacamento, licenciamento e regularização de veículos. Controle processos e documentos em um único lugar.',
  url: 'https://servicosazevedo.vercel.app/',
  ogImage: '/og-image.png',
  keywords: [
    'transferência de veículos',
    'emplacamento',
    'licenciamento',
    'documentação veicular',
    'despachante',
    'gerenciamento de clientes',
    'controle financeiro',
    'sistema de gestão',
    'vistoria veicular',
  ],
  authors: [{ name: 'Serviços Azevedo' }],
  creator: 'Serviços Azevedo',
  publisher: 'Serviços Azevedo',
  canonical: 'https://servicosazevedo.vercel.app/',
  twitter: {
    card: 'summary_large_image',
    title: 'Serviços Azevedo - Documentação e Legalização de Veículos',
    description: 'Gestão completa de transferência, emplacamento, licenciamento e regularização de veículos.',
    creator: '@servicosazevedo',
    images: ['/og-image.png'],
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://servicosazevedo.vercel.app/',
    siteName: 'Serviços Azevedo',
    title: 'Serviços Azevedo - Sistema de Gestão para Habilitação',
    description: 'Sistema completo para gerenciamento de serviços de habilitação de veículos. Controle clientes, serviços, etapas e financeiro.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Serviços Azevedo',
      },
    ],
  },
}

export const navigationLinks = [
  { name: 'Dashboard', href: '/', seoName: 'Painel Principal' },
  { name: 'Serviços', href: '/servicos', seoName: 'Gerenciamento de Serviços' },
  { name: 'Clientes', href: '/clientes', seoName: 'Gerenciamento de Clientes' },
  { name: 'Financeiro', href: '/financeiro', seoName: 'Controle Financeiro' },
  { name: 'Configurações', href: '/configuracoes', seoName: 'Configurações do Sistema' },
]

export const servicesSEOMetadata = {
  transferencia: {
    title: 'Transferência de Veículo | Serviços Azevedo',
    description: 'Processo completo de transferência de propriedade de veículos de forma rápida e segura.',
  },
  emplacamento: {
    title: 'Emplacamento e Mercosul | Serviços Azevedo',
    description: 'Primeiro emplacamento e conversão para placas padrão Mercosul.',
  },
  licenciamento: {
    title: 'Licenciamento Anual | Serviços Azevedo',
    description: 'Regularização do licenciamento anual e emissão de CRLV-e.',
  },
  veiculos: {
    title: "Serviços e Documentação de Veículos",
    description: "Gestão completa de transferência, emplacamento e licenciamento.",
  }
}
