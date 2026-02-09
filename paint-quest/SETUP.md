# PaintQuest - Milestone 1 Setup Guide

## Prerequisites
- Node.js 20+ installed
- pnpm installed
- Supabase account (free tier works)

## Setup Steps

### 1. Install Dependencies
Already done! ✅

### 2. Set Up Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for the project to finish setting up

### 3. Run Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Paste and run it in the SQL Editor
4. Verify tables are created in **Table Editor**

### 4. Configure Environment Variables

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Configure Email Auth (Optional but Recommended)

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Email** provider
3. Configure email templates if desired
4. For development, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Disable "Enable email confirmations"

### 6. Run the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Testing the Application

### Manual Test Steps

1. **Home Page**
   - Visit `http://localhost:3000`
   - Should see PaintQuest landing page
   - Click "Get Started"

2. **Sign Up**
   - Enter email and password
   - Click "Sign Up"
   - If email confirmation is enabled, check your email
   - If disabled, you'll be signed up immediately

3. **Sign In**
   - Use the same credentials
   - Click "Sign In"
   - Should redirect to `/sessions`

4. **Create Attempt**
   - Click "+ New Attempt" button
   - New attempt should appear in the list
   - Should show attempt ID and creation timestamp

5. **Verify Data Isolation**
   - Open an incognito window
   - Sign up with a different email
   - Create attempts
   - Verify you only see your own attempts

6. **Logout**
   - Click "Logout" button
   - Should redirect to home page
   - Clicking "Get Started" should show auth page

## Architecture Overview

### File Structure
```
src/
├── app/
│   ├── auth/
│   │   └── page.tsx          # Auth page (sign in/up)
│   ├── sessions/
│   │   ├── page.tsx          # Sessions list (server component)
│   │   ├── SessionsList.tsx  # Interactive list (client component)
│   │   └── LogoutButton.tsx  # Logout button
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles with CSS variables
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── middleware.ts     # Auth middleware helper
│   └── types/
│       └── database.types.ts # Database type definitions
└── middleware.ts             # Next.js middleware
```

### Key Patterns

1. **Server/Client Boundaries**
   - Server components: `page.tsx` files (auth checks, data fetching)
   - Client components: Interactive UI (forms, buttons)

2. **Auth Flow**
   - Middleware refreshes sessions on every request
   - Protected routes redirect to `/auth` if not authenticated
   - RLS ensures users only see their own data

3. **Data Model**
   - `attempt`: Core entity, owned by user
   - `progress_event`: Append-only event log
   - No derived state stored in database

## Next Steps (Future Milestones)

- [ ] Implement FSM state derivation
- [ ] Add event recording UI
- [ ] Build attempt detail page
- [ ] Add state explanation feature
- [ ] Implement recommended actions

## Troubleshooting

### "Cannot find module '@supabase/ssr'"
Run: `pnpm add @supabase/ssr`

### Auth not working
- Check `.env.local` has correct values
- Verify Supabase project is active
- Check browser console for errors

### RLS errors
- Ensure you're signed in
- Verify RLS policies were created correctly
- Check Supabase logs in Dashboard

### Dev server issues
- Stop the server (Ctrl+C)
- Delete `.next` folder
- Run `pnpm dev` again
