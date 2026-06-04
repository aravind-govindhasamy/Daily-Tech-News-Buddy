import { 
  CommunityPost, 
  EventItem, 
  NGOItem, 
  RiderRoute, 
  LeaderboardUser, 
  MarvelCharacter, 
  TriviaQuestion 
} from '../types/community';

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'm1',
    category: 'marvel',
    subcategory: 'Comics Recommendations',
    authorName: 'Tony_Stark_Saves',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80',
    authorReputation: 'Expert Trivia Master',
    content: '🚨 MUST READ: If you enjoyed Avengers: Secret Wars in comics, you need to read Jonathan Hickman\'s 2015 run right now! The setup with the incursions of Earth-1610 and Earth-616 is peak Marvel storytelling. The artwork by Esad Ribic is breathtaking. What are your thoughts on his Doom-ruled battleworld?',
    likes: 342,
    commentsCount: 54,
    shares: 12,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&fit=crop&q=80',
    createdAt: '2026-05-31T18:30:00Z'
  },
  {
    id: 'm2',
    category: 'marvel',
    subcategory: 'Fan Theories',
    authorName: 'Mutant_Confidential',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop&q=80',
    authorReputation: 'Lore Seeker',
    content: 'Unpopular opinion: Magneto\'s island nation of Krakoa was actual perfection until the Orchis invasion. The resurrection protocols were a brilliant workaround for classic plot armor, but the societal dynamics were even better. How do you think Marvel will bring back Mutant Sovereignty in the upcoming films?',
    likes: 198,
    commentsCount: 33,
    shares: 8,
    createdAt: '2026-05-31T14:15:00Z'
  },
  {
    id: 'r1',
    category: 'riders',
    subcategory: 'Route Sharing',
    authorName: 'Cruisin_Coyote',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80',
    authorReputation: 'Road Captain',
    content: 'Just completed the "Twisty Crest Ascent." 120km of absolute bliss, sweeping hairpins, and beautiful elevation! Check out my mapped path under the Bike Rides tab. The final view from the Ridge Summit is unmatched. Join us this Saturday!',
    likes: 154,
    commentsCount: 22,
    shares: 19,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&fit=crop&q=80',
    createdAt: '2026-05-31T09:45:00Z'
  },
  {
    id: 'r2',
    category: 'riders',
    subcategory: 'Motorcycle Reviews',
    authorName: 'Apex_Vanguard',
    authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&fit=crop&q=80',
    authorReputation: 'Gear Head',
    content: 'Honest review of the 2026 Adventure Touring 900: After 5,000 miles, the suspension holds up stellar on dirt. Low-end torque is perfect for mud escapes. Only drawback is the stock seat layout which causes minor strain during long 6-hour sessions. Total rating: 9.1/10.',
    likes: 89,
    commentsCount: 14,
    shares: 4,
    createdAt: '2026-05-30T16:20:00Z'
  },
  {
    id: 't1',
    category: 'travel',
    subcategory: 'Hidden Gems',
    authorName: 'Vagabond_Muse',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80',
    authorReputation: 'Pathfinder',
    content: '🌿 Found this hidden emerald lagoon tucked inside the old Whispering Gorge park. NO crowds at all! The water has a striking deep teal look due to mineral deposits. It is about a 40-minute hike from the West Gate parking. Pin added to Travel Map!',
    likes: 512,
    commentsCount: 91,
    shares: 88,
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&fit=crop&q=80',
    createdAt: '2026-05-31T07:10:00Z'
  },
  {
    id: 't2',
    category: 'travel',
    subcategory: 'One-Day Trips',
    authorName: 'Weekender_Escape',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80',
    authorReputation: 'Local Guide',
    content: 'Ultimate 1-Day Trip: Historic Coastal Hamlet! Start with hot sourdough pastries at Pier Bakery, visit the old lighthouse ruins (free entry), and rent a sea kayak for sunset exploration. Perfect 12-hour getaway planner is live on the guide deck.',
    likes: 275,
    commentsCount: 41,
    shares: 34,
    createdAt: '2026-05-30T11:00:00Z'
  },
  {
    id: 'n1',
    category: 'ngo',
    subcategory: 'Environmental Initiatives',
    authorName: 'Eco_Steward',
    authorAvatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&fit=crop&q=80',
    authorReputation: 'Golden Heart',
    content: 'We just finished our 12th Tree Plantation drive of the quarter! Planted 450 native saplings in the urban buffer zone. Shoutout to the 30 volunteers who joined. Check out our active NGO offices map to sign up for next Saturday\'s cleanup!',
    likes: 418,
    commentsCount: 62,
    shares: 45,
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&fit=crop&q=80',
    createdAt: '2026-05-31T11:25:00Z'
  },
  {
    id: 'v1',
    category: 'volunteering',
    subcategory: 'Blood Donation Drives',
    authorName: 'HealthShield',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&fit=crop&q=80',
    authorReputation: 'Life Saver',
    content: '🚑 CRITICAL DEMAND: Local pediatric ward has a high shortage of O-negative and B-positive red blood cell units. We are hosting a Skills-based volunteer drive at Central Community Center all afternoon. RSVP to claim 150 Community Points & earn your Blood Donor Medal.',
    likes: 620,
    commentsCount: 110,
    shares: 240,
    createdAt: '2026-05-31T06:05:00Z'
  },
  {
    id: 'l1',
    category: 'local',
    subcategory: 'Photography Clubs',
    authorName: 'Shutter_Vibe',
    authorAvatar: 'https://images.unsplash.com/photo-1534751516642-a131ffd473fd?w=100&fit=crop&q=80',
    authorReputation: 'Visual Creator',
    content: 'Selected submissions from our Sunday "Golden Hour Shadows" photowalk! The lighting was perfect along the retro warehouse district. Next meetup is Startup Showcase. If you are into camera tech or visual art, join the circle!',
    likes: 213,
    commentsCount: 18,
    shares: 11,
    imageUrl: 'https://images.unsplash.com/photo-1452421820245-172192da2b6a?w=800&fit=crop&q=80',
    createdAt: '2026-05-31T15:40:00Z'
  },
  {
    id: 'reel_1',
    category: 'riders',
    subcategory: 'Reels & Shorts',
    authorName: 'Rev_Rebel',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop&q=80',
    authorReputation: 'Asphalt Junkie',
    content: 'Chasing sunsets on the Mountain Road! The 2026 exhaust sound is pure music. 🏍️💨 #motorcycles #sunset #biker #reels',
    likes: 1250,
    commentsCount: 154,
    shares: 89,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&fit=crop&q=80',
    reelsUrl: 'https://assets.mixkit.co/videos/preview/mixkit-motorcyclist-riding-along-the-highway-at-sunset-10332-large.mp4',
    createdAt: '2026-05-31T20:10:00Z'
  },
  {
    id: 'reel_2',
    category: 'travel',
    subcategory: 'Reels & Shorts',
    authorName: 'GlobeTracker',
    authorAvatar: 'https://images.unsplash.com/photo-1534751516642-a131ffd473fd?w=100&fit=crop&q=80',
    authorReputation: 'World Hiker',
    content: '3 Hidden Waterfalls in Maui you won\'t find on the commercial tourism buses! Saving the coordinates in my Travel Guide. 🌴💧 #wanderlust #shorts #nature',
    likes: 3105,
    commentsCount: 220,
    shares: 412,
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&fit=crop&q=80',
    reelsUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-waterfall-flowing-deep-into-the-lush-forest-45091-large.mp4',
    createdAt: '2026-05-31T21:40:00Z'
  }
];

export const EVENTS: EventItem[] = [
  {
    id: 'ev1',
    category: 'riders',
    title: 'Weekend Breakfast Ride: Twisty Crest Route',
    description: 'We are meeting at the East highway junction, cruising through the Twisty Crest loop, and ending at Joe\'s Motor Diner for hot pancakes. Glove-friendly speed route map provided. All skill levels welcome!',
    date: '2026-06-06',
    time: '06:30 AM',
    location: 'Highway East Gate Junction',
    lat: 38,
    lng: 42,
    attendeeCount: 48,
    userRsvp: false,
    isCheckedIn: false,
    organizer: 'Apex Riding Alliance',
    rewardPoints: 100,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&fit=crop&q=80'
  },
  {
    id: 'ev2',
    category: 'volunteering',
    title: 'Disaster Relief Training & Supply Packing',
    description: 'Special skills training session focusing on fire escape, triage packing, and community aid dispatch. Earn your First Responder Badge and verify volunteer hours.',
    date: '2026-06-07',
    time: '10:00 AM',
    location: 'Westside Logistics Warehouses',
    lat: 65,
    lng: 25,
    attendeeCount: 124,
    userRsvp: false,
    isCheckedIn: false,
    organizer: 'RedShield Emergency Corps',
    rewardPoints: 150,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&fit=crop&q=80'
  },
  {
    id: 'ev3',
    category: 'ngo',
    title: 'Paws-In-Need Shelter Animal Welfare Day',
    description: 'Help brush, feed, walk, and capture clean high-contrast social photos of adoptable shelter dogs and cats. Social boost matching program is active!',
    date: '2026-06-08',
    time: '11:00 AM',
    location: 'Meadowlands Animal Shelter',
    lat: 48,
    lng: 71,
    attendeeCount: 35,
    userRsvp: false,
    isCheckedIn: false,
    organizer: 'NGO Paws Foundation',
    rewardPoints: 120,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1484130331485-d61bb418f10a?w=400&fit=crop&q=80'
  },
  {
    id: 'ev4',
    category: 'local',
    title: 'Photography Walk: Cyber Neon Nightscape',
    description: 'Gather at the downtown plaza. We\'ll shoot rain reflections, glowing signage, and industrial architectural shadows. Tripods recommended.',
    date: '2026-06-10',
    time: '08:30 PM',
    location: 'Metropolis Center Plaza',
    lat: 52,
    lng: 50,
    attendeeCount: 19,
    userRsvp: false,
    isCheckedIn: false,
    organizer: 'ShutterVibe Club',
    rewardPoints: 80,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1452421820245-172192da2b6a?w=400&fit=crop&q=80'
  },
  {
    id: 'ev5',
    category: 'travel',
    title: 'Day Trip Hike to Hidden Teak Gorge',
    description: 'Guided trek to the deep limestone gorges, swimming holes, and historical caves of Teak National Park. Includes packed organic lunch!',
    date: '2026-06-13',
    time: '07:00 AM',
    location: 'Teak Gorge Nature Park Office',
    lat: 22,
    lng: 85,
    attendeeCount: 22,
    userRsvp: false,
    isCheckedIn: false,
    organizer: 'Wilderness Rangers Association',
    rewardPoints: 110,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&fit=crop&q=80'
  }
];

export const NGOs: NGOItem[] = [
  {
    id: 'n_ngo_1',
    name: 'Eco-Earth Solutions Network',
    focus: 'Environmental Protection & Urban Foresting',
    description: 'Dedicated to planting native trees, clean river restoration, and educating schools on compost systems in the metropolitan region.',
    officeLocation: 'Suite 204, Green Hub Center',
    logo: '🌱',
    donationGoal: 15000,
    donationRaised: 11240,
    volunteersNeeded: 25,
    lat: 33,
    lng: 35
  },
  {
    id: 'n_ngo_2',
    name: 'Paws & Whiskers Sanctuary',
    focus: 'Animal Rescue, Medical Aid, & Pet Adoption',
    description: 'A rescue shelter holding up a no-kill policy. Provides high-quality clinical aid, vaccination, sterile campaigns, and animal fostering.',
    officeLocation: '19 Shelter Road, Meadowlands',
    logo: '🐶',
    donationGoal: 8500,
    donationRaised: 4320,
    volunteersNeeded: 12,
    lat: 48,
    lng: 71
  },
  {
    id: 'n_ngo_3',
    name: 'Care & Nourish Trust',
    focus: 'Homeless Welfare & Crisis Response',
    description: 'Serving hot organic meals, providing safe overnight shelter packages, and offering professional job skill opportunities directly to local families.',
    officeLocation: 'Community Wing A, Central Hall',
    logo: '🤝',
    donationGoal: 20000,
    donationRaised: 18950,
    volunteersNeeded: 40,
    lat: 61,
    lng: 15
  },
  {
    id: 'n_ngo_4',
    name: 'EduShield Global Initiative',
    focus: 'Education Support for Underprivileged Kids',
    description: 'Distributes laptops, funds after-school study bootcamps, and pairs kids with master technical mentors in coding, arts, and science.',
    officeLocation: 'Room 501, Literacy Center',
    logo: '📚',
    donationGoal: 10000,
    donationRaised: 6200,
    volunteersNeeded: 18,
    lat: 15,
    lng: 58
  }
];

export const ROUTES: RiderRoute[] = [
  {
    id: 'route_1',
    routeName: 'Twisty Crest Peak Loop',
    difficulty: 'Challenging',
    lengthKm: 120,
    elevationM: 1450,
    startPoint: 'City East Junction',
    endPoint: 'Meadowlands Lookout Point',
    waypoints: [
      { x: 30, y: 55, label: 'Start: Gate J1' },
      { x: 45, y: 40, label: 'Way 1: Pine S-Bends' },
      { x: 65, y: 35, label: 'Way 2: Summit Ridge Rest' },
      { x: 80, y: 50, label: 'End: Lookout Diner' }
    ]
  },
  {
    id: 'route_2',
    routeName: 'The Sizzling Coastal Ribbon',
    difficulty: 'Easy',
    lengthKm: 75,
    elevationM: 320,
    startPoint: 'West Lighthouse Turnoff',
    endPoint: 'Blue Bay Sands',
    waypoints: [
      { x: 10, y: 80, label: 'Start: Lighthouse' },
      { x: 25, y: 72, label: 'Way 1: Seagull Cliffs' },
      { x: 40, y: 75, label: 'Way 2: Fisherman Dock' },
      { x: 60, y: 88, label: 'End: Blue Bay Sands' }
    ]
  },
  {
    id: 'route_3',
    routeName: 'The Red Rock Canyon Drag',
    difficulty: 'Expert',
    lengthKm: 185,
    elevationM: 1800,
    startPoint: 'Desert Edge Station',
    endPoint: 'Dusty Plateau Post',
    waypoints: [
      { x: 90, y: 20, label: 'Start: Desert Fuel' },
      { x: 75, y: 15, label: 'Way 1: Cobra hairpin' },
      { x: 50, y: 10, label: 'Way 2: Deadman Chasm' },
      { x: 20, y: 30, label: 'End: Dusty Outpost' }
    ]
  }
];

export const TOP_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Captain_America_AOP', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80', points: 4120, volunteerHours: 56, reputation: 'Legendary Guardian', badges: ['Blood Hero', '40h Tracker', 'Avenger Trivia'] },
  { rank: 2, name: 'Adventure_Addict', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80', points: 3840, volunteerHours: 32, reputation: 'Grand Explorer', badges: ['Ride Captain', 'Lagoon Finder', 'Pioneer'] },
  { rank: 3, name: 'Eco_Tree_Guardian', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&fit=crop&q=80', points: 2950, volunteerHours: 42, reputation: 'Elite Caretaker', badges: ['Tree Planter', 'Rescue Support'] },
  { rank: 4, name: 'Marvel_Geek_99', avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=100&fit=crop&q=80', points: 2600, volunteerHours: 5, reputation: 'Worthy Trivia Shield', badges: ['Spidey Master', 'Comics Critic'] },
  { rank: 5, name: 'Revving_Medic', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80', points: 2150, volunteerHours: 24, reputation: 'Community Pillar', badges: ['First Responder', 'Route Planner'] }
];

export const MARVEL_CHARACTERS: MarvelCharacter[] = [
  {
    name: 'Spider-Man',
    alias: 'Peter Parker',
    description: 'Bitten by a radioactive spider, high-schooler Peter Parker gained proportional spider abilities. Gifted with super strength, incredible wall-clinging reflexes, and a proactive Spider-Sense, he protects New York with homemade web shooters.',
    imageUrl: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=400&fit=crop&q=80',
    powers: ['Super Strength', 'Wall Crawling', 'Spatial Spider Sense', 'Genius Chemistry'],
    stats: { strength: 4, intelligence: 4, speed: 4, durability: 3, energy: 1, combat: 4 }
  },
  {
    name: 'Iron Man',
    alias: 'Tony Stark',
    description: 'Genius billionaire Tony Stark built an advanced armored exo-suit from scrap metal during captive detention. He uses his technological creations, artificial intelligences, and continuous rocket infrastructure to defend world order as a leading Avenger.',
    imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?w=400&fit=crop&q=80',
    powers: ['High Flight Suit', 'Repulsor Rays', 'Tactical AI Integration', 'Billionaire Capital'],
    stats: { strength: 6, intelligence: 6, speed: 5, durability: 6, energy: 6, combat: 3 }
  },
  {
    name: 'Wolverine',
    alias: 'Logan / Weapon X',
    description: 'A mutant gifted with enhanced animal senses, continuous physical cellular regeneration, and three retractable bone claws per arm. His entire skeleton was forcefully laced with the indestructible fictional metal Adamantium.',
    imageUrl: 'https://images.unsplash.com/photo-1608889174653-817c0cd922bc?w=400&fit=crop&q=80',
    powers: ['Adamantium Claws', 'Regenerative Healing', 'Feral Tracking Senses', 'Century Combat Experience'],
    stats: { strength: 2, intelligence: 2, speed: 2, durability: 4, energy: 1, combat: 7 }
  },
  {
    name: 'Scarlet Witch',
    alias: 'Wanda Maximoff',
    description: 'Possesses the terrifying capacity to manipulate probability fields and harness volatile Chaos Magic to alter fabric and timeline reality. Wanda is one of the most powerful dimensional beings in the Marvel Pantheon.',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&fit=crop&q=80',
    powers: ['Chaos Magic', 'Probability Manipulation', 'Mass Reality Warping', 'Psychic Shield'],
    stats: { strength: 1, intelligence: 3, speed: 2, durability: 2, energy: 6, combat: 3 }
  }
];

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: 'In the Marvel Comics universe, what is the composition of Captain America\'s unyielding spherical shield?',
    options: ['Pure Adamantium', 'Proto-Adamantium and Vibranium alloy', 'Solid Carbon-Nanotube Uru', 'Mithril Titanium Composite'],
    correctAnswer: 1,
    explanation: 'Captain America\'s comic shield is a unique, unrepeatable accidental combination of Vibranium, an iron alloy (sometimes referred to as Proto-Adamantium), and an unknown catalyst.'
  },
  {
    question: 'Which vintage issue marks the iconic first appearance of Wolverine in Marvel Comics history?',
    options: ['The Incredible Hulk #181', 'Chamber of Darkness #1', 'Giant-Size X-Men #1', 'X-Men #1'],
    correctAnswer: 0,
    explanation: 'While Wolverine made a minor cameo on the final page of The Incredible Hulk #180, his first full operational appearance and combat is Hulk #181 in October 1974.'
  },
  {
    question: 'Which cosmic entity is the true, sentient manifestation of a universe\'s cosmic life force within Marvel?',
    options: ['The One-Above-All', 'Galactus', 'The Phoenix Force', 'The Living Tribunal'],
    correctAnswer: 2,
    explanation: 'The Phoenix Force is an immortal, indestructible prime child of the universe representing the spark of life itself, creation, and passion.'
  },
  {
    question: 'Which fictional secret organization is notorious for their bright yellow hazmat suits and the creation of M.O.D.O.K.?',
    options: ['Hydra', 'A.I.M. (Advanced Idea Mechanics)', 'The Hand', 'Roxxon Energy Corporation'],
    correctAnswer: 1,
    explanation: 'Advanced Idea Mechanics (A.I.M.) is a global ring of rogue weapons-maker scientists responsible for building Cosmic Cubes and the mutated computing mastermind M.O.D.O.K.'
  }
];
