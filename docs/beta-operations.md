# Operar a Closed Beta no Supabase

Esta aplicação não tem painel de administração. O Supabase é a consola de operações: aprovas candidaturas e geres o acesso diretamente na base de dados. Mantém o acesso ao projeto limitado à equipa, com MFA ativo, e nunca exponhas as credenciais da base de dados na aplicação cliente.

## Conceitos

- `BetaWaitlist` é a candidatura por email. Os estados possíveis são `pending`, `approved` e `rejected`.
- `BetaCampaign` é a campanha global. A campanha inicial chama-se `closed-beta-2026`.
- `AccessGrant` é o acesso Pro beta de uma pessoa. Não é uma subscrição Stripe e não altera `User.plan`.

Uma waitlist aprovada recebe acesso beta e Pro na próxima sessão iniciada com o mesmo email. Se a pessoa já tiver uma conta, pede-lhe para terminar e iniciar sessão novamente (ou simplesmente atualizar a página). O registo é criado automaticamente pela aplicação.

## Aprovar uma candidatura

No Supabase, abre **Table Editor → BetaWaitlist**, encontra o email e atualiza:

```txt
status: approved
approvedAt: data/hora atual (UTC)
```

Depois comunica à pessoa para iniciar sessão com o mesmo email usado na waitlist. Não é preciso alterar `User.plan` nem criar manualmente um `AccessGrant` no fluxo normal.

Para rejeitar, usa `status: rejected` e `rejectedAt`. Não apagues candidaturas: o histórico é útil.

## Confirmar que recebeu acesso

Após a pessoa iniciar sessão, abre **Table Editor → AccessGrant**. Deves ver um registo com:

```txt
access: pro_access
status: active
campaignId: campanha Closed Beta 2026
```

O plano em `User.plan` continuará a ser `free`. Isso é correto: o acesso efetivo é calculado a partir do plano pago/trial **ou** deste grant beta.

## Revogar Pro individualmente

No **SQL Editor**, executa o seguinte, substituindo apenas o email. A operação mantém o histórico e tem efeito na sessão seguinte/pedido seguinte.

```sql
UPDATE "AccessGrant" AS grant
SET "status" = 'revoked', "revokedAt" = NOW()
FROM "User" AS app_user, "BetaCampaign" AS campaign
WHERE grant."userId" = app_user."id"
  AND grant."campaignId" = campaign."id"
  AND app_user."email" = 'pessoa@example.com'
  AND campaign."slug" = 'closed-beta-2026'
  AND grant."access" = 'pro_access'
  AND grant."status" = 'active';
```

Isto revoga apenas Pro beta. A pessoa continua com a conta Free e continua elegível para comprar/trial mais tarde. Para voltar a conceder o acesso a alguém revogado, altera o mesmo registo para `status = 'active'`, define `revokedAt = NULL` e deixa uma nota explicativa.

## Terminar a beta para todos

Quando decidires a data de fecho, configura-a uma vez na campanha. Todos os grants dessa campanha deixam de contar para Pro a partir desse instante.

```sql
UPDATE "BetaCampaign"
SET "endsAt" = '2026-10-07T23:59:59Z'
WHERE "slug" = 'closed-beta-2026';
```

Podes definir a data no futuro ou `NOW()` para terminar imediatamente. Não precisas atualizar cada utilizador. Para reabrir antes da data, define `endsAt = NULL`; grants individuais revogados mantêm-se revogados.

`endsAt` termina o benefício Pro beta; não altera `APP_PHASE`. Quando estiveres pronto para abrir pagamentos, muda também `APP_PHASE` de `beta` para `early_access` no ambiente de produção.

## Dar uma extensão individual

Define `expiresAt` no `AccessGrant` da pessoa para uma data posterior à data da campanha **apenas se a campanha continuar aberta**. A data global da campanha é sempre um limite máximo; para uma extensão depois do fim global, cria uma nova campanha em vez de reabrir a antiga.

## Segurança operacional

- Não alteres `User.plan` para gerir beta; esse campo pertence a Stripe/trials.
- Não apagues grants ou candidaturas; usa estados e datas de revogação.
- Antes de executar SQL, confirma o email com um `SELECT` equivalente.
- Mantém `endsAt` vazio enquanto a beta estiver aberta; define-o quando tiveres a data final.
- Aplica a migration em produção antes de começares a aprovar candidaturas (`npx prisma migrate deploy` no ambiente de deploy).
