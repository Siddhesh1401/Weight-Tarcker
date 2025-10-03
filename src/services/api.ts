// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : `${window.location.origin}/api`);
const DEFAULT_USER_ID = 'user_001'; // For now, using a single user

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Log API
export const logApi = {
  // Save a meal, weight, water, or sleep log
  async saveLog(logData: {
    date: string;
    meal_type: string;
    meal_notes?: string;
    tea_biscuit?: boolean;
    cheat_meal?: boolean;
    weight?: number;
    water_glasses?: number;
    sleep_hours?: number;
    sleep_quality?: string;
  }) {
    return apiCall('/log', {
      method: 'POST',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        ...logData,
      }),
    });
  },

  // Get all logs with optional filters
  async getLogs(filters?: {
    date?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
      ...filters,
    } as Record<string, string>);

    return apiCall<any[]>(`/logs?${params.toString()}`);
  },

  // Get progress data for charts
  async getProgress(days: number = 30) {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
      days: days.toString(),
    });

    return apiCall<{
      weightHistory: Array<{ date: string; weight: number; timestamp: string }>;
      cheatMealCount: number;
      teaBiscuitCount: number;
      mealBreakdown: {
        breakfast: number;
        lunch: number;
        snacks: number;
        dinner: number;
      };
      totalLogs: number;
      dateRange: {
        start: string;
        end: string;
      };
    }>(`/progress?${params.toString()}`);
  },

  // Delete a specific log entry
  async deleteLog(id: string) {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
    });

    return apiCall(`/log/${id}?${params.toString()}`, {
      method: 'DELETE',
    });
  },

  // Delete all logs for the user
  async deleteAllLogs() {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
    });

    return apiCall(`/logs?${params.toString()}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsApi = {
  // Get user settings
  async getSettings() {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
    });

    return apiCall<{
      _id: string;
      name: string;
      email?: string;
      goal_weight: number;
      created_at: string;
    }>(`/settings?${params.toString()}`);
  },

  // Save user settings
  async saveSettings(settings: {
    name?: string;
    email?: string;
    goal_weight?: number;
    height?: number;
    current_weight?: number;
    water_goal?: number;
    sleep_goal?: number;
    hidden_presets?: {
      breakfast?: string[];
      lunch?: string[];
      snacks?: string[];
      dinner?: string[];
    };
  }) {
    return apiCall('/settings', {
      method: 'POST',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        ...settings,
      }),
    });
  },
};

// Templates API
export const templatesApi = {
  // Get all templates for a user (optionally filtered by meal_type)
  async getTemplates(mealType?: string) {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
    });
    if (mealType) {
      params.append('meal_type', mealType);
    }

    return apiCall<{
      _id: string;
      name: string;
      meal_type: string;
      description: string;
      is_favorite: boolean;
      use_count: number;
      created_at: string;
    }[]>(`/templates?${params.toString()}`);
  },

  // Create a new template
  async createTemplate(template: {
    name: string;
    meal_type: string;
    description: string;
    is_favorite?: boolean;
  }) {
    return apiCall('/templates', {
      method: 'POST',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        ...template,
      }),
    });
  },

  // Update a template
  async updateTemplate(id: string, updates: {
    name?: string;
    description?: string;
    is_favorite?: boolean;
  }) {
    return apiCall(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        ...updates,
      }),
    });
  },

  // Delete a template
  async deleteTemplate(id: string) {
    const params = new URLSearchParams({
      user_id: DEFAULT_USER_ID,
    });

    return apiCall(`/templates/${id}?${params.toString()}`, {
      method: 'DELETE',
    });
  },

  // Increment use count for a template
  async incrementUseCount(id: string) {
    return apiCall(`/templates/${id}/use`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
      }),
    });
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE_URL.replace('/api', ''));
    return response.ok;
  } catch {
    return false;
  }
};
