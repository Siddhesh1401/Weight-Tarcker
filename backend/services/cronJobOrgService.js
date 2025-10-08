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
              statusCode: res.statusCode,
              dataLength: data.length,
              data: data.substring(0, 200) // First 200 chars
            });

            if (!data || data.trim() === '') {
              reject(new Error(`Empty response from cron-job.org API. Status: ${res.statusCode}. Check if API key is valid.`));
              return;
            }

            const response = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`API Error: ${res.statusCode} - ${response.message || JSON.stringify(response)}`));
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
  async listJobs() {
    try {
      const response = await this.makeRequest('/jobs');
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
          schedule: jobData.schedule,
          timezone: jobData.timezone || 'UTC',
          title: jobData.title,
          httpMethod: jobData.method || 'POST',
          httpHeaders: jobData.headers || [],
        }
      };

      const response = await this.makeRequest('/jobs', {
        method: 'POST',
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
  async deleteJob(jobId) {
    try {
      await this.makeRequest(`/jobs/${jobId}`, {
        method: 'DELETE',
      });

      return true;
    } catch (error) {
      console.error('Failed to delete cron job:', error.message);
      throw error;
    }
  }

  // Enable/disable a cron job
  async toggleJob(jobId, enabled) {
    try {
      const response = await this.makeRequest(`/jobs/${jobId}/toggle`, {
        method: 'POST',
        body: { enabled },
      });

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
    // Convert time from HH:MM to cron format
    const [hours, minutes] = scheduleTime.split(':');
    
    const schedules = {
      daily: `${minutes} ${hours} * * *`,           // Daily at specified time
      weekly: `${minutes} ${hours} * * 1`,          // Every Monday at specified time
      monthly: `${minutes} ${hours} 1 * *`          // 1st of month at specified time
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
      schedule: schedules[type],
      timezone: 'UTC',
      title: titles[type],
      method: 'POST',
      headers: [
        { name: 'x-api-key', value: apiKey },
        { name: 'Content-Type', value: 'application/json' }
      ]
    };
  }
}

export default new CronJobOrgService();
