import https from 'https';

class CronJobOrgService {
  constructor() {
    this.baseURL = 'https://api.cron-job.org';
    this.apiKey = process.env.CRON_JOB_ORG_API_KEY;
    this.email = process.env.CRON_JOB_ORG_EMAIL;
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}, customApiKey = null) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Use custom API key if provided, otherwise fall back to environment variable
    const apiKey = customApiKey || this.apiKey;
    
    console.log('Making request to cron-job.org:', {
      url,
      endpoint,
      method: options.method || 'GET',
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING'
    });

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...options.headers,
      },
      ...options,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            // Log for debugging
            console.log('Cron-job.org API Response:', {
              url,
              statusCode: res.statusCode,
              dataLength: data.length,
              data: data.substring(0, 500) // First 500 chars for better debugging
            });

            if (!data || data.trim() === '') {
              reject(new Error(`Empty response from cron-job.org API. Status: ${res.statusCode}. URL: ${url}. Check if API key is valid.`));
              return;
            }

            const response = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${response.error?.message || response.message || JSON.stringify(response)}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}. Raw data: ${data.substring(0, 100)}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  // List all cron jobs
  async listJobs(customApiKey = null) {
    try {
      const response = await this.makeRequest('/jobs', {}, customApiKey);
      return response.jobs || [];
    } catch (error) {
      console.error('Failed to list cron jobs:', error.message);
      throw error;
    }
  }

  // Create a new cron job
  async createJob(jobData, customApiKey = null) {
    try {
      const payload = {
        job: {
          url: jobData.url,
          enabled: jobData.enabled !== false,
          title: jobData.title,
          saveResponses: jobData.saveResponses || false,
          requestMethod: jobData.requestMethod || 1, // 1 = POST
          schedule: jobData.schedule, // Should already be in correct format from createEmailSummaryJob
        }
      };

      console.log('Creating job with payload:', JSON.stringify(payload, null, 2));

      const response = await this.makeRequest('/jobs', {
        method: 'PUT', // Documentation says PUT for creating jobs
        body: payload,
      }, customApiKey);

      return response.job;
    } catch (error) {
      console.error('Failed to create cron job:', error.message);
      throw error;
    }
  }

  // Update an existing cron job
  async updateJob(jobId, jobData) {
    try {
      const payload = {
        job: {
          url: jobData.url,
          enabled: jobData.enabled,
          schedule: jobData.schedule,
          timezone: jobData.timezone || 'UTC',
          title: jobData.title,
          httpMethod: jobData.method || 'POST',
          httpHeaders: jobData.headers || [],
        }
      };

      const response = await this.makeRequest(`/jobs/${jobId}`, {
        method: 'PUT',
        body: payload,
      });

      return response.job;
    } catch (error) {
      console.error('Failed to update cron job:', error.message);
      throw error;
    }
  }

  // Delete a cron job
  async deleteJob(jobId, customApiKey = null) {
    try {
      await this.makeRequest(`/jobs/${jobId}`, {
        method: 'DELETE',
      }, customApiKey);

      return true;
    } catch (error) {
      console.error('Failed to delete cron job:', error.message);
      throw error;
    }
  }

  // Enable/disable a cron job
  async toggleJob(jobId, enabled, customApiKey = null) {
    try {
      const response = await this.makeRequest(`/jobs/${jobId}`, {
        method: 'PATCH',
        body: { 
          job: {
            enabled: enabled
          }
        },
      }, customApiKey);

      return response.job;
    } catch (error) {
      console.error('Failed to toggle cron job:', error.message);
      throw error;
    }
  }

  // Get job details
  async getJob(jobId) {
    try {
      const response = await this.makeRequest(`/jobs/${jobId}`);
      return response.job;
    } catch (error) {
      console.error('Failed to get cron job:', error.message);
      throw error;
    }
  }

  // Test job execution
  async testJob(jobId) {
    try {
      const response = await this.makeRequest(`/jobs/${jobId}/test`, {
        method: 'POST',
      });

      return response;
    } catch (error) {
      console.error('Failed to test cron job:', error.message);
      throw error;
    }
  }

  // Helper method to create standard email summary jobs
  createEmailSummaryJob(type, backendUrl, apiKey, scheduleTime = '20:00') {
    // Convert time from HH:MM format to cron-job.org API format
    const [hoursStr, minutesStr] = scheduleTime.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    console.log(`Creating ${type} job with schedule time ${scheduleTime}:`, {
      originalTime: scheduleTime,
      parsedHours: hours,
      parsedMinutes: minutes,
      hoursArray: [hours],
      minutesArray: [minutes]
    });
    
    // cron-job.org API uses arrays for schedule
    // [-1] means "every" (e.g., [-1] for hours = every hour)
    // Using Asia/Kolkata timezone for Mumbai, India
    const schedules = {
      daily: {
        timezone: 'Asia/Kolkata',  // Mumbai timezone
        hours: [hours],        // Specific hour
        minutes: [minutes],    // Specific minute
        mdays: [-1],          // Every day of month
        months: [-1],         // Every month
        wdays: [-1]           // Every day of week
      },
      weekly: {
        timezone: 'Asia/Kolkata',  // Mumbai timezone
        hours: [hours],
        minutes: [minutes],
        mdays: [-1],          // Every day of month
        months: [-1],         // Every month
        wdays: [1]            // Only Monday (0=Sunday, 1=Monday, etc.)
      },
      monthly: {
        timezone: 'Asia/Kolkata',  // Mumbai timezone
        hours: [hours],
        minutes: [minutes],
        mdays: [1],           // Only 1st day of month
        months: [-1],         // Every month
        wdays: [-1]           // Every day of week
      }
    };

    const titles = {
      daily: 'Weight Tracker - Daily Summary',
      weekly: 'Weight Tracker - Weekly Summary',
      monthly: 'Weight Tracker - Monthly Summary'
    };

    const endpoints = {
      daily: '/api/email/send-daily-summary',
      weekly: '/api/email/send-weekly-summary',
      monthly: '/api/email/send-monthly-summary'
    };

    return {
      url: `${backendUrl}${endpoints[type]}`,
      enabled: true,
      title: titles[type],
      saveResponses: false,
      requestMethod: 1, // 1 = POST according to API docs
      schedule: schedules[type]
    };
  }
}

export default new CronJobOrgService();
