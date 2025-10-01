import express from 'express';
import MealTemplate from '../models/MealTemplate.js';

const router = express.Router();

// GET /api/templates - Get all meal templates for a user
router.get('/templates', async (req, res) => {
  try {
    const { user_id, meal_type } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    let query = { user_id };
    if (meal_type) {
      query.meal_type = meal_type;
    }

    const templates = await MealTemplate.find(query).sort({ use_count: -1, created_at: -1 });

    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: error.message
    });
  }
});

// POST /api/templates - Create a new meal template
router.post('/templates', async (req, res) => {
  try {
    const { user_id, name, meal_type, description, is_favorite } = req.body;

    if (!user_id || !name || !meal_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, name, meal_type, description'
      });
    }

    const template = new MealTemplate({
      user_id,
      name,
      meal_type,
      description,
      is_favorite: is_favorite || false
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error.message
    });
  }
});

// PUT /api/templates/:id - Update template (increment use count)
router.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_favorite } = req.body;

    const update = { $inc: { use_count: 1 } };
    if (is_favorite !== undefined) {
      update.is_favorite = is_favorite;
    }

    const template = await MealTemplate.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error.message
    });
  }
});

// DELETE /api/templates/:id - Delete a template
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await MealTemplate.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
});

export default router;
