const path = require('path');

// Load libas directly for testing
const libas = require('../libas');

async function testFalconIntegration() {
  console.log('🧪 Testing Falcon integration...\n');

  try {
    // 1. Generate a key pair
    console.log('1. Generating Falcon key pair...');
    const keyPair = libas.createKeyPair();
    console.log('✅ Key pair generated');

    // 2. Create a test message
    const message = JSON.stringify({
      type: 'transfer',
      from: '0x123...',
      to: '0x456...',
      amount: '100',
      nonce: 1
    });
    console.log('✅ Test message created');

    // 3. Sign the message
    console.log('2. Signing message...');
    const signature = libas.falconSign(message, keyPair.privateKey);
    console.log('✅ Message signed');

    // 4. Test our API endpoint
    console.log('3. Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/verify/signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        signature,
        publicKey: keyPair.publicKey
      })
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (result.valid) {
      console.log('🎉 SUCCESS: Feng-Sui Network can verify Falcon signatures!');
    } else {
      console.log('❌ FAILED: Signature verification failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFalconIntegration(); 
