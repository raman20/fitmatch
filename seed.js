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

// ---- Programmatic sample generator (deterministic, so every fresh DB gets the same people) ----
const TOTAL_SAMPLES = 500;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(20261028);
const pick = a => a[Math.floor(R() * a.length)];
const pickN = (a, n) => { const c = [...a], o = []; while (o.length < n && c.length) o.push(c.splice(Math.floor(R() * c.length), 1)[0]); return o; };
const randInt = (lo, hi) => lo + Math.floor(R() * (hi - lo + 1));
const FIRST = {
  Man: ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Rohan', 'Kabir', 'Ishaan', 'Reyansh', 'Ayaan', 'Krishna', 'Sai', 'Atharv', 'Dhruv', 'Nikhil', 'Pranav', 'Rahul', 'Varun', 'Karthik', 'Siddharth', 'Manish', 'Harsh', 'Yash', 'Akash', 'Amit', 'Sameer', 'Imran', 'Faizan', 'Joseph', 'Gurpreet', 'Harjot', 'Anirban', 'Sourav', 'Abhishek', 'Tejas', 'Omkar', 'Naveen', 'Vignesh', 'Arun', 'Rakesh', 'Deepak', 'Mohit', 'Kunal', 'Neel', 'Parth', 'Ritvik', 'Shaurya', 'Zubin', 'Aniket', 'Suraj', 'Hemant'],
  Woman: ['Aanya', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Myra', 'Ira', 'Kiara', 'Riya', 'Priya', 'Sneha', 'Pooja', 'Neha', 'Shreya', 'Kavya', 'Meera', 'Isha', 'Tanvi', 'Nisha', 'Divya', 'Aishwarya', 'Lakshmi', 'Deepika', 'Swati', 'Ritika', 'Simran', 'Harleen', 'Zoya', 'Ayesha', 'Fatima', 'Sana', 'Maria', 'Anjali', 'Rhea', 'Trisha', 'Nandini', 'Pallavi', 'Shruti', 'Gayatri', 'Madhuri', 'Bhavna', 'Ishita', 'Sakshi', 'Tara', 'Mitali', 'Payal', 'Radhika', 'Sonal', 'Vidya'],
  'Non-binary': ['Aru', 'Kiran', 'Ashu', 'Noor', 'Sam', 'Jai', 'Rumi', 'Sky', 'Neel', 'Avi', 'Ari', 'Indu'],
};
const LAST = ['Sharma', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Menon', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta', 'Joshi', 'Kulkarni', 'Deshpande', 'Banerjee', 'Chatterjee', 'Das', 'Ghosh', 'Singh', 'Gill', 'Sandhu', 'Khan', 'Sheikh', 'Qureshi', "D'Souza", 'Fernandes', 'Pillai', 'Krishnan', 'Naidu', 'Bhat', 'Hegde', 'Shetty', 'Kapoor', 'Malhotra', 'Chopra', 'Agarwal', 'Jain', 'Saxena', 'Mishra', 'Pandey', 'Tiwari', 'Yadav', 'Thakur', 'Bose', 'Mukherjee', 'Pathak', 'Sethi', 'Arora', 'Bajaj', 'Kamath'];
// city -> { venueType: [venues] }
const VENUES = {
  Mumbai: { Park: ['Joggers Park, Bandra', 'Shivaji Park', 'Priyadarshini Park'], Gym: ['PowerHouse Fitness, Bandra', 'Iron Den, Andheri West', 'Cult Gym, Powai'], Studio: ['Zen Yoga Loft, Khar', 'Pulse Pilates, Lower Parel'], 'Sports club / court': ['Andheri Sports Complex', 'Khar Gymkhana courts'], Pool: ['NSCI Dome Pool', 'Andheri Aquatic Centre'], 'Trail / outdoors': ['Sanjay Gandhi National Park trails', 'Marine Drive promenade'], 'Ground / stadium': ['Oval Maidan', 'Azad Maidan'] },
  Bengaluru: { Park: ['Cubbon Park', 'Lalbagh', 'Sankey Tank'], Gym: ['Iron Republic Gym, Indiranagar', 'Cult Gym, HSR Layout', 'Gold\'s Gym, Koramangala'], Studio: ['Koramangala Climbing Wall', 'Prana Yoga, Jayanagar', 'Beat Dance Studio, Whitefield'], 'Sports club / court': ['Play Arena, Sarjapur', 'Smash Badminton, HSR'], Pool: ['Basavanagudi Aquatic Centre', 'Kensington Pool'], 'Trail / outdoors': ['Nandi Hills climb', 'Turahalli Forest trail'], 'Ground / stadium': ['Kanteerava Stadium', 'Ulsoor ground'] },
  Delhi: { Park: ['Lodhi Garden', 'Deer Park, Hauz Khas', 'Nehru Park'], Gym: ['Muscle Factory, Saket', 'Anytime Fitness, GK-2', 'Cult Gym, Rajouri Garden'], Studio: ['Om Yoga Studio, Defence Colony', 'Fight Club Boxing, Lajpat Nagar'], 'Sports club / court': ['Siri Fort Sports Complex', 'DLTA Complex'], Pool: ['Talkatora Pool', 'Siri Fort Pool'], 'Trail / outdoors': ['Sanjay Van trail', 'Asola Bhatti trails'], 'Ground / stadium': ['JLN Stadium track', 'Thyagaraj Stadium'] },
  Gurugram: { Park: ['Leisure Valley Park', 'Tau Devi Lal Park'], Gym: ['Cult Gym, Sector 29', 'Gold\'s Gym, Golf Course Rd'], Studio: ['FlowState Pilates, Golf Course Rd', 'Zumba Nation, DLF Phase 4'], 'Sports club / court': ['Pickleball Hub, Sector 56', 'Tennis Garden, DLF 5'], Pool: ['Nehru Stadium Pool, Gurugram'], 'Trail / outdoors': ['Aravalli Biodiversity Park trail'], 'Ground / stadium': ['Tau Devi Lal Stadium'] },
  Pune: { Park: ['Empress Garden', 'Kamla Nehru Park'], Gym: ['Fitness Factory, Kothrud', 'Cult Gym, Viman Nagar'], Studio: ['Iyengar Yoga Centre', 'CrossBox, Baner'], 'Sports club / court': ['Smash Arena, Baner', 'PYC Hindu Gymkhana'], Pool: ['Tilak Tank', 'Balewadi Aquatic Centre'], 'Trail / outdoors': ['Vetal Tekdi', 'Sinhagad Fort trail'], 'Ground / stadium': ['Balewadi Stadium', 'SP College ground'] },
  Hyderabad: { Park: ['KBR National Park', 'Sanjeevaiah Park'], Gym: ['Gold\'s Gym, Banjara Hills', 'Cult Gym, Kondapur'], Studio: ['Shanti Yoga, Jubilee Hills', 'Punch House, Madhapur'], 'Sports club / court': ['Pullela Gopichand Academy', 'Gachibowli Indoor Stadium'], Pool: ['AquaFit Pool, Jubilee Hills', 'GHMC Pool, Gachibowli'], 'Trail / outdoors': ['Necklace Road', 'Ananthagiri Hills trail'], 'Ground / stadium': ['Gachibowli Stadium', 'LB Stadium'] },
  Chennai: { Park: ['Nageswara Rao Park', 'Guindy Park'], Gym: ['Muscle Mania, T Nagar', 'Cult Gym, Anna Nagar'], Studio: ['Sunrise Yoga Studio, Adyar', 'Kalakshetra dance studio'], 'Sports club / court': ['SDAT Tennis Stadium', 'Madras Gymkhana courts'], Pool: ['Velachery Aquatic Complex'], 'Trail / outdoors': ['Besant Nagar beach', 'Marina Beach promenade'], 'Ground / stadium': ['Nehru Stadium, Periamet', 'Chepauk nets'] },
  Kolkata: { Park: ['Rabindra Sarobar', 'Central Park, Salt Lake', 'Maidan'], Gym: ['Talwalkars, Park Street', 'Cult Gym, New Town'], Studio: ['Yoga Mandir, Ballygunge'], 'Sports club / court': ['Calcutta Racket Club', 'Salt Lake badminton hall'], Pool: ['Anderson Club Pool'], 'Trail / outdoors': ['Eco Park loop', 'Prinsep Ghat riverside'], 'Ground / stadium': ['Salt Lake Stadium', 'Mohun Bagan ground'] },
  Ahmedabad: { Park: ['Law Garden', 'Vastrapur Lake'], Gym: ['Fit Zone, SG Highway', 'Cult Gym, Prahlad Nagar'], Studio: ['Zumba Studio, Navrangpura'], 'Sports club / court': ['Karnavati Club courts'], Pool: ['Sardar Patel Pool'], 'Trail / outdoors': ['Riverfront Walkway'], 'Ground / stadium': ['Motera ground'] },
  Jaipur: { Park: ['Central Park, Jaipur', 'Jawahar Circle'], Gym: ['Iron Fit, Malviya Nagar', 'Anytime Fitness, C-Scheme'], Studio: ['Pink City Yoga, Bani Park'], 'Sports club / court': ['SMS Badminton Hall'], Pool: ['SMS Swimming Pool'], 'Trail / outdoors': ['Nahargarh Fort trek', 'Jhalana trail'], 'Ground / stadium': ['SMS Stadium'] },
  Kochi: { Park: ['Subhash Bose Park'], Gym: ['Gold\'s Gym, Kadavanthra', 'Muscle Hub, Edappally'], Studio: ['Kalari Studio, Fort Kochi', 'Yoga Tree, Panampilly Nagar'], 'Sports club / court': ['Regional Sports Centre'], Pool: ['RSC Pool, Kadavanthra'], 'Trail / outdoors': ['Marine Drive', 'Cherai beach'], 'Ground / stadium': ['JLN Stadium, Kaloor'] },
  Chandigarh: { Park: ['Sukhna Lake', 'Rose Garden', 'Leisure Valley'], Gym: ['Fitness First, Sector 17', 'Cult Gym, Sector 35'], Studio: ['Yogshala, Sector 8'], 'Sports club / court': ['Lake Club courts', 'Sector 42 sports complex'], Pool: ['Sector 23 Pool'], 'Trail / outdoors': ['Morni Hills trail', 'Kasauli hikes'], 'Ground / stadium': ['Sector 16 Cricket Stadium'] },
  Lucknow: { Park: ['Janeshwar Mishra Park', 'Ambedkar Park'], Gym: ['Muscle Zone, Gomti Nagar'], Studio: ['Nritya Studio, Hazratganj'], 'Sports club / court': ['KD Singh Babu courts'], Pool: ['Gomti Nagar Pool'], 'Trail / outdoors': ['Gomti Riverfront'], 'Ground / stadium': ['Ekana Stadium'] },
  Indore: { Park: ['Meghdoot Garden', 'Regional Park'], Gym: ['Anytime Fitness, Vijay Nagar'], Studio: ['Yoga Niketan, Palasia'], 'Sports club / court': ['Yeshwant Club courts'], Pool: ['Nehru Park Pool'], 'Trail / outdoors': ['Patalpani trail'], 'Ground / stadium': ['Holkar Stadium'] },
  Goa: { Park: ['Campal Garden'], Gym: ['Iron Paradise, Panjim'], Studio: ['Purple Valley Yoga, Assagao'], 'Sports club / court': ['Panjim Gymkhana'], Pool: ['Campal Pool'], 'Trail / outdoors': ['Miramar beach', 'Dudhsagar trek'], 'Ground / stadium': ['Fatorda Stadium'] },
};
// activity -> venue types it naturally happens at
const ACT_VENUE = {
  'Gym / weights': ['Gym'], Running: ['Park', 'Trail / outdoors', 'Ground / stadium'], Yoga: ['Studio', 'Park', 'Home'], Cycling: ['Trail / outdoors', 'Park'], Swimming: ['Pool'],
  'Hiking / trekking': ['Trail / outdoors'], Badminton: ['Sports club / court'], Cricket: ['Ground / stadium'], Football: ['Ground / stadium'], Tennis: ['Sports club / court'],
  Pickleball: ['Sports club / court'], 'CrossFit / HIIT': ['Gym', 'Studio'], 'Dance / Zumba': ['Studio'], Pilates: ['Studio'], 'Martial arts / boxing': ['Studio', 'Gym'],
  Calisthenics: ['Park', 'Gym'], 'Home workouts': ['Home'], Climbing: ['Studio', 'Trail / outdoors'],
};
const ACT_GOALS = {
  'Gym / weights': ['Build muscle', 'Strength'], Running: ['Endurance', 'Train for an event'], Yoga: ['Flexibility & mobility', 'Stress relief'], Cycling: ['Endurance'], Swimming: ['Endurance', 'General fitness'],
  'Hiking / trekking': ['Endurance', 'Stress relief'], Badminton: ['Sport performance'], Cricket: ['Sport performance'], Football: ['Sport performance'], Tennis: ['Sport performance'], Pickleball: ['General fitness'],
  'CrossFit / HIIT': ['Lose fat', 'Strength'], 'Dance / Zumba': ['Lose fat', 'Stress relief'], Pilates: ['Flexibility & mobility'], 'Martial arts / boxing': ['Lose fat', 'Strength'], Calisthenics: ['Strength'], 'Home workouts': ['Lose fat', 'General fitness'], Climbing: ['Strength'],
};
const ACT_LINE = {
  'Gym / weights': ['Need a spotter for heavy bench days.', 'Running a PPL split and want a consistent partner.', 'Chasing a bodyweight squat this year.'],
  Running: ['Looking for pace buddies for weekend long runs.', 'Training for a half marathon — easy pace, lots of chatting.', 'Couch-to-5K graduate looking for a running crew.'],
  Yoga: ['Morning vinyasa keeps me sane.', 'Hatha regular, learning arm balances.', 'Looking for someone to try new yoga classes with.'],
  Cycling: ['Weekend 50km rides, coffee stop mandatory.', 'New road bike, need riding company.', 'Commute by cycle and ride longer on Sundays.'],
  Swimming: ['Laps before work, working on my freestyle.', 'Learning to swim properly as an adult — patience appreciated!', 'Open-water curious, pool regular.'],
  'Hiking / trekking': ['Monsoon treks are my thing.', 'Weekend getaways to the hills whenever possible.', 'Collecting sunrise summits this year.'],
  Badminton: ['Weeknight doubles, any level welcome.', 'Looking for competitive singles practice.', 'Need a regular badminton partner.'],
  Cricket: ['Weekend box cricket regular.', 'Gully cricket on Sundays — need a few more players.', 'Leg-spinner looking for a nets partner.'],
  Football: ['Sunday 7-a-side regular.', 'Turf football twice a week.', 'Looking for a futsal team.'],
  Tennis: ['Want a hitting partner for weekend mornings.', 'Getting back into tennis after years off.', 'Working on my serve, rally buddies welcome.'],
  Pickleball: ['Just discovered pickleball and I am hooked.', 'Pickleball doubles partner wanted.', 'Casual pickleball after work.'],
  'CrossFit / HIIT': ['WODs are better with someone yelling encouragement.', 'HIIT 4x a week, loving it.', 'Prepping for a local fitness challenge.'],
  'Dance / Zumba': ['Zumba twice a week — come join!', 'Bollywood dance fitness fan.', 'Dance cardio is my favourite workout.'],
  Pilates: ['Reformer pilates convert.', 'Mat pilates for my back — game changer.', 'Looking for a pilates class buddy.'],
  'Martial arts / boxing': ['Boxing 3x a week, need a sparring partner.', 'Muay Thai beginner.', 'Kickboxing keeps the stress away.'],
  Calisthenics: ['Working towards my first muscle-up.', 'Park bars every evening.', 'Handstand practice partner wanted.'],
  'Home workouts': ['WFH, so home workouts — need a virtual accountability buddy.', 'Bodyweight circuits at home, video calls welcome.', 'Home dumbbells + YouTube workouts.'],
  Climbing: ['Bouldering V3ish, looking for a belay partner.', 'Weekend crag trips when possible.', 'New to climbing and loving it.'],
};
const OPENERS = ['Software engineer by day.', 'Doctor with weird shifts.', 'Teacher, early riser.', 'Designer who needs to get off the laptop.', 'Startup founder, stress-relief seeker.', 'Grad student.', 'Chartered accountant.', 'Marketing person.', 'New to the city.', 'Lawyer, long days.', 'Banker trying to stay fit.', 'Chef with odd hours.', 'Freelancer with a flexible schedule.', 'Architect.', 'Nurse on rotating shifts.', 'Product manager.'];
const CLOSERS = ['Chai after workouts is non-negotiable.', 'Consistency over intensity.', 'Let\'s keep each other accountable!', 'Dog parent 🐶.', 'Foodie who works out to eat more.', 'Will share my playlists.', 'Slow and steady wins.', 'Always up for trying something new.', ''];
const SCHED = [
  { days: ['Mon', 'Wed', 'Fri'] }, { days: ['Tue', 'Thu', 'Sat'] }, { days: ['Sat', 'Sun'] }, { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { days: ['Tue', 'Thu', 'Sat', 'Sun'] }, { days: ['Mon', 'Wed', 'Sat'] }, { days: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'] }, { days: ['Wed', 'Sat', 'Sun'] },
];
const CITY_W = ['Bengaluru', 'Bengaluru', 'Bengaluru', 'Mumbai', 'Mumbai', 'Mumbai', 'Delhi', 'Delhi', 'Gurugram', 'Pune', 'Pune', 'Hyderabad', 'Hyderabad', 'Chennai', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi', 'Chandigarh', 'Lucknow', 'Indore', 'Goa'];
function genSample() {
  const gender = R() < 0.47 ? 'Man' : R() < 0.94 ? 'Woman' : 'Non-binary';
  const name = `${pick(FIRST[gender])} ${pick(LAST)}`;
  const age = R() < 0.75 ? randInt(21, 35) : randInt(18, 45);
  const city = pick(CITY_W);
  const acts = {}; const nActs = randInt(1, 3);
  for (const a of pickN(Object.keys(ACT_VENUE), nActs)) acts[a] = pick([B, B, I, I, I, A]);
  const main = Object.keys(acts)[0];
  const vt = pick(ACT_VENUE[main]);
  const venue = vt === 'Home' ? 'Home' : pick(VENUES[city][vt] || VENUES[city].Park);
  const goals = [...new Set([pick(ACT_GOALS[main]), pick(['Lose fat', 'Build muscle', 'Strength', 'Endurance', 'Flexibility & mobility', 'General fitness', 'Sport performance', 'Stress relief', 'Train for an event'])])].slice(0, randInt(1, 2));
  const days = pick(SCHED).days;
  const times = pickN(['Early morning', 'Early morning', 'Morning', 'Afternoon', 'Evening', 'Evening', 'Night'], randInt(1, 2)).filter((t, i, a) => a.indexOf(t) === i);
  const bio = [pick(OPENERS), pick(ACT_LINE[main]), pick(CLOSERS)].filter(Boolean).join(' ');
  const r = R(); const buddy = r < 0.85 ? 1 : 0; const dating = r < 0.25 ? 0 : 1; // ~15% dating-only, ~25% buddy-only, rest both
  const dg = gender === 'Man' ? (R() < 0.9 ? ['Woman'] : ['Man']) : gender === 'Woman' ? (R() < 0.9 ? ['Man'] : ['Woman', 'Man']) : pick([['Woman', 'Man', 'Non-binary'], ['Non-binary', 'Woman']]);
  const amin = Math.max(18, age - randInt(3, 7)), amax = Math.min(50, age + randInt(3, 9));
  const bl = pick([[], [], [B, I], [I, A], [I]]);
  return [name, age, gender, city, venue, vt, goals, acts, days, times, bio, buddy, dating ? 1 : 0, dating ? dg : [], dating ? amin : 18, dating ? amax : 99, bl];
}
while (S.length < TOTAL_SAMPLES) S.push(genSample());

const sampleEmail = i => `sample${String(i + 1).padStart(3, '0')}@fitmatch.sample`;
function seed() {
  if (db.prepare('SELECT COUNT(*) c FROM users WHERE is_sample=1').get().c >= S.length) return;
  const ins = db.prepare(`INSERT OR IGNORE INTO users(email,pw_hash,name,age,gender,city,venue,venue_type,goals,activities,days,times,bio,buddy_on,dating_on,date_genders,age_min,age_max,buddy_levels,is_sample,onboarded)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,1)`);
  const pw = hash('sample123');
  db.exec('BEGIN');
  S.forEach((s, i) => {
    const [name, age, gender, city, venue, vt, goals, acts, days, times, bio, bud, dat, dg, amin, amax, bl] = s;
    ins.run(sampleEmail(i), pw, name, age, gender, city, venue, vt, JSON.stringify(goals), JSON.stringify(acts),
      JSON.stringify(days), JSON.stringify(times), bio, bud, dat, JSON.stringify(dg), amin, amax, JSON.stringify(bl));
  });
  // Ready-made demo account
  ins.run('demo@fitmatch.in', hash('demo1234'), 'Demo User', 28, 'Man', 'Bengaluru', 'Cubbon Park', 'Park', JSON.stringify(['Endurance', 'Build muscle']),
    JSON.stringify({ Running: 'Intermediate', 'Gym / weights': 'Intermediate' }), JSON.stringify(['Tue', 'Thu', 'Sat', 'Sun']), JSON.stringify(['Early morning', 'Evening']),
    'Demo account — explore freely.', 1, 1, JSON.stringify(['Woman']), 22, 36, JSON.stringify([]));
  db.prepare("UPDATE users SET is_sample=0 WHERE email='demo@fitmatch.in'").run();
  db.exec('COMMIT');
  console.log(`Seeded ${db.prepare('SELECT COUNT(*) c FROM users WHERE is_sample=1').get().c} sample users + demo account`);
}
module.exports = { seed };
if (require.main === module) seed();
