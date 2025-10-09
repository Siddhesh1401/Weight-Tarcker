import Log from '../models/Log.js';
import User from '../models/User.js';

class SummaryService {

  // Generate daily summary data
  async generateDailySummary(userId, date) {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      // Get all logs for the day
      const dayLogs = await Log.find({
        user_id: userId,
        date: date
      });

      console.log(`🔍 Querying logs for user ${userId} on date ${date}`);
      console.log(`   - Found ${dayLogs.length} logs for this date`);

      // Filter and organize data
      const meals = dayLogs.filter(log =>
        ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(log.meal_type)
      );

      // Debug: Log what we found
      console.log(`📊 Summary for ${userId} on ${date}:`);
      console.log(`   - Total day logs: ${dayLogs.length}`);
      console.log(`   - Filtered meals: ${meals.length}`);
      console.log(`   - Day logs by type:`, dayLogs.reduce((acc, log) => {
        acc[log.meal_type] = (acc[log.meal_type] || 0) + 1;
        return acc;
      }, {}));

      const weight = dayLogs.find(log => log.meal_type === 'weight' && log.weight);
      const water = dayLogs.find(log => log.meal_type === 'water' && log.water_glasses);
      const sleep = dayLogs.find(log => log.meal_type === 'sleep' && log.sleep_hours);

      // Generate achievements
      const achievements = [];
      if (meals.length >= 3) achievements.push('🥗 Completed 3+ meals');
      if (water && water.water_glasses >= 8) achievements.push('💧 Excellent hydration');
      if (sleep && sleep.sleep_hours >= 7) achievements.push('😴 Good night\'s sleep');
      if (meals.some(meal => !meal.cheat_meal)) achievements.push('🎯 Healthy eating day');

      return {
        date,
        meals,
        weight,
        water,
        sleep,
        achievements,
        totalMeals: meals.length,
        cheatMeals: meals.filter(meal => meal.cheat_meal).length
      };
    } catch (error) {
      console.error('Error generating daily summary:', error);
      throw error;
    }
  }

  // Generate weekly summary data
  async generateWeeklySummary(userId, weekStart) {
    try {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      // Get all logs for the week
      const weekLogs = await Log.find({
        user_id: userId,
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0]
        }
      });

      // Aggregate data
      const meals = weekLogs.filter(log =>
        ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(log.meal_type)
      );

      const weights = weekLogs.filter(log => log.meal_type === 'weight' && log.weight);
      const waterLogs = weekLogs.filter(log => log.meal_type === 'water' && log.water_glasses);
      const sleepLogs = weekLogs.filter(log => log.meal_type === 'sleep' && log.sleep_hours);

      // Calculate averages and totals
      const avgWeight = weights.length > 0 ? {
        current: (weights.reduce((sum, w) => sum + w.weight, 0) / weights.length).toFixed(1),
        start: Math.min(...weights.map(w => w.weight)),
        end: Math.max(...weights.map(w => w.weight)),
        change: weights.length > 1 ? (Math.max(...weights.map(w => w.weight)) - Math.min(...weights.map(w => w.weight))).toFixed(1) : 0
      } : null;

      const totalWater = waterLogs.reduce((sum, w) => sum + w.water_glasses, 0);
      const avgSleep = sleepLogs.length > 0 ?
        (sleepLogs.reduce((sum, s) => sum + s.sleep_hours, 0) / sleepLogs.length).toFixed(1) : 0;

      // Meal type breakdown
      const mealsByType = meals.reduce((acc, meal) => {
        acc[meal.meal_type] = (acc[meal.meal_type] || 0) + 1;
        return acc;
      }, {});

      // Generate insights
      const trends = [];
      if (meals.length >= 21) trends.push('Great consistency with meal logging this week!');
      if (totalWater >= 56) trends.push('Excellent hydration habits this week!');
      if (avgSleep >= 7) trends.push('You\'re getting quality sleep consistently!');
      if (meals.filter(meal => meal.cheat_meal).length <= 2) trends.push('Disciplined eating with minimal cheat meals!');

      return {
        weekStart: startDate.toISOString().split('T')[0],
        weekEnd: endDate.toISOString().split('T')[0],
        meals: {
          total: meals.length,
          byType: mealsByType
        },
        avgWeight,
        totalWater,
        avgSleep,
        trends,
        totalDays: 7,
        consistencyScore: Math.round((meals.length / 7) * 100) // Percentage of days with meals logged
      };
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      throw error;
    }
  }

  // Generate monthly summary data
  async generateMonthlySummary(userId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      // Get all logs for the month
      const monthLogs = await Log.find({
        user_id: userId,
        date: {
          $gte: startDate.toISOString().split('T')[0],
          $lte: endDate.toISOString().split('T')[0]
        }
      });

      // Aggregate data
      const meals = monthLogs.filter(log =>
        ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(log.meal_type)
      );

      const weights = monthLogs.filter(log => log.meal_type === 'weight' && log.weight);
      const waterLogs = monthLogs.filter(log => log.meal_type === 'water' && log.water_glasses);
      const sleepLogs = monthLogs.filter(log => log.meal_type === 'sleep' && log.sleep_hours);

      // Calculate statistics
      const totalMeals = meals.length;
      const avgWater = waterLogs.length > 0 ?
        (waterLogs.reduce((sum, w) => sum + w.water_glasses, 0) / waterLogs.length).toFixed(1) : 0;
      const avgSleep = sleepLogs.length > 0 ?
        (sleepLogs.reduce((sum, s) => sum + s.sleep_hours, 0) / sleepLogs.length).toFixed(1) : 0;

      // Weight progress
      const weightProgress = weights.length > 1 ? {
        start: Math.min(...weights.map(w => w.weight)),
        end: Math.max(...weights.map(w => w.weight)),
        change: (Math.max(...weights.map(w => w.weight)) - Math.min(...weights.map(w => w.weight))).toFixed(1)
      } : null;

      // Consistency metrics
      const daysInMonth = endDate.getDate();
      const activeDays = new Set(monthLogs.map(log => log.date)).size;

      // Generate goals and achievements
      const goals = [];
      const waterGoal = 8; // Default water goal
      const sleepGoal = 8; // Default sleep goal

      if (parseFloat(avgWater) >= waterGoal) {
        goals.push({
          name: 'Water Goal',
          progress: 100,
          achieved: true,
          description: `Average ${avgWater} glasses per day - excellent!`
        });
      } else {
        goals.push({
          name: 'Water Goal',
          progress: Math.round((parseFloat(avgWater) / waterGoal) * 100),
          achieved: false,
          description: `${avgWater} glasses average - aim for ${waterGoal} daily`
        });
      }

      if (parseFloat(avgSleep) >= sleepGoal) {
        goals.push({
          name: 'Sleep Goal',
          progress: 100,
          achieved: true,
          description: `Average ${avgSleep}h per night - perfect rest!`
        });
      } else {
        goals.push({
          name: 'Sleep Goal',
          progress: Math.round((parseFloat(avgSleep) / sleepGoal) * 100),
          achieved: false,
          description: `${avgSleep}h average - target ${sleepGoal}h nightly`
        });
      }

      // Generate insights
      const trends = [];
      if (activeDays >= daysInMonth * 0.8) trends.push('Outstanding consistency this month!');
      if (totalMeals >= daysInMonth * 2.5) trends.push('Great meal tracking discipline!');
      if (meals.filter(meal => meal.cheat_meal).length <= totalMeals * 0.2) trends.push('Excellent control over cheat meals!');

      return {
        month,
        year,
        stats: {
          totalMeals,
          avgWater,
          avgSleep,
          weightProgress,
          activeDays,
          totalDays: daysInMonth,
          consistencyPercentage: Math.round((activeDays / daysInMonth) * 100)
        },
        trends,
        goals
      };
    } catch (error) {
      console.error('Error generating monthly summary:', error);
      throw error;
    }
  }

  // Get user email preferences
  async getUserEmailPreferences(userId) {
    try {
      let user = await User.findOne({ _id: userId });
      if (!user) {
        // Create default user if not exists
        console.log(`📧 Creating default user ${userId}`);
        user = await User.findOneAndUpdate(
          { _id: userId },
          { 
            _id: userId,
            name: 'Default User',
            email: null,
            goal_weight: 70,
            email_notifications: {
              enabled: false,
              email: null,
              daily_summary: false,
              weekly_summary: false,
              monthly_summary: false
            }
          },
          { new: true, upsert: true }
        );
      }
      return user.email_notifications || {
        enabled: false,
        email: null,
        daily_summary: false,
        weekly_summary: false,
        monthly_summary: false
      };
    } catch (error) {
      console.error('Error getting email preferences:', error);
      // Return default preferences on error
      return {
        enabled: false,
        email: null,
        daily_summary: false,
        weekly_summary: false,
        monthly_summary: false
      };
    }
  }

  // Update user email preferences
  async updateEmailPreferences(userId, preferences) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { email_notifications: preferences } },
        { new: true, upsert: true }
      );
      return user.email_notifications;
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }
  }
}

export default new SummaryService();
