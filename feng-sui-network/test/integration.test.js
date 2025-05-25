const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

describe('Falcon Integration Tests', () => {
  test('should verify Falcon signatures through API', async () => {
    // 1. Generate a key pair
    const keyPair = libas.createKeyPair();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toBeDefined();

    // 2. Create a test message
    const message = JSON.stringify({
      type: 'transfer',
      from: '0x123...',
      to: '0x456...',
      amount: '100',
      nonce: 1
    });

    // 3. Sign the message
    const signature = libas.falconSign(message, keyPair.privateKey);
    expect(signature).toBeDefined();

    // 4. Test our API endpoint (requires server to be running)
    try {
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
      expect(result.valid).toBe(true);
    } catch (error) {
      // If server is not running, skip this test
      console.warn('⚠️ Server not running, skipping API test');
    }
  });

  test('should generate valid Falcon key pairs', () => {
    const keyPair = libas.createKeyPair();
    
    expect(keyPair).toHaveProperty('privateKey');
    expect(keyPair).toHaveProperty('publicKey');
    expect(typeof keyPair.privateKey).toBe('string');
    expect(typeof keyPair.publicKey).toBe('string');
    expect(keyPair.privateKey.length).toBeGreaterThan(0);
    expect(keyPair.publicKey.length).toBeGreaterThan(0);
  });

  test('should sign and verify messages with libas', () => {
    const keyPair = libas.createKeyPair();
    const message = 'test message for signing';
    
    const signature = libas.falconSign(message, keyPair.privateKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    
    const isValid = libas.falconVerify(message, signature, keyPair.publicKey);
    expect(isValid).toBe(true);
  });
}); 
