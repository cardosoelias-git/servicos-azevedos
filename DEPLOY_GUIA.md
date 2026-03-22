# Guia de Deploy: Serviços Azevedo 🚗

Este arquivo contém o comando definitivo para realizar deploys do projeto de forma rápida, segura e automática.

## 🚀 1. Comando Único de Deploy
Sempre que fizer alterações no código, basta abrir o terminal e digitar:

```bash
npm run deploy
```

> [!TIP]
> Você pode adicionar uma mensagem personalizada: `npm run deploy -- "azevedos"`

**O que este comando faz:**
- **Limpeza de Cache**: Remove a pasta `.next` automaticamente para evitar erros de visualização e "Cannot find module".
- **Resiliência Windows**: Trata arquivos problemáticos (como o arquivo `nul`) que costumam travar o OneDrive.
- **Sincronização Total**: Prepara todos os seus arquivos (Layout, Temas, Supabase) para envio.
- **Commit & Push**: Cria um registro e envia tudo para o GitHub em um único passo.

## 🌐 2. Configuração no Painel
Para detalhes completos de acesso e IDs de projeto, consulte:
👉 **[CONEXOES.md](./CONEXOES.md)**

Certifique-se de que as **Variáveis de Ambiente** estão configuradas no seu serviço de hospedagem:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://vfbcboddmqcgzpyyscjs.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Sua chave Anon - veja .env.local)

## 🗄️ 3. Banco de Dados
Lembre-se: o banco de dados oficial está integrado ao projeto. Se precisar mexer no esquema, use o arquivo:
`supabase/schema.sql`

---
*Gerado para garantir um fluxo de trabalho profissional e sem erros.*
