# Production readiness

## Automated on every push and pull request

- Install dependencies with `npm ci` and generate Prisma Client.
- Validate the Prisma schema.
- Apply every migration twice to a fresh PostgreSQL database and verify status.
- Run lint, unit tests, production dependency audit, and production build.
- Start the production server and smoke-test signup, request limits, protected APIs, and `/api/health`.

## Stripe checks before launch

1. Create the production webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook`.
2. Subscribe it to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Set the production `STRIPE_WEBHOOK_SECRET`, price IDs, coupon ID, and Stripe secret key on the host.
4. In Stripe test mode, complete one monthly checkout, one trial, and one season payment.
5. Confirm the user plan and renewal fields in Supabase after each event.
6. Cancel a subscription and delete a test account; confirm Stripe and Supabase agree.
7. Replay a webhook event and confirm it is reported as a duplicate rather than processed twice.

## Monitoring before launch

- Configure an uptime monitor for `https://YOUR_DOMAIN/api/health`.
- Configure the hosting provider to retain and alert on structured logs with `level: "error"`.
- Add an external error tracker such as Sentry before inviting paying users.
- Monitor the daily data pipeline and alert when `updatedAt` becomes older than 36 hours.

## Release gate

A release is ready only when CI is green, `/api/health` returns HTTP 200, the latest migration is applied, and the Stripe test checklist above has passed.
