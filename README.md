# Beer Counter 🍺

A Next.js app to track your beer and cachaça consumption with a simple login system and statistics.

## Features

- 🔐 Simple password-based authentication
- 🍺 Track beer consumption (300ml, 500ml, 1L)
- 🥃 Track cachaça consumption (50ml dose, 190ml lavrado)
- 📊 View statistics (today, week, month, all-time)
- 📱 Mobile-first responsive design
- 💾 JSON file storage (no database required)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set the password in environment variables (optional, defaults to 'beercounter2024'):
```bash
# Create .env.local file
APP_PASSWORD=your-secure-password
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variable `APP_PASSWORD` if you want a custom password
4. Deploy!

**Important Note on Vercel:** Vercel's serverless functions have a read-only filesystem. For production use with persistent storage, you'll need to use a database service (like Vercel KV, Supabase, or MongoDB) instead of JSON files. The current JSON file storage works great for local development and testing.

## Usage

1. Login with the password (default: `beercounter2024` or your custom `APP_PASSWORD`)
2. Click the appropriate button when you drink
3. View statistics in the Stats tab
4. All data is stored with timestamps

