# n8n Workflow Blog

A production-ready portfolio application for showcasing n8n automation workflows.

## Features
- Public Portfolio with Search & Filtering
- Detailed Workflow View (Modal)
- Google OAuth Authentication (Admin Access)
- Workflow Management (Add/Edit/Delete)
- Image Hosting via Supabase Storage
- Dark Theme with Modern UI

## Setup Instructions

### 1. Supabase Setup
1. Create a new Supabase project at [database.new](https://database.new)
2. Go to the **SQL Editor** and run the contents of `supabase_schema.sql` to create tables and policies.
3. Go to **Storage**, create a new Public bucket named `workflow-images`.
   - Ensure policies allow Public Read and Authenticated Insert/Update.

### 2. Google OAuth Configuration
1. Go to Supabase **Authentication** -> **Providers**.
2. Enable **Google**.
3. You will need a Google Cloud Project with OAuth credentials.
   - Authorized Redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase.

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=your-email@gmail.com
```

### 4. Admin Configuration
Update the `VITE_ADMIN_EMAIL` in `.env` with the email address you will use to log in via Google. Only this email will see the "Add Workflow" button and Edit/Delete controls.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173`

## Deployment
Build for production:
```bash
npm run build
```
Deploy the `dist` folder to Vercel, Netlify, or any static host.
