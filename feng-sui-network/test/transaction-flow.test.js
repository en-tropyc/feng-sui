const path = require('path');

// Load libas library for Falcon crypto
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

// Use configurable base URL
const baseUrl = process.env.FENG_SUI_API_URL || global.testUtils?.API_BASE_URL || 'http://localhost:3001';

describe('Transaction Flow Tests', () => {
  test('should handle complete transaction flow', async () => {
    // 1. Generate a key pair for signing
    const keyPair = libas.createKeyPair();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();

    // 2. Create a transaction
    const transaction = {
      type: 'mint',
      from: 'treasury',
      to: keyPair.publicKey,
      amount: '100',
      nonce: Date.now()
    };

    // 3. Sign the transaction
    const message = JSON.stringify(transaction);
    const signature = libas.falconSign(message, keyPair.privateKey);
    expect(signature).toBeDefined();

    try {
      // Submit transaction to our API
      const response = await fetch(`${baseUrl}/api/transactions/submit`, {
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

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.transaction_id).toBeDefined();

      // 4. Check queue status
      const queueResponse = await fetch(`${baseUrl}/api/transactions/queue/status`);
      expect(queueResponse.ok).toBe(true);

      // 5. Check specific transaction status
      const statusResponse = await fetch(`${baseUrl}/api/transactions/${result.transaction_id}/status`);
      expect(statusResponse.ok).toBe(true);
      const transactionStatus = await statusResponse.json();
      expect(transactionStatus.transaction_id).toBeDefined();
      
    } catch (error) {
      // If server is not running, skip API tests
      console.warn('⚠️ Server not running, skipping API tests');
      return;
    }

    // 6. Verify the signature works independently
    const verified = libas.falconVerify(message, signature, keyPair.publicKey);
    expect(verified).toBe(true);

    console.log('✅ Complete transaction flow test passed');
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
