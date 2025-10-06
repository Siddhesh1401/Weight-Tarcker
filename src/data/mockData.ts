import { MealEntry, WeightLog, WaterLog, SleepLog, UserSettings } from '../types';

const today = new Date();
const formatDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const mockMeals: MealEntry[] = [
  // Day 7 (7 days ago)
  {
    id: '1',
    date: formatDate(7),
    mealType: 'breakfast',
    description: 'Oatmeal with banana and honey',
    hadTea: true,
    timestamp: `${formatDate(7)}T07:30:00`,
  },
  {
    id: '2',
    date: formatDate(7),
    mealType: 'lunch',
    description: 'Grilled chicken salad with quinoa',
    timestamp: `${formatDate(7)}T12:30:00`,
  },
  {
    id: '3',
    date: formatDate(7),
    mealType: 'snacks',
    description: 'Greek yogurt with almonds',
    hadTea: true,
    timestamp: `${formatDate(7)}T15:00:00`,
  },
  {
    id: '4',
    date: formatDate(7),
    mealType: 'dinner',
    description: 'Baked salmon with vegetables',
    timestamp: `${formatDate(7)}T19:00:00`,
  },

  // Day 6
  {
    id: '5',
    date: formatDate(6),
    mealType: 'breakfast',
    description: 'Whole grain toast with avocado',
    hadTea: true,
    timestamp: `${formatDate(6)}T07:45:00`,
  },
  {
    id: '6',
    date: formatDate(6),
    mealType: 'lunch',
    description: 'Turkey wrap with mixed greens',
    timestamp: `${formatDate(6)}T12:15:00`,
  },
  {
    id: '7',
    date: formatDate(6),
    mealType: 'snacks',
    description: 'Apple slices with peanut butter',
    timestamp: `${formatDate(6)}T16:30:00`,
  },
  {
    id: '8',
    date: formatDate(6),
    mealType: 'dinner',
    description: 'Vegetable stir fry with tofu',
    timestamp: `${formatDate(6)}T18:45:00`,
  },

  // Day 5
  {
    id: '9',
    date: formatDate(5),
    mealType: 'breakfast',
    description: 'Smoothie bowl with berries',
    hadTea: false,
    timestamp: `${formatDate(5)}T08:00:00`,
  },
  {
    id: '10',
    date: formatDate(5),
    mealType: 'lunch',
    description: 'Quinoa bowl with chickpeas',
    timestamp: `${formatDate(5)}T12:00:00`,
  },
  {
    id: '11',
    date: formatDate(5),
    mealType: 'snacks',
    description: 'Protein bar and banana',
    timestamp: `${formatDate(5)}T15:30:00`,
  },
  {
    id: '12',
    date: formatDate(5),
    mealType: 'dinner',
    description: 'Grilled steak with sweet potato',
    isCheatMeal: true,
    timestamp: `${formatDate(5)}T19:30:00`,
  },

  // Day 4
  {
    id: '13',
    date: formatDate(4),
    mealType: 'breakfast',
    description: 'Eggs and whole grain toast',
    hadTea: true,
    timestamp: `${formatDate(4)}T07:30:00`,
  },
  {
    id: '14',
    date: formatDate(4),
    mealType: 'lunch',
    description: 'Chicken Caesar salad',
    timestamp: `${formatDate(4)}T12:30:00`,
  },
  {
    id: '15',
    date: formatDate(4),
    mealType: 'snacks',
    description: 'Trail mix and orange',
    timestamp: `${formatDate(4)}T16:00:00`,
  },
  {
    id: '16',
    date: formatDate(4),
    mealType: 'dinner',
    description: 'Pasta with marinara sauce',
    timestamp: `${formatDate(4)}T18:30:00`,
  },

  // Day 3
  {
    id: '17',
    date: formatDate(3),
    mealType: 'breakfast',
    description: 'Greek yogurt parfait',
    hadTea: true,
    timestamp: `${formatDate(3)}T08:15:00`,
  },
  {
    id: '18',
    date: formatDate(3),
    mealType: 'lunch',
    description: 'Tuna salad sandwich',
    timestamp: `${formatDate(3)}T12:45:00`,
  },
  {
    id: '19',
    date: formatDate(3),
    mealType: 'snacks',
    description: 'Dark chocolate and nuts',
    isCheatMeal: true,
    timestamp: `${formatDate(3)}T17:00:00`,
  },
  {
    id: '20',
    date: formatDate(3),
    mealType: 'dinner',
    description: 'Homemade pizza night!',
    isCheatMeal: true,
    timestamp: `${formatDate(3)}T20:00:00`,
  },

  // Day 2
  {
    id: '21',
    date: formatDate(2),
    mealType: 'breakfast',
    description: 'Oatmeal with fruits and honey',
    hadTea: true,
    timestamp: `${formatDate(2)}T08:00:00`,
  },
  {
    id: '22',
    date: formatDate(2),
    mealType: 'lunch',
    description: 'Grilled chicken with rice and salad',
    timestamp: `${formatDate(2)}T12:30:00`,
  },
  {
    id: '23',
    date: formatDate(2),
    mealType: 'snacks',
    description: 'Apple and almonds',
    hadTea: true,
    timestamp: `${formatDate(2)}T15:30:00`,
  },
  {
    id: '24',
    date: formatDate(2),
    mealType: 'dinner',
    description: 'Vegetable stir fry with tofu',
    timestamp: `${formatDate(2)}T18:30:00`,
  },

  // Day 1 (yesterday)
  {
    id: '25',
    date: formatDate(1),
    mealType: 'breakfast',
    description: 'Greek yogurt with berries',
    hadTea: true,
    timestamp: `${formatDate(1)}T08:30:00`,
  },
  {
    id: '26',
    date: formatDate(1),
    mealType: 'lunch',
    description: 'Turkey sandwich on whole grain',
    timestamp: `${formatDate(1)}T12:00:00`,
  },
  {
    id: '27',
    date: formatDate(1),
    mealType: 'snacks',
    description: 'Protein bar',
    hadTea: false,
    timestamp: `${formatDate(1)}T16:15:00`,
  },
  {
    id: '28',
    date: formatDate(1),
    mealType: 'dinner',
    description: 'Pizza night!',
    isCheatMeal: true,
    timestamp: `${formatDate(1)}T19:45:00`,
  },

  // Today
  {
    id: '29',
    date: formatDate(0),
    mealType: 'breakfast',
    description: 'Avocado toast with eggs',
    hadTea: true,
    timestamp: `${formatDate(0)}T08:00:00`,
  },
  {
    id: '30',
    date: formatDate(0),
    mealType: 'lunch',
    description: 'Mediterranean bowl',
    timestamp: `${formatDate(0)}T12:30:00`,
  },
];

export const mockWeights: WeightLog[] = [
  { id: 'w1', date: formatDate(7), weight: 78.5, timestamp: `${formatDate(7)}T08:00:00` },
  { id: 'w2', date: formatDate(6), weight: 78.2, timestamp: `${formatDate(6)}T08:15:00` },
  { id: 'w3', date: formatDate(5), weight: 78.0, timestamp: `${formatDate(5)}T08:00:00` },
  { id: 'w4', date: formatDate(4), weight: 77.8, timestamp: `${formatDate(4)}T08:10:00` },
  { id: 'w5', date: formatDate(3), weight: 77.5, timestamp: `${formatDate(3)}T08:00:00` },
  { id: 'w6', date: formatDate(2), weight: 77.3, timestamp: `${formatDate(2)}T08:05:00` },
  { id: 'w7', date: formatDate(1), weight: 77.0, timestamp: `${formatDate(1)}T08:00:00` },
  { id: 'w8', date: formatDate(0), weight: 76.8, timestamp: `${formatDate(0)}T08:00:00` },
];

export const mockWaterLogs: WaterLog[] = [
  // Day 7
  { id: 'water1', date: formatDate(7), glasses: 2, timestamp: `${formatDate(7)}T09:00:00` },
  { id: 'water2', date: formatDate(7), glasses: 3, timestamp: `${formatDate(7)}T14:00:00` },
  { id: 'water3', date: formatDate(7), glasses: 2, timestamp: `${formatDate(7)}T18:00:00` },

  // Day 6
  { id: 'water4', date: formatDate(6), glasses: 2, timestamp: `${formatDate(6)}T08:30:00` },
  { id: 'water5', date: formatDate(6), glasses: 4, timestamp: `${formatDate(6)}T13:00:00` },
  { id: 'water6', date: formatDate(6), glasses: 2, timestamp: `${formatDate(6)}T17:30:00` },

  // Day 5
  { id: 'water7', date: formatDate(5), glasses: 3, timestamp: `${formatDate(5)}T09:00:00` },
  { id: 'water8', date: formatDate(5), glasses: 3, timestamp: `${formatDate(5)}T15:00:00` },
  { id: 'water9', date: formatDate(5), glasses: 1, timestamp: `${formatDate(5)}T19:00:00` },

  // Day 4
  { id: 'water10', date: formatDate(4), glasses: 2, timestamp: `${formatDate(4)}T08:00:00` },
  { id: 'water11', date: formatDate(4), glasses: 4, timestamp: `${formatDate(4)}T12:00:00` },
  { id: 'water12', date: formatDate(4), glasses: 3, timestamp: `${formatDate(4)}T16:00:00` },

  // Day 3
  { id: 'water13', date: formatDate(3), glasses: 2, timestamp: `${formatDate(3)}T08:30:00` },
  { id: 'water14', date: formatDate(3), glasses: 2, timestamp: `${formatDate(3)}T14:00:00` },
  { id: 'water15', date: formatDate(3), glasses: 3, timestamp: `${formatDate(3)}T18:30:00` },

  // Day 2
  { id: 'water16', date: formatDate(2), glasses: 3, timestamp: `${formatDate(2)}T09:00:00` },
  { id: 'water17', date: formatDate(2), glasses: 3, timestamp: `${formatDate(2)}T13:30:00` },
  { id: 'water18', date: formatDate(2), glasses: 2, timestamp: `${formatDate(2)}T17:00:00` },

  // Day 1
  { id: 'water19', date: formatDate(1), glasses: 2, timestamp: `${formatDate(1)}T08:00:00` },
  { id: 'water20', date: formatDate(1), glasses: 4, timestamp: `${formatDate(1)}T12:30:00` },
  { id: 'water21', date: formatDate(1), glasses: 2, timestamp: `${formatDate(1)}T16:00:00` },

  // Today
  { id: 'water22', date: formatDate(0), glasses: 2, timestamp: `${formatDate(0)}T08:30:00` },
  { id: 'water23', date: formatDate(0), glasses: 3, timestamp: `${formatDate(0)}T13:00:00` },
];

export const mockSleepLogs: SleepLog[] = [
  { id: 'sleep1', date: formatDate(7), hours: 7.5, quality: 'good', timestamp: `${formatDate(7)}T07:00:00` },
  { id: 'sleep2', date: formatDate(6), hours: 8.0, quality: 'excellent', timestamp: `${formatDate(6)}T07:15:00` },
  { id: 'sleep3', date: formatDate(5), hours: 6.5, quality: 'fair', timestamp: `${formatDate(5)}T07:30:00` },
  { id: 'sleep4', date: formatDate(4), hours: 7.0, quality: 'good', timestamp: `${formatDate(4)}T07:00:00` },
  { id: 'sleep5', date: formatDate(3), hours: 8.5, quality: 'excellent', timestamp: `${formatDate(3)}T06:45:00` },
  { id: 'sleep6', date: formatDate(2), hours: 7.0, quality: 'good', timestamp: `${formatDate(2)}T07:30:00` },
  { id: 'sleep7', date: formatDate(1), hours: 6.0, quality: 'poor', timestamp: `${formatDate(1)}T08:00:00` },
  { id: 'sleep8', date: formatDate(0), hours: 7.5, quality: 'good', timestamp: `${formatDate(0)}T07:00:00` },
];

export const defaultSettings: UserSettings = {
  goalWeight: 75.0,
  breakfastTime: '11:00 AM',
  lunchTime: '1:00 PM',
  snacksTime: '6:00 PM',
  dinnerTime: '11:00 PM',
  notificationsEnabled: true,
};
