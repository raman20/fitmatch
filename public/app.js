'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = { token: localStorage.getItem('fm_token'), user: null, meta: null, mode: localStorage.getItem('fm_mode') || 'buddy', feed: [], poll: null };

async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { method: opts.method || 'GET', headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { logoutLocal(); throw new Error(data.error || 'Signed out'); }
  if (!r.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.add('hidden'), 2600); }
function logoutLocal() { S.token = null; S.user = null; localStorage.removeItem('fm_token'); location.hash = '#/login'; }

const COLORS = [['#c6ff00', '#00e0a4'], ['#ff4d8d', '#ffb020'], ['#00c2ff', '#7c4dff'], ['#ffb020', '#ff4d6d'], ['#00e0a4', '#00c2ff']];
function avatar(u) {
  if (u && u.photo) return `<img class="avatar" src="${esc(u.photo)}" alt="${esc(u.name)}">`;
  const n = (u && u.name) || '?'; const [a, b] = COLORS[(n.charCodeAt(0) + n.length) % COLORS.length];
  const ini = n.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
  return `<div class="avatar-ph" style="background:linear-gradient(135deg,${a},${b})">${esc(ini)}</div>`;
}
const ACT_ICON = { 'Gym / weights': '🏋️', Running: '🏃', Yoga: '🧘', Cycling: '🚴', Swimming: '🏊', 'Hiking / trekking': '🥾', Badminton: '🏸', Cricket: '🏏', Football: '⚽', Tennis: '🎾', Pickleball: '🏓', 'CrossFit / HIIT': '🔥', 'Dance / Zumba': '💃', Pilates: '🤸', 'Martial arts / boxing': '🥊', Calisthenics: '🤸‍♂️', 'Home workouts': '🏠', Climbing: '🧗' };

// ---------- mode ----------
function setMode(m) {
  S.mode = m; localStorage.setItem('fm_mode', m);
  document.body.classList.toggle('dating', m === 'dating');
  document.querySelectorAll('#modeToggle button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
}
function syncModeAvailability() {
  const u = S.user; if (!u || !u.onboarded) return;
  document.querySelectorAll('#modeToggle button').forEach(b => { b.disabled = !u[b.dataset.mode + '_on']; b.title = b.disabled ? 'Turn this mode on in your profile' : ''; });
  if (!u[S.mode + '_on']) setMode(u.buddy_on ? 'buddy' : 'dating');
}
$('#modeToggle').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  setMode(b.dataset.mode); if (location.hash.startsWith('#/discover')) route(); else location.hash = '#/discover';
});

// ---------- router ----------
async function route() {
  clearInterval(S.poll); S.poll = null;
  const h = location.hash || '#/';
  const [, page, arg] = h.split('/');
  if (!S.token && page !== 'login') return (location.hash = '#/login');
  if (S.token && !S.user) { try { S.user = (await api('/me')).user; } catch { return; } }
  if (S.user && !S.user.onboarded && page !== 'profile' && page !== 'login') return (location.hash = '#/profile');
  const authed = !!S.user;
  $('#topbar').classList.toggle('hidden', !authed || !S.user.onboarded);
  $('#bottomnav').classList.toggle('hidden', !authed || !S.user.onboarded);
  document.querySelectorAll('#bottomnav a').forEach(a => a.classList.toggle('on', a.dataset.nav === page || (page === 'chat' && a.dataset.nav === 'matches')));
  syncModeAvailability(); setMode(S.mode);
  if (page !== 'chat') window.scrollTo(0, 0);
  try {
    if (page === 'login') return renderLogin();
    if (page === 'profile') return renderProfile();
    if (page === 'matches') return renderMatches();
    if (page === 'chat') return renderChat(arg);
    return renderDiscover();
  } catch (e) { $('#app').innerHTML = `<div class="empty"><div class="big">😵</div>${esc(e.message)}</div>`; }
}
window.addEventListener('hashchange', route);

// ---------- login ----------
function renderLogin() {
  if (S.user) return (location.hash = '#/discover');
  let tab = 'login';
  const draw = () => {
    $('#app').innerHTML = `
    <div class="hero-land"><div class="brand" style="font-size:26px">⚡ Fit<span>Match</span></div>
      <h1>Find your <em>training partner</em>. Or your <em style="color:#ff4d8d">match</em>.</h1>
      <p class="muted">Runners, lifters, yogis, cyclists, swimmers, hikers, badminton &amp; football regulars — matched on activities, goals, level, schedule and location.</p></div>
    <div class="tabs"><div class="chip ${tab === 'login' ? 'on' : ''}" data-t="login">Log in</div><div class="chip ${tab === 'register' ? 'on' : ''}" data-t="register">Sign up</div></div>
    <form class="panel" id="authForm">
      <label>Email</label><input name="email" type="email" required autocomplete="email" placeholder="you@example.in">
      <label>Password</label><input name="password" type="password" required minlength="6" autocomplete="${tab === 'login' ? 'current-password' : 'new-password'}" placeholder="min 6 characters">
      ${tab === 'register' ? `<label class="switch" style="margin-top:14px"><span>I confirm I am <b>18 years or older</b></span><input type="checkbox" name="adult"></label>` : ''}
      <div class="err" id="err"></div>
      <button class="btn" style="margin-top:14px">${tab === 'login' ? 'Log in' : 'Create account'}</button>
    </form>
    <button class="btn ghost" id="demoBtn">⚡ Try the demo account</button>
    <p class="muted small" style="text-align:center;margin-top:14px">FitMatch is 18+ only. All 20 profiles you'll see are <b>fictional sample data</b>.</p>`;
    document.querySelectorAll('.tabs .chip').forEach(c => c.onclick = () => { tab = c.dataset.t; draw(); });
    $('#authForm').onsubmit = async e => {
      e.preventDefault(); const f = new FormData(e.target);
      try {
        const d = await api(tab === 'login' ? '/login' : '/register', { method: 'POST', body: { email: f.get('email'), password: f.get('password'), adult: f.get('adult') === 'on' } });
        loginDone(d);
      } catch (err) { $('#err').textContent = err.message; }
    };
    $('#demoBtn').onclick = async () => { try { loginDone(await api('/login', { method: 'POST', body: { email: 'demo@fitmatch.in', password: 'demo1234' } })); } catch (err) { $('#err').textContent = err.message; } };
  };
  draw();
}
function loginDone(d) { S.token = d.token; S.user = d.user; localStorage.setItem('fm_token', d.token); location.hash = d.user.onboarded ? '#/discover' : '#/profile'; }

// ---------- profile ----------
async function renderProfile() {
  const M = S.meta || (S.meta = await api('/meta'));
  const u = S.user;
  const st = { photo: u.photo || null, goals: [...u.goals], activities: { ...u.activities }, days: [...u.days], times: [...u.times], date_genders: [...u.date_genders], buddy_levels: [...u.buddy_levels] };
  const chips = (key, opts) => `<div class="chips" data-key="${key}">${opts.map(o => `<div class="chip ${st[key].includes(o) ? 'on' : ''}" data-v="${esc(o)}">${esc(o)}</div>`).join('')}</div>`;
  $('#app').innerHTML = `
  <h1>${u.onboarded ? 'Your profile' : 'Set up your profile'}</h1>
  <p class="muted">One profile, two modes. Turn on Buddy, Dating, or both.</p>
  <form id="pf">
  <div class="panel">
    <div class="photo-edit"><div class="pic" id="pic">${avatar({ ...u, photo: st.photo, name: u.name || '?' })}</div>
      <div><label class="btn ghost" style="width:auto;margin:0">📷 Upload photo<input type="file" accept="image/*" id="photoIn" hidden></label>
      <div class="small muted" style="margin-top:6px">Optional — initials are used otherwise. <a href="#" id="rmPhoto">Remove</a></div></div></div>
    <label>Name</label><input name="name" value="${esc(u.name || '')}" required maxlength="40" placeholder="e.g. Raman">
    <div class="row"><div><label>Age (18+)</label><input name="age" type="number" min="18" max="100" required value="${esc(u.age || '')}"></div>
    <div><label>Gender</label><select name="gender" required><option value="">Select</option>${M.GENDERS.map(g => `<option ${u.gender === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div></div>
    <label>City</label><input name="city" list="cities" required value="${esc(u.city || '')}" placeholder="e.g. Bengaluru"><datalist id="cities">${M.CITIES.map(c => `<option>${c}</option>`).join('')}</datalist>
    <div class="row"><div style="flex:2"><label>Usual spot / venue</label><input name="venue" value="${esc(u.venue || '')}" placeholder="e.g. Cubbon Park, a gym, studio, court"></div>
    <div><label>Type</label><select name="venue_type"><option value="">—</option>${M.VENUE_TYPES.map(g => `<option ${u.venue_type === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div></div>
    <label>Bio</label><textarea name="bio" maxlength="300" placeholder="What do you train for? What's a perfect session?">${esc(u.bio || '')}</textarea>
  </div>
  <div class="panel"><h2 style="margin-top:0">Activities &amp; level</h2><p class="small muted">Pick everything you do, then set your level for each.</p>
    <div class="chips" id="acts">${M.ACTIVITIES.map(a => `<div class="chip ${st.activities[a] ? 'on' : ''}" data-v="${esc(a)}">${ACT_ICON[a] || ''} ${esc(a)}</div>`).join('')}</div>
    <div class="act-levels" id="actLevels"></div>
    <label>Fitness goals</label>${chips('goals', M.GOALS)}
  </div>
  <div class="panel"><h2 style="margin-top:0">When do you train?</h2>
    <label>Days</label>${chips('days', M.DAYS)}<label>Times</label>${chips('times', M.TIMES)}</div>
  <div class="panel"><h2 style="margin-top:0">Modes</h2>
    <label class="switch"><span>🤝 <b>Buddy mode</b> — find workout partners</span><input type="checkbox" name="buddy_on" ${u.buddy_on || !u.onboarded ? 'checked' : ''}></label>
    <div id="buddyOpts"><label>Partner level I'm looking for (any if none)</label>${chips('buddy_levels', M.LEVELS)}
      <label>Minimum shared training days</label><select name="min_overlap">${[0, 1, 2, 3].map(n => `<option value="${n}" ${u.min_overlap == n ? 'selected' : ''}>${n === 0 ? 'No minimum' : n + '+ day' + (n > 1 ? 's' : '')}</option>`).join('')}</select></div>
    <label class="switch"><span>❤️ <b>Dating mode</b> — meet someone who gets your 5am alarm</span><input type="checkbox" name="dating_on" ${u.dating_on ? 'checked' : ''}></label>
    <div id="datingOpts"><label>I want to meet</label>${chips('date_genders', M.GENDERS)}
      <div class="row"><div><label>Age from</label><input name="age_min" type="number" min="18" max="100" value="${u.age_min || 18}"></div><div><label>to</label><input name="age_max" type="number" min="18" max="100" value="${u.age_max || 45}"></div></div></div>
    <p class="small muted">You only appear in a mode's feed when that mode is on.</p>
  </div>
  <div class="err" id="err"></div>
  <button class="btn" style="margin-top:6px">${u.onboarded ? 'Save profile' : 'Start matching →'}</button>
  </form>
  ${u.onboarded ? `<button class="btn ghost" id="logout" style="margin-top:10px">Log out</button>` : ''}
  <p class="small muted" style="text-align:center">Signed in as ${esc(u.email)}</p>`;

  const drawLevels = () => {
    $('#actLevels').innerHTML = Object.entries(st.activities).map(([a, l]) => `<div class="act-level"><span>${ACT_ICON[a] || ''} ${esc(a)}</span><select data-a="${esc(a)}">${M.LEVELS.map(x => `<option ${x === l ? 'selected' : ''}>${x}</option>`).join('')}</select></div>`).join('');
    $('#actLevels').querySelectorAll('select').forEach(s => s.onchange = () => st.activities[s.dataset.a] = s.value);
  };
  drawLevels();
  $('#acts').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; const a = c.dataset.v; if (st.activities[a]) delete st.activities[a]; else st.activities[a] = 'Beginner'; c.classList.toggle('on'); drawLevels(); };
  document.querySelectorAll('.chips[data-key]').forEach(box => box.onclick = e => {
    const c = e.target.closest('.chip'); if (!c) return; const arr = st[box.dataset.key], v = c.dataset.v;
    const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); c.classList.toggle('on');
  });
  const pf = $('#pf');
  const toggleOpts = () => { $('#buddyOpts').classList.toggle('hidden', !pf.buddy_on.checked); $('#datingOpts').classList.toggle('hidden', !pf.dating_on.checked); };
  pf.buddy_on.onchange = pf.dating_on.onchange = toggleOpts; toggleOpts();
  $('#photoIn').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { st.photo = await resizeImage(f, 480); $('#pic').innerHTML = avatar({ photo: st.photo }); } catch { toast('Could not read that image'); } };
  $('#rmPhoto').onclick = e => { e.preventDefault(); st.photo = null; $('#pic').innerHTML = avatar({ name: pf.name.value || '?' }); };
  pf.onsubmit = async e => {
    e.preventDefault();
    const body = { ...st, name: pf.name.value, age: pf.age.value, gender: pf.gender.value, city: pf.city.value, venue: pf.venue.value, venue_type: pf.venue_type.value, bio: pf.bio.value,
      buddy_on: pf.buddy_on.checked, dating_on: pf.dating_on.checked, min_overlap: pf.min_overlap.value, age_min: pf.age_min.value, age_max: pf.age_max.value };
    try { const first = !S.user.onboarded; S.user = (await api('/me', { method: 'PUT', body })).user; toast('Profile saved ✅'); if (first) location.hash = '#/discover'; else route(); }
    catch (err) { $('#err').textContent = err.message; $('#err').scrollIntoView({ block: 'center' }); }
  };
  if ($('#logout')) $('#logout').onclick = async () => { try { await api('/logout', { method: 'POST' }); } catch {} logoutLocal(); };
}
function resizeImage(file, max) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onerror = rej;
    img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src); res(c.toDataURL('image/jpeg', 0.82)); };
    img.src = URL.createObjectURL(file);
  });
}

// ---------- discover ----------
function cardHTML(u) {
  const acts = Object.entries(u.activities).map(([a, l]) => `<span class="tag ${u.shared.includes(a) ? 'hl' : ''}">${ACT_ICON[a] || ''} ${esc(a)} · ${esc(l)}</span>`).join('');
  return `<div class="hero">${avatar(u)}${u.is_sample ? '<div class="sample">SAMPLE PROFILE</div>' : ''}<div class="score" title="Compatibility">${u.score}%</div>
    <div class="title"><b>${esc(u.name)}, ${u.age}</b><div class="small">📍 ${esc(u.venue ? u.venue + ' · ' : '')}${esc(u.city)}</div></div></div>
    <div class="stamp like">${S.mode === 'dating' ? 'LIKE' : "LET'S TRAIN"}</div><div class="stamp nope">PASS</div>
    <div class="body"><div class="reasons">${u.reasons.map(r => `<div>${esc(r)}</div>`).join('')}</div>
    <div>${acts}</div><div style="margin-top:6px">${u.goals.map(g => `<span class="tag">🎯 ${esc(g)}</span>`).join('')}</div>
    <div class="small muted" style="margin-top:8px">🗓 ${esc(u.days.join(', ') || '—')} · ${esc(u.times.join(', ') || '—')}</div>
    <p style="margin:10px 0 0">${esc(u.bio)}</p>
    <div style="margin-top:12px"><a href="#" class="small muted" data-report="${u.id}">🚩 Report / block</a></div></div>`;
}
async function renderDiscover() {
  const mode = S.mode;
  $('#app').innerHTML = `<div class="empty">Loading…</div>`;
  const d = await api('/feed?mode=' + mode);
  if (S.mode !== mode) return;
  S.feed = d.users;
  $('#app').innerHTML = `<div class="small muted">${mode === 'buddy' ? '🤝 Workout partners' : '❤️ Dating'} · ${d.total} people match your filters</div>
    <div class="deck" id="deck"></div>
    <div class="actions" id="acts"><button class="circle pass" id="passBtn" aria-label="Pass">✕</button><button class="circle like" id="likeBtn" aria-label="Like">${mode === 'dating' ? '♥' : '💪'}</button></div>
    <div class="kbd">Swipe, tap, or use ← / → keys</div>`;
  $('#passBtn').onclick = () => decide('pass'); $('#likeBtn').onclick = () => decide('like');
  drawDeck();
}
function drawDeck() {
  const deck = $('#deck'); if (!deck) return;
  if (!S.feed.length) {
    deck.innerHTML = `<div class="empty"><div class="big">🏁</div><b>That's everyone for now.</b><p>Widen your filters in your profile, or switch modes.</p><a class="btn ghost" href="#/profile" style="width:auto">Edit filters</a></div>`;
    $('#acts').classList.add('hidden'); return;
  }
  deck.innerHTML = S.feed.slice(0, 2).reverse().map((u, i, arr) => `<div class="card" data-id="${u.id}" style="${i < arr.length - 1 ? 'transform:scale(.95) translateY(10px);opacity:.6' : ''}">${cardHTML(u)}</div>`).join('');
  deck.querySelectorAll('[data-report]').forEach(a => a.onclick = e => { e.preventDefault(); reportDialog(+a.dataset.report, () => { S.feed = S.feed.filter(x => x.id !== +a.dataset.report); drawDeck(); }); });
  attachSwipe(deck.lastElementChild);
}
function attachSwipe(card) {
  let sx = 0, sy = 0, dx = 0, down = false;
  const like = card.querySelector('.stamp.like'), nope = card.querySelector('.stamp.nope');
  card.addEventListener('pointerdown', e => { if (e.target.closest('a,button')) return; down = true; sx = e.clientX; sy = e.clientY; dx = 0; card.classList.add('dragging'); card.setPointerCapture(e.pointerId); });
  card.addEventListener('pointermove', e => { if (!down) return; dx = e.clientX - sx; const dy = e.clientY - sy; card.style.transform = `translate(${dx}px,${dy * 0.3}px) rotate(${dx / 18}deg)`; like.style.opacity = Math.max(0, dx / 100); nope.style.opacity = Math.max(0, -dx / 100); });
  const end = () => { if (!down) return; down = false; card.classList.remove('dragging'); if (Math.abs(dx) > 100) decide(dx > 0 ? 'like' : 'pass'); else { card.style.transform = ''; like.style.opacity = nope.style.opacity = 0; } };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
}
let busy = false;
async function decide(action) {
  if (busy || !S.feed.length) return; busy = true;
  const u = S.feed[0], card = $('#deck .card:last-child');
  if (card) { card.style.transform = `translateX(${action === 'like' ? 600 : -600}px) rotate(${action === 'like' ? 25 : -25}deg)`; card.querySelector(action === 'like' ? '.stamp.like' : '.stamp.nope').style.opacity = 1; }
  try {
    const r = await api('/swipe', { method: 'POST', body: { mode: S.mode, to_id: u.id, action } });
    S.feed.shift();
    setTimeout(() => { drawDeck(); busy = false; if (r.match) showMatch(r.match); }, 220);
  } catch (e) { toast(e.message); busy = false; drawDeck(); }
}
document.addEventListener('keydown', e => {
  if (!location.hash.startsWith('#/discover') && location.hash !== '' && location.hash !== '#/') return;
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || !$('#modal').classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') decide('like'); if (e.key === 'ArrowLeft') decide('pass');
});
function showMatch(m) {
  const md = $('#modal');
  md.innerHTML = `<div class="box"><h1 style="color:var(--accent)">${m.mode === 'dating' ? "It's a match! ❤️" : "Training partner found! 💪"}</h1>
    <p class="muted">You and ${esc(m.user.name)} liked each other · ${m.score}% compatible</p>
    <div class="matchpics"><div class="pic">${avatar(S.user)}</div><div class="pic">${avatar(m.user)}</div></div>
    <a class="btn" href="#/chat/${m.id}" id="goChat">Send a message</a><button class="btn ghost" id="keep" style="margin-top:8px">Keep swiping</button></div>`;
  md.classList.remove('hidden');
  const close = () => md.classList.add('hidden');
  $('#keep').onclick = close; $('#goChat').onclick = close;
}

// ---------- safety ----------
function reportDialog(userId, after) {
  const md = $('#modal');
  md.innerHTML = `<div class="box" style="text-align:left"><h2 style="margin-top:0">Report or block</h2>
    <p class="small muted">Blocking hides you from each other everywhere and removes the match. Reports go to our safety team (demo: stored in the database).</p>
    <label>Reason (for reports)</label><select id="rr"><option>Fake profile / spam</option><option>Inappropriate messages</option><option>Harassment</option><option>Underage</option><option>Other</option></select>
    <button class="btn danger" id="doReport" style="margin-top:14px">🚩 Report &amp; block</button>
    <button class="btn ghost" id="doBlock" style="margin-top:8px">⛔ Just block</button>
    <button class="btn ghost" id="cancel" style="margin-top:8px">Cancel</button></div>`;
  md.classList.remove('hidden');
  const close = () => md.classList.add('hidden');
  $('#cancel').onclick = close;
  $('#doBlock').onclick = async () => { try { await api('/block', { method: 'POST', body: { user_id: userId } }); close(); toast('Blocked'); after && after(); } catch (e) { toast(e.message); } };
  $('#doReport').onclick = async () => { try { await api('/report', { method: 'POST', body: { user_id: userId, reason: $('#rr').value } }); close(); toast('Reported & blocked. Thanks for keeping FitMatch safe.'); after && after(); } catch (e) { toast(e.message); } };
}

// ---------- matches ----------
async function renderMatches() {
  const { matches } = await api('/matches');
  $('#app').innerHTML = `<h1>Matches</h1>${matches.length ? `<div class="mlist">${matches.map(m => `
    <a href="#/chat/${m.id}"><div class="pic">${avatar(m.user)}</div><div class="meta"><b>${esc(m.user.name)}</b><span class="pill ${m.mode}">${m.mode === 'dating' ? 'DATING' : 'BUDDY'}</span>${m.user.is_sample ? '<span class="pill">SAMPLE</span>' : ''}
    <div class="last">${m.last ? (m.last.sender_id === S.user.id ? 'You: ' : '') + esc(m.last.body) : `New match · ${m.score}% · say hi 👋`}</div></div></a>`).join('')}</div>`
    : `<div class="empty"><div class="big">🤝</div>No matches yet. When you and someone both like each other, they'll show up here.<br><br><a class="btn" href="#/discover" style="width:auto">Start swiping</a></div>`}`;
}

// ---------- chat ----------
async function renderChat(id) {
  const d = await api(`/matches/${id}/messages`);
  const o = d.user; let lastId = 0;
  $('#app').innerHTML = `<div class="chathead"><a class="iconbtn" href="#/matches">←</a><div class="pic">${avatar(o)}</div>
    <div class="grow"><b>${esc(o.name)}, ${o.age}</b> <span class="pill ${d.mode}">${d.mode.toUpperCase()}</span><div class="small muted">📍 ${esc(o.venue || o.city)}${o.is_sample ? ' · sample profile (auto-replies)' : ''}</div></div>
    <button class="iconbtn" id="rep" title="Report or block">🚩</button></div>
    <div class="msgs" id="msgs"><div class="small muted" style="text-align:center">You matched in ${d.mode} mode. Suggest a session — ${esc(Object.keys(o.activities)[0] || 'a workout')}? Meet in public places first.</div></div>
    <div class="composer"><form id="cf"><input id="ci" placeholder="Message ${esc(o.name.split(' ')[0])}…" autocomplete="off" maxlength="1000"><button class="btn">Send</button></form></div>`;
  const add = msgs => {
    const box = $('#msgs'); if (!box) return;
    msgs.forEach(m => { if (m.id <= lastId) return; lastId = m.id; const el = document.createElement('div'); el.className = 'msg' + (m.sender_id === S.user.id ? ' mine' : ''); el.textContent = m.body; box.appendChild(el); });
    if (msgs.length) window.scrollTo(0, document.body.scrollHeight);
  };
  add(d.messages);
  $('#cf').onsubmit = async e => {
    e.preventDefault(); const v = $('#ci').value.trim(); if (!v) return; $('#ci').value = '';
    try { const r = await api(`/matches/${id}/messages`, { method: 'POST', body: { body: v } }); add([r.message]); } catch (err) { toast(err.message); }
  };
  $('#rep').onclick = () => reportDialog(o.id, () => (location.hash = '#/matches'));
  S.poll = setInterval(async () => { try { add((await api(`/matches/${id}/messages?after=${lastId}`)).messages); } catch {} }, 2000);
  $('#ci').focus();
}

route();
