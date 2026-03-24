# RiseOS — Guia de Setup Supabase
*Projeto: kmxqvcknhakhhquplmpi*

---

## 1. Executar as Migrations (SQL Editor)

Acesse o SQL Editor do projeto:
**https://supabase.com/dashboard/project/kmxqvcknhakhhquplmpi/sql/new**

Execute os arquivos na ordem:

### Passo 1 — Schema completo
Cole e execute o conteúdo de:
```
supabase/migrations/001_initial_schema.sql
```
Isso cria todas as tabelas, índices, triggers, views e políticas RLS.

### Passo 2 — Dados de referência
Cole e execute o conteúdo de:
```
supabase/seed/001_reference_data.sql
```
Isso insere os departamentos e os pipelines de status padrão.

---

## 2. Criar Buckets no Supabase Storage

Acesse: **https://supabase.com/dashboard/project/kmxqvcknhakhhquplmpi/storage/buckets**

Criar os seguintes buckets:

| Bucket | Visibilidade | Descrição |
|--------|-------------|-----------|
| `avatars` | **Público** | Fotos de perfil dos usuários |
| `task-attachments` | **Privado** | Anexos de tarefas |
| `documents` | **Privado** | Arquivos do módulo Documentos |
| `audio-messages` | **Privado** | Áudios enviados no chat |

**Para cada bucket privado**, adicionar a seguinte política RLS no Storage:

```sql
-- Permitir leitura de anexos por usuários autenticados com acesso à tarefa
-- (configurar via dashboard: Storage → Policies → New policy)
-- Por enquanto, usar "Authenticated users can read" como política inicial
```

---

## 3. Configurar Auth

Acesse: **https://supabase.com/dashboard/project/kmxqvcknhakhhquplmpi/auth/providers**

### Email
- Habilitar **Email** como provedor
- Em desenvolvimento: desabilitar "Confirm email" para agilizar testes
- Em produção: habilitar confirmação por e-mail

### URLs de Redirect
Acesse: **https://supabase.com/dashboard/project/kmxqvcknhakhhquplmpi/auth/url-configuration**

Adicionar:
```
http://localhost:5173
http://localhost:5173/**
https://seu-dominio.com
https://seu-dominio.com/**
```

---

## 4. Verificar RLS

Após executar a migration, verificar se o RLS está ativo:

```sql
-- Executar no SQL Editor para confirmar
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Todas as tabelas devem ter `rowsecurity = true`.

---

## 5. Criar primeiro usuário Admin

Após fazer signup pelo app (http://localhost:5173), execute no SQL Editor:

```sql
-- Substituir <email> pelo email cadastrado
-- Isso promove o usuário a admin global

insert into permissoes (usuario_id, tipo, departamento_id)
select p.id, 'admin', null
from profiles p
join auth.users u on u.id = p.id
where u.email = '<seu-email@rise.com>';
```

---

## 6. Rodar o projeto

```bash
pnpm dev
```

O app estará disponível em `http://localhost:5173`.

---

## Comandos Supabase CLI (opcional)

Instalar o Supabase CLI:
```bash
brew install supabase/tap/supabase
```

Fazer link com o projeto remoto:
```bash
supabase link --project-ref kmxqvcknhakhhquplmpi
```

Gerar tipos TypeScript automaticamente (atualiza `src/lib/database.types.ts`):
```bash
npx supabase gen types typescript --project-id kmxqvcknhakhhquplmpi > src/lib/database.types.ts
```

Aplicar migrations via CLI:
```bash
supabase db push
```

---

## Credenciais

> As credenciais ficam no arquivo `.env` (nunca commitar).

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://kmxqvcknhakhhquplmpi.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_ImLLK5VtiVl54CbksBI2ew_SmC5YVkK` |
| `DATABASE_URL` | `postgresql://postgres:<senha>@db.kmxqvcknhakhhquplmpi.supabase.co:5432/postgres` |
