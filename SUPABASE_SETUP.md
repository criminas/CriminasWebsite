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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    starred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, project_id)
);

CREATE TABLE public.contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.newsletter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE POLICY "Users can read own subscription" ON public.newsletter_subscriptions FOR SELECT USING (email IN (SELECT email FROM auth.users WHERE id = auth.uid()));

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
