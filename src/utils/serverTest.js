/**
 * Server connection test utility
 */
import { API_CONFIG } from '../constants';

export const testServerConnection = async () => {
  try {
    console.log('🔍 Testing server connection...');
    console.log('🎯 Target URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`);
    
    // First, test basic connectivity with a simple fetch
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });
    
    console.log('📡 Server response status:', response.status);
    console.log('📡 Server response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📡 Server response body:', text);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      body: text
    };
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    
    return {
      success: false,
      error: error.message,
      type: error.name
    };
  }
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  window.testServerConnection = testServerConnection;
}