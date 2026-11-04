# Architecture Guide — Government-Scale E-commerce Dashboard

## 1. Purpose and guiding principles

This document defines how AI coding agents and human developers must design, implement, test, and maintain this application. The project is a full-stack e-commerce platform built with **Next.js App Router, TypeScript, and MongoDB**. It includes a large administrative dashboard, public storefront, product and content management, checkout, orders, and role-based access for government-agency operations.

The architecture prioritizes:
- **Small, focused components:** no React component file should exceed 100 lines of code. Treat this as a hard limit, not a target to approach.
- **Separation of concerns:** UI rendering, state, business rules, data access, validation, and authorization live in separate modules.
- **Server-first implementation:** use React Server Components by default; add client components only when browser interactivity requires them.
- **Secure-by-default behavior:** enforce authorization on the server for every protected operation; never trust UI visibility or client-supplied role/tenant identifiers.
- **Backend-driven content:** administrators can manage products and configurable storefront sections through validated APIs and persisted settings rather than hard-coded page content.
- **Maintainability and testability:** explicit contracts, typed domain models, predictable module boundaries, tests, logs, and documented decisions.
- **Accessibility and responsive design:** support keyboard navigation, screen readers, mobile/tablet/desktop, and clear error states.

## 2. Recommended stack

Use current stable, mutually compatible releases and pin versions through the package manager lockfile.

- **Framework:** Next.js App Router
- **Language:** TypeScript with `strict: true`
- **UI:** React, Tailwind CSS, and an accessible component system such as shadcn/ui where appropriate
- **Forms:** React Hook Form + Zod (or an equivalent consistent, typed approach)
- **Database:** MongoDB Atlas or a managed MongoDB deployment
- **MongoDB access:** MongoDB Node.js driver by default; use Mongoose only if the team explicitly chooses its schema/model conveniences. Do not mix both approaches casually.
- **Authentication:** Auth.js or a similarly maintained authentication solution, with server-side session validation. Choose the implementation deliberately and document it before coding.
- **Testing:** Vitest or Jest for unit tests; React Testing Library for UI; Playwright for critical end-to-end journeys
- **Logging/monitoring:** structured server logs and an error-monitoring service selected for the deployment environment
- **File storage:** object storage for product images and documents; store metadata and object keys in MongoDB, not large binary files directly in normal product documents.
- **Payments:** integrate a payment provider through a server-only adapter. Never store raw card details.

Do not add libraries without a clear need. Check compatibility with the selected Next.js version before introducing framework-specific packages.

## 3. Application structure

Keep route files thin. Route files compose feature components and call appropriate server-side services; they must not become containers for business logic.

```text
src/
  app/
    (storefront)/
      page.tsx
      products/
        page.tsx
        [slug]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      orders/[orderNumber]/page.tsx
    (auth)/
      sign-in/page.tsx
      register/page.tsx
      forgot-password/page.tsx
    (dashboard)/
      admin/
        layout.tsx
        page.tsx
        products/
          page.tsx
          new/page.tsx
          [productId]/edit/page.tsx
        orders/page.tsx
        customers/page.tsx
        content/page.tsx
        settings/page.tsx
    api/
      auth/[...route]/route.ts
      products/route.ts
      products/[productId]/route.ts
      cart/route.ts
      checkout/route.ts
      orders/route.ts
      admin/...
    layout.tsx
    globals.css

  components/
    ui/                 # Generic design-system primitives only
    layout/              # Header, sidebar, navigation, page shells
    feedback/            # Empty states, errors, loading indicators
    forms/               # Reusable form fields and form layout helpers

  features/
    auth/
      components/
      hooks/
      schemas/
      services/
      types/
    catalog/
      components/
      hooks/
      schemas/
      services/
      types/
    cart/
    checkout/
    orders/
    customers/
    content-management/
    dashboard/
    settings/

  server/
    db/
      mongodb.ts
    auth/
      session.ts
      permissions.ts
      password.ts
    repositories/        # MongoDB queries, isolated from UI
    services/            # Cross-repository business operations
    security/
      rate-limit.ts
      audit-log.ts
    payments/
    storage/

  lib/
    env.ts
    errors.ts
    logger.ts
    utils.ts

  config/
    navigation.ts
    permissions.ts

  types/
    api.ts
    next-auth.d.ts

tests/
  unit/
  integration/
  e2e/
```

Adjust feature names to match actual scope, but preserve the boundaries. Avoid creating empty folders prematurely. Keep one feature's code inside that feature unless it is genuinely shared.

## 4. Component rules (mandatory)

### The 100-line limit
- A component file must contain **100 lines or fewer**, including imports, types, hooks, JSX, and exports.
- If a file approaches 80 lines, proactively split it.
- Count comments and blank lines too. Do not evade the limit by compressing code into one line.
- If a component needs more than 100 lines, split it into smaller components, hooks, or modules. Do not create a “mega-component” or move the same complexity into a single helper file.
- This limit applies to React component files. Keep non-UI modules similarly focused; as a team convention, aim for roughly 100–150 lines and split modules when their responsibilities diverge.

### One component, one responsibility
Examples for a product management screen:
- `ProductsPage` — page composition only
- `ProductsPageHeader` — title and primary actions
- `ProductsFilters` — search and filter controls
- `ProductsTable` — table composition
- `ProductTableRow` — one row
- `ProductStatusBadge` — status presentation
- `ProductsPagination` — pagination controls
- `DeleteProductDialog` — confirmation UI

Do not split every HTML element into a component. Extract a component when it has a clear reusable role, meaningful logic, or improves readability.

### Props and reuse
- Define explicit prop types; avoid `any`.
- Prefer small, predictable props rather than passing entire database documents through multiple layers.
- Keep reusable UI primitives domain-agnostic. Product-specific behavior belongs in `features/catalog`.
- Avoid prop drilling across many levels; use feature hooks or a narrowly scoped context when appropriate.
- Do not make a generic abstraction until at least two real use cases justify it.

## 5. Separate state from UI

Keep rendering components presentational wherever practical. Put stateful behavior in feature hooks or controller modules.

Example:
```text
features/catalog/
  components/
    ProductsScreen.tsx
    ProductsTable.tsx
    ProductsFilters.tsx
  hooks/
    useProductsFilters.ts
    useProductSelection.ts
  schemas/
    product.schema.ts
  services/
    product.client.ts
  types/
    product.ts
```

Rules:
- `ProductsTable` receives typed rows and callbacks; it does not fetch data or own unrelated business rules.
- `useProductsFilters` owns local filter state and URL query synchronization if needed.
- Server-side data loading and mutations belong in server services or Server Actions/Route Handlers, not in client components.
- Do not duplicate the same source of truth in local state, URL parameters, and server cache without an explicit synchronization strategy.
- Use URL search parameters for shareable list state such as page, search, sort, and filters when appropriate.
- Keep transient UI state (open dialog, active tab) local to the smallest component that needs it.
- Use context only for genuinely cross-cutting client state, not as a default global store.
- Avoid introducing a global state library unless real requirements justify it. A cart may use a server-backed cart with a small client context for immediate UI updates.
- Never store secrets, authorization decisions, or trusted prices in client state.

## 6. Next.js server/client boundaries

- Default to Server Components. Add `"use client"` only to the smallest component that requires state, event handlers, browser APIs, or client-only libraries.
- Never import server-only modules, MongoDB clients, secret-bearing environment variables, or payment credentials into client code.
- Mark sensitive modules with `import "server-only"` where useful.
- Use Server Actions for appropriate same-app mutations or Route Handlers for explicit API contracts and external integrations. Do not implement the same mutation in multiple places without a shared service.
- Route Handlers and Server Actions must validate input, authenticate the caller, authorize the action, and return safe errors.
- Do not treat middleware/proxy route checks as the only authorization layer. Verify permissions at the data/mutation boundary.
- Use `loading.tsx`, `error.tsx`, `not-found.tsx`, and Suspense boundaries where they improve the experience.
- Define cache behavior deliberately. Admin data, user-specific carts, checkout, and order details must not be accidentally shared across users by caching.

## 7. MongoDB and data access

### Connection
- Keep one reusable MongoDB connection/client in `src/server/db/mongodb.ts`.
- Reuse the client across requests and hot reloads; do not open a new client for every query.
- Read the URI only from server-side environment variables.
- Validate required environment variables at startup or on first server use with a clear, non-secret error.
- Do not log connection strings, credentials, password hashes, session tokens, or payment secrets.
- Use a managed database, least-privilege database credentials, TLS, backups, and separate development/staging/production databases.

### Data access pattern
Use this call path:

```text
Route / Server Component / Server Action
        ↓
Authentication + permission check
        ↓
Feature service (business rules / transaction boundary)
        ↓
Repository (MongoDB queries only)
        ↓
MongoDB
```

Repositories should not contain HTTP response logic. UI components should never query MongoDB directly. Services should not depend on React components.

### Collections to consider
Implement only what is needed for the first milestone, but design with future growth in mind:

- `users` — registered identities, normalized unique email, password hash or external auth identity, status, roles/permissions reference, timestamps
- `products` — title, slug, description, price in integer minor units, currency, SKU, images, inventory, status, category references, SEO fields, timestamps
- `categories` — name, slug, parent reference if hierarchical, status, ordering
- `carts` — optional persisted cart for registered users or anonymous checkout sessions
- `orders` — immutable purchase snapshot, items, prices, currency, totals, customer/contact/shipping details, payment state, fulfillment state, timestamps
- `content_sections` — editable homepage/storefront sections and structured content
- `site_settings` — validated configuration for branding, navigation, contact details, and storefront options
- `audit_logs` — actor, action, target type/id, timestamp, request correlation ID, and safe metadata
- `sessions` or authentication-provider collections — only if required by the selected auth implementation

Add indexes intentionally: unique normalized user email, unique product slug/SKU where appropriate, order number, product status/category/search fields, and fields used in common queries. Verify indexes with realistic query patterns. Avoid speculative indexes everywhere.

### Consistency and money
- Store money as integer minor units (e.g. kobo/cents) with an explicit currency code; never use floating-point arithmetic for prices.
- Snapshot product name, SKU, unit price, tax/discount allocations, and quantity into the order at purchase time so later product edits do not rewrite order history.
- Recalculate prices, discounts, tax, shipping, and stock on the server at checkout. Ignore client-submitted totals.
- Use MongoDB transactions only where the deployment topology supports them and the operation needs atomic multi-document consistency. Otherwise design idempotent workflows and explicit recovery.
- Use idempotency keys for checkout/payment webhooks and other retryable operations.
- Never mark an order as paid solely because the browser returns from a payment provider. Verify provider webhooks server-side.

## 8. Authentication, roles, and guest checkout

### Account types
Support:
- **Administrator:** can access explicitly permitted administration capabilities.
- **Regular user/customer:** can manage their own account and view their own orders.
- **Guest:** can browse and purchase without registering.

Do not assume that every administrator has unrestricted access forever. Use named permissions, and allow additional roles later (e.g. catalog manager, order manager, auditor, agency operator) without rewriting the application.

### First administrator
- Create the first administrator through a one-time, protected bootstrap script or deployment command.
- Read initial credentials from secure environment variables or prompt interactively; never commit a default password.
- Hash passwords with Argon2id or a maintained authentication provider's recommended password hashing.
- Refuse to overwrite an existing administrator and make the bootstrap process safe to rerun.
- Require the administrator to change any temporary password on first sign-in if temporary credentials are used.
- Do not expose public administrator registration.
- Add multi-factor authentication for privileged production accounts when feasible.

### Authorization
- Centralize role/permission definitions and helper functions.
- Enforce permissions on every protected page, Route Handler, Server Action, and service that performs a privileged operation.
- Check object ownership for user resources such as orders and addresses.
- Return 401 for unauthenticated access and 403 for authenticated but unauthorized access where appropriate.
- Log security-relevant administrative actions in `audit_logs`.
- Do not accept a `role`, `userId`, `organizationId`, price, or permission claim from the browser as authoritative.

### Guest checkout
- Guest checkout is a first-class flow; account creation is optional and must not block purchase.
- Assign the guest cart/order a cryptographically random, high-entropy session identifier stored in a secure, HttpOnly, SameSite cookie where possible. Never use a guessable sequential ID.
- Keep guest cart access scoped to that session. Do not expose guest orders by order number alone; use an additional unguessable access token or verified email-based flow.
- Collect only the customer information required to fulfil the order and payment.
- If a guest later creates an account, provide a safe, verified process to associate eligible guest orders with that account.
- Apply rate limits and abuse protection to guest checkout, coupon attempts, account creation, and order lookup.
- Never store card details. Use a payment provider's hosted checkout or tokenized payment components.

## 9. Backend-controlled storefront content

“Almost every section is controlled from the backend” should mean structured, validated content—not arbitrary executable code or unrestricted HTML.

Create admin-managed records for:
- Homepage hero/banner
- Featured categories and products
- Promotional strips and campaign blocks
- Navigation menus and footer links
- Store contact details and policy pages
- Product/category descriptions and SEO metadata
- Theme tokens and supported layout options
- Visibility, ordering, start/end dates, and publication status

Use a **finite set of approved section types** (for example `hero`, `featured_products`, `category_grid`, `promo_banner`, `rich_text`, `faq`) and a Zod schema for each type. The frontend maps known types to approved components. Do not evaluate database content as JavaScript, JSX, templates, or raw HTML. Sanitize any rich text with a maintained sanitizer and restrict allowed tags/attributes. Add draft/published states and audit history for important content changes.

## 10. API and validation conventions

- Use Zod schemas for request input, environment variables, and structured admin content.
- Parse and validate all untrusted input at the server boundary.
- Use consistent response envelopes for public API endpoints, e.g. `{ data }` on success and a safe `{ error: { code, message, requestId } }` on failure.
- Never send stack traces, database errors, secrets, or internal implementation details to clients.
- Use appropriate HTTP status codes and stable machine-readable error codes.
- Implement pagination, filtering, sorting allowlists, and maximum page sizes for collection endpoints.
- Normalize emails and slugs consistently.
- Use optimistic concurrency/version checks for edits where concurrent administrator updates could overwrite one another.
- Keep API types inferred from schemas where possible; avoid maintaining duplicate request/response types by hand.

## 11. Security baseline

- Validate and authorize on the server, every time.
- Use secure, HttpOnly, SameSite cookies for session identifiers; set `Secure` in production.
- Add CSRF protection where the chosen cookie-based mutation architecture requires it.
- Rate-limit authentication, password reset, guest checkout, order lookup, and other abuse-prone endpoints.
- Add password reset with short-lived, single-use tokens; never reveal whether an email exists unnecessarily.
- Restrict uploads by type, size, dimensions where relevant, and authorization. Store uploads in object storage; never trust file extensions alone.
- Prevent mass assignment by explicitly selecting allowed writable fields.
- Sanitize rendered rich text and guard against XSS, injection, open redirects, and insecure direct object references.
- Keep secrets in environment/deployment secret storage, not source control.
- Add audit logs for product changes, order status changes, permission changes, settings changes, and administrative authentication events.
- Define retention and access rules for personal data; collect the minimum required.
- Use dependency scanning, code review, backups, and a documented incident/recovery process.
- Never log passwords, password hashes, access tokens, session cookies, payment data, or sensitive personal information.

## 12. Screen-by-screen component planning

Every screen should have a short component inventory before implementation. Example:

### Admin product list
- `ProductsPage` — server-side route composition
- `ProductsPageHeader` — heading and create action
- `ProductsToolbar` — search, filters, bulk-action trigger
- `ProductsTable` — table layout
- `ProductTableRow` — row presentation
- `ProductStatusBadge` — status label
- `ProductsPagination` — paging controls
- `DeleteProductDialog` — confirmation
- `useProductsFilters` — client-side filter state/URL synchronization
- `product.service.ts` — permission checks and business rules
- `product.repository.ts` — MongoDB operations
- `product.schema.ts` — validation

### Product editor
- `ProductEditorPage`
- `ProductForm`
- `ProductBasicFields`
- `ProductPricingFields`
- `ProductInventoryFields`
- `ProductImageManager`
- `ProductCategorySelector`
- `ProductSeoFields`
- `ProductFormActions`
- `useProductForm`
- `product.schema.ts`
- `product.service.ts`

### Checkout
- `CheckoutPage`
- `CheckoutContactForm`
- `CheckoutShippingForm`
- `CheckoutOrderSummary`
- `CheckoutPaymentSection`
- `CheckoutSubmitButton`
- `useCheckoutForm`
- `checkout.service.ts`
- `order.repository.ts`
- `payment.provider.ts`

This is a planning pattern, not a requirement to create every component regardless of need. Keep each file within the 100-line rule.

## 13. Required implementation workflow for the AI coding agent

For every feature, follow this sequence:

1. **Inspect first:** read the existing architecture, package scripts, routes, schemas, and nearby features. Do not overwrite working code blindly.
2. **Clarify the contract:** state the user story, access rules, inputs/outputs, data changes, loading/empty/error states, and acceptance criteria.
3. **Plan the screen:** list route files, UI components, hooks/state modules, schemas, services, repositories, permissions, and tests.
4. **Define the data model:** specify fields, constraints, indexes, and migration/backfill implications before writing UI.
5. **Implement the smallest vertical slice:** schema → repository → service → route/action → UI → tests.
6. **Enforce boundaries:** UI does not query MongoDB; repositories do not render UI; client code never imports server-only code.
7. **Check file size:** verify each component file is at most 100 lines. Split it if not.
8. **Test:** run typecheck, lint, unit/integration tests, and relevant end-to-end tests.
9. **Review security:** authentication, authorization, tenant/object ownership, validation, rate limits, logging, caching, and secret exposure.
10. **Summarize:** report files created/changed, behavior implemented, commands run and outcomes, remaining risks, and any environment variables needed.

Do not claim a test passed unless it was actually run and its output was checked. Do not leave TODOs in critical security, authentication, payment, or authorization paths.

## 14. Definition of done

A feature is complete only when:
- It meets its acceptance criteria and supports loading, empty, success, and error states as appropriate.
- All component files are 100 lines or fewer.
- State and business logic are separated from presentational UI.
- Inputs are validated and permissions enforced on the server.
- Database operations use repositories/services and appropriate indexes.
- Relevant tests pass, or any blocked tests are explicitly reported.
- Accessibility and responsive behavior have been considered.
- No secrets or sensitive values are exposed or logged.
- Documentation and environment examples are updated.
