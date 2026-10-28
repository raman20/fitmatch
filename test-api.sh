#!/usr/bin/env bash
# Smoke test of main flows against a running server. Usage: BASE=http://localhost:3000 ./test-api.sh
set -e; B=${BASE:-http://localhost:3000}; E="t$RANDOM@test.in"
j(){ curl -s -H 'Content-Type: application/json' "$@"; }
echo "--- 18+ gate (no confirm)"; j -X POST $B/api/register -d "{\"email\":\"$E\",\"password\":\"secret1\"}"; echo
T=$(j -X POST $B/api/register -d "{\"email\":\"$E\",\"password\":\"secret1\",\"adult\":true}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
A="Authorization: Bearer $T"
echo "--- underage profile rejected"; j -H "$A" -X PUT $B/api/me -d '{"name":"Kid","age":16,"gender":"Man","city":"Bengaluru","activities":{"Running":"Beginner"},"buddy_on":true}'; echo
echo "--- create profile"; j -H "$A" -X PUT $B/api/me -d '{"name":"Raman Test","age":29,"gender":"Man","city":"Bengaluru","venue":"Cubbon Park","venue_type":"Park","goals":["Endurance","Strength"],"activities":{"Running":"Intermediate","Gym / weights":"Advanced"},"days":["Tue","Thu","Sat","Sun"],"times":["Early morning","Evening"],"bio":"hi","buddy_on":true,"dating_on":true,"date_genders":["Woman"],"age_min":22,"age_max":35}' | node -pe 'const u=JSON.parse(require("fs").readFileSync(0)).user;u.name+" onboarded="+u.onboarded'
for M in buddy dating; do echo "--- $M feed"; j -H "$A" "$B/api/feed?mode=$M" | node -pe 'const d=JSON.parse(require("fs").readFileSync(0));d.total+" users; top: "+d.users.slice(0,4).map(u=>u.name+"("+u.gender+") "+u.score+"% ["+u.reasons.join("; ")+"]").join(" | ")'; done
echo "--- like everyone in buddy feed"
IDS=$(j -H "$A" "$B/api/feed?mode=buddy" | node -pe 'JSON.parse(require("fs").readFileSync(0)).users.map(u=>u.id).join(" ")')
MID=""; for i in $IDS; do R=$(j -H "$A" -X POST $B/api/swipe -d "{\"mode\":\"buddy\",\"to_id\":$i,\"action\":\"like\"}"); echo "$R" | grep -q '"id"' && MID=${MID:-$(echo "$R" | node -pe 'JSON.parse(require("fs").readFileSync(0)).match.id')}; done
echo "matches: $(j -H "$A" $B/api/matches | node -pe 'JSON.parse(require("fs").readFileSync(0)).matches.length')  first match id=$MID"
echo "--- feed after swiping: $(j -H "$A" "$B/api/feed?mode=buddy" | node -pe 'JSON.parse(require("fs").readFileSync(0)).total')"
echo "--- chat"; j -H "$A" -X POST $B/api/matches/$MID/messages -d '{"body":"Hey! Run on Saturday?"}'; echo; sleep 2
j -H "$A" $B/api/matches/$MID/messages | node -pe 'JSON.parse(require("fs").readFileSync(0)).messages.map(m=>m.sender_id+": "+m.body).join("\n")'
echo "--- real-user mutual match (two new accounts)"
mk(){ local e="u$RANDOM$1@test.in"; local t=$(j -X POST $B/api/register -d "{\"email\":\"$e\",\"password\":\"secret1\",\"adult\":true}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token'); j -H "Authorization: Bearer $t" -X PUT $B/api/me -d "{\"name\":\"$2\",\"age\":27,\"gender\":\"$3\",\"city\":\"Jaipur\",\"activities\":{\"Yoga\":\"Beginner\"},\"days\":[\"Mon\"],\"times\":[\"Morning\"],\"buddy_on\":false,\"dating_on\":true,\"date_genders\":[\"$4\"],\"age_min\":20,\"age_max\":40}" >/dev/null; echo $t; }
T1=$(mk a Asha Woman Man); T2=$(mk b Nikhil Man Woman)
ID1=$(j -H "Authorization: Bearer $T1" $B/api/me | node -pe 'JSON.parse(require("fs").readFileSync(0)).user.id'); ID2=$(j -H "Authorization: Bearer $T2" $B/api/me | node -pe 'JSON.parse(require("fs").readFileSync(0)).user.id')
echo "Nikhil sees Asha in dating feed: $(j -H "Authorization: Bearer $T2" "$B/api/feed?mode=dating" | grep -c "\"id\":$ID1,")"
echo "Asha buddy feed (mode off): $(j -H "Authorization: Bearer $T1" "$B/api/feed?mode=buddy")"
j -H "Authorization: Bearer $T1" -X POST $B/api/swipe -d "{\"mode\":\"dating\",\"to_id\":$ID2,\"action\":\"like\"}"; echo
j -H "Authorization: Bearer $T2" -X POST $B/api/swipe -d "{\"mode\":\"dating\",\"to_id\":$ID1,\"action\":\"like\"}" | head -c 120; echo
echo "--- block: Asha blocks Nikhil -> match disappears"
j -H "Authorization: Bearer $T1" -X POST $B/api/report -d "{\"user_id\":$ID2,\"reason\":\"Spam\"}"; echo
echo "Nikhil matches: $(j -H "Authorization: Bearer $T2" $B/api/matches | node -pe 'JSON.parse(require("fs").readFileSync(0)).matches.length')"
