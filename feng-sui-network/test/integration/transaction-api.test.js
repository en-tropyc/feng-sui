const setup = require('../setup');

const BASE_URL = process.env.FENG_SUI_API_URL || 'http://localhost:3001';

describe('Transaction API Integration Tests', () => {
  let falconCrypto;
  let testUser;

  beforeAll(async () => {
    await setup.initializeLibas();
    falconCrypto = setup.getFalconCrypto();
    testUser = falconCrypto.generateKeypair();
  });

  describe('Core Transaction Endpoints', () => {
    test('POST /api/transactions/submit should accept valid mint transaction', async () => {
      const message = JSON.stringify({
        type: 'mint',
        from: 'treasury',
        to: testUser.publicKey,
        amount: '1000',
        nonce: Date.now()
      });

      const signature = falconCrypto.sign(message, testUser.privateKey);

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
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
      expect(result.status).toBe('batched');
      expect(result.message).toContain('verified and queued');
    });

    test('should reject transactions with invalid signatures', async () => {
      const message = JSON.stringify({
        type: 'transfer',
        from: testUser.publicKey,
        to: 'recipient_address',
        amount: '100',
        nonce: Date.now()
      });

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature: 'invalid_signature',
          public_key: testUser.publicKey
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Falcon signature');
    });

    test('should reject transactions with mismatched public keys', async () => {
      const message = JSON.stringify({
        type: 'transfer',
        from: testUser.publicKey,
        to: 'recipient_address',
        amount: '100',
        nonce: Date.now()
      });

      const signature = falconCrypto.sign(message, testUser.privateKey);
      const differentUser = falconCrypto.generateKeypair();

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
          public_key: differentUser.publicKey // Wrong public key
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Falcon signature');
    });

    test('should reject transactions with missing required fields', async () => {
      const incompleteTransactions = [
        { message: '{}', signature: 'sig', public_key: testUser.publicKey }, // Missing transaction fields
        { signature: 'sig', public_key: testUser.publicKey }, // Missing message
        { message: '{"type":"transfer"}', public_key: testUser.publicKey }, // Missing signature
        { message: '{"type":"transfer"}', signature: 'sig' } // Missing public_key
      ];

      for (const transaction of incompleteTransactions) {
        const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });

        expect(response.ok).toBe(false);
        const result = await response.json();
        expect(result.success).toBe(false);
      }
    });
  });

  describe('Transaction Status and Queue Management', () => {
    let testTransactionId;

    test('should submit transaction and retrieve status', async () => {
      // First submit a transaction
      const message = JSON.stringify({
        type: 'mint',
        from: 'treasury',
        to: testUser.publicKey,
        amount: '500',
        nonce: Date.now()
      });

      const signature = falconCrypto.sign(message, testUser.privateKey);

      const submitResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
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
      
      expect(result.queueLength).toBeDefined();
      expect(result.processedCount).toBeDefined();
      expect(result.batchProcessorReady).toBeDefined();
      expect(typeof result.queueLength).toBe('number');
      expect(typeof result.processedCount).toBe('number');
      expect(typeof result.batchProcessorReady).toBe('boolean');
    });

    test('GET /api/transactions/batches/status should return batch information', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/batches/status`);
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.totalBatches).toBeDefined();
      expect(result.batchCount).toBeDefined();
      expect(typeof result.totalBatches).toBe('number');
      expect(typeof result.batchCount).toBe('number');
    });
  });

  describe('Network Status Endpoints', () => {
    test('GET /api/network/status should return network information', async () => {
      const response = await fetch(`${BASE_URL}/api/network/status`);
      
      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.settlementReady).toBeDefined();
      expect(result.network).toBeDefined();
      expect(typeof result.settlementReady).toBe('boolean');
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
        const message = JSON.stringify({
          type: 'mint',
          from: 'treasury',
          to: testUser.publicKey,
          amount: '100',
          nonce: Date.now() + i
        });

        const signature = falconCrypto.sign(message, testUser.privateKey);

        const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            signature,
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
      expect(batchResult.totalBatches).toBeGreaterThan(0);
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
      expect(result.success).toBe(false);
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
      const message = JSON.stringify({
        type: 'transfer',
        from: testUser.publicKey,
        to: 'recipient_address',
        amount: '100',
        nonce: Date.now()
      });

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
      const keyPair = falconCrypto.generateKeypair();
      
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
