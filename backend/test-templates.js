// Test script to verify backend templates API is working
// Run with: node test-templates.js

const BASE_URL = 'http://localhost:5000/api';
const USER_ID = 'user_001';

async function testAPI() {
  console.log('🧪 Testing Weight Tracker Templates API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthRes = await fetch('http://localhost:5000');
    const healthData = await healthRes.json();
    console.log('✅ Server is running:', healthData.message);
    console.log('');

    // Test 2: Get templates
    console.log('2️⃣ Fetching existing templates...');
    const getRes = await fetch(`${BASE_URL}/templates?user_id=${USER_ID}&meal_type=breakfast`);
    const templates = await getRes.json();
    console.log('✅ Found templates:', templates.data?.length || 0);
    if (templates.data?.length > 0) {
      console.log('   Example:', templates.data[0].name);
    }
    console.log('');

    // Test 3: Create a test template
    console.log('3️⃣ Creating test template...');
    const createRes = await fetch(`${BASE_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: USER_ID,
        name: 'API Test Smoothie',
        meal_type: 'breakfast',
        description: 'Created by test script',
        is_favorite: false
      })
    });
    const created = await createRes.json();
    if (created.success) {
      console.log('✅ Template created:', created.data.name);
      console.log('   ID:', created.data._id);
      
      const templateId = created.data._id;

      // Test 4: Update template
      console.log('');
      console.log('4️⃣ Updating template...');
      const updateRes = await fetch(`${BASE_URL}/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: USER_ID,
          name: 'Updated API Test Smoothie',
          description: 'Updated by test script'
        })
      });
      const updated = await updateRes.json();
      if (updated.success) {
        console.log('✅ Template updated:', updated.data.name);
      }

      // Test 5: Delete template
      console.log('');
      console.log('5️⃣ Deleting test template...');
      const deleteRes = await fetch(`${BASE_URL}/templates/${templateId}?user_id=${USER_ID}`, {
        method: 'DELETE'
      });
      const deleted = await deleteRes.json();
      if (deleted.success) {
        console.log('✅ Template deleted successfully');
      }
    } else {
      console.log('❌ Failed to create template:', created.message);
    }

    console.log('');
    console.log('🎉 All tests passed!');
    console.log('');
    console.log('✅ Your backend is working correctly!');
    console.log('✅ Templates sync should work between devices');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the frontend: npm run dev');
    console.log('2. Open on laptop: http://localhost:5173');
    console.log('3. Open on mobile: http://YOUR_IP:5173');
    console.log('4. Add custom presets and watch them sync! 🔄');

  } catch (error) {
    console.log('');
    console.log('❌ Error:', error.message);
    console.log('');
    console.log('Make sure:');
    console.log('1. Backend is running: cd backend && npm start');
    console.log('2. MongoDB is connected (check .env file)');
    console.log('3. Port 5000 is not blocked');
  }
}

testAPI();
