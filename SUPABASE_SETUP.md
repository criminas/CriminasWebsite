# Supabase Setup Guide

To finish the backend migration from Convex to Supabase, you must run the following SQL script in your Supabase project's **SQL Editor**. 

You will also need to create a storage bucket and update your environment variables.

## 1. Environment Variables

Create or update `.env.local` in your project root with your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these in your Supabase project dashboard under **Settings > API**.

## 2. Storage Bucket

1. Go to **Storage** in your Supabase dashboard.
2. Create a new bucket named `avatars`.
3. Check **"Public bucket"** so profile pictures can be viewed by anyone.

## 3. SQL Setup Script

Navigate to the **SQL Editor** in your Supabase dashboard, paste the following script, and click **Run**. This will create all your tables, enable Row Level Security (RLS), and set up the automatic profile creation trigger.

```sql
-- Create Tables
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    role TEXT DEFAULT 'community',
    newsletter_subscribed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.starred_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    starred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, project_id)
);

CREATE TABLE public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.newsletter_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starred_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles and update their own
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Starred Projects: Users can CRUD their own stars
CREATE POLICY "Users can view own stars" ON public.starred_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stars" ON public.starred_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stars" ON public.starred_projects FOR DELETE USING (auth.uid() = user_id);

-- Contact Forms: Anyone can insert, but only authenticated users can read (or you can adjust this to admins)
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions FOR INSERT WITH CHECK (true);

-- Newsletter: Anyone can insert
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own subscription" ON public.newsletter_subscriptions FOR SELECT USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "Users can update own subscription" ON public.newsletter_subscriptions FOR UPDATE USING (email = (auth.jwt() ->> 'email'));
CREATE POLICY "Users can delete own subscription" ON public.newsletter_subscriptions FOR DELETE USING (email = (auth.jwt() ->> 'email'));

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, image)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Storage Policies for 'avatars' bucket
-- (You must create the 'avatars' bucket first and set it to Public)
CREATE POLICY "Avatar images are publicly accessible." 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload an avatar." 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their avatar." 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

```

## 4. Authentication Configuration

Under **Authentication > Email Templates** in your Supabase dashboard:
1. Ensure the redirect URL is set correctly for your production/development environments.
2. In **URL Configuration**, set the **Site URL** to `http://localhost:4321` for local development, and add your production domain to the **Redirect URLs**.

## 5. User Ban Migration

To enable banning users from the Supabase dashboard, run the following migration in the **SQL Editor**. This adds `is_banned` and `ban_reason` columns to the `profiles` table and locks them down so only a service-role (admin) call can set them — regular users cannot ban themselves.

```sql
-- Add ban columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL;

-- Prevent users from updating their own ban status via the anon/authenticated role.
-- Only the Supabase service role (used in admin scripts or the dashboard) can write these columns.
CREATE POLICY "Only service role can ban users"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Users can update their own profile, but is_banned and ban_reason must stay unchanged
    is_banned = (SELECT is_banned FROM public.profiles WHERE id = auth.uid())
    AND
    ban_reason IS NOT DISTINCT FROM (SELECT ban_reason FROM public.profiles WHERE id = auth.uid())
  );
```

> [!NOTE]
> The existing `"Users can update own profile"` policy must be **dropped and replaced** by the one above, because it previously allowed unrestricted self-updates. Run this first if you already applied the original setup script:
>
> ```sql
> DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
> ```
>
> Then run the `CREATE POLICY` block above.

### Banning a User (via Supabase Dashboard)

1. Go to **Table Editor → profiles** in your Supabase dashboard.
2. Find the row for the user you want to ban.
3. Set `is_banned` to `true`.
4. Optionally fill in `ban_reason` with a short explanation (e.g. `"Violation of Terms of Service"`). This message will be shown to the user on their dashboard.
5. Click **Save**.

The user's dashboard will immediately show a suspension notice on their next page load, and all interactive features will be disabled. They will still be able to sign out.

### Unbanning a User

Set `is_banned` back to `false` (and clear `ban_reason` if desired) in the same row. The restriction is lifted instantly on their next dashboard load.

## 6. IP Logging Table

To enable visitor IP logging, run the following in the **SQL Editor**. Each IP address is stored only once — the `UNIQUE` constraint and the upsert logic in the API route both enforce this at the database and application levels respectively.

```sql
-- Create ip_logs table
CREATE TABLE public.ip_logs (
    id          UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    ip          TEXT                     NOT NULL,
    user_agent  TEXT                     DEFAULT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    CONSTRAINT ip_logs_ip_unique UNIQUE (ip)
);

-- Enable Row Level Security
ALTER TABLE public.ip_logs ENABLE ROW LEVEL SECURITY;

-- Only the service role (server-side API) can insert or read rows.
-- No anon or authenticated user policy is created intentionally,
-- so the table is completely inaccessible from the client/browser.
```

> [!IMPORTANT]
> This table must **only** be written to via the `/api/log-ip` serverless route using the `SUPABASE_SERVICE_ROLE_KEY`. The service role key bypasses RLS entirely and must never be exposed to the browser.

### Environment Variables

Add the following server-side-only variables to your Vercel project's **Environment Variables** settings (Settings → Environment Variables), and to your local `.env.local` for development:

```env
# Server-side only — never prefix with PUBLIC_
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find the service role key in your Supabase dashboard under **Settings → API → Project API keys → service_role**.

> [!WARNING]
> Never commit `SUPABASE_SERVICE_ROLE_KEY` to version control, and never expose it in any client-side code or environment variable prefixed with `PUBLIC_`.

### How It Works

- On every page load, the browser fires a `POST /api/log-ip` request.
- The serverless function extracts the real client IP from `x-forwarded-for` (first entry) or falls back to `x-real-ip` — both are set reliably by Vercel's edge network.
- The IP and user-agent are upserted into `ip_logs` with `ignoreDuplicates: true`, so repeat visits from the same IP are silently skipped.
- No error is thrown or surfaced to the user if the IP already exists.
