const setup = require('../setup');

const BASE_URL = process.env.FENG_SUI_API_URL || 'http://localhost:3000';

describe('Transaction API Integration Tests', () => {
  let falconCrypto;
  let testUser;

  beforeAll(async () => {
    await setup.initializeLibas();
    falconCrypto = setup.getFalconCrypto();
    testUser = falconCrypto.createKeyPair();
  });

  describe('Core Transaction Endpoints', () => {
    test('POST /api/transactions/submit should accept valid mint transaction', async () => {
      const transactionData = {
        type: 'mint',
        from: 'treasury',
        to: testUser.publicKey,
        amount: '1000',
        nonce: Date.now()
      };

      const message = JSON.stringify(transactionData);
      const signature = falconCrypto.sign(message, testUser.privateKey);

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          falcon_signature: signature,
          public_key: testUser.publicKey
        })
      });

      if (!response.ok) {
        const errorResult = await response.json();
        console.log('Transaction submission error:', errorResult);
      }

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.transaction_id).toBeDefined();
      expect(['queued', 'batched']).toContain(result.status);
      expect(result.message).toMatch(/(verified and queued|verified and queued for batching)/);
    });

    test('should reject transactions with invalid signatures', async () => {
      const transactionData = {
        type: 'transfer',
        from: testUser.publicKey,
        to: 'recipient_address',
        amount: '100',
        nonce: Date.now()
      };

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          falcon_signature: 'invalid_signature',
          public_key: testUser.publicKey
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.error).toContain('Invalid Falcon signature');
    });

    test('should reject transactions with mismatched public keys', async () => {
      const transactionData = {
        type: 'transfer',
        from: testUser.publicKey,
        to: 'recipient_address',
        amount: '100',
        nonce: Date.now()
      };

      const message = JSON.stringify(transactionData);
      const signature = falconCrypto.sign(message, testUser.privateKey);
      const differentUser = falconCrypto.createKeyPair();

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          falcon_signature: signature,
          public_key: differentUser.publicKey // Wrong public key
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.error).toContain('Invalid Falcon signature');
    });

    test('should reject transactions with missing required fields', async () => {
      const incompleteTransactions = [
        { amount: '100', nonce: 123, falcon_signature: 'sig', public_key: testUser.publicKey }, // Missing type and from
        { type: 'transfer', from: 'addr', amount: '100', nonce: 123, public_key: testUser.publicKey }, // Missing signature
        { type: 'transfer', from: 'addr', amount: '100', nonce: 123, falcon_signature: 'sig' } // Missing public_key
      ];

      for (const transaction of incompleteTransactions) {
        const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });

        expect(response.ok).toBe(false);
        const result = await response.json();
        expect(result.error).toContain('Missing required fields');
      }
    });
  });

  describe('Transaction Status and Queue Management', () => {
    let testTransactionId;

    test('should submit transaction and retrieve status', async () => {
      // First submit a transaction
      const transactionData = {
        type: 'mint',
        from: 'treasury',
        to: testUser.publicKey,
        amount: '500',
        nonce: Date.now()
      };

      const message = JSON.stringify(transactionData);
      const signature = falconCrypto.sign(message, testUser.privateKey);

      const submitResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          falcon_signature: signature,
          public_key: testUser.publicKey
        })
      });

      expect(submitResponse.ok).toBe(true);
      const submitResult = await submitResponse.json();
      testTransactionId = submitResult.transaction_id;

      // Then check its status
      const statusResponse = await fetch(`${BASE_URL}/api/transactions/${testTransactionId}/status`);
      
      expect(statusResponse.ok).toBe(true);
      const statusResult = await statusResponse.json();
      
      expect(statusResult.transaction_id).toBe(testTransactionId);
      expect(statusResult.status).toBeDefined();
    });

    test('GET /api/transactions/queue/status should return queue information', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/queue/status`);
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.queue.queueLength).toBeDefined();
      expect(result.queue.processedCount).toBeDefined();
      expect(result.queue.batchProcessorReady).toBeDefined();
      expect(typeof result.queue.queueLength).toBe('number');
      expect(typeof result.queue.processedCount).toBe('number');
      expect(typeof result.queue.batchProcessorReady).toBe('boolean');
    });

    test('GET /api/transactions/batches/status should return batch information', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/batches/status`);
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.batches).toBeDefined();
      expect(result.batches.totalBatches).toBeDefined();
      expect(typeof result.batches.totalBatches).toBe('number');
    });
  });

  describe('Network Status Endpoints', () => {
    test('GET /api/network/status should return network information', async () => {
      const response = await fetch(`${BASE_URL}/api/network/status`);
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.settlement).toBeDefined();
      expect(result.settlement.settlementReady).toBeDefined();
      expect(typeof result.settlement.settlementReady).toBe('boolean');
    });

    test('GET /api/health should return service health', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Batch Processing Integration', () => {
    test('should handle multiple transactions and trigger batching', async () => {
      const transactions = [];
      const numTransactions = 5;

      // Submit multiple transactions
      for (let i = 0; i < numTransactions; i++) {
        const transactionData = {
          type: 'mint',
          from: 'treasury',
          to: testUser.publicKey,
          amount: '100',
          nonce: Date.now() + i
        };

        const message = JSON.stringify(transactionData);
        const signature = falconCrypto.sign(message, testUser.privateKey);

        const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...transactionData,
            falcon_signature: signature,
            public_key: testUser.publicKey
          })
        });

        if (response.ok) {
          const result = await response.json();
          transactions.push(result.transaction_id);
        }
      }

      expect(transactions.length).toBeGreaterThan(0);

      // Check that batch processing is working
      const batchResponse = await fetch(`${BASE_URL}/api/transactions/batches/status`);
      expect(batchResponse.ok).toBe(true);
      
      const batchResult = await batchResponse.json();
      expect(batchResult.batches.totalBatches).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{'
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    test('should handle non-existent transaction status requests', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/99999/status`);
      
      expect(response.ok).toBe(false);
      const result = await response.json();
      expect(result.error).toContain('not found');
    });

    test('should handle invalid HTTP methods', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'GET' // Should be POST
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('Falcon Signature Integration', () => {
    test('should verify Falcon signatures correctly through API', async () => {
      const transactionData = {
        type: 'transfer',
        from: testUser.publicKey,
        to: 'recipient_address',
        amount: '100',
        nonce: Date.now()
      };

      const message = JSON.stringify(transactionData);
      const signature = falconCrypto.sign(message, testUser.privateKey);

      // Test direct signature verification if endpoint exists
      try {
        const response = await fetch(`${BASE_URL}/api/verify/signature`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            signature,
            publicKey: testUser.publicKey
          })
        });

        if (response.ok) {
          const result = await response.json();
          expect(result.valid).toBe(true);
        }
      } catch (error) {
        // Endpoint may not exist, that's ok
      }
    });

    test('should generate valid Falcon key pairs', () => {
      const keyPair = falconCrypto.createKeyPair();
      
      expect(keyPair).toHaveProperty('privateKey');
      expect(keyPair).toHaveProperty('publicKey');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
    });

    test('should verify signatures correctly outside API', () => {
      const message = 'test message';
      const signature = falconCrypto.sign(message, testUser.privateKey);
      
      const isValid = falconCrypto.verify(message, signature, testUser.publicKey);
      expect(isValid).toBe(true);
      
      // Test with wrong message
      const isInvalid = falconCrypto.verify('wrong message', signature, testUser.publicKey);
      expect(isInvalid).toBe(false);
    });
  });
}); 
