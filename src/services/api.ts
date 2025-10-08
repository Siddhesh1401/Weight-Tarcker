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
  // Save a meal, weight, water, or sleep log (creates new entry)
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
    bed_time?: string; // HH:MM format for sleep bed time
    sleep_notes?: string; // Sleep notes
    time?: string; // HH:MM format
  }) {
    return apiCall('/log', {
      method: 'POST',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        ...logData,
      }),
    });
  },

  // Update an existing log (uses MongoDB _id to prevent duplicates when time changes)
  async updateLog(logData: {
    log_id?: string; // MongoDB _id of the log to update
    date: string;
    meal_type: string;
    meal_notes?: string;
    tea_biscuit?: boolean;
    cheat_meal?: boolean;
    weight?: number;
    water_glasses?: number;
    sleep_hours?: number;
    sleep_quality?: string;
    bed_time?: string; // HH:MM format for sleep bed time
    sleep_notes?: string; // Sleep notes
    time?: string; // HH:MM format
  }) {
    return apiCall('/log', {
      method: 'PUT',
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

  // Reorder templates
  async reorderTemplates(templateIds: string[]) {
    return apiCall('/templates/reorder', {
      method: 'POST',
      body: JSON.stringify({
        user_id: DEFAULT_USER_ID,
        template_ids: templateIds,
      }),
    });
  },
};

// Email API
export const emailApi = {
  // Get email preferences
  getEmailPreferences: async (userId?: string): Promise<any> => {
    return apiCall(`/email/preferences${userId ? `?user_id=${userId}` : ''}`);
  },

  // Update email preferences
  updateEmailPreferences: async (preferences: any, userId?: string): Promise<any> => {
    return apiCall('/email/preferences', {
      method: 'POST',
      body: JSON.stringify({
        preferences,
        user_id: userId || DEFAULT_USER_ID
      }),
    });
  },

  // Send test email
  sendTestEmail: async (email: string): Promise<any> => {
    return apiCall('/email/test', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Send daily summary (for cron jobs)
  sendDailySummary: async (userId?: string, date?: string): Promise<any> => {
    return apiCall('/email/send-daily-summary', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_CRON_API_KEY || '',
      },
      body: JSON.stringify({
        user_id: userId || DEFAULT_USER_ID,
        date,
      }),
    });
  },

  // Send weekly summary (for cron jobs)
  sendWeeklySummary: async (userId?: string, weekStart?: string): Promise<any> => {
    return apiCall('/email/send-weekly-summary', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_CRON_API_KEY || '',
      },
      body: JSON.stringify({
        user_id: userId || DEFAULT_USER_ID,
        week_start: weekStart,
      }),
    });
  },

  // Send monthly summary (for cron jobs)
  sendMonthlySummary: async (userId?: string, month?: number, year?: number): Promise<any> => {
    return apiCall('/email/send-monthly-summary', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_CRON_API_KEY || '',
      },
      body: JSON.stringify({
        user_id: userId || DEFAULT_USER_ID,
        month,
        year,
      }),
    });
  },
};

// Cron Jobs API
export const cronJobsApi = {
  // List all cron jobs
  getCronJobs: async (): Promise<any> => {
    return apiCall('/cron-jobs');
  },

  // Create a new cron job
  createCronJob: async (jobData: any): Promise<any> => {
    return apiCall('/cron-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobData }),
    });
  },

  // Update an existing cron job
  updateCronJob: async (jobId: string, jobData: any): Promise<any> => {
    return apiCall(`/cron-jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify({ jobData }),
    });
  },

  // Delete a cron job
  deleteCronJob: async (jobId: string): Promise<any> => {
    return apiCall(`/cron-jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  // Toggle cron job (enable/disable)
  toggleCronJob: async (jobId: string, enabled: boolean): Promise<any> => {
    return apiCall(`/cron-jobs/${jobId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  },

  // Get specific cron job details
  getCronJob: async (jobId: string): Promise<any> => {
    return apiCall(`/cron-jobs/${jobId}`);
  },

  // Test cron job execution
  testCronJob: async (jobId: string): Promise<any> => {
    return apiCall(`/cron-jobs/${jobId}/test`, {
      method: 'POST',
    });
  },

  // Setup email summary cron jobs (convenience method)
  setupEmailSummaryJobs: async (backendUrl: string, apiKey: string): Promise<any> => {
    return apiCall('/cron-jobs/setup-email-summaries', {
      method: 'POST',
      body: JSON.stringify({ backendUrl, apiKey }),
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
