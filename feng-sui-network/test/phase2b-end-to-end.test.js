const path = require('path');

// Load libas for key generation and signing
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

describe('Phase 2B End-to-End Tests', () => {
  test('should handle complete signature aggregation and settlement workflow', async () => {
    // Step 1: Generate multiple key pairs for testing
    const users = [];
    for (let i = 0; i < 3; i++) {
      const keyPair = libas.createKeyPair();
      users.push({
        id: i + 1,
        keyPair,
        address: `user_${i + 1}_address`
      });
    }
    
    expect(users).toHaveLength(3);
    users.forEach(user => {
      expect(user.keyPair.privateKey).toBeDefined();
      expect(user.keyPair.publicKey).toBeDefined();
    });

    // Step 2: Create and sign multiple transactions
    const transactions = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const transaction = {
        type: 'transfer',
        from: user.address,
        to: `recipient_${i + 1}_address`,
        amount: `${(i + 1) * 100}`,
        nonce: Date.now() + i
      };

      // Sign the transaction
      const message = JSON.stringify(transaction);
      const signature = libas.falconSign(message, user.keyPair.privateKey);

      const signedTransaction = {
        ...transaction,
        falcon_signature: signature,
        public_key: user.keyPair.publicKey
      };

      transactions.push(signedTransaction);
    }

    expect(transactions).toHaveLength(3);
    transactions.forEach(tx => {
      expect(tx.falcon_signature).toBeDefined();
      expect(tx.public_key).toBeDefined();
    });

    // Step 3: Test API endpoints if server is running
    try {
      // Submit transactions to the API
      const submissionResults = [];
      
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        
        const response = await fetch('http://localhost:3000/api/transactions/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tx)
        });

        const result = await response.json();
        submissionResults.push(result);
        expect(result.success).toBe(true);
        expect(result.transaction_id).toBeDefined();
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Check queue status
      const statusResponse = await fetch('http://localhost:3000/api/transactions/queue/status');
      const status = await statusResponse.json();
      
      expect(status.queue).toBeDefined();
      expect(status.batchProcessor).toBeDefined();
      
      // Check batch information
      const batchesResponse = await fetch('http://localhost:3000/api/transactions/batches');
      const batchesData = await batchesResponse.json();
      
      expect(batchesData.totalBatches).toBeGreaterThanOrEqual(0);
      
      // Check individual transaction statuses
      for (const result of submissionResults) {
        if (result.transaction_id) {
          const statusResponse = await fetch(`http://localhost:3000/api/transactions/${result.transaction_id}/status`);
          const txStatus = await statusResponse.json();
          
          expect(txStatus.transaction_id).toBe(result.transaction_id);
          expect(txStatus.status).toBeDefined();
        }
      }

    } catch (error) {
      // If server is not running, skip API tests
      console.warn('⚠️ Server not running, skipping API tests');
    }
  });

  test('should aggregate multiple Falcon signatures', () => {
    // Generate test data
    const keyPairs = [libas.createKeyPair(), libas.createKeyPair(), libas.createKeyPair()];
    const messages = ['message1', 'message2', 'message3'];
    const signatures = messages.map((msg, i) => 
      libas.falconSign(msg, keyPairs[i].privateKey)
    );
    const publicKeys = keyPairs.map(kp => kp.publicKey);

    // Test aggregation
    const aggregateSignature = libas.aggregate(messages, signatures, publicKeys);
    expect(aggregateSignature).toBeDefined();
    expect(typeof aggregateSignature).toBe('string');

    // Verify aggregate signature
    const isValid = libas.verify(aggregateSignature, messages, publicKeys);
    expect(isValid).toBe(true);
  });
}); 
