// SAMPLE DATA ONLY — all people below are fictional demo profiles.
const crypto = require('crypto');
const db = require('./db');
const hash = pw => { const s = 'samplesalt'; return s + ':' + crypto.scryptSync(pw, s, 32).toString('hex'); };
const B = 'Beginner', I = 'Intermediate', A = 'Advanced';
const wk = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], we = ['Sat', 'Sun'];
// name, age, gender, city, venue, venueType, goals, activities, days, times, bio, buddy, dating, dateGenders, ageMin, ageMax, buddyLevels
const S = [
  ['Aarav Mehta', 27, 'Man', 'Bengaluru', 'Cubbon Park', 'Park', ['Endurance', 'Train for an event'], { Running: A, Cycling: I }, ['Tue', 'Thu', 'Sat', 'Sun'], ['Early morning'], 'Training for the TCS World 10K. Looking for pace buddies for Sunday long runs.', 1, 1, ['Woman'], 23, 32, [I, A]],
  ['Priya Nair', 25, 'Woman', 'Bengaluru', 'Iron Republic Gym, Indiranagar', 'Gym', ['Build muscle', 'Strength'], { 'Gym / weights': I, Pilates: B }, wk, ['Evening'], 'PPL split, chasing a 60kg squat. Need a spotter who shows up on time!', 1, 1, ['Man'], 25, 33, [I, A]],
  ['Rohan Kulkarni', 30, 'Man', 'Pune', 'Smash Arena, Baner', 'Sports club / court', ['General fitness', 'Stress relief'], { Badminton: I, Football: B }, ['Mon', 'Wed', 'Fri'], ['Night'], 'Weeknight badminton doubles. Need a regular partner, any level welcome.', 1, 0, [], 18, 99, []],
  ['Ananya Iyer', 29, 'Woman', 'Chennai', 'Sunrise Yoga Studio, Adyar', 'Studio', ['Flexibility & mobility', 'Stress relief'], { Yoga: A, Swimming: I }, ['Mon', 'Wed', 'Fri', 'Sat'], ['Early morning', 'Morning'], 'Yoga teacher on weekends. Love beach walks at Besant Nagar after class.', 1, 1, ['Man'], 27, 36, []],
  ['Kabir Singh', 32, 'Man', 'Delhi', 'Lodhi Garden', 'Park', ['Lose fat', 'General fitness'], { Running: B, 'Home workouts': I }, ['Mon', 'Tue', 'Thu', 'Sat'], ['Early morning'], 'Down 8kg, 10 to go. Looking for accountability for morning walks/jogs.', 1, 1, ['Woman'], 26, 34, [B, I]],
  ['Meera Joshi', 26, 'Woman', 'Mumbai', 'PowerHouse Fitness, Bandra', 'Gym', ['Strength', 'Build muscle'], { 'Gym / weights': A, 'CrossFit / HIIT': I }, ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'], ['Morning'], 'Powerlifter, 120kg deadlift. Happy to teach form to motivated lifters.', 1, 1, ['Man', 'Woman'], 24, 34, [I, A]],
  ['Arjun Reddy', 28, 'Man', 'Hyderabad', 'Gachibowli Stadium', 'Ground / stadium', ['Sport performance', 'Endurance'], { Football: A, Running: I }, ['Wed', 'Sat', 'Sun'], ['Evening'], 'Sunday 7-a-side regular. Also up for interval runs midweek.', 1, 1, ['Woman'], 22, 30, []],
  ['Sneha Patel', 31, 'Woman', 'Ahmedabad', 'Riverfront Walkway', 'Trail / outdoors', ['Lose fat', 'General fitness'], { Cycling: I, 'Dance / Zumba': I }, ['Tue', 'Thu', 'Sat', 'Sun'], ['Early morning', 'Evening'], 'Weekend rides along the Sabarmati. Zumba twice a week.', 1, 0, [], 18, 99, [B, I]],
  ['Vikram Rao', 34, 'Man', 'Bengaluru', 'Iron Republic Gym, Indiranagar', 'Gym', ['Strength', 'Build muscle'], { 'Gym / weights': A, Calisthenics: I }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Evening', 'Night'], 'Ex-rugby. Strength coach in the making. Will push you, nicely.', 1, 1, ['Woman'], 26, 36, [I, A]],
  ['Isha Bansal', 24, 'Woman', 'Gurugram', 'FlowState Pilates, Golf Course Rd', 'Studio', ['Flexibility & mobility', 'General fitness'], { Pilates: I, Yoga: I, Running: B }, ['Mon', 'Wed', 'Sat'], ['Morning'], 'Reformer pilates + trying to run my first 5K.', 1, 1, ['Man'], 24, 31, []],
  ['Dev Malhotra', 29, 'Man', 'Mumbai', 'Sanjay Gandhi National Park trails', 'Trail / outdoors', ['Endurance', 'Stress relief'], { 'Hiking / trekking': A, Cycling: I }, we, ['Early morning'], 'Sahyadri monsoon treks every weekend. Kalsubai sunrise anyone?', 1, 1, ['Woman'], 24, 32, []],
  ['Fatima Sheikh', 27, 'Woman', 'Hyderabad', 'AquaFit Pool, Jubilee Hills', 'Pool', ['Endurance', 'Lose fat'], { Swimming: A, 'CrossFit / HIIT': B }, ['Mon', 'Wed', 'Fri'], ['Early morning'], 'Masters swimmer, 2k laps before work. Can help with freestyle technique.', 1, 0, [], 18, 99, [B, I]],
  ['Siddharth Menon', 33, 'Man', 'Kochi', 'Marine Drive', 'Trail / outdoors', ['Train for an event', 'Endurance'], { Running: A, Swimming: I, Cycling: I }, ['Tue', 'Thu', 'Sat', 'Sun'], ['Early morning'], 'Training for my first Ironman 70.3. Brick workouts are better with company.', 1, 1, ['Woman'], 27, 36, [I, A]],
  ['Tanvi Deshmukh', 23, 'Woman', 'Pune', 'Smash Arena, Baner', 'Sports club / court', ['Sport performance', 'General fitness'], { Badminton: A, Tennis: I }, ['Mon', 'Wed', 'Fri', 'Sat'], ['Evening', 'Night'], 'State-level badminton (junior). Looking for competitive singles practice.', 1, 1, ['Man'], 23, 29, [I, A]],
  ['Rahul Verma', 26, 'Man', 'Delhi', 'Home', 'Home', ['Build muscle', 'Lose fat'], { 'Home workouts': I, Calisthenics: B, Cricket: I }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Night'], 'WFH, so home workouts at night. Weekend gully cricket. Need a virtual accountability buddy.', 1, 1, ['Woman'], 21, 29, []],
  ['Nisha Kapoor', 30, 'Woman', 'Chandigarh', 'Sukhna Lake', 'Park', ['General fitness', 'Stress relief'], { Running: I, Yoga: B, 'Hiking / trekking': I }, ['Tue', 'Thu', 'Sat', 'Sun'], ['Early morning', 'Evening'], 'Lake loops at sunrise, Kasauli hikes on long weekends.', 1, 1, ['Man'], 28, 38, []],
  ['Aditya Ghosh', 35, 'Man', 'Kolkata', 'Rabindra Sarobar', 'Park', ['Endurance', 'General fitness'], { Cycling: A, Running: I }, ['Sat', 'Sun', 'Wed'], ['Early morning'], 'Weekend 60km rides. Slow coffee stops mandatory.', 1, 0, [], 18, 99, [I, A]],
  ['Zara Khan', 28, 'Woman', 'Mumbai', 'PowerHouse Fitness, Bandra', 'Gym', ['Lose fat', 'Build muscle'], { 'Gym / weights': B, 'Martial arts / boxing': I }, ['Mon', 'Wed', 'Fri', 'Sat'], ['Morning', 'Evening'], 'Boxing 3x a week, new to the weights floor. Teach me the barbell?', 1, 1, ['Man'], 26, 35, [I, A]],
  ['Karan Shah', 31, 'Man', 'Bengaluru', 'Koramangala Climbing Wall', 'Studio', ['Strength', 'Stress relief'], { Climbing: I, Yoga: B, 'Gym / weights': I }, ['Tue', 'Thu', 'Sat'], ['Evening'], 'Bouldering V4ish. Belay partner wanted for weekend crag trips to Ramanagara.', 1, 1, ['Woman', 'Man'], 25, 35, []],
  ['Lakshmi Pillai', 36, 'Woman', 'Bengaluru', 'Cubbon Park', 'Park', ['Train for an event', 'Endurance'], { Running: I, Pickleball: B }, ['Tue', 'Thu', 'Sat', 'Sun'], ['Early morning'], 'Half-marathon #3 coming up. Comfortable at 6:30/km.', 1, 1, ['Man'], 32, 42, [I, A]],
];
function seed() {
  if (db.prepare('SELECT COUNT(*) c FROM users WHERE is_sample=1').get().c > 0) return;
  const ins = db.prepare(`INSERT INTO users(email,pw_hash,name,age,gender,city,venue,venue_type,goals,activities,days,times,bio,buddy_on,dating_on,date_genders,age_min,age_max,buddy_levels,is_sample,onboarded)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,1)`);
  const pw = hash('sample123');
  S.forEach((s, i) => {
    const [name, age, gender, city, venue, vt, goals, acts, days, times, bio, bud, dat, dg, amin, amax, bl] = s;
    ins.run(`sample${String(i + 1).padStart(2, '0')}@fitmatch.sample`, pw, name, age, gender, city, venue, vt, JSON.stringify(goals), JSON.stringify(acts),
      JSON.stringify(days), JSON.stringify(times), bio, bud, dat, JSON.stringify(dg), amin, amax, JSON.stringify(bl));
  });
  // Ready-made demo account
  ins.run('demo@fitmatch.in', hash('demo1234'), 'Demo User', 28, 'Man', 'Bengaluru', 'Cubbon Park', 'Park', JSON.stringify(['Endurance', 'Build muscle']),
    JSON.stringify({ Running: 'Intermediate', 'Gym / weights': 'Intermediate' }), JSON.stringify(['Tue', 'Thu', 'Sat', 'Sun']), JSON.stringify(['Early morning', 'Evening']),
    'Demo account — explore freely.', 1, 1, JSON.stringify(['Woman']), 22, 36, JSON.stringify([]));
  db.prepare("UPDATE users SET is_sample=0 WHERE email='demo@fitmatch.in'").run();
  console.log(`Seeded ${S.length} sample users + demo account`);
}
module.exports = { seed };
if (require.main === module) seed();
