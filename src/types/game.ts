/**
 * Indian Life RP - Types & Interfaces
 * Tagline: "Apni Zindagi Khud Banao – Your Life, Your Family, Your Future."
 */

export type LifeStage = 
  | 'childhood'     // Age 0-5
  | 'primary_school'// Age 6-10
  | 'high_school'   // Age 11-17
  | 'college'       // Age 18-21
  | 'career'        // Age 22-30
  | 'family_business' // Age 31-59
  | 'elder';        // Age 60+

export type Rank = 'Beginner' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Champion';

export type CareerType = 
  | 'none'
  | 'army_defence'
  | 'police'
  | 'doctor'
  | 'engineer'
  | 'businessperson'
  | 'teacher'
  | 'farmer'
  | 'mechanic';

export type VehicleType = 'bicycle' | 'scooter' | 'motorcycle' | 'car';

export interface PlayerCustomization {
  name: string;
  gender: 'male' | 'female';
  skinTone: string;
  hairStyle: 'short' | 'classic' | 'curly' | 'ponytail';
  outfitColor: string;
  pantsColor: string;
  outfitStyle: 'kurta' | 'shirt_trousers' | 'casual_tee' | 'police_uniform' | 'army_camo' | 'doctor_coat';
  gameId: string; // Fictional ID like "IND-AS-84920"
  familyOrigin: 'Barua' | 'Sharma' | 'Das' | 'Verma';
}

export interface FamilyMember {
  id: 'father' | 'mother' | 'brother' | 'sister';
  name: string;
  relation: string;
  occupation: string;
  relationship: number; // 0 to 100
  dialogueHistory: string[];
  currentMood: 'Happy' | 'Proud' | 'Caring' | 'Stern' | 'Relaxed';
}

export interface HouseUpgrades {
  tv: boolean;          // Color LED TV
  inverter: boolean;    // Power inverter for village power cuts
  cooler: boolean;      // Air Cooler
  almirah: boolean;     // Godrej Steel Almirah
  familyMotorcycle: boolean;
  puccaRoof: boolean;   // Reinforced Concrete Roof
}

export interface EducationState {
  currentClass: number; // 1 to 12
  isCollegeEnrolled: boolean;
  collegeStream?: 'Arts' | 'Science' | 'Commerce' | 'Engineering' | 'Medical';
  collegeYear: number;  // 1 to 4
  degreesEarned: string[];
  reportCards: {
    examName: string;
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    passed: boolean;
    division: string;
    date: string;
  }[];
  attendancePercentage: number;
}

export interface CareerProgress {
  career: CareerType;
  designation: string;
  salary: number; // monthly in ₹
  academyCompleted: boolean;
  promotions: number;
  dutyPoints: number;
}

export interface BusinessState {
  ownedTypes: ('grocery_store' | 'cyber_cafe' | 'chai_stall' | 'mobile_shop')[];
  shopName: string;
  inventoryValue: number;
  dailyRevenue: number;
  dailyExpenses: number;
  employees: number;
  reputation: number; // 0 - 100
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'story' | 'career' | 'family';
  targetLocation?: string;
  rewardMoney: number;
  rewardXP: number;
  completed: boolean;
}

export interface GameLocation {
  id: string;
  name: string;
  category: 'home' | 'school' | 'college' | 'cyber_cafe' | 'bank' | 'hospital' | 'police' | 'market' | 'tea_garden' | 'station' | 'playground';
  x: number;
  z: number;
  label: string;
  icon: string;
}

export interface GameSaveData {
  version: number;
  savedAt: string;
  player: PlayerCustomization;
  age: number;
  lifeStage: LifeStage;
  xp: number;
  rank: Rank;
  skillPoints: number;
  moneyCash: number;
  moneyBank: number;
  day: number;
  inGameTime: number; // 0 to 1440 minutes in day
  weather: 'clear' | 'rainy';
  ownedVehicles: VehicleType[];
  activeVehicle: VehicleType | null;
  family: Record<string, FamilyMember>;
  houseUpgrades: HouseUpgrades;
  education: EducationState;
  career: CareerProgress;
  business: BusinessState;
  missions: Mission[];
  completedMissionIds: string[];
}
