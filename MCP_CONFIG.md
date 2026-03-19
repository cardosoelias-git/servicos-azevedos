# 🚀 Configuração MCP e GitHub

Este guia descreve como configurar o Model Context Protocol (MCP) para que agentes de IA e o GitHub Actions possam interagir corretamente com este projeto.

## 👤 GitHub Secrets

Para que o pipeline de CI/CD em `.github/workflows/ci.yml` funcione corretamente, você deve configurar os seguintes **Secrets** no seu repositório GitHub (**Settings > Secrets and variables > Actions**):

| Nome | Descrição |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vfbcboddmqcgzpyyscjs.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_1agVU7TlrxfXKALPR9NFjA_SQEeC1rB` |
| `VERCEL_TOKEN` | Seu token de acesso da Vercel (se estiver usando Vercel) |

## 🤖 Supabase MCP Integration

Para que eu (IA) ou outros agentes MCP possam gerenciar seu banco de dados diretamente, o `project_id` deste projeto é:

**Project Ref:** `vfbcboddmqcgzpyyscjs`

### Comandos MCP comuns:
- `mcp_supabase-mcp-server_execute_sql(project_id="vfbcboddmqcgzpyyscjs", query="SELECT * FROM clientes")`
- `mcp_supabase-mcp-server_list_tables(project_id="vfbcboddmqcgzpyyscjs", schemas=["public"])`

## 🔗 Conexão de Banco de Dados

A string de conexão direta (Postgres) é:
`postgresql://postgres:[YOUR-PASSWORD]@db.vfbcboddmqcgzpyyscjs.supabase.co:5432/postgres`

*Nota: Substitua `[YOUR-PASSWORD]` pela sua senha real.*
