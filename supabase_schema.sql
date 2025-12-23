
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  image_url TEXT,
  workflow_json JSONB,
  tags TEXT[],
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  use_case TEXT,
  tools_used TEXT[],
  date_added TIMESTAMP DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pre-populate categories
INSERT INTO categories (name, slug) VALUES
  ('Webhooks & APIs', 'webhooks-apis'),
  ('AI & Machine Learning', 'ai-ml'),
  ('Data Processing', 'data-processing'),
  ('Notifications & Alerts', 'notifications'),
  ('Social Media Automation', 'social-media'),
  ('E-commerce', 'ecommerce'),
  ('Content Management', 'content-management'),
  ('DevOps & Monitoring', 'devops'),
  ('Custom/Other', 'other');

-- Enable RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Public read access" ON workflows FOR SELECT USING (true);
CREATE POLICY "Public read access categories" ON categories FOR SELECT USING (true);


-- Authenticated users (Admin) can insert/update/delete
-- Note: Ideally checking for specific email in policy, or just 'authenticated' if using app-level checks + only admin is allowed to sign in/act.
-- User requested "Authenticated write access"
CREATE POLICY "Authenticated write access" ON workflows FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated write access categories" ON categories FOR ALL TO authenticated USING (true);

-- Enable Storage Policies
-- You need to create a bucket named 'workflow-images' first.

-- Storage Policies for 'workflow-images' bucket:
-- Select: Public
-- Insert: Authenticated
-- Update: Authenticated
-- Delete: Authenticated
