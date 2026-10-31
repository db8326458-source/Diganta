import { GameLocation, GameSaveData, Mission } from '../types/game';

export const VILLAGE_LOCATIONS: GameLocation[] = [
  { id: 'home', name: 'Middle-Class Home', category: 'home', x: 0, z: -15, label: 'Apna Ghar', icon: 'Home' },
  { id: 'school', name: 'Saraswati Vidya Niketan', category: 'school', x: -45, z: -40, label: 'School & College', icon: 'GraduationCap' },
  { id: 'cyber_cafe', name: 'Maa Tara Cyber Point', category: 'cyber_cafe', x: 25, z: -35, label: 'Cyber Cafe (Online Forms)', icon: 'Monitor' },
  { id: 'bank', name: 'State Bank & ATM Kiosk', category: 'bank', x: 42, z: -10, label: 'Bank & ATM', icon: 'Landmark' },
  { id: 'police', name: 'Village Police Station (Thana)', category: 'police', x: -50, z: 20, label: 'Police Thana', icon: 'Shield' },
  { id: 'hospital', name: 'Civil Primary Health Centre', category: 'hospital', x: 55, z: 25, label: 'Hospital', icon: 'HeartPulse' },
  { id: 'market', name: 'Gramin Daily Bazar & Kirana', category: 'market', x: 0, z: 25, label: 'Market & Chai Stall', icon: 'ShoppingBag' },
  { id: 'tea_garden', name: 'Lush Assam Tea Estate', category: 'tea_garden', x: -65, z: -85, label: 'Tea Garden & Estate', icon: 'Leaf' },
  { id: 'station', name: 'Village Railway Halt', category: 'station', x: 60, z: -75, label: 'Railway Station', icon: 'Train' },
  { id: 'playground', name: 'Cricket Field & Playground', category: 'playground', x: -25, z: 60, label: 'Cricket Ground', icon: 'Trophy' }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1_greet_family',
    title: 'Apne Pariwar Se Baat Karo (Greet Family)',
    description: 'Start your day by touching parents feet or talking to Papa and Mummy at the front veranda.',
    category: 'family',
    targetLocation: 'home',
    rewardMoney: 100,
    rewardXP: 150,
    completed: false
  },
  {
    id: 'm2_attend_school',
    title: 'Attend School & Attempt Class Test',
    description: 'Walk or ride your bicycle to Saraswati High School and complete the daily exam practice.',
    category: 'daily',
    targetLocation: 'school',
    rewardMoney: 200,
    rewardXP: 300,
    completed: false
  },
  {
    id: 'm3_cyber_cafe',
    title: 'Visit Cyber Cafe & Fill Exam Form',
    description: 'Head over to Maa Tara Cyber Point to view online government & career exam notifications.',
    category: 'story',
    targetLocation: 'cyber_cafe',
    rewardMoney: 300,
    rewardXP: 400,
    completed: false
  },
  {
    id: 'm4_atm_visit',
    title: 'Withdraw Money from ATM Kiosk',
    description: 'Visit the 24/7 ATM next to the Bank to check your account balance and deposit savings.',
    category: 'story',
    targetLocation: 'bank',
    rewardMoney: 150,
    rewardXP: 250,
    completed: false
  },
  {
    id: 'm5_buy_vehicle',
    title: 'Own a 100cc Desi Splendor Bike',
    description: 'Save money and acquire your personal motorcycle to travel smoothly across the village and tea estates.',
    category: 'story',
    targetLocation: 'market',
    rewardMoney: 1000,
    rewardXP: 600,
    completed: false
  },
  {
    id: 'm6_join_career',
    title: 'Begin Your Dream Career',
    description: 'Clear written & fitness exams to join Defence, Police, Healthcare, Engineering, or start your own business!',
    category: 'career',
    rewardMoney: 2500,
    rewardXP: 1000,
    completed: false
  },
  {
    id: 'm7_upgrade_home',
    title: 'Upgrade Family House (Ghar Ka Vikas)',
    description: 'Purchase an LED TV, steel almirah, or power inverter for your family home.',
    category: 'family',
    targetLocation: 'home',
    rewardMoney: 1500,
    rewardXP: 800,
    completed: false
  }
];

export const SCHOOL_EXAM_QUESTIONS = [
  {
    subject: 'General Knowledge & Assam',
    question: 'Which river flows through Assam and is renowned as one of the largest in India?',
    options: ['Ganga', 'Brahmaputra', 'Yamuna', 'Godavari'],
    correctIndex: 1,
    explanation: 'The mighty Brahmaputra river flows directly through Assam.'
  },
  {
    subject: 'Mathematics',
    question: 'If a Kirana shopkeeper buys 10 kg of Assam tea at ₹200/kg and sells it for ₹250/kg, what is the profit?',
    options: ['₹300', '₹400', '₹500', '₹600'],
    correctIndex: 2,
    explanation: 'Profit = (250 - 200) * 10 = ₹500.'
  },
  {
    subject: 'Science',
    question: 'What is the main chemical component responsible for plant photosynthesis in green tea leaves?',
    options: ['Chlorophyll', 'Hemoglobin', 'Melanin', 'Keratin'],
    correctIndex: 0,
    explanation: 'Chlorophyll absorbs sunlight to drive photosynthesis.'
  },
  {
    subject: 'English & Communication',
    question: 'Choose the correct formal salutation when writing an application to the District Magistrate:',
    options: ['Hey buddy', 'Respected Sir/Madam', 'What is up', 'Cheers'],
    correctIndex: 1,
    explanation: 'Respected Sir/Madam is standard Indian formal correspondence.'
  },
  {
    subject: 'Civics & Indian Constitution',
    question: 'At what minimum age is an Indian citizen eligible to vote in general elections?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctIndex: 1,
    explanation: 'Under Article 326, voting age in India is 18 years.'
  },
  {
    subject: 'General Fitness & Reasoning',
    question: 'To maintain peak cardiovascular stamina for police/army physical test, what is recommended?',
    options: ['Daily morning jogging & hydration', 'Staying awake all night', 'Eating only oily pakoras', 'Skipping meals'],
    correctIndex: 0,
    explanation: 'Consistent aerobic running and hydration builds physical endurance.'
  }
];

export const CAREER_TIERS = {
  army_defence: [
    { title: 'Agniveer / GD Recruit', salary: 30000, reqXP: 300, minAge: 18 },
    { title: 'Naik / Sergeant', salary: 42000, reqXP: 800, minAge: 20 },
    { title: 'Subedar / JCO', salary: 58000, reqXP: 1800, minAge: 24 },
    { title: 'Commissioned Captain', salary: 85000, reqXP: 3500, minAge: 26 }
  ],
  police: [
    { title: 'Police Constable', salary: 28000, reqXP: 250, minAge: 18 },
    { title: 'Assistant Sub-Inspector (ASI)', salary: 38000, reqXP: 750, minAge: 21 },
    { title: 'Sub-Inspector (SI)', salary: 52000, reqXP: 1600, minAge: 23 },
    { title: 'Inspector / Thana In-Charge', salary: 72000, reqXP: 3000, minAge: 27 }
  ],
  doctor: [
    { title: 'Medical Intern / MBBS Resident', salary: 35000, reqXP: 500, minAge: 22 },
    { title: 'Medical Officer (PHC)', salary: 65000, reqXP: 1500, minAge: 24 },
    { title: 'Specialist Physician', salary: 95000, reqXP: 3200, minAge: 28 },
    { title: 'Chief Medical Superintendent', salary: 140000, reqXP: 5500, minAge: 32 }
  ],
  engineer: [
    { title: 'Junior Assistant Engineer', salary: 32000, reqXP: 400, minAge: 21 },
    { title: 'Systems & Civil Engineer', salary: 55000, reqXP: 1200, minAge: 23 },
    { title: 'Senior Project Manager', salary: 88000, reqXP: 2800, minAge: 27 },
    { title: 'Chief Technical Officer', salary: 135000, reqXP: 5000, minAge: 31 }
  ],
  businessperson: [
    { title: 'Tea Stall & Kirana Owner', salary: 25000, reqXP: 200, minAge: 18 },
    { title: 'Cyber Cafe & Service Centre Owner', salary: 48000, reqXP: 700, minAge: 20 },
    { title: 'Commercial Retail Enterprise', salary: 90000, reqXP: 2000, minAge: 24 },
    { title: 'Regional Business Tycoon', salary: 180000, reqXP: 4500, minAge: 29 }
  ],
  teacher: [
    { title: 'Primary School Teacher', salary: 26000, reqXP: 250, minAge: 20 },
    { title: 'High School Graduate Teacher', salary: 40000, reqXP: 800, minAge: 22 },
    { title: 'Senior PGT Lecturer', salary: 56000, reqXP: 1800, minAge: 25 },
    { title: 'School Principal', salary: 82000, reqXP: 3600, minAge: 30 }
  ]
};

export const INITIAL_SAVE_DATA: GameSaveData = {
  version: 1,
  savedAt: new Date().toISOString(),
  player: {
    name: 'Rahul',
    gender: 'male',
    skinTone: '#c68642',
    hairStyle: 'classic',
    outfitColor: '#1e3a8a', // Deep Blue Kurta/Shirt
    pantsColor: '#f8fafc',  // White Pajama/Trousers
    outfitStyle: 'kurta',
    gameId: 'IND-AS-84920',
    familyOrigin: 'Barua'
  },
  age: 18,
  lifeStage: 'college',
  xp: 120,
  rank: 'Beginner',
  skillPoints: 5,
  moneyCash: 2500,
  moneyBank: 12000,
  day: 1,
  inGameTime: 480, // 8:00 AM
  weather: 'clear',
  ownedVehicles: ['bicycle'],
  activeVehicle: null,
  family: {
    father: {
      id: 'father',
      name: 'Ramesh Barua',
      relation: 'Papa (Father)',
      occupation: 'Government Revenue Office Clerk',
      relationship: 85,
      dialogueHistory: [
        'Beta, always remember: honesty and hard work are a middle-class family’s biggest assets.',
        'Did you check the Cyber Cafe today? Many public exam and employment forms were released.'
      ],
      currentMood: 'Proud'
    },
    mother: {
      id: 'mother',
      name: 'Sunita Barua',
      relation: 'Mummy (Mother)',
      occupation: 'Homemaker & Handloom Weaver',
      relationship: 95,
      dialogueHistory: [
        'Have warm tea with pitha! Do not stay empty stomach before studying.',
        'May god bless you with success in whatever career path you choose.'
      ],
      currentMood: 'Caring'
    },
    brother: {
      id: 'brother',
      name: 'Aakash Barua',
      relation: 'Chhota Bhai (Brother)',
      occupation: 'High School Student (Class 10)',
      relationship: 78,
      dialogueHistory: [
        'Bhaiya, will you take me on your bicycle to the tea garden river bridge today?',
        'Help me with mathematics problem 4, bhaiya!'
      ],
      currentMood: 'Happy'
    },
    sister: {
      id: 'sister',
      name: 'Priya Barua',
      relation: 'Behen (Sister)',
      occupation: 'College Arts Student',
      relationship: 82,
      dialogueHistory: [
        'Bhaiya, let us save money together so we can buy an inverter for Mummy during summer load-shedding.',
        'I am preparing my resume at the Cyber Cafe too.'
      ],
      currentMood: 'Relaxed'
    }
  },
  houseUpgrades: {
    tv: false,
    inverter: false,
    cooler: false,
    almirah: true,
    familyMotorcycle: false,
    puccaRoof: false
  },
  education: {
    currentClass: 12,
    isCollegeEnrolled: true,
    collegeStream: 'Science',
    collegeYear: 1,
    degreesEarned: ['Higher Secondary School Certificate (Class 12)'],
    reportCards: [
      {
        examName: 'Class 10 Matriculation Board',
        totalMarks: 512,
        maxMarks: 600,
        percentage: 85.3,
        passed: true,
        division: '1st Division with Star',
        date: 'Day 0'
      }
    ],
    attendancePercentage: 92
  },
  career: {
    career: 'none',
    designation: 'Student / Aspirant',
    salary: 0,
    academyCompleted: false,
    promotions: 0,
    dutyPoints: 0
  },
  business: {
    ownedTypes: [],
    shopName: 'Barua Enterprises',
    inventoryValue: 0,
    dailyRevenue: 0,
    dailyExpenses: 0,
    employees: 0,
    reputation: 50
  },
  missions: INITIAL_MISSIONS,
  completedMissionIds: []
};
