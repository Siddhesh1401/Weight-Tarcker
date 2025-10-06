import { MealEntry, WeightLog, UserSettings } from '../types';

const today = new Date();
const formatDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockMeals: MealEntry[] = [
  {
    id: '1',
    date: formatDate(2),
    mealType: 'breakfast',
    description: 'Oatmeal with fruits and honey',
    hadTea: true,
    timestamp: `${formatDate(2)}T11:00:00`,
  },
  {
    id: '2',
    date: formatDate(2),
    mealType: 'lunch',
    description: 'Grilled chicken with rice and salad',
    timestamp: `${formatDate(2)}T13:30:00`,
  },
  {
    id: '3',
    date: formatDate(2),
    mealType: 'snacks',
    description: 'Apple and almonds',
    hadTea: true,
    timestamp: `${formatDate(2)}T18:00:00`,
  },
  {
    id: '4',
    date: formatDate(2),
    mealType: 'dinner',
    description: 'Vegetable stir fry with tofu',
    timestamp: `${formatDate(2)}T23:00:00`,
  },
  {
    id: '5',
    date: formatDate(1),
    mealType: 'breakfast',
    description: 'Greek yogurt with berries',
    hadTea: true,
    timestamp: `${formatDate(1)}T11:15:00`,
  },
  {
    id: '6',
    date: formatDate(1),
    mealType: 'lunch',
    description: 'Turkey sandwich on whole grain',
    timestamp: `${formatDate(1)}T13:00:00`,
  },
  {
    id: '7',
    date: formatDate(1),
    mealType: 'snacks',
    description: 'Protein bar',
    hadTea: false,
    timestamp: `${formatDate(1)}T18:15:00`,
  },
  {
    id: '8',
    date: formatDate(1),
    mealType: 'dinner',
    description: 'Pizza night!',
    isCheatMeal: true,
    timestamp: `${formatDate(1)}T23:30:00`,
  },
];

export const mockWeights: WeightLog[] = [
  {
    id: 'w1',
    date: formatDate(7),
    weight: 78.5,
    timestamp: `${formatDate(7)}T08:00:00`,
  },
  {
    id: 'w2',
    date: formatDate(6),
    weight: 78.2,
    timestamp: `${formatDate(6)}T08:15:00`,
  },
  {
    id: 'w3',
    date: formatDate(5),
    weight: 78.0,
    timestamp: `${formatDate(5)}T08:00:00`,
  },
  {
    id: 'w4',
    date: formatDate(4),
    weight: 77.8,
    timestamp: `${formatDate(4)}T08:10:00`,
  },
  {
    id: 'w5',
    date: formatDate(3),
    weight: 77.5,
    timestamp: `${formatDate(3)}T08:00:00`,
  },
  {
    id: 'w6',
    date: formatDate(2),
    weight: 77.3,
    timestamp: `${formatDate(2)}T08:05:00`,
  },
  {
    id: 'w7',
    date: formatDate(1),
    weight: 77.0,
    timestamp: `${formatDate(1)}T08:00:00`,
  },
];

export const defaultSettings: UserSettings = {
  goalWeight: 75.0,
  breakfastTime: '11:00 AM',
  lunchTime: '1:00 PM',
  snacksTime: '6:00 PM',
  dinnerTime: '11:00 PM',
  notificationsEnabled: true,
  waterGoal: 8,
  sleepGoal: 8,
};
