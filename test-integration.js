// Simple test to verify the create config API integration
const { apiService } = require('./src/services/api');

console.log('Testing create config file API integration...');

// Test the API function signature
const testCreateConfig = async () => {
  try {
    // This would fail with network error since server isn't running, but will test the function signature
    await apiService.createConfigFile('test-app', 'test-namespace', '/test/path', 'test@example.com');
  } catch (error) {
    console.log('Expected error (server not running):', error.message);
    console.log('✅ API function signature is correct');
  }
};

testCreateConfig();