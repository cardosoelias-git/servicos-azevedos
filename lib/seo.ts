export const siteConfig = {
  name: 'Serviços Azevedo',
  title: 'Serviços Azevedo - Sistema de Gestão para Habilitação',
  description: 'Sistema completo para gerenciamento de serviços de habilitação de veículos. Controle clientes, serviços, etapas e financeiro em um único lugar.',
  url: 'https://servicosazevedo.vercel.app/',
  ogImage: '/og-image.png',
  keywords: [
    'serviços de habilitação',
    'gestão de habilitação',
    'controle de serviços',
    'sistema para autoescola',
    'gerenciamento de clientes',
    'controle financeiro',
    'sistema de gestão',
    'habilitação de veículos',
    'processo de habilitação',
    'autoescola'
  ],
  authors: [{ name: 'Serviços Azevedo' }],
  creator: 'Serviços Azevedo',
  publisher: 'Serviços Azevedo',
  canonical: 'https://servicosazevedo.vercel.app/',
  twitter: {
    card: 'summary_large_image',
    title: 'Serviços Azevedo - Sistema de Gestão para Habilitação',
    description: 'Sistema completo para gerenciamento de serviços de habilitação de veículos.',
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
  renovacao: {
    title: 'Renovação de CNH | Serviços Azevedo',
    description: 'Renovação de Carteira Nacional de Habilitação. Processo rápido e descomplicado.',
  },
  adicao: {
    title: 'Adição de Categoria | Serviços Azevedo',
    description: 'Adicione novas categorias na sua CNH. Habilitação para moto, carro, caminhão e mais.',
  },
  mudanca: {
    title: 'Mudança de Categoria | Serviços Azevedo',
    description: 'Mude de categoria na sua CNH. Atualize sua habilitação para conduzir novos veículos.',
  },
  veiculos: {
    title: "Serviços e Documentação de Veículos",
    description: "Gestão completa de transferência, emplacamento e licenciamento.",
  }
}
