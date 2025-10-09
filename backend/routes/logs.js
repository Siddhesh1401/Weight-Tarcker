import express from 'express';
import Log from '../models/Log.js';

const router = express.Router();

// POST /api/log - Save a meal/weight/water/sleep entry
router.post('/log', async (req, res) => {
  try {
    const { 
      user_id, date, meal_type, meal_notes, tea_biscuit, cheat_meal, weight,
      water_glasses, sleep_hours, sleep_quality, bed_time, sleep_notes, time
    } = req.body;

    // Validation
    if (!user_id || !date || !meal_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, date, meal_type'
      });
    }

    const newLog = new Log({
      user_id,
      date,
      meal_type,
      meal_notes: meal_notes || '',
      tea_biscuit: tea_biscuit || false,
      cheat_meal: cheat_meal || false,
      weight: weight || null,
      water_glasses: water_glasses || null,
      sleep_hours: sleep_hours || null,
      sleep_quality: sleep_quality || null,
      bed_time: bed_time || null,
      sleep_notes: sleep_notes || null,
      time: time || undefined // Use provided time or let model default handle it
    });

    await newLog.save();

    res.status(201).json({
      success: true,
      message: 'Log entry saved successfully',
      data: newLog
    });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save log entry',
      error: error.message
    });
  }
});

// GET /api/logs - Get all logs for a user (with optional date filter)
router.get('/logs', async (req, res) => {
  try {
    const { user_id, date, start_date, end_date } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    let query = { user_id };

    // Filter by specific date
    if (date) {
      query.date = date;
    }

    // Filter by date range
    if (start_date && end_date) {
      query.date = { $gte: start_date, $lte: end_date };
    }

    const logs = await Log.find(query).sort({ date: -1, timestamp: -1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

// GET /api/progress - Return weight history + cheat meal count for charts
router.get('/progress', async (req, res) => {
  try {
    const { user_id, days = 30 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get all logs in date range
    const logs = await Log.find({
      user_id,
      date: { $gte: startDateStr, $lte: endDateStr }
    }).sort({ date: 1, timestamp: 1 });

    // Extract weight history (only entries with weight)
    const weightHistory = logs
      .filter(log => log.weight !== null && log.weight > 0)
      .map(log => ({
        date: log.date,
        weight: log.weight,
        timestamp: log.timestamp
      }));

    // Count cheat meals
    const cheatMealCount = logs.filter(log => log.cheat_meal === true).length;

    // Count tea/biscuit entries
    const teaBiscuitCount = logs.filter(log => log.tea_biscuit === true).length;

    // Meal breakdown by type
    const mealBreakdown = {
      breakfast: logs.filter(log => log.meal_type === 'breakfast').length,
      lunch: logs.filter(log => log.meal_type === 'lunch').length,
      snacks: logs.filter(log => log.meal_type === 'snacks').length,
      dinner: logs.filter(log => log.meal_type === 'dinner').length
    };

    res.json({
      success: true,
      data: {
        weightHistory,
        cheatMealCount,
        teaBiscuitCount,
        mealBreakdown,
        totalLogs: logs.length,
        dateRange: {
          start: startDateStr,
          end: endDateStr
        }
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress data',
      error: error.message
    });
  }
});

// GET /api/export - Export all logs as CSV
router.get('/export', async (req, res) => {
  try {
    const { user_id, format = 'csv' } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const logs = await Log.find({ user_id }).sort({ date: -1, timestamp: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'Date,Type,Notes,Tea/Biscuit,Cheat Meal,Weight,Water Glasses,Sleep Hours,Sleep Quality,Timestamp\n';
      const csvRows = logs.map(log => {
        return [
          log.date,
          log.meal_type,
          `"${(log.meal_notes || '').replace(/"/g, '""')}"`,
          log.tea_biscuit ? 'Yes' : 'No',
          log.cheat_meal ? 'Yes' : 'No',
          log.weight || '',
          log.water_glasses || '',
          log.sleep_hours || '',
          log.sleep_quality || '',
          log.timestamp
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="weight-tracker-export-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        success: true,
        count: logs.length,
        data: logs
      });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});

// DELETE /api/log/:id - Delete a specific log entry
router.delete('/log/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const deletedLog = await Log.findOneAndDelete({
      _id: id,
      user_id: user_id
    });

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: 'Log entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Log entry deleted successfully',
      data: deletedLog
    });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete log entry',
      error: error.message
    });
  }
});

// PUT /api/log - Update an existing log entry
router.put('/log', async (req, res) => {
  try {
    const { 
      user_id, date, meal_type, meal_notes, tea_biscuit, cheat_meal, weight,
      water_glasses, sleep_hours, sleep_quality, bed_time, sleep_notes, time, log_id
    } = req.body;

    // Validation
    if (!user_id || !date || !meal_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, date, meal_type'
      });
    }

    console.log('PUT /api/log - Received:', { log_id, meal_type, date, time });

    // If log_id is provided, use it to update (this is an edit of existing entry)
    if (log_id) {
      console.log('Updating by ID:', log_id);
      
      const updatedLog = await Log.findByIdAndUpdate(
        log_id,
        {
          user_id,
          date,
          meal_type,
          meal_notes: meal_notes || '',
          tea_biscuit: tea_biscuit || false,
          cheat_meal: cheat_meal || false,
          weight: weight || null,
          water_glasses: water_glasses || null,
          sleep_hours: sleep_hours || null,
          sleep_quality: sleep_quality || null,
          bed_time: bed_time || null,
          sleep_notes: sleep_notes || null,
          time: time || null,
          timestamp: new Date().toISOString()
        },
        { 
          new: true,
          runValidators: true
        }
      );

      if (!updatedLog) {
        return res.status(404).json({
          success: false,
          message: 'Log entry not found'
        });
      }

      console.log('Updated log by ID:', updatedLog._id);

      return res.json({
        success: true,
        message: 'Log entry updated successfully',
        data: updatedLog
      });
    }

    // If no log_id, fall back to upsert behavior (for backward compatibility)
    // Build query to find existing log
    let query = { user_id, date, meal_type };
    
    // Only add time to query for meals and water (allows multiple per day)
    if (time && (meal_type === 'water' || ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(meal_type))) {
      query.time = time;
    }

    console.log('PUT /api/log - Query:', JSON.stringify(query));

    const updatedLog = await Log.findOneAndUpdate(
      query,
      {
        user_id,
        date,
        meal_type,
        meal_notes: meal_notes || '',
        tea_biscuit: tea_biscuit || false,
        cheat_meal: cheat_meal || false,
        weight: weight || null,
        water_glasses: water_glasses || null,
        sleep_hours: sleep_hours || null,
        sleep_quality: sleep_quality || null,
        bed_time: bed_time || null,
        sleep_notes: sleep_notes || null,
        time: time || null,
        timestamp: new Date().toISOString()
      },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    console.log('Updated/Created log:', updatedLog._id);

    res.json({
      success: true,
      message: 'Log entry updated successfully',
      data: updatedLog
    });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update log entry',
      error: error.message
    });
  }
});

// DELETE /api/logs - Delete all logs for a user
router.delete('/logs', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const result = await Log.deleteMany({ user_id });

    res.json({
      success: true,
      message: 'All logs deleted successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting all logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all logs',
      error: error.message
    });
  }
});

export default router;
