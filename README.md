# ⚡ FitMatch

Matchmaking for people who move — runners, lifters, yogis, cyclists, swimmers, hikers, badminton/cricket/football players, class-goers and home-workout folks. Toggle between two modes:

- **🤝 Buddy** — find training partners
- **❤️ Dating** — meet someone who shares your lifestyle

> **Demo build.** All 500 profiles are **fictional sample data** (Indian cities: Bengaluru, Mumbai, Delhi, Pune, Hyderabad, Chennai, Kochi…). Sample users auto-"like back" ~60% of the time and send a canned auto-reply in chat so the flows work solo.

## Run it

Requires **Node.js 22.5+** (uses the built-in `node:sqlite`, so no native build step).

```bash
npm install
npm start            # http://localhost:3000   (PORT=8080 npm start to change)
```

- Demo login: **demo@fitmatch.in / demo1234** (or click "Try the demo account"), or sign up with any email.
- Sample accounts: `sample001@fitmatch.sample` … `sample500@fitmatch.sample`, password `sample123` — log in as one in another browser to test real two-person matching and chat.
- Reset data: `npm run reset` (deletes `fitmatch.db`, reseeds). DB is created & seeded automatically on first start.
- API smoke test (server running): `npm test`

## Features

- **Auth**: email + password (scrypt-hashed), bearer-token sessions.
- **18+ gate**: confirm-18+ checkbox at signup, and profile age must be ≥18 (server-enforced); feeds never show under-18s.
- **Profile** (shared by both modes): name, age, gender, city, usual spot/venue + type (gym, park, studio, court, pool, trail, home, ground), photo upload (resized in-browser) or initials avatar, **activities multi-select with a level per activity**, goals, training days/times, bio.
  - Buddy settings: preferred partner level(s), minimum shared training days.
  - Dating settings: who you want to meet (genders), age range — applied **both ways**.
  - Opt-in per mode: you only appear in (and can use) a mode you've turned on.
- **Compatibility score (0–100)**: shared activities 30 · shared goals 20 · level similarity on shared activities 15 (boosted/penalised by buddy level preference) · schedule overlap (days + time slots) 20 · location 15 (same venue > same city). Dating mode adds a small age-closeness factor after hard preference filters. Each card shows the "why" (e.g. *Same spot: Cubbon Park · Both into Running · Free 3 same days, early morning*).
- **Swipe feed**: drag/swipe cards, ✕ / ♥ buttons, or ← / → keys. Mutual like ⇒ match (per mode) with a match modal.
- **Matches list** + **in-app chat** per match (2s polling).
- **Safety**: report (with reason) & block, or just block, from any card or chat. Blocking hides both users from each other's feeds, matches and chat.

## Structure

```
server.js     Express API + static hosting
db.js         SQLite schema (node:sqlite) → fitmatch.db
matching.js   Eligibility filters + compatibility scoring
seed.js       500 fictional sample users (20 hand-written + generated) + demo account
constants.js  Activities, goals, levels, days/times, venue types, cities
public/       Vanilla JS SPA (index.html, app.js, styles.css) — mobile-first dark theme
test-api.sh   curl smoke test of the main flows
```

## Roadmap

1. **Real auth** — phone OTP (common in India) / Google sign-in, email verification, password reset, session expiry, rate limiting.
2. **Photo storage & verification** — S3/Cloudinary uploads with moderation, selfie verification badge, multiple photos.
3. **Push notifications** — new match / new message via web push + FCM; WebSockets instead of polling for chat.
4. **Deployment** — Docker image, Postgres (+PostGIS for real distance), host on Render/Fly/Railway or AWS Mumbai region; HTTPS & CDN.
5. **Better matching** — distance radius with geolocation, "train now" live mode, group sessions/events, learn from swipe history.
6. **Safety & compliance** — admin moderation queue for reports, ID/age verification, unmatch, message filtering, DPDP Act 2023 compliance (consent, data export/deletion).
7. **Monetisation** — premium (see who liked you, boosts) priced in INR, e.g. ₹299/month; partner gyms/studios offering buddy-pass discounts.

## Known limitations

- Demo-grade: no email verification, no rate limiting, sessions never expire, tokens in localStorage.
- Photos stored as base64 in SQLite (fine for a demo, not for scale).
- Location is text-matching on city/venue (no geolocation/distance).
- Chat uses polling, not WebSockets; no push notifications; no unmatch.
- Reports are stored but there's no admin UI.
