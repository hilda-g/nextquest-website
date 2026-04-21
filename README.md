# NextQuest — Cyprus Geek Events

Live events aggregator connected to Supabase + Telegram Bot.

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
   VITE\_SUPABASE\_URL=https://YOUR\_PROJECT\_ID.supabase.co
   VITE\_SUPABASE\_ANON\_KEY=your\_anon\_key
   VITE\_BOT\_USERNAME=nextquest\_bot
   ```

2. Install and run:

```bash
   npm install
   npm run dev
   ```

## Deploy

### Netlify

* Build command: `npm run build`
* Publish directory: `dist`
* Add env vars in Netlify dashboard (Settings → Environment variables)
* `public/\_redirects` handles SPA routing automatically

### Vercel

* Import the repo, Vercel auto-detects Vite
* Add env vars in Vercel dashboard
* `vercel.json` handles SPA routing automatically

## Supabase RLS

Make sure the `events` table has a Row Level Security policy:

```sql
CREATE POLICY "Public can read published events"
ON events FOR SELECT
USING (status = 'published'); 
```

