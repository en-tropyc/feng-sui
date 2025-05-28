const axios = require('axios');
const { FalconCrypto } = require('./src/crypto/FalconCrypto');

async function testApiSettlement() {
  console.log('🧪 Testing API Settlement End-to-End...\n');
  
  try {
    // Initialize Falcon crypto for signing
    const falcon = new FalconCrypto();
    await falcon.initialize();
    console.log('✅ FalconCrypto initialized');
    
    // Generate a keypair for testing
    const { publicKey, privateKey } = await falcon.generateKeyPair();
    const fromAddress = `0x${publicKey.slice(0, 40)}`;
    const toAddress = '0x456789abcdef0123456789abcdef0123456789ab';
    
    // Create transaction data
    const transactionData = {
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount: 100,
      nonce: Date.now()
    };
    
    console.log('📝 Transaction Data:', transactionData);
    
    // Sign the transaction
    const message = JSON.stringify(transactionData);
    const signature = await falcon.sign(message, privateKey);
    console.log('✅ Transaction signed with Falcon signature');
    
    // Submit transaction to API
    console.log('\n📤 Submitting transaction to API...');
    const response = await axios.post('http://localhost:3000/api/transactions', {
      ...transactionData,
      signature: signature
    });
    
    console.log('✅ Transaction submitted successfully');
    console.log('📋 Response:', response.data);
    
    // Wait a moment for processing
    console.log('\n⏳ Waiting for batch processing...');
    await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds for batch processing
    
    // Check queue status
    console.log('\n📊 Checking queue status...');
    const queueResponse = await axios.get('http://localhost:3000/api/transactions/queue/status');
    console.log('📋 Queue Status:', JSON.stringify(queueResponse.data, null, 2));
    
    // Check if settlement worked
    const batchProcessor = queueResponse.data.batchProcessor;
    if (batchProcessor.statusCounts.settled > 0) {
      console.log('\n🎉 SUCCESS! Settlement is working correctly!');
      console.log(`✅ Total settled batches: ${batchProcessor.statusCounts.settled}`);
    } else {
      console.log('\n⚠️  No batches settled yet, but transaction was accepted');
    }
    
    // Get transaction status if available
    try {
      const statusResponse = await axios.get(`http://localhost:3000/api/transactions/${response.data.transactionId}/status`);
      console.log('\n📋 Transaction Status:', statusResponse.data);
    } catch (error) {
      console.log('\n📋 Transaction status endpoint not available');
    }
    
  } catch (error) {
    console.error('❌ API settlement test failed:', error.message);
    if (error.response) {
      console.error('📋 Error response:', error.response.data);
    }
    process.exit(1);
  }
}

testApiSettlement(); 
