# 🎯 Guia de Configuração - Serviços Azevedo

## 📋 Índice
1. [Configuração do Supabase](#supabase)
2. [Configuração do GitHub](#github)
3. [Deploy](#deploy)

---

## 🔥 Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `servicos-azevedo`
   - **Database Password**: (gere uma senha forte)
   - **Region**: Escolha a mais próxima de você
4. Clique em **"Create new project"**
5. Aguarde a criação (pode levar alguns minutos)

### Passo 2: Obter as Chaves da API

1. No projeto criado, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...`

### Passo 3: Configurar o arquivo .env.local

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

### Passo 4: Criar as Tabelas

1. No Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `supabase/schema.sql`
4. Clique em **"Run"** para executar

### Passo 5: Verificar Instalação

1. No Supabase, vá em **Table Editor**
2. Você deve ver as tabelas:
   - `clientes`
   - `servicos`
   - `transacoes`
   - `configuracoes`

---

## 🐙 GitHub

### Passo 1: Criar Repositório no GitHub

1. Acesse [https://github.com/new](https://github.com/new)
2. Preencha:
   - **Repository name**: `servicos-azevedo`
   - **Description**: Sistema de gestão para serviços de habilitação
   - **Visibility**: Private (ou Public)
3. NÃO initialize com README
4. Clique em **"Create repository"**

### Passo 2: Conectar o Projeto Local ao GitHub

```bash
# Adicionar origin
git remote add origin https://github.com/SEU_USUARIO/servicos-azevedo.git

# Verificar remote
git remote -v

# Enviar código
git push -u origin master
```

### Passo 3: Tokens de Acesso (se necessário)

Se o push pedir autenticação:

1. GitHub > Settings > Developer settings > Personal access tokens
2. Generate new token (classic)
3. Marque `repo` e `workflow`
4. Copie o token
5. Use como senha ao fazer push

---

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Importe o repositório `servicos-azevedo`
5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em **"Deploy"**

### Opção 2: Netlify

1. Acesse [https://netlify.com](https://netlify.com)
2. Conecte ao GitHub
3. New site from Git > Import from GitHub
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Adicione as variáveis de ambiente
6. Deploy!

### Opção 3: Render

1. Acesse [https://render.com](https://render.com)
2. New > Web Service
3. Conecte ao GitHub
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Adicione as variáveis de ambiente
6. Deploy!

---

## ⚙️ Configurações Adicionais

### Habilitar Autenticação (Opcional)

```sql
-- No SQL Editor do Supabase:
-- Auth > Users para ver usuários
-- Auth > Providers para configurar provedores (Google, GitHub, etc.)
```

### Backup Automático

O Supabase já faz backup diário automático no plano Pro.
Para planos gratuitos, considere exportar dados manualmente.

### Monitoramento

- Supabase Dashboard > Logs para ver queries
- Vercel/Netlify > Analytics para métricas de acesso

---

## 📞 Problemas Comuns

### Erro de CORS
```
Access to fetch at 'https://xxx.supabase.co' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solução**: No Supabase > Settings > API > CORS, adicione:
```
http://localhost:3000
https://seu-dominio.vercel.app
```

### Erro de Autenticação
```
Invalid API key
```

**Solução**: Verifique se as chaves no `.env.local` estão corretas.

### Tabelas não existem
```
relation "public.clientes" does not exist
```

**Solução**: Execute o script SQL novamente no Supabase.

---

## 📁 Estrutura do Projeto

```
servicos-azevedo/
├── app/                    # Páginas Next.js
│   ├── page.tsx          # Dashboard
│   ├── clientes/         # Gerenciamento de clientes
│   ├── servicos/         # Gerenciamento de serviços
│   ├── financeiro/        # Controle financeiro
│   └── configuracoes/    # Configurações
├── components/            # Componentes React
│   ├── ui/               # Componentes UI (shadcn)
│   ├── ClientLayout.tsx  # Layout principal
│   └── ThemeToggle.tsx   # Toggle de tema
├── hooks/                 # Hooks personalizados
│   └── useTheme.tsx      # Hook de tema
├── lib/                   # Bibliotecas
│   ├── supabase.ts       # Cliente Supabase
│   ├── storage.ts        # LocalStorage
│   └── utils.ts          # Utilitários
├── supabase/
│   └── schema.sql        # Schema do banco
├── .env.local           # Variáveis de ambiente
└── package.json
```

---

## ✅ Checklist de Configuração

- [ ] Criar projeto no Supabase
- [ ] Obter chaves da API
- [ ] Configurar .env.local
- [ ] Executar schema.sql
- [ ] Criar repositório no GitHub
- [ ] Conectar projeto local
- [ ] Fazer primeiro push
- [ ] Configurar deploy (Vercel/Netlify)
- [ ] Testar aplicação em produção
