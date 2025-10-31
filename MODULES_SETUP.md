# Configuração do Sistema de Módulos

Este documento descreve as alterações implementadas para suportar múltiplos módulos no sistema MES SaaS.

## Resumo das Alterações

O sistema agora suporta múltiplos módulos que podem ser habilitados/desabilitados para cada empresa individualmente. Atualmente, implementamos o controle para o módulo **MES**.

## Arquivos Modificados

### Backend

1. **server/prisma/schema.prisma**
   - Adicionado campo `enabledModules` (JSON) na tabela `Company`
   - Padrão: array vazio `[]`

2. **server/src/controllers/companies.controller.ts**
   - Adicionada função `toggleModule` para habilitar/desabilitar módulos
   - Atualizada criação de empresas para inicializar `enabledModules: []`

3. **server/src/routes/companies.routes.ts**
   - Adicionada rota `PATCH /:id/toggle-module`

4. **server/src/controllers/auth.supabase.controller.ts**
   - Adicionada validação no login para verificar se o módulo MES está habilitado
   - Usuários com role MASTER não são afetados pela validação
   - Mensagem de erro: "A empresa está inativa." quando o módulo não está habilitado

### Frontend

5. **src/types/index.ts**
   - Adicionado campo `enabledModules: string[]` na interface `Company`

6. **src/services/companiesService.ts**
   - Adicionado método `toggleModule(id: string, module: string)`

7. **src/pages/Master/MasterDashboard.tsx**
   - Adicionada função `handleToggleModule`
   - Adicionada seção "Módulos Habilitados" na listagem de empresas
   - Botão para habilitar/desabilitar módulo MES com feedback visual

## Como Aplicar as Alterações

### Passo 1: Executar a Migration do Banco de Dados

```bash
cd server
npx prisma migrate dev --name add_enabled_modules_to_company
```

**Nota:** Certifique-se de que o banco de dados Supabase está acessível antes de executar a migration.

### Passo 2: Atualizar Empresas Existentes

Execute o script SQL `update_enabled_modules.sql` no Supabase:

```sql
-- Habilitar o módulo MES para todas as empresas existentes
UPDATE companies
SET "enabledModules" = '["MES"]'::jsonb
WHERE "enabledModules" IS NULL OR "enabledModules"::text = '[]';
```

**Alternativa:** Se você quiser que empresas existentes iniciem sem módulos habilitados:

```sql
-- Deixar o campo vazio (sem módulos habilitados)
UPDATE companies
SET "enabledModules" = '[]'::jsonb
WHERE "enabledModules" IS NULL;
```

### Passo 3: Reiniciar o Backend

```bash
cd server
npm run dev
```

### Passo 4: Reiniciar o Frontend

```bash
npm run dev
```

## Como Usar

### Para o Master

1. Acesse o **Painel Master** (`/master`)
2. Na listagem de empresas, você verá uma nova seção "Módulos Habilitados"
3. Clique no botão de toggle do **Módulo MES** para habilitar/desabilitar
4. O botão mostrará:
   - **Habilitado** (azul) quando o módulo estiver ativo
   - **Desabilitado** (cinza) quando o módulo estiver inativo

### Comportamento do Login

- **Módulo MES Habilitado:** Usuários podem fazer login normalmente
- **Módulo MES Desabilitado:** Usuários recebem a mensagem "A empresa está inativa."
- **Usuário MASTER:** Sempre pode fazer login, independente do status do módulo

## Estrutura de Dados

### Campo enabledModules

```typescript
enabledModules: string[]  // Array de módulos habilitados

// Exemplos:
[]              // Nenhum módulo habilitado
["MES"]         // Apenas MES habilitado
["MES", "QUALITY"]  // MES e QUALITY habilitados (futuro)
```

### API Endpoint

**PATCH** `/api/companies/:id/toggle-module`

**Request Body:**
```json
{
  "module": "MES"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "enabledModules": ["MES"],
    // ... outros campos
  },
  "message": "Module \"MES\" enabled successfully"
}
```

## Próximos Passos (Futuro)

Para adicionar novos módulos (ex: QUALITY, MAINTENANCE, etc.):

1. Adicione o controle no MasterDashboard.tsx (similar ao módulo MES)
2. O backend já está preparado para suportar qualquer módulo
3. Adicione validações específicas no login se necessário

## Testando

### Teste 1: Habilitar/Desabilitar Módulo
1. Faça login como MASTER
2. Habilite o módulo MES para uma empresa
3. Tente fazer login como usuário dessa empresa → Deve funcionar
4. Desabilite o módulo MES
5. Tente fazer login novamente → Deve exibir "A empresa está inativa."

### Teste 2: Novas Empresas
1. Crie uma nova empresa no painel Master
2. Por padrão, ela virá sem módulos habilitados
3. Habilite o módulo MES para permitir login

### Teste 3: Usuário Master
1. Desabilite o módulo MES para todas as empresas
2. Faça login como MASTER → Deve funcionar normalmente
3. MASTER não é afetado pelo status dos módulos

## Troubleshooting

### Migration falha com erro de conexão
- Verifique se o banco Supabase está acessível
- Confirme as credenciais no arquivo `.env`

### Empresas existentes não conseguem fazer login
- Execute o script SQL `update_enabled_modules.sql` para habilitar o módulo MES

### Botão de toggle não aparece
- Verifique se a migration foi executada
- Recarregue a lista de empresas no painel Master

## Contato

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com o time de desenvolvimento.
