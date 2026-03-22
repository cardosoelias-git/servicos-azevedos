# 🔗 Conexões e Configurações - Serviços Azevedo

Este arquivo centraliza os acessos e configurações essenciais para o funcionamento do projeto. 

> [!IMPORTANT]
> Mantenha este arquivo seguro. Se o repositório for tornado público, adicione este arquivo ao `.gitignore`.

## 🐙 GitHub (Repositório)
- **Nome**: `cardosoelias-git/servicos-azevedos`
- **URL**: [https://github.com/cardosoelias-git/servicos-azevedos](https://github.com/cardosoelias-git/servicos-azevedos)
- **Workflow**: Os deploys são gatilhados automaticamente ao fazer push para a branch `master`.

## 🔥 Supabase (Banco de Dados & Auth)
- **Projeto ID**: `vfbcboddmqcgzpyyscjs`
- **Dashboard**: [https://supabase.com/dashboard/project/vfbcboddmqcgzpyyscjs](https://supabase.com/dashboard/project/vfbcboddmqcgzpyyscjs)
- **API URL**: `https://vfbcboddmqcgzpyyscjs.supabase.co`
- **Documentação de Tabelas**: Veja [supabase/schema.sql](./supabase/schema.sql)

## 🚀 Vercel (Hospedagem & Deploy)
- **URL da Aplicação**: [https://servicosazevedo.vercel.app](https://servicosazevedo.vercel.app)
- **Dashboard Vercel**: [https://vercel.com/cardosoelias-gits-projects/servicos-azevedo](https://vercel.com/cardosoelias-gits-projects/servicos-azevedo)
- **Status de Deploy**: Automático via GitHub.

---

## 🛠️ Variáveis de Ambiente (.env)
Se precisar configurar um novo ambiente local ou de produção, use estas chaves:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

> [!TIP]
> Os valores atuais estão no arquivo `.env.local` (localmente) e nas configurações de "Environment Variables" no painel da Vercel.

---
*Gerado para facilitar a reconexão rápida e manutenção do sistema.*
