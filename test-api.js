/**
 * Simple API Test Script
 * Run with: node test-api.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testManualMode() {
  console.log('\n🧪 Testing Manual Mode...');
  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: 'TEST',
        mode: 'manual',
        data: {
          currentPrice: 500,
          eps: 25.30,
          historicalGrowth: 10,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Manual Mode Failed:', data);
      return false;
    }

    console.log('✅ Manual Mode Success!');
    console.log('Scenarios:', data.scenarios.map(s => `${s.type}: ${s.marginOfSafety.toFixed(1)}%`));
    return true;
  } catch (error) {
    console.error('❌ Manual Mode Error:', error.message);
    return false;
  }
}

async function testAutoMode() {
  console.log('\n🤖 Testing Auto Mode with AAPL...');
  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: 'AAPL',
        mode: 'auto',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Auto Mode Failed:', data);
      return false;
    }

    console.log('✅ Auto Mode Success!');
    console.log('Company:', data.companyName);
    console.log('Current Price:', data.currentPrice);
    console.log('EPS:', data.eps);
    console.log('Scenarios:', data.scenarios.map(s => `${s.type}: ${s.marginOfSafety.toFixed(1)}%`));
    return true;
  } catch (error) {
    console.error('❌ Auto Mode Error:', error.message);
    return false;
  }
}

async function main() {
  console.log(`🚀 Testing API at: ${API_URL}`);

  // Test 1: Manual Mode (doesn't need API key)
  const manualSuccess = await testManualMode();

  // Test 2: Auto Mode (needs API key)
  const autoSuccess = await testAutoMode();

  console.log('\n📊 Test Summary:');
  console.log(`Manual Mode: ${manualSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auto Mode: ${autoSuccess ? '✅ PASS' : '❌ FAIL'}`);

  if (!manualSuccess || !autoSuccess) {
    process.exit(1);
  }
}

main();
