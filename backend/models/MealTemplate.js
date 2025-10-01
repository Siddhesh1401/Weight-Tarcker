import mongoose from 'mongoose';

const mealTemplateSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  meal_type: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  is_favorite: {
    type: Boolean,
    default: false
  },
  use_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
mealTemplateSchema.index({ user_id: 1, meal_type: 1 });

const MealTemplate = mongoose.model('MealTemplate', mealTemplateSchema);

export default MealTemplate;
