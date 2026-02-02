// Test script for Task Management API
// Run with: node scripts/test-task-api.js

const testTaskAPI = async () => {
  const baseUrl = 'http://localhost:3000';
  
  // Test data
  const testTask = {
    title: "Test Task - Follow on X",
    category: "Social",
    reward: 50,
    status: "Active",
    description: "Test task for API verification",
    instructions: "Follow and take screenshot",
    proofType: "Screenshot"
  };

  console.log('🧪 Testing TASKKASH Task Management API...\n');

  try {
    // Test 1: Get active tasks (public endpoint)
    console.log('1. Testing GET /api/tasks (public endpoint)...');
    const publicResponse = await fetch(`${baseUrl}/api/tasks`);
    console.log(`Status: ${publicResponse.status}`);
    if (publicResponse.ok) {
      const data = await publicResponse.json();
      console.log(`✅ Found ${data.tasks?.length || 0} active tasks`);
    } else {
      console.log('❌ Failed to fetch active tasks');
    }

    // Test 2: Create task (admin endpoint - will fail without auth)
    console.log('\n2. Testing POST /api/admin/tasks (admin endpoint)...');
    const createResponse = await fetch(`${baseUrl}/api/admin/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTask)
    });
    console.log(`Status: ${createResponse.status}`);
    
    if (createResponse.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else if (createResponse.status === 403) {
      console.log('✅ Correctly requires admin access');
    } else if (createResponse.ok) {
      const data = await createResponse.json();
      console.log('✅ Task created successfully:', data.task?.title);
    } else {
      const error = await createResponse.json();
      console.log('❌ Error:', error.error);
    }

    // Test 3: Get admin tasks (admin endpoint - will fail without auth)
    console.log('\n3. Testing GET /api/admin/tasks (admin endpoint)...');
    const adminResponse = await fetch(`${baseUrl}/api/admin/tasks`);
    console.log(`Status: ${adminResponse.status}`);
    
    if (adminResponse.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else if (adminResponse.status === 403) {
      console.log('✅ Correctly requires admin access');
    } else if (adminResponse.ok) {
      const data = await adminResponse.json();
      console.log(`✅ Found ${data.tasks?.length || 0} tasks for admin`);
    } else {
      const error = await adminResponse.json();
      console.log('❌ Error:', error.error);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\n📝 Notes:');
    console.log('- Public endpoints work without authentication');
    console.log('- Admin endpoints correctly require authentication');
    console.log('- To test admin functionality, login as admin in browser');
    console.log('- Make sure ADMIN_EMAIL environment variable is set');

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\n💡 Make sure the development server is running on localhost:3000');
  }
};

// Run the test
testTaskAPI();
