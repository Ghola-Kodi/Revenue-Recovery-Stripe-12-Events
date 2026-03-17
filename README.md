# RevEng – Stripe Revenue Recovery (Demo)

Next.js + Supabase + Stripe demo app for Stripe payment failure recovery / signal dashboards.

## Tech

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase Auth (email/password + Google OAuth)
- Stripe webhooks

## Local development

Install deps:

```bash
npm install
```

Create `.env.local` (do **not** commit it). You can copy `.env.example` and fill in values.

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

### Supabase (client + server)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase (server-only)

- `SUPABASE_SERVICE_ROLE_KEY` (used by the Stripe webhook ingestion route)

### Stripe (server-only)

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Supabase Auth setup (Google OAuth)

This app starts Google OAuth in the browser with:

- redirect: `/auth/callback`

And then exchanges the OAuth code on the server in:

- `src/app/auth/callback/route.ts`

### 1) Configure Google → Supabase redirect URI (critical)

In **Google Cloud Console → Credentials → OAuth 2.0 Client**, add this to **Authorized redirect URIs**:

`https://<your-project-ref>.supabase.co/auth/v1/callback`

Example (your current project ref looks like `ageohxugckzuuhlvgnue`):

`https://ageohxugckzuuhlvgnue.supabase.co/auth/v1/callback`

### 2) Configure Supabase Google provider

In **Supabase Dashboard → Authentication → Providers → Google**:

- paste the same **Client ID**
- paste the same **Client Secret**

### 3) Configure allowed redirects back to your app

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**:
  - local: `http://localhost:3000`
  - production: `https://your-vercel-domain.vercel.app`
- **Additional Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://your-vercel-domain.vercel.app/auth/callback`

If you see `Unable to exchange external code`, it’s almost always (1) or (2).

## Stripe webhook setup

The webhook endpoint is:

- `POST /api/webhooks/stripe`

For local development, use the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Set `STRIPE_WEBHOOK_SECRET` to the signing secret printed by the Stripe CLI.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import it in Vercel.
3. In **Vercel → Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
4. Deploy.
5. Update **Supabase Auth URL Configuration** to include your Vercel domain as shown above.

## Security notes (portfolio hygiene)

- Never commit `.env.local`.
- Rotate any keys you previously pasted into a repo or shared.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only (Vercel env var is fine; never use `NEXT_PUBLIC_`).

