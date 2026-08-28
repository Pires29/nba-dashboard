# Production readiness

## Production launch runbook

Use this order for the first production deploy.

1. Create the production Supabase project.
2. Create a private Supabase Storage bucket named `nba-data`.
3. Add production environment variables to the hosting provider.
4. Run Prisma migrations against the production database.
5. Publish the initial NBA data snapshot to production Storage.
6. Create Stripe Live products, prices, coupon, and webhook.
7. Deploy the app.
8. Run the production smoke test.
9. Invite the first beta users.

## Required production environment variables

Use production-only values here. Local development should use `.env.local` from
`.env.local.example`; the data publisher should use `.env.pipeline` from
`.env.pipeline.example`.

Database and auth:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Stripe Live:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY` for the €7.99/month Pro price
- `STRIPE_PRICE_SEASON` for the €39.99 one-time Season Pass price
- `STRIPE_REFERRAL_COUPON_ID`

NBA data and maintenance:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET=nba-data`
- `NBA_DATA_SOURCE=storage`
- `NBA_STORAGE_MANIFEST=current.json`
- `CLEANUP_SECRET`

Production safety:

- `QA_MODE=false`
- `QA_ALLOW_PRODUCTION_LOCAL=false`

## Production database migration

Point `DATABASE_URL` and `DIRECT_URL` to the production Supabase database for
this command only, then run:

```bash
npx prisma migrate deploy
npx prisma validate
```

Do not run `prisma migrate dev` against production.

## Initial NBA Storage publish

In `.env.pipeline`, point these variables to production Supabase Storage:

```bash
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
SUPABASE_STORAGE_BUCKET=nba-data
NBA_DATA_SOURCE=storage
NBA_STORAGE_MANIFEST=current.json
```

Then publish the current production manifest:

```bash
python3 update_data.py
```

After deploy, verify:

- `/api/health` returns HTTP 200.
- The response reports the database as healthy.
- Player logs load from Storage.
- Free user player restrictions still apply.

## Automated on every push and pull request

- Install dependencies with `npm ci` and generate Prisma Client.
- Validate the Prisma schema.
- Apply every migration twice to a fresh PostgreSQL database and verify status.
- Run lint, unit tests, production dependency audit, and production build.
- Start the production server and smoke-test signup, request limits, protected APIs, and `/api/health`.

## Stripe checks before launch

1. Create the Live Monthly Pro product.
2. Create the Live Monthly Pro recurring price:
   - amount: `€7.99`
   - billing period: monthly
   - env var: `STRIPE_PRICE_MONTHLY`
3. Create the Live Season Pass product.
4. Create the Live Season Pass one-time price:
   - amount: `€39.99`
   - env var: `STRIPE_PRICE_SEASON`
5. Do not create a separate Stripe price for the trial. The app uses `STRIPE_PRICE_MONTHLY` and applies a 7-day trial in Checkout.
6. If referrals are enabled for creator partners, create the Live coupon and set `STRIPE_REFERRAL_COUPON_ID`.
7. Create the production webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook`.
8. Subscribe it to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
9. Set the production `STRIPE_WEBHOOK_SECRET`, price IDs, coupon ID, and Stripe secret key on the host.
10. In Stripe test mode, complete one monthly checkout, one trial, and one season payment.
11. Confirm the user plan and renewal fields in Supabase after each event.
12. Cancel a subscription and delete a test account; confirm Stripe and Supabase agree.
13. Replay a webhook event and confirm it is reported as a duplicate rather than processed twice.

## Monitoring before launch

- Configure an uptime monitor for `https://YOUR_DOMAIN/api/health`.
- Configure the hosting provider to retain and alert on structured logs with `level: "error"`.
- Add an external error tracker such as Sentry before inviting paying users.
- Monitor the daily data pipeline and alert when `updatedAt` becomes older than 36 hours.

## Release gate

A release is ready only when CI is green, `/api/health` returns HTTP 200, the latest migration is applied, and the Stripe test checklist above has passed.
