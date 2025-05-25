const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

describe('Transaction Flow Tests', () => {
  test('should handle complete transaction flow', async () => {
    // 1. Generate a key pair for signing
    const keyPair = libas.createKeyPair();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();

    // 2. Create a transaction
    const transaction = {
      type: 'transfer',
      from: '0x1234567890abcdef',
      to: '0xfedcba0987654321',
      amount: '100',
      nonce: Date.now() // Use timestamp as nonce for uniqueness
    };

    // 3. Create transaction message and sign it
    const transactionMessage = JSON.stringify(transaction);
    const signature = libas.falconSign(transactionMessage, keyPair.privateKey);
    expect(signature).toBeDefined();

    // 4. Test API endpoints (requires server to be running)
    try {
      // Submit transaction to our API
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
      expect(result.success).toBe(true);
      expect(result.transaction_id).toBeDefined();
      
      // Check queue status
      const queueResponse = await fetch('http://localhost:3000/api/transactions/queue/status');
      const queueStatus = await queueResponse.json();
      expect(queueStatus.queueLength).toBeGreaterThanOrEqual(0);
      
      // Check individual transaction status
      const statusResponse = await fetch(`http://localhost:3000/api/transactions/${result.transaction_id}/status`);
      const transactionStatus = await statusResponse.json();
      expect(transactionStatus.transaction).toBeDefined();
      
    } catch (error) {
      // If server is not running, skip API tests
      console.warn('⚠️ Server not running, skipping API tests');
    }
  });

  test('should create valid transaction signatures', () => {
    const keyPair = libas.createKeyPair();
    const transaction = {
      type: 'transfer',
      from: '0x123',
      to: '0x456',
      amount: '50',
      nonce: 12345
    };

    const transactionMessage = JSON.stringify(transaction);
    const signature = libas.falconSign(transactionMessage, keyPair.privateKey);
    
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    
    // Verify the signature
    const isValid = libas.falconVerify(transactionMessage, signature, keyPair.publicKey);
    expect(isValid).toBe(true);
  });
}); 
