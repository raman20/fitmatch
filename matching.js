const LV = { Beginner: 0, Intermediate: 1, Advanced: 2 };
const inter = (a, b) => a.filter(x => b.includes(x));
const jacc = (a, b) => { const u = new Set([...a, ...b]); return u.size ? inter(a, b).length / u.size : 0; };

function parse(u) {
  const j = (s, d) => { try { return JSON.parse(s); } catch { return d; } };
  return { ...u, goals: j(u.goals, []), activities: j(u.activities, {}), days: j(u.days, []), times: j(u.times, []),
    date_genders: j(u.date_genders, []), buddy_levels: j(u.buddy_levels, []), buddy_on: !!u.buddy_on, dating_on: !!u.dating_on, is_sample: !!u.is_sample, onboarded: !!u.onboarded };
}
function overallLevel(u) {
  const v = Object.values(u.activities).map(l => LV[l] ?? 0);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
}

// Hard filters (both directions where relevant)
function eligible(me, o, mode) {
  if (!o.onboarded || o.age < 18) return false;
  if (mode === 'buddy') {
    if (!o.buddy_on) return false;
    const sharedDays = inter(me.days, o.days).length;
    if (me.min_overlap && sharedDays < me.min_overlap) return false;
    return true;
  }
  if (!o.dating_on) return false;
  const wants = (a, b) => (!a.date_genders.length || a.date_genders.includes(b.gender)) && b.age >= (a.age_min || 18) && b.age <= (a.age_max || 99);
  return wants(me, o) && wants(o, me);
}

// Score 0-100 + human-readable reasons
function score(me, o, mode) {
  const reasons = [];
  const myActs = Object.keys(me.activities), oActs = Object.keys(o.activities);
  const shared = inter(myActs, oActs);
  // Activities (30)
  const sAct = myActs.length && oActs.length ? Math.min(1, shared.length / Math.min(myActs.length, oActs.length)) : 0;
  if (shared.length) reasons.push('Both into ' + shared.slice(0, 3).join(', '));
  // Goals (20)
  const sGoal = jacc(me.goals, o.goals);
  const sg = inter(me.goals, o.goals);
  if (sg.length) reasons.push('Shared goal: ' + sg.slice(0, 2).join(', '));
  // Level (15): compare per shared activity, else overall
  let diffs = shared.map(a => Math.abs((LV[me.activities[a]] ?? 0) - (LV[o.activities[a]] ?? 0)));
  if (!diffs.length) diffs = [Math.abs(overallLevel(me) - overallLevel(o))];
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  let sLvl = 1 - avgDiff / 2;
  if (mode === 'buddy' && me.buddy_levels.length) {
    const lvls = shared.length ? shared.map(a => o.activities[a]) : [Object.keys(LV)[overallLevel(o)]];
    sLvl = lvls.some(l => me.buddy_levels.includes(l)) ? Math.max(sLvl, 0.9) : sLvl * 0.5;
  }
  if (sLvl >= 0.9) reasons.push('Similar level');
  // Schedule (20)
  const dShared = inter(me.days, o.days), tShared = inter(me.times, o.times);
  const sDay = me.days.length && o.days.length ? dShared.length / Math.min(me.days.length, o.days.length) : 0;
  const sTime = me.times.length && o.times.length ? tShared.length / Math.min(me.times.length, o.times.length) : 0;
  const sSched = 0.5 * sDay + 0.5 * sTime;
  if (dShared.length && tShared.length) reasons.push(`Free ${dShared.length} same day${dShared.length > 1 ? 's' : ''}, ${tShared[0].toLowerCase()}`);
  // Location (15)
  let sLoc = 0;
  const norm = s => (s || '').trim().toLowerCase();
  if (norm(me.city) && norm(me.city) === norm(o.city)) {
    sLoc = 0.6;
    if (norm(me.venue) && norm(me.venue) === norm(o.venue)) { sLoc = 1; reasons.unshift('Same spot: ' + o.venue); }
    else reasons.push('Also in ' + o.city);
  }
  let total = 30 * sAct + 20 * sGoal + 15 * sLvl + 20 * sSched + 15 * sLoc;
  if (mode === 'dating') {
    // preferences already hard-filtered; small bonus for age closeness
    const ad = Math.abs(me.age - o.age);
    total = total * 0.9 + 10 * Math.max(0, 1 - ad / 10);
  }
  return { score: Math.round(Math.max(0, Math.min(100, total))), reasons: reasons.slice(0, 4), shared };
}
module.exports = { parse, eligible, score, overallLevel };
