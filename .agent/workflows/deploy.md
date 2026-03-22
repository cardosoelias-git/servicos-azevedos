---
description: Como realizar o deploy oficial do projeto no GitHub e Vercel
---

Para realizar o deploy deste projeto e garantir que todas as alterações (incluindo Realtime e Design) sejam aplicadas, siga estes passos:

1. **Verificar Alterações Locais**:
   Certifique-se de que todos os arquivos foram salvos.

2. **Comando de Deploy Automatizado**:
   Execute o seguinte comando no terminal:
   ```bash
   npm run deploy
   ```
   *Este comando limpa o cache, adiciona todos os arquivos, faz o commit e envia para o GitHub (que dispara o deploy na Vercel).*

3. **Verificar Variáveis na Vercel**:
   Sempre que houver mudanças no `.env.local`, verifique se as mesmas chaves existem no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`

4. **Sincronização Realtime**:
   Após o deploy, confirme no painel do Supabase se a publicação `supabase_realtime` continua ativa para as tabelas `clientes`, `servicos` e `transacoes`.
