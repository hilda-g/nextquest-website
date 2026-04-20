# NextQuest — Cyprus Geek Events

Live events aggregator connected to Supabase + Telegram Bot.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_BOT_USERNAME=nextquest_bot
   ```

2. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploy

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add env vars in Netlify dashboard (Settings → Environment variables)
- `public/_redirects` handles SPA routing automatically

### Vercel
- Import the repo, Vercel auto-detects Vite
- Add env vars in Vercel dashboard
- `vercel.json` handles SPA routing automatically

## Supabase RLS
Make sure the `events` table has a Row Level Security policy:
```sql
CREATE POLICY "Public can read published events"
ON events FOR SELECT
USING (status = 'published');
```
