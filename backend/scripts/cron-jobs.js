#!/usr/bin/env node

// Simple cron job setup script for email summaries
// This script can be run as a cron job to send automated email summaries

import { config } from 'dotenv';
import { emailApi } from '../src/services/api.js';

// Load environment variables
config();

async function sendDailySummary() {
  try {
    console.log('📧 Sending daily summary...');

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];

    await emailApi.sendDailySummary(undefined, dateString);
    console.log('✅ Daily summary sent successfully');
  } catch (error) {
    console.error('❌ Failed to send daily summary:', error.message);
  }
}

async function sendWeeklySummary() {
  try {
    console.log('📧 Sending weekly summary...');

    // Get Monday of current week
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = monday.toISOString().split('T')[0];

    await emailApi.sendWeeklySummary(undefined, weekStart);
    console.log('✅ Weekly summary sent successfully');
  } catch (error) {
    console.error('❌ Failed to send weekly summary:', error.message);
  }
}

async function sendMonthlySummary() {
  try {
    console.log('📧 Sending monthly summary...');

    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const year = now.getFullYear();

    await emailApi.sendMonthlySummary(undefined, month, year);
    console.log('✅ Monthly summary sent successfully');
  } catch (error) {
    console.error('❌ Failed to send monthly summary:', error.message);
  }
}

// Main execution based on command line arguments
const command = process.argv[2];

switch (command) {
  case 'daily':
    await sendDailySummary();
    break;
  case 'weekly':
    await sendWeeklySummary();
    break;
  case 'monthly':
    await sendMonthlySummary();
    break;
  default:
    console.log('Usage: node cron-jobs.js [daily|weekly|monthly]');
    console.log('Examples:');
    console.log('  node cron-jobs.js daily    # Send daily summary');
    console.log('  node cron-jobs.js weekly   # Send weekly summary');
    console.log('  node cron-jobs.js monthly  # Send monthly summary');
    process.exit(1);
}
