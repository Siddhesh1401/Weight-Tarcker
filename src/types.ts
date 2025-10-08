export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'other' | 'weight' | 'water' | 'sleep';

export interface MealEntry {
  id: string;
  date: string;
  mealType: MealType;
  description: string;
  hadTea?: boolean;
  isCheatMeal?: boolean;
  timestamp: string;
  time?: string; // HH:MM format
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  timestamp: string;
  time?: string; // HH:MM format
}

export interface WaterLog {
  id: string;
  date: string;
  glasses: number;
  timestamp: string;
  time?: string; // HH:MM format
}

export interface SleepLog {
  id: string;
  date: string;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  timestamp: string;
  time?: string; // HH:MM format - wake up time
  bedTime?: string; // HH:MM format - when went to bed
  notes?: string; // Optional notes about sleep factors
}

export interface MealTemplate {
  id: string;
  name: string;
  mealType: Exclude<MealType, 'weight' | 'water' | 'sleep'>;
  description: string;
  isFavorite: boolean;
  useCount: number;
  order: number;
}

export interface DayData {
  date: string;
  meals: MealEntry[];
  weight?: WeightLog;
  water?: WaterLog;
  sleep?: SleepLog;
}

export interface UserSettings {
  goalWeight: number;
  breakfastTime: string;
  lunchTime: string;
  snacksTime: string;
  dinnerTime: string;
  notificationsEnabled: boolean;
  height?: number; // in cm
  currentWeight?: number; // in kg
  waterGoal?: number;
  sleepGoal?: number;
  darkMode?: boolean;
  age?: number;
  gender?: 'male' | 'female';
  bodyFatMethod?: 'navy' | 'jackson-pollock' | 'boer' | 'hume';
  bmi?: number;
  bodyFat?: number;
  emailPreferences?: EmailPreferences;
  emailSchedule?: {
    daily: string;
    weekly: string;
    monthly: string;
  };
  cronApiKey?: string;
}

export interface EmailPreferences {
  enabled: boolean;
  email: string;
  daily_summary: boolean;
  weekly_summary: boolean;
  monthly_summary: boolean;
  custom_frequency?: 'daily' | 'weekly' | 'monthly';
}
