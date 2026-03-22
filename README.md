<div align="center">
  <h1>🚗 Serviços Azevedo</h1>
  <p>Sistema completo de gestão para serviços de habilitação</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/Supabase-ready-green?style=flat-square&logo=supabase" alt="Supabase">
    <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel" alt="Vercel">
  </p>
</div>

## 📋 Índice

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Começando](#começando)
- [Infraestrutura e Conexões](#infraestrutura-e-conexões)
- [Configuração](#configuração)
- [Deploy](#deploy)
- [Estrutura](#estrutura)

## 🎯 Sobre

Sistema completo para gerenciamento de serviços de habilitação de veículos, incluindo:
- Cadastro de clientes
- Acompanhamento de serviços
- Controle financeiro
- Tema claro/escuro

## ✨ Funcionalidades

- 📊 **Dashboard** - Visão geral com estatísticas em tempo real
- 👥 **Clientes** - CRUD completo com máscara de CPF e telefone
- 🚗 **Serviços** - Acompanhamento de etapas com progresso visual
- 💰 **Financeiro** - Controle de entradas e contas a receber
- ⚙️ **Configurações** - Preferências do sistema e backup
- 🌓 **Dark Mode** - Tema claro e escuro com toggle

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Banco de Dados**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + shadcn/ui
- **Animações**: Motion
- **Ícones**: Lucide React
- **Deploy**: Vercel / Netlify

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase (opcional)
- Conta no GitHub (para deploy)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/cardosoelias-git/servicos-azevedos.git
cd servicos-azevedos

# Instale as dependências
npm install

# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o .env.local com suas configurações

# Execute o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🔗 Infraestrutura e Conexões

Para gerenciar o sistema, consulte o arquivo central de conexões:
👉 **[CONEXOES.md](./CONEXOES.md)**

Lá você encontrará links diretos para:
- Dashboard do Supabase (Banco de Dados)
- Dashboard da Vercel (Hospedagem)
- Repositório GitHub (Código Fonte)

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase (obrigatório para produção)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# URL da aplicação (para produção)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### Configurar Supabase

1. Crie um projeto em [https://app.supabase.com](https://app.supabase.com)
2. Acesse **Settings > API** e copie as chaves
3. No **SQL Editor**, execute o script em `supabase/schema.sql`
4. Configure as variáveis de ambiente

### Schema do Banco

O arquivo `supabase/schema.sql` contém:
- Tabela `clientes`
- Tabela `servicos`
- Tabela `transacoes`
- Tabela `configuracoes`
- Índices para performance
- Policies RLS (Row Level Security)

## 🌐 Deploy

### Vercel (Recomendado)

1. Fork este repositório no GitHub
2. Acesse [https://vercel.com](https://vercel.com)
3. Importe o repositório
4. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**

### Netlify

1. Fork este repositório no GitHub
2. Acesse [https://netlify.com](https://netlify.com)
3. New site from Git > Import from GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Adicione as variáveis de ambiente na seção **Environment**

### GitHub Actions

O projeto já inclui workflows prontos:

- `.github/workflows/ci.yml` - CI/CD para produção
- `.github/workflows/preview.yml` - Deploy de preview para PRs

#### Secrets necessários (GitHub > Settings > Secrets):

- `VERCEL_TOKEN` - Token da API do Vercel
- `NEXT_PUBLIC_SUPABASE_URL` - URL do Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase

## 📁 Estrutura

```
servicos-azevedo/
├── app/                    # Páginas (App Router)
│   ├── page.tsx          # Dashboard
│   ├── clientes/         # Gerenciamento de clientes
│   ├── servicos/          # Gerenciamento de serviços
│   │   └── [id]/         # Detalhes do serviço
│   ├── financeiro/         # Controle financeiro
│   └── configuracoes/     # Configurações
├── components/            # Componentes React
│   ├── ui/               # Componentes shadcn/ui
│   ├── ClientLayout.tsx   # Layout principal
│   └── ThemeToggle.tsx   # Toggle de tema
├── hooks/                  # Hooks personalizados
│   └── useTheme.tsx      # Hook de tema
├── lib/                    # Utilitários
│   ├── supabase.ts       # Cliente Supabase
│   ├── storage.ts        # LocalStorage
│   └── utils.ts          # Funções auxiliares
├── supabase/              # Scripts do banco
│   └── schema.sql         # Schema completo
├── .github/workflows/     # GitHub Actions
│   ├── ci.yml            # Pipeline de produção
│   └── preview.yml       # Pipeline de preview
├── vercel.json            # Configuração Vercel
├── netlify.toml           # Configuração Netlify
└── .env.local            # Variáveis locais
```

## 🎨 Personalização

### Cores

Edite `app/globals.css` para alterar o tema:

```css
/* Tema Claro */
:root {
  --color-primary: #F97316;  /* Laranja */
}

/* Tema Escuro */
.dark {
  --background: 222.2 84% 4.9%;
}
```

### Logo

O logo está no componente `ClientLayout.tsx`. Substitua a letra "A" por uma imagem se preferir.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  <p>Desenvolvido com ❤️ usando Next.js + Supabase</p>
</div>
