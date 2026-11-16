# Marketplace

A Facebook Marketplace-inspired web application where anyone can browse listings, search, filter by category, post an item with a photo, and message sellers without creating an account. The application also supports payments through **Stripe Connect**, allowing sellers to onboard, buyers to purchase listings, and sellers to receive payments.

## Features

### Marketplace
- **Create listings** with a photo, title, description, price, category, and seller email.
- **Browse listings** in a responsive grid with category filters.
- **Keyword search** across listing titles and descriptions.
- **Listing detail pages** with product information, seller email, and related listings.
- **Message sellers** with messages stored in Supabase.
- **Optional email notifications** through a Supabase Edge Function and Resend.

### Stripe Connect Payments
- **Seller onboarding** through Stripe-hosted onboarding.
- **Connected account management** with seller account information stored in Supabase.
- **Seller verification status** synchronized with Stripe.
- **Buy Now checkout** for eligible listings.
- **Stripe Checkout** for secure test payments.
- **10% marketplace application fee** deducted from successful transactions.
- **Order records** stored in Supabase.
- **Stripe webhook integration** to confirm payments and update order status.
- **Automatic listing status updates** to Sold after successful payment.

## Tech Stack

- Next.js 16 (App Router, Cache Components)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (Base UI)
- Lucide icons
- Supabase (Postgres, Storage, Edge Functions)
- Stripe Connect
- Stripe Checkout
- Vercel

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── create/page.tsx
│   ├── item/[id]/page.tsx
│   ├── category/[slug]/page.tsx
│   ├── seller/connect/
│   └── api/
│       └── stripe/
│           ├── connect/
│           ├── checkout/
│           └── webhook/
├── components/
│   ├── layout/
│   ├── marketplace/
│   └── ui/
├── lib/
│   ├── supabase.ts
│   ├── supabase-admin.ts
│   ├── listings-api.ts
│   ├── listings-mutations.ts
│   ├── categories.ts
│   ├── listing-utils.ts
│   └── stripe/
└── types/
    ├── listing.ts
    └── seller.ts

supabase/
└── functions/
    └── notify-seller/
```

## Getting Started

### 1. Install

```bash
git clone <your-repo-url>
cd marketplace
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root. This file is git-ignored and must never be committed.

Configure the following variables using the actual names expected by your application:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_SITE_URL=
```

- **Supabase URL and publishable key:** Available in your Supabase project settings.
- **Supabase service role key:** Used by server-side administrative operations. Never expose this key in client-side code.
- **Stripe secret key:** The provided Stripe test-mode secret key.
- **Stripe webhook secret:** The signing secret for the configured webhook endpoint.
- **Site URL:** The deployed application URL or local development URL.

Check your source code for the exact environment variable names. Never commit actual API keys, service role keys, or webhook secrets.

### 3. Database Setup

In the Supabase SQL Editor, run the database schema and migrations included in the project.

The database supports:

- Listings and listing images.
- Buyer and seller messages.
- Seller Stripe connected accounts.
- Orders and payment status.
- Listing availability and sold status.

Configure Supabase Storage for the `listing-images` bucket and apply the required Row Level Security policies.

Ensure that the database includes all tables and columns required by the current application before deploying.

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000.

Other available scripts:

```bash
npm run lint
npm run build
npm start
```

## Stripe Connect Setup

The application uses Stripe Connect to support seller onboarding and marketplace payments.

### Seller Onboarding

1. Open a listing created by a seller.
2. Start the seller connection process.
3. Enter the seller's email address.
4. Complete the Stripe-hosted onboarding flow.
5. The connected Stripe account ID and onboarding status are saved in Supabase.

Sellers must complete the required onboarding steps and have the necessary payment capabilities enabled before their listings can accept payments.

### Buyer Checkout

1. Open an available listing.
2. Click **Buy Now**.
3. Complete the Stripe Checkout payment using a test card.
4. After successful payment, the order is confirmed through the Stripe webhook.
5. The listing is automatically marked as Sold.

### Marketplace Application Fee

The marketplace charges a **10% application fee** on successful transactions.

The remaining payment amount is allocated to the connected seller account according to the Stripe Connect payment configuration.

### Stripe Test Payments

Use Stripe test mode when testing checkout.

| Field | Test Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiration | Any future date |
| CVC | Any three digits |
| ZIP / Postal code | Any valid test value |

Use the provided Stripe sandbox credentials for the assignment.

## Stripe Webhooks

The application uses a Stripe webhook endpoint:

```text
/api/stripe/webhook
```

The webhook handles the following events:

- `checkout.session.completed`
- `account.updated`

These events are used to synchronize seller account status, confirm completed payments, update orders, and mark purchased listings as Sold.

The webhook signing secret must be configured through the `STRIPE_WEBHOOK_SECRET` environment variable.

For production deployment, register the webhook using the deployed application URL and the appropriate Stripe Connect event configuration.

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel, or use the existing Vercel project if one is already connected.
3. Configure all required environment variables in **Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed application URL.
5. Deploy the application.
6. Configure the Stripe webhook endpoint using the deployed URL:

```text
https://YOUR-VERCEL-DOMAIN/api/stripe/webhook
```

7. Add the corresponding webhook signing secret to Vercel.
8. Redeploy if environment variables were changed.

Ensure that the deployed application uses the provided Stripe test-mode credentials for the assignment.

## Optional: Email Seller Notifications

A Supabase Database Webhook on the `messages` table can invoke the `notify-seller` Edge Function to send email notifications through Resend.

1. Create a Resend account and API key.
2. Deploy the `notify-seller` Supabase Edge Function.
3. Configure `RESEND_API_KEY`, `FROM_EMAIL`, and optionally `SITE_URL` as function secrets.
4. Configure a database webhook for new message insertions.

Email notifications are optional and separate from Stripe payment processing.

## Known Limitations

- One photo per listing.
- Listings use the default location unless a location is supplied.
- No traditional user authentication system is required for browsing and listing creation.
- Seller identification is based on the seller email associated with a listing.
- Seller emails are displayed publicly on listing pages.
- Messages are stored in Supabase, but there is no in-app inbox.
- Stripe onboarding and payment processing use test-mode credentials for the assignment.
- Listings can only be purchased when they are available and the seller has completed the required Stripe onboarding.

## License

MIT License

Copyright (c) 2026 YOUR NAME

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.