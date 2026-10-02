# Metma Admin

Next.js admin for **BG / DE / USA**. Data goes **directly to Firebase** (Auth + Firestore + Storage) — no ASP.NET backend.

See **[FIREBASE.md](./FIREBASE.md)** for project setup, rules, and env keys.

## Run

```bash
cd metma-admin
cp .env.example .env.local   # fill Firebase keys
npm install
npm run dev
```

Open: [http://localhost:3003](http://localhost:3003)

Without Firebase keys the panel falls back to local mock data.

## What’s included

- Firebase Auth login (email/password)
- Sidebar + **site switcher** (`?site=De|Bg|Usa`) — documents tagged with `site`
- Products, Pages, Blog, Media, Categories, QR codes
- Uploads → Firebase Storage
