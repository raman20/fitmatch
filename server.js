const express = require('express');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');
const C = require('./constants');
const { parse, eligible, score } = require('./matching');
const { seed } = require('./seed');

seed();
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------
const hash = (pw, salt = crypto.randomBytes(16).toString('hex')) => salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
const verify = (pw, stored) => { const [salt, h] = stored.split(':'); const c = crypto.scryptSync(pw, salt, 32); return crypto.timingSafeEqual(c, Buffer.from(h, 'hex')); };
const getUser = id => { const r = db.prepare('SELECT * FROM users WHERE id=?').get(id); return r ? parse(r) : null; };
const pub = u => { const { pw_hash, email, ...rest } = u; return rest; };
const me = u => { const { pw_hash, ...rest } = u; return rest; };
const blockedIds = id => new Set(db.prepare('SELECT blocked AS x FROM blocks WHERE blocker=? UNION SELECT blocker FROM blocks WHERE blocked=?').all(id, id).map(r => r.x));
const MODES = ['buddy', 'dating'];

function auth(req, res, next) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  const s = t && db.prepare('SELECT user_id FROM sessions WHERE token=?').get(t);
  if (!s) return res.status(401).json({ error: 'Not signed in' });
  req.user = getUser(s.user_id);
  if (!req.user) return res.status(401).json({ error: 'Not signed in' });
  next();
}
function newSession(uid) { const t = crypto.randomBytes(24).toString('hex'); db.prepare('INSERT INTO sessions(token,user_id) VALUES(?,?)').run(t, uid); return t; }

// ---------- auth ----------
app.get('/api/meta', (req, res) => res.json(C));
app.post('/api/register', (req, res) => {
  const { email, password, adult } = req.body || {};
  if (!adult) return res.status(400).json({ error: 'You must confirm you are 18 or older.' });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Valid email required' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email.toLowerCase())) return res.status(409).json({ error: 'Email already registered' });
  const r = db.prepare('INSERT INTO users(email,pw_hash) VALUES(?,?)').run(email.toLowerCase(), hash(password));
  const id = Number(r.lastInsertRowid);
  res.json({ token: newSession(id), user: me(getUser(id)) });
});
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const r = db.prepare('SELECT * FROM users WHERE email=?').get((email || '').toLowerCase());
  if (!r || !verify(password || '', r.pw_hash)) return res.status(401).json({ error: 'Wrong email or password' });
  res.json({ token: newSession(r.id), user: me(parse(r)) });
});
app.post('/api/logout', auth, (req, res) => { db.prepare('DELETE FROM sessions WHERE token=?').run(req.headers.authorization.replace('Bearer ', '')); res.json({ ok: true }); });
app.get('/api/me', auth, (req, res) => res.json({ user: me(req.user) }));

// ---------- profile ----------
app.put('/api/me', auth, (req, res) => {
  const b = req.body || {};
  const errs = [];
  const age = parseInt(b.age, 10);
  if (!b.name || !String(b.name).trim()) errs.push('Name is required');
  if (!(age >= 18 && age <= 100)) errs.push('FitMatch is 18+ only — age must be 18 or above');
  if (!C.GENDERS.includes(b.gender)) errs.push('Pick a gender');
  if (!b.city) errs.push('City is required');
  const acts = {};
  for (const [a, l] of Object.entries(b.activities || {})) if (C.ACTIVITIES.includes(a) && C.LEVELS.includes(l)) acts[a] = l;
  if (!Object.keys(acts).length) errs.push('Pick at least one activity');
  if (!b.buddy_on && !b.dating_on) errs.push('Turn on at least one mode (Buddy or Dating)');
  if (b.photo && (typeof b.photo !== 'string' || !b.photo.startsWith('data:image/') || b.photo.length > 1_500_000)) errs.push('Photo must be an image under ~1MB');
  if (errs.length) return res.status(400).json({ error: errs.join('. ') });
  const f = arr => JSON.stringify((b[arr] || []).filter(x => typeof x === 'string'));
  const amin = Math.max(18, parseInt(b.age_min, 10) || 18), amax = Math.max(amin, parseInt(b.age_max, 10) || 99);
  db.prepare(`UPDATE users SET name=?,age=?,gender=?,city=?,venue=?,venue_type=?,photo=?,goals=?,activities=?,days=?,times=?,bio=?,
    buddy_on=?,dating_on=?,date_genders=?,age_min=?,age_max=?,buddy_levels=?,min_overlap=?,onboarded=1 WHERE id=?`).run(
    String(b.name).trim().slice(0, 40), age, b.gender, String(b.city).trim().slice(0, 40), String(b.venue || '').trim().slice(0, 60),
    C.VENUE_TYPES.includes(b.venue_type) ? b.venue_type : null, b.photo || null, f('goals'), JSON.stringify(acts), f('days'), f('times'),
    String(b.bio || '').slice(0, 300), b.buddy_on ? 1 : 0, b.dating_on ? 1 : 0, f('date_genders'), amin, amax, f('buddy_levels'),
    Math.min(7, Math.max(0, parseInt(b.min_overlap, 10) || 0)), req.user.id);
  res.json({ user: me(getUser(req.user.id)) });
});

// ---------- feed ----------
function checkMode(req, res) {
  const mode = req.query.mode || req.body?.mode;
  if (!MODES.includes(mode)) { res.status(400).json({ error: 'mode must be buddy or dating' }); return null; }
  if (!req.user.onboarded) { res.status(400).json({ error: 'Complete your profile first' }); return null; }
  if (!req.user[mode + '_on']) { res.status(403).json({ error: `Turn on ${mode} mode in your profile to use it` }); return null; }
  return mode;
}
app.get('/api/feed', auth, (req, res) => {
  const mode = checkMode(req, res); if (!mode) return;
  const u = req.user, blocked = blockedIds(u.id);
  const swiped = new Set(db.prepare('SELECT to_id FROM swipes WHERE from_id=? AND mode=?').all(u.id, mode).map(r => r.to_id));
  const list = db.prepare('SELECT * FROM users WHERE id!=? AND onboarded=1 AND age>=18').all(u.id).map(parse)
    .filter(o => !blocked.has(o.id) && !swiped.has(o.id) && eligible(u, o, mode))
    .map(o => ({ ...pub(o), ...score(u, o, mode) }))
    .sort((a, b) => b.score - a.score);
  res.json({ users: list.slice(0, 30), total: list.length });
});

app.post('/api/swipe', auth, (req, res) => {
  const mode = checkMode(req, res); if (!mode) return;
  const { to_id, action } = req.body;
  if (!['like', 'pass'].includes(action)) return res.status(400).json({ error: 'action must be like or pass' });
  const o = getUser(to_id);
  if (!o || o.id === req.user.id || blockedIds(req.user.id).has(o.id) || !eligible(req.user, o, mode)) return res.status(400).json({ error: 'User not available' });
  db.prepare('INSERT OR REPLACE INTO swipes(from_id,to_id,mode,action) VALUES(?,?,?,?)').run(req.user.id, o.id, mode, action);
  if (action !== 'like') return res.json({ match: null });
  // Demo behaviour: sample users "like back" ~60% of the time (deterministic per pair)
  if (o.is_sample && !db.prepare('SELECT 1 FROM swipes WHERE from_id=? AND to_id=? AND mode=?').get(o.id, req.user.id, mode)) {
    const h = crypto.createHash('md5').update(`${o.id}-${req.user.id}-${mode}`).digest()[0];
    if (h % 10 < 6) db.prepare('INSERT INTO swipes(from_id,to_id,mode,action) VALUES(?,?,?,?)').run(o.id, req.user.id, mode, 'like');
  }
  const back = db.prepare("SELECT 1 FROM swipes WHERE from_id=? AND to_id=? AND mode=? AND action='like'").get(o.id, req.user.id, mode);
  if (!back) return res.json({ match: null });
  const [a, b] = [req.user.id, o.id].sort((x, y) => x - y);
  db.prepare('INSERT OR IGNORE INTO matches(a,b,mode) VALUES(?,?,?)').run(a, b, mode);
  const m = db.prepare('SELECT * FROM matches WHERE a=? AND b=? AND mode=?').get(a, b, mode);
  res.json({ match: { id: m.id, mode, user: pub(o), ...score(req.user, o, mode) } });
});

// ---------- matches & chat ----------
function myMatch(req, res) {
  const m = db.prepare('SELECT * FROM matches WHERE id=? AND (a=? OR b=?)').get(req.params.id, req.user.id, req.user.id);
  if (!m) { res.status(404).json({ error: 'Match not found' }); return null; }
  const other = m.a === req.user.id ? m.b : m.a;
  if (blockedIds(req.user.id).has(other)) { res.status(404).json({ error: 'Match not found' }); return null; }
  return { ...m, other };
}
app.get('/api/matches', auth, (req, res) => {
  const blocked = blockedIds(req.user.id);
  const rows = db.prepare('SELECT * FROM matches WHERE a=? OR b=? ORDER BY created_at DESC, id DESC').all(req.user.id, req.user.id);
  const out = rows.map(m => {
    const oid = m.a === req.user.id ? m.b : m.a;
    if (blocked.has(oid)) return null;
    const o = getUser(oid); if (!o) return null;
    const last = db.prepare('SELECT body,sender_id,created_at FROM messages WHERE match_id=? ORDER BY id DESC LIMIT 1').get(m.id);
    return { id: m.id, mode: m.mode, created_at: m.created_at, user: pub(o), last: last || null, ...score(req.user, o, m.mode) };
  }).filter(Boolean);
  res.json({ matches: out });
});
app.get('/api/matches/:id/messages', auth, (req, res) => {
  const m = myMatch(req, res); if (!m) return;
  const after = parseInt(req.query.after, 10) || 0;
  res.json({ messages: db.prepare('SELECT * FROM messages WHERE match_id=? AND id>? ORDER BY id').all(m.id, after), user: pub(getUser(m.other)), mode: m.mode });
});
const REPLIES = ['Haha nice! When are you usually free this week? 💪', 'Sounds good to me. Saturday morning works?', "Love that. I'm trying to be more consistent too!", 'Sure, let\'s plan something 🙌'];
app.post('/api/matches/:id/messages', auth, (req, res) => {
  const m = myMatch(req, res); if (!m) return;
  const body = String(req.body?.body || '').trim().slice(0, 1000);
  if (!body) return res.status(400).json({ error: 'Message is empty' });
  const r = db.prepare('INSERT INTO messages(match_id,sender_id,body) VALUES(?,?,?)').run(m.id, req.user.id, body);
  const o = getUser(m.other);
  if (o.is_sample) { // demo: sample users auto-reply after a moment
    const n = db.prepare('SELECT COUNT(*) c FROM messages WHERE match_id=? AND sender_id=?').get(m.id, o.id).c;
    if (n < 3) setTimeout(() => { try { db.prepare('INSERT INTO messages(match_id,sender_id,body) VALUES(?,?,?)').run(m.id, o.id, REPLIES[n % REPLIES.length]); } catch {} }, 1500);
  }
  res.json({ message: db.prepare('SELECT * FROM messages WHERE id=?').get(r.lastInsertRowid) });
});

// ---------- safety ----------
app.post('/api/block', auth, (req, res) => {
  const id = parseInt(req.body?.user_id, 10);
  if (!getUser(id) || id === req.user.id) return res.status(400).json({ error: 'Invalid user' });
  db.prepare('INSERT OR IGNORE INTO blocks(blocker,blocked) VALUES(?,?)').run(req.user.id, id);
  res.json({ ok: true });
});
app.post('/api/report', auth, (req, res) => {
  const id = parseInt(req.body?.user_id, 10);
  if (!getUser(id) || id === req.user.id) return res.status(400).json({ error: 'Invalid user' });
  db.prepare('INSERT INTO reports(reporter,reported,reason) VALUES(?,?,?)').run(req.user.id, id, String(req.body?.reason || 'unspecified').slice(0, 500));
  if (req.body?.block !== false) db.prepare('INSERT OR IGNORE INTO blocks(blocker,blocked) VALUES(?,?)').run(req.user.id, id);
  res.json({ ok: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`FitMatch running on http://localhost:${PORT}`));
module.exports = app;
