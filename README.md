# Sadikecom

Government-agency e-commerce storefront and administration platform.
Next.js 16 (App Router) + TypeScript (strict) + MongoDB. See
[`architecture.md`](./architecture.md) for the binding architecture rules —
component files are hard-limited to 100 lines and all privileged work is
authorized on the server.

## Requirements

- Node.js **22.x** (developed on v22.18)
- npm 10+
- MongoDB 6+ — local (`mongod`), Docker (`docker run -p 27017:27017 mongo:8`),
  or a managed deployment such as MongoDB Atlas

## Setup

```bash
npm install
cp .env.example .env         # fill in the values below (.env.local also works)
npm run dev                  # http://localhost:3000
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string. Least-privilege user, TLS in production. |
| `MONGODB_DB` | yes | Database name. |
| `SESSION_PASSWORD` | yes | iron-session cookie-encryption secret, **32+ random characters**. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `ADMIN_EMAIL` | bootstrap only | Email for `npm run admin:create`. Prompted interactively when unset. |
| `ADMIN_PASSWORD` | bootstrap only | Password for `npm run admin:create`. Prompted (no echo) when unset. |
| `ADMIN_DISPLAY_NAME` | no | Defaults to `Administrator`. |
| `PAYSTACK_SECRET_KEY` | checkout only | Paystack secret key (`sk_test_…`/`sk_live_…`). Checkout is disabled until set. |
| `PAYSTACK_CURRENCY` | no | Charge currency, default `USD`. Must match displayed prices and a currency enabled on your Paystack business. |
| `APP_BASE_URL` | no | Public origin for the payment callback, default `http://localhost:3000`. |
| `SHIPPING_FEE` | no | Flat shipping fee in major units added at checkout, default `0`. |
| `CLOUDINARY_CLOUD_NAME` | image uploads | Cloudinary cloud name for admin product-image uploads. |
| `CLOUDINARY_API_KEY` | image uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | image uploads | Cloudinary API secret — signs uploads server-side. |
| `CLOUDINARY_UPLOAD_FOLDER` | no | Cloudinary folder for product images, default `products`. |

No secrets are ever exposed through `NEXT_PUBLIC_*` variables.

### Payments (Paystack)

Checkout uses Paystack's hosted page: `placeOrder` snapshots the cart into a
pending `orders` document, initializes a transaction server-side, and
redirects the shopper to `authorization_url`. Payment is confirmed only via
server-side verification — both in `/checkout/callback` and the webhook at
`POST /api/payments/paystack` — never from the browser return alone. Register
the webhook URL in the Paystack dashboard; signature verification uses
`PAYSTACK_SECRET_KEY`. Orders are viewable at `/orders/{orderNumber}` by the
ordering guest/session or a shareable access token.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (eslint-config-next) |
| `npm test` | Vitest unit/integration tests |
| `npm run admin:create` | One-time administrator bootstrap |
| `npm run order:seed` | Dev-only: record a paid order (`<email> <slug> [qty] [variant]`) so a user can review that product |

## Creating the first administrator

There is **no** public admin registration and no seeded default password.
The only path is the protected bootstrap command:

```bash
npm run admin:create          # interactive prompt (password is not echoed)
# or non-interactively:
ADMIN_EMAIL=you@agency.gov ADMIN_PASSWORD='...' npm run admin:create
```

The script validates the password policy, hashes with Argon2id, and is safe
to rerun: it reports "already exists" for an existing admin (without
touching the password) and refuses to elevate an existing non-admin
account. New admins sign in at `/sign-in` and land on `/admin`.

## Authentication design

- **Credentials + sealed session cookie** following the Next.js 16
  authentication guide (DAL pattern). `iron-session` encrypts/signs a cookie
  that carries only `userId`; roles and status are re-read from MongoDB on
  every request, so suspension and permission changes take effect
  immediately and the cookie conveys no privileges.
- **Why not Auth.js:** Auth.js v5 (the App Router–compatible line) remains
  in beta. The maintained, docs-endorsed alternative (iron-session +
  a server-side data access layer) gives the same security posture with a
  stable dependency and a single identity system in our own `users`
  collection. The DAL (`src/server/auth/current-user.ts`) is the single
  integration point if the project later adopts Auth.js.
- **Passwords:** Argon2id via `hash-wasm` (pure WASM — identical behavior in
  dev/CI/prod, no native toolchain). Stored in PHC format; never logged.
- **Authorization:** `src/config/permissions.ts` maps roles (`admin`,
  `customer`) to named permissions; `requirePermission`/`requireAdmin`
  protect pages/services and `apiGuard` (`src/server/auth/api-guard.ts`)
  protects admin Route Handlers at the data boundary. Roles submitted by
  the browser are ignored.
- **Route guards:** `src/proxy.ts` performs an *optimistic* session redirect
  for `/admin` (real 307) and issues the guest cookie; the authoritative
  check is always the server-side gate/guard.
- **Rate limiting:** `src/server/security/rate-limit.ts` exposes a
  `RateLimiter` contract. The bundled `InMemoryRateLimiter` is suitable for
  a single dev process only — for multi-instance production, provide a
  Redis/Upstash implementation of the same interface.
- **Sessions:** HttpOnly, `SameSite=Lax`, `Secure` in production, 8-hour
  TTL, path `/`.

## Guest checkout design

Purchases never require an account. `src/proxy.ts` issues a 256-bit random
`ske_guest` cookie (HttpOnly, SameSite=Lax, Secure in production, 30 days)
on storefront routes. A future `carts` collection will key guest carts by
this token; orders will additionally carry an unguessable access token so
they can't be looked up by order number alone. If a guest later registers,
eligible guest orders may be claimed only after email verification. Payment
integration is intentionally out of scope for this milestone.

## Testing

`npm test` runs Vitest (`tests/`): environment validation, auth schemas and
email normalization, customer registration and duplicate-email handling,
Argon2id hash/verify, permission helpers, admin bootstrap safety
(elevation/overwrite refusal), guest-token and cookie attributes, the
in-memory rate limiter, session seal/unseal, and the readiness endpoint
(including a no-secret-leakage check). The MongoDB repository is covered by
a fake implementing the same `UserRepository` interface.

## Project layout

```
src/
  app/            routes: (storefront)/, sign-in, register, admin, api/*
  components/     domain-agnostic UI primitives, forms, feedback, layout
  config/         roles → permissions
  features/       auth + domain slices (announcements, content-management,
                  settings) — schemas, services, components per feature
  server/         db, auth (session/DAL/password/guards), repositories,
                  services, security, guest session — server-only
  lib/            env validation, API envelopes, safe errors, logger
  proxy.ts        guest cookie + optimistic /admin redirect
                  (Next.js 16 "proxy", ex-middleware)
scripts/          admin bootstrap
tests/            vitest unit/integration tests
```

## Known limitations & next milestone

- The in-memory rate limiter does not coordinate across instances — swap a
  Redis adapter for multi-instance deployments (interface already defined).
- Product catalog, carts, checkout, orders, and payments are not yet
  implemented (by design — this is the foundation milestone).
- No MFA yet; add it for privileged production accounts.
- No e2e suite yet; add Playwright smoke tests for public and admin routes.
- Recommended next milestone: catalog (products/categories collections,
  public browsing, admin product management) followed by server-backed
  guest carts.
