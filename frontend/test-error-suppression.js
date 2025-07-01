/**
 * Test Script for Error Suppression System
 * 
 * This script demonstrates how the error suppression system works
 * Run this in the browser console to simulate error conditions
 */

// Test RealTimeService Error Suppression
function testRealTimeErrorSuppression() {
  console.log('🧪 Testing RealTime Service Error Suppression');
  
  // Import the service (adjust path as needed)
  import('./services/realTimeService.js').then(({ default: realTimeService }) => {
    const originalFetch = realTimeService.fetchLatestData;
    let errorCount = 0;
    
    // Mock the fetchLatestData to always fail
    realTimeService.fetchLatestData = async function() {
      errorCount++;
      const error = new Error(`Simulated error ${errorCount}`);
      error.response = { status: 500 };
      throw error;
    };
    
    console.log('✅ Error simulation active. Watch console for suppression after 3 errors.');
    console.log('⏰ Errors will occur every 30 seconds (normal polling interval)');
    
    // Restore original function after 5 minutes
    setTimeout(() => {
      realTimeService.fetchLatestData = originalFetch;
      console.log('🔄 Restored original fetchLatestData function');
    }, 5 * 60 * 1000);
  });
}

// Test Dashboard API Error Suppression
function testDashboardErrorSuppression() {
  console.log('🧪 Testing Dashboard API Error Suppression');
  
  // This would need to be run from within the Dashboard component context
  // You can manually trigger this by clicking the refresh button multiple times
  // when the backend is down
  
  console.log('📝 Manual test steps:');
  console.log('1. Stop the backend server');
  console.log('2. Click the "Actualizar" button multiple times');
  console.log('3. Observe console logs being suppressed after 2 errors per endpoint');
  console.log('4. Look for connection alerts in the UI after 5+ errors');
  console.log('5. Restart backend and click refresh to see recovery logs');
}

// Simulate Backend Outage Scenario
function simulateBackendOutage() {
  console.log('🚨 Simulating Backend Outage Scenario');
  console.log('');
  console.log('Expected behavior:');
  console.log('1. First few errors logged normally');
  console.log('2. Suppression warnings after thresholds');
  console.log('3. Periodic summaries every 2-5 minutes');
  console.log('4. Connection alerts in UI');
  console.log('5. Recovery messages when backend returns');
  console.log('');
  console.log('To test manually:');
  console.log('- Stop backend: npm run dev (in backend folder)');
  console.log('- Navigate to dashboard');
  console.log('- Click refresh button several times');
  console.log('- Wait and observe console logs');
  console.log('- Restart backend and refresh again');
}

// Export test functions
window.testErrorSuppression = {
  realTime: testRealTimeErrorSuppression,
  dashboard: testDashboardErrorSuppression,
  simulate: simulateBackendOutage
};

console.log('🧪 Error Suppression Test Suite Loaded');
console.log('Run testErrorSuppression.realTime() to test polling suppression');
console.log('Run testErrorSuppression.dashboard() for manual test instructions');
console.log('Run testErrorSuppression.simulate() for full scenario simulation');
