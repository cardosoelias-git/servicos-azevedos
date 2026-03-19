---
description: Como realizar o deploy oficial do projeto no GitHub e Vercel
---

Este workflow deve ser seguido para garantir a sincronização segura do projeto local com o ambiente de produção.

### 📋 Pré-requisitos
- Repositório Git configurado (`https://github.com/cardosoelias-git/servicos-azevedos.git`)
- Credenciais do Supabase no `.env.local`

### 🛠️ Passos do Deploy

1. **Validação Local**
   ```bash
   npm run build
   ```

2. **Sincronização com GitHub**
   ```bash
   git add .
   git commit -m "Sua mensagem descritiva"
   git push origin main
   ```

3. **Verificação de Variáveis (Vercel)**
   Certifique-se de que o ambiente de produção tem:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---
*Este workflow garante a integridade do deploy do Serviços Azevedo.*
