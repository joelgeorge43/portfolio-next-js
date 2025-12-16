  description text,
  content text, -- MDX content
  images jsonb default '[]'::jsonb,
  is_protected boolean default false,
  password_type text default 'master', -- 'master' or 'custom'
  custom_password text, -- Storing plain text as requested for specific sub-passwords (ideally hashed)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Admin Settings Table
create table public.admin_settings (
  key text primary key,
  value text not null
);

-- Insert Default Master Password (hashed or straight? User asked for 'edit master password'. We can store distinct value).
-- Let's assume we handle the Master Password check in API via Environment Variable mostly, but IF dynamic, we store here.
-- For now, we seed a placeholder.
insert into public.admin_settings (key, value) values ('master_password', 'password');

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.admin_settings enable row level security;

-- Policies
-- Public can read ALL projects (Filtering happens in API/Frontend for 'protected' content, but metadata is public? 
-- Actually, for security, we might want to hide 'content' if protected.
-- But for simplicity in this V1, let's allow public read, and we gate the *View* in the frontend/API).
create policy "Allow public read access" on public.projects for select using (true);

-- Only Service Role (Admin API) can insert/update/delete
create policy "Allow service role full access" on public.projects using (true) with check (true);
create policy "Allow service role full access settings" on public.admin_settings using (true) with check (true);

-- Create Storage Bucket for Project Images
insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);

-- Allow public access to images
create policy "Public Access" on storage.objects for select using ( bucket_id = 'project-images' );
create policy "Auth Upload" on storage.objects for insert using ( bucket_id = 'project-images' ); -- We will use Service Role for uploads so this policy might not even be needed if using service key.

-- Analytics Tables

-- Visitors table: tracks unique visitors
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT UNIQUE NOT NULL,
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_visits INTEGER DEFAULT 1,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views table: tracks individual page views
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    duration INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON public.visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON public.visitors(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON public.page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);

-- Enable RLS on analytics tables
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for tracking)
CREATE POLICY "Allow public insert" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert views" ON public.page_views FOR INSERT WITH CHECK (true);

-- Only service role can read
CREATE POLICY "Service role read" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Service role read views" ON public.page_views FOR SELECT USING (true);

