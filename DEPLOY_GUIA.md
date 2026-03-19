# Guia de Deploy: Serviços Azevedo 🚗

Este arquivo contém o comando definitivo para realizar deploys do projeto de forma rápida, segura e automática.

## 🚀 1. Comando Único de Deploy
Sempre que fizer alterações no código, basta abrir o terminal e digitar:

```bash
npm run deploy
```

**O que este comando faz:**
- Limpa arquivos inválidos do Windows automaticamente.
- Prepara todos os seus arquivos (Layout, Temas, Supabase) para envio.
- Cria um registro (commit) e envia tudo para o GitHub.
- Dispara o build automático no seu painel (Vercel ou Netlify).

## 🌐 2. Configuração no Painel
Certifique-se de que as **Variáveis de Ambiente** estão configuradas no seu serviço de hospedagem:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://vfbcboddmqcgzpyyscjs.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Sua chave Anon)

## 🗄️ 3. Banco de Dados
Lembre-se: o banco de dados oficial está integrado ao projeto. Se precisar mexer no esquema, use o arquivo:
`supabase/schema.sql`

---
*Gerado para garantir um fluxo de trabalho profissional e sem erros.*
