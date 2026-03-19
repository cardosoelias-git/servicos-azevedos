# Guia de Deploy: Serviços Azevedo 🚗

Este arquivo contém o passo a passo para realizar deploys futuros do projeto de forma rápida e segura.

## 🚀 1. Sincronização com GitHub
Sempre que fizer alterações no código, use os comandos abaixo para enviar ao servidor:

```bash
# 1. Adicionar todas as mudanças
git add .

# 2. Criar uma nota sobre o que foi mudado
git commit -m "SUA MENSAGEM AQUI"

# 3. Enviar para o GitHub
git push origin main
```

## 🌐 2. Configuração no Painel (Vercel / Netlify)
Após o envio para o GitHub, o build será iniciado automaticamente. Certifique-se de que as **Environment Variables (Variáveis de Ambiente)** estão configuradas no painel:

| Variável | Valor Exemplo |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vfbcboddmqcgzpyyscjs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `SUA_CHAVE_ANON_DO_SUPABASE` |
| `NEXT_PUBLIC_APP_URL` | `https://servicos-azevedos.vercel.app` |

## 🗄️ 3. Banco de Dados
O banco de dados está no Supabase. Se precisar restaurar as tabelas ou políticas em um novo projeto, o script oficial está em:
`supabase/schema.sql`

---
*Gerado automaticamente para facilitar o crescimento do projeto Serviços Azevedo.*
