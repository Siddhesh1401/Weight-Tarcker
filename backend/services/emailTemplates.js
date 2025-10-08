// Email templates for different summary types

export const generateDailySummaryTemplate = (data) => {
  const { date, meals, weight, water, sleep, achievements } = data;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 300;">📊 Daily Health Summary</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

        <!-- Meals Section -->
        ${meals && meals.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 5px;">🍽️ Meals Logged</h2>
            ${meals.map(meal => `
              <div style="background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #667eea;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: #333; text-transform: capitalize;">${meal.meal_type}</strong>
                  <span style="color: #666; font-size: 14px;">${meal.time || 'No time logged'}</span>
                </div>
                <p style="margin: 5px 0; color: #555;">${meal.meal_notes || 'No description'}</p>
                ${meal.cheat_meal ? '<span style="background: #ffc107; color: #333; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">CHEAT MEAL</span>' : ''}
                ${meal.tea_biscuit ? '<span style="background: #17a2b8; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px;">TEA + BISCUIT</span>' : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: #666; font-style: italic;">No meals logged today</p>'}

        <!-- Weight Section -->
        ${weight ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #28a745; padding-bottom: 5px;">⚖️ Weight Update</h2>
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #155724;">${weight.weight} kg</div>
              <p style="margin: 5px 0 0 0; color: #155724;">Keep up the great work! 💪</p>
            </div>
          </div>
        ` : ''}

        <!-- Water Section -->
        ${water ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #17a2b8; padding-bottom: 5px;">💧 Water Intake</h2>
            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #0c5460;">${water.water_glasses} glasses</div>
              <p style="margin: 5px 0 0 0; color: #0c5460;">${water.water_glasses >= 8 ? 'Excellent hydration! 🌊' : 'Try to drink more water tomorrow!'}</p>
            </div>
          </div>
        ` : ''}

        <!-- Sleep Section -->
        ${sleep ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #6f42c1; padding-bottom: 5px;">😴 Sleep Quality</h2>
            <div style="background: #e2e3e5; padding: 20px; border-radius: 8px; border-left: 4px solid #6f42c1; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #383d41;">${sleep.sleep_hours}h</div>
              <p style="margin: 5px 0 0 0; color: #383d41; text-transform: capitalize;">${sleep.sleep_quality} quality sleep</p>
              ${sleep.bed_time ? `<p style="font-size: 14px; color: #6c757d;">Bedtime: ${sleep.bed_time}</p>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Achievements Section -->
        ${achievements && achievements.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #ffc107; padding-bottom: 5px;">🏆 Today's Achievements</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              ${achievements.map(achievement => `
                <span style="background: #fff3cd; color: #856404; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; border: 2px solid #ffc107;">
                  ${achievement}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Keep up the great work on your health journey! 🌟</p>
          <p style="margin-top: 10px;">
            <a href="#" style="color: #667eea; text-decoration: none; font-weight: bold;">View in Weight Tracker App</a>
          </p>
        </div>
      </div>
    </div>
  `;
};

export const generateWeeklySummaryTemplate = (data) => {
  const { weekStart, weekEnd, meals, avgWeight, totalWater, avgSleep, trends } = data;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 300;">📈 Weekly Health Report</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date(weekStart).toLocaleDateString()} - ${new Date(weekEnd).toLocaleDateString()}</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

        <!-- Overview Stats -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">📊 Weekly Overview</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2d5a2d;">${meals.total} meals</div>
              <p style="margin: 5px 0 0 0; color: #2d5a2d; font-size: 14px;">logged this week</p>
            </div>
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #0c5460;">${totalWater} glasses</div>
              <p style="margin: 5px 0 0 0; color: #0c5460; font-size: 14px;">water consumed</p>
            </div>
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #856404;">${avgSleep}h avg</div>
              <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">sleep per night</p>
            </div>
          </div>
        </div>

        <!-- Weight Trend -->
        ${avgWeight ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #28a745; padding-bottom: 5px;">⚖️ Weight Progress</h2>
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #155724;">${avgWeight.current} kg</div>
              <p style="margin: 5px 0 0 0; color: #155724;">Average weight this week</p>
              ${avgWeight.change ? `<p style="font-size: 18px; margin: 10px 0 0 0; color: ${avgWeight.change > 0 ? '#dc3545' : '#28a745'};">${avgWeight.change > 0 ? '↗️' : '↘️'} ${Math.abs(avgWeight.change)} kg ${avgWeight.change > 0 ? 'gained' : 'lost'}</p>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Meal Patterns -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 5px;">🍽️ Meal Patterns</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            ${Object.entries(meals.byType).map(([type, count]) => `
              <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; text-align: center;">
                <div style="font-size: 20px; font-weight: bold; color: #495057;">${count}</div>
                <div style="font-size: 12px; color: #6c757d; text-transform: capitalize;">${type}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Insights -->
        ${trends && trends.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #ffc107; padding-bottom: 5px;">💡 Weekly Insights</h2>
            ${trends.map(trend => `
              <div style="background: #fff3cd; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404;">${trend}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Great progress this week! Keep building healthy habits! 🌟</p>
        </div>
      </div>
    </div>
  `;
};

export const generateMonthlySummaryTemplate = (data) => {
  const { month, year, stats, trends, goals } = data;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 300;">📅 Monthly Health Report</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

        <!-- Monthly Stats -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">📊 Monthly Overview</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2d5a2d;">${stats.totalMeals} meals</div>
              <p style="margin: 5px 0 0 0; color: #2d5a2d; font-size: 14px;">logged this month</p>
            </div>
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #0c5460;">${stats.avgWater} glasses/day</div>
              <p style="margin: 5px 0 0 0; color: #0c5460; font-size: 14px;">average water intake</p>
            </div>
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #856404;">${stats.avgSleep}h/night</div>
              <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">average sleep duration</p>
            </div>
          </div>
        </div>

        <!-- Weight Progress -->
        ${stats.weightProgress ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #28a745; padding-bottom: 5px;">⚖️ Weight Journey</h2>
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #155724;">${stats.weightProgress.change} kg</div>
              <p style="margin: 5px 0 0 0; color: #155724;">${stats.weightProgress.change > 0 ? 'gained' : 'lost'} this month</p>
              <p style="font-size: 14px; margin: 10px 0 0 0; color: #155724;">
                From ${stats.weightProgress.start} kg to ${stats.weightProgress.end} kg
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Goal Progress -->
        ${goals && goals.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #ffc107; padding-bottom: 5px;">🎯 Goal Progress</h2>
            ${goals.map(goal => `
              <div style="background: ${goal.achieved ? '#d4edda' : '#f8d7da'}; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid ${goal.achieved ? '#28a745' : '#dc3545'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="color: ${goal.achieved ? '#155724' : '#721c24'};">${goal.name}</strong>
                  <span style="color: ${goal.achieved ? '#155724' : '#721c24'}; font-weight: bold;">
                    ${goal.progress}% ${goal.achieved ? '✅' : '⏳'}
                  </span>
                </div>
                <p style="margin: 5px 0 0 0; color: ${goal.achieved ? '#155724' : '#721c24'}; font-size: 14px;">
                  ${goal.description}
                </p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Monthly Insights -->
        ${trends && trends.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 15px; border-bottom: 2px solid #17a2b8; padding-bottom: 5px;">💡 Monthly Insights</h2>
            ${trends.map(trend => `
              <div style="background: #d1ecf1; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #17a2b8;">
                <p style="margin: 0; color: #0c5460;">${trend}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p>Amazing progress this month! You're building lifelong healthy habits! 🌟</p>
          <p style="margin-top: 10px; font-size: 12px; color: #999;">
            Consistency is key to long-term health success
          </p>
        </div>
      </div>
    </div>
  `;
};
