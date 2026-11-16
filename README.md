# Marketplace

A Facebook Marketplace-inspired web app where anyone can browse listings, search, filter by category, post an item with a photo, and message a seller. No login required.

## Features

- **Create a listing** with photo, title, description, price, category and seller email. Saved to Supabase, photo stored in Supabase Storage.
- **Browse** all listings in a responsive grid with category tabs.
- **Keyword search** across titles and descriptions.
- **Listing detail page** with photo, full details, seller email and related listings.
- **Message Seller** stores the buyer's message in Supabase.
- **Optional:** the seller receives an email when a message arrives (Supabase Edge Function + Resend).

## Tech stack

- Next.js 16 (App Router, Cache Components) and React 19
- TypeScript
- Tailwind CSS 4 and shadcn/ui (Base UI), Lucide icons
- Supabase (Postgres, Storage, Edge Functions)

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # header + sidebar shell
│   ├── page.tsx                # home: all listings + category tabs
│   ├── create/page.tsx         # create listing
│   ├── item/[id]/page.tsx      # listing detail + message seller
│   └── category/[slug]/page.tsx
├── components/
│   ├── layout/                 # header, sidebar
│   ├── marketplace/            # cards, grid, forms, search, etc.
│   └── ui/                     # shadcn components
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── listings-api.ts         # server-side reads
│   ├── listings-mutations.ts   # browser-side writes (create, upload, message)
│   ├── categories.ts
│   └── listing-utils.ts
└── types/listing.ts
supabase/
└── functions/notify-seller/    # optional email notification function
```

## Getting started

### 1. Install

```bash
git clone <your-repo-url>
cd marketplace
npm install
```

### 2. Environment variables

Create `.env.local` in the project root (it is git-ignored, so never commit it):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
```

Find both values in Supabase under **Project Settings → API**. The exact variable names the app expects are in `src/lib/supabase.ts`; use those if they differ from above.

### 3. Database

In the Supabase **SQL Editor**, run the schema below. It creates the `listings` and `messages` tables, the `listing-images` storage bucket, indexes and row-level-security policies.

<details>
<summary>Schema SQL</summary>

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  image_url TEXT,
  location VARCHAR(255) DEFAULT 'Palo Alto, CA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_email VARCHAR(255) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

CREATE POLICY "Anyone can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'listing-images');
CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Anyone can create listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create messages" ON messages FOR INSERT WITH CHECK (true);
```

</details>

Recommended hardening (the app only ever inserts messages, so nothing breaks):

```sql
-- Do not allow the public key to read buyers' and sellers' messages.
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;

-- Only accept the app's categories.
ALTER TABLE listings ADD CONSTRAINT listings_category_check
  CHECK (category IN ('Electronics','Furniture','Clothing','Home & Garden',
                      'Sports & Outdoors','Vehicles','Other'));
```

Also set a file size limit (for example 5 MB) and allowed types (`image/jpeg`, `image/png`, `image/webp`) on the `listing-images` bucket in **Storage → Policies/Settings**.

### 4. Run

```bash
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run lint
npm run build    # production build
npm start        # run the production build
```

## Deploy to Vercel

1. **Push to GitHub.** Confirm `.env.local` is listed in `.gitignore` first.
   ```bash
   git add .
   git commit -m "Marketplace app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```
2. In [Vercel](https://vercel.com), click **Add New → Project** and import the repository. Vercel detects Next.js automatically.
3. Under **Environment Variables**, add the same two variables from your `.env.local`. Without them the build fails.
4. Click **Deploy**.
5. Check the live site:
   - Create a listing with a photo and see it on the home page
   - Filter it by category and search for it
   - Open its detail page
   - Send a message and confirm the row appears in the `messages` table

## Optional: email the seller on new messages

A Supabase Database Webhook on `messages` inserts calls the `notify-seller` Edge Function, which emails the seller through [Resend](https://resend.com). The seller can reply directly to the buyer.

1. Create a Resend account and API key.
2. In Supabase, create an Edge Function named `notify-seller` and paste in `supabase/functions/notify-seller/index.ts`.
3. Add the secrets `RESEND_API_KEY`, `FROM_EMAIL` and (optional) `SITE_URL` under **Edge Functions → Secrets**.
4. Under **Database → Webhooks**, create a hook on table `messages`, event **Insert**, type **Supabase Edge Functions**, function `notify-seller`.

Until you verify a domain in Resend, test emails can only be delivered to the address you signed up with.

## Known limitations

- One photo per listing (the schema has a single `image_url` column).
- Every new listing gets the default location from the schema, because the form has no location field.
- No accounts, so listings can't be edited or deleted by their owners.
- Anyone can create listings and messages. Add rate limiting or a CAPTCHA before heavy public use.
- Seller emails are shown publicly on listing pages, by design.
- Messages are stored and optionally emailed, but there is no in-app inbox.

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
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.