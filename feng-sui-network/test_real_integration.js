#!/usr/bin/env node

const path = require('path');
const http = require('http');

// Load libas for creating test transactions
const libasPath = path.join(__dirname, '../libas');
const libas = require(libasPath);

console.log('🧪 Testing Real QUSD Contract Integration');
console.log('=' .repeat(50));

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testIntegration() {
  try {
    // Test 1: Check contract information
    console.log('📦 Testing contract information...');
    const contractsResponse = await makeRequest('GET', '/api/transactions/contracts');
    console.log('Contract Info:', JSON.stringify(contractsResponse.data, null, 2));

    // Test 2: Check network status
    console.log('\n🌐 Testing network status...');
    const networkResponse = await makeRequest('GET', '/api/transactions/network/status');
    console.log('Network Status:', JSON.stringify(networkResponse.data, null, 2));

    // Test 3: Submit real transactions
    console.log('\n📝 Creating and submitting test transactions...');
    
    const users = [];
    for (let i = 0; i < 3; i++) {
      const keyPair = libas.createKeyPair();
      users.push({
        id: i + 1,
        keyPair,
        address: `user_${i + 1}_address`
      });
    }

    const submissionResults = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const transaction = {
        type: 'transfer',
        from: user.address,
        to: `recipient_${i + 1}_address`,
        amount: `${(i + 1) * 100}`,
        nonce: Date.now() + i
      };

      const transactionMessage = JSON.stringify(transaction);
      const signature = libas.falconSign(transactionMessage, user.keyPair.privateKey);

      const submissionData = {
        ...transaction,
        falcon_signature: signature,
        public_key: user.keyPair.publicKey
      };

      console.log(`📤 Submitting transaction ${i + 1}...`);
      const response = await makeRequest('POST', '/api/transactions/submit', submissionData);
      submissionResults.push(response);
      
      if (response.status === 200) {
        console.log(`✅ Transaction ${i + 1} submitted: ID ${response.data.transaction_id}`);
      } else {
        console.log(`❌ Transaction ${i + 1} failed:`, response.data);
      }
    }

    // Test 4: Wait for processing and check results
    console.log('\n⏳ Waiting for batch processing (7 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 7000));

    // Check queue status
    console.log('\n📊 Checking queue status...');
    const queueResponse = await makeRequest('GET', '/api/transactions/queue/status');
    console.log('Queue Status:', JSON.stringify(queueResponse.data, null, 2));

    // Check batches
    console.log('\n📦 Checking batches...');
    const batchesResponse = await makeRequest('GET', '/api/transactions/batches');
    console.log('Batches:', JSON.stringify(batchesResponse.data, null, 2));

    // Check individual transaction statuses
    console.log('\n🔍 Checking transaction statuses...');
    for (const result of submissionResults) {
      if (result.status === 200 && result.data.transaction_id) {
        const statusResponse = await makeRequest('GET', `/api/transactions/${result.data.transaction_id}/status`);
        console.log(`Transaction ${result.data.transaction_id}:`, JSON.stringify(statusResponse.data, null, 2));
      }
    }

    console.log('\n🎉 Integration test completed!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the test
testIntegration(); 
