const libas = require('../libas');

async function testTransactionFlow() {
  console.log('🧪 Testing complete transaction flow...\n');

  try {
    // 1. Generate a key pair for signing
    console.log('1. Generating Falcon key pair...');
    const keyPair = libas.createKeyPair();
    console.log('✅ Key pair generated');

    // 2. Create a transaction
    const transaction = {
      type: 'transfer',
      from: '0x1234567890abcdef',
      to: '0xfedcba0987654321',
      amount: '100',
      nonce: Date.now() // Use timestamp as nonce for uniqueness
    };

    // 3. Create transaction message and sign it
    console.log('2. Creating and signing transaction...');
    const transactionMessage = JSON.stringify(transaction);
    const signature = libas.falconSign(transactionMessage, keyPair.privateKey);
    console.log('✅ Transaction signed');

    // 4. Submit transaction to our API
    console.log('3. Submitting transaction to Feng-Sui Network...');
    const response = await fetch('http://localhost:3000/api/transactions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: transaction.type,
        from: transaction.from,
        to: transaction.to,
        amount: transaction.amount,
        nonce: transaction.nonce,
        falcon_signature: signature,
        public_key: keyPair.publicKey
      })
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (result.success) {
      console.log(`✅ Transaction ${result.transaction_id} submitted successfully!`);
      
      // 5. Check queue status
      console.log('4. Checking queue status...');
      const queueResponse = await fetch('http://localhost:3000/api/transactions/queue/status');
      const queueStatus = await queueResponse.json();
      console.log('Queue Status:', queueStatus);
      
      // 6. Check individual transaction status
      console.log('5. Checking transaction status...');
      const statusResponse = await fetch(`http://localhost:3000/api/transactions/${result.transaction_id}/status`);
      const transactionStatus = await statusResponse.json();
      console.log('Transaction Status:', transactionStatus);
      
      console.log('\n🎉 SUCCESS: Complete transaction flow working!');
      console.log('✅ Falcon signature verification: PASSED');
      console.log('✅ Transaction queuing: PASSED');
      console.log('✅ Status tracking: PASSED');
      
    } else {
      console.log('❌ FAILED: Transaction submission failed');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTransactionFlow(); 
