const path = require('path');
const FalconCrypto = require('../../src/core/FalconCrypto');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../../libas');
const libas = require(libasPath);

describe('FalconCrypto', () => {
  let crypto;

  beforeAll(async () => {
    crypto = new FalconCrypto();
    await crypto.initialize();
  });

  test('should initialize successfully', () => {
    expect(crypto.isReady()).toBe(true);
  });

  test('should verify valid Falcon signatures', () => {
    const keyPair = libas.createKeyPair();
    const message = 'test message';
    const signature = libas.falconSign(message, keyPair.privateKey);

    const isValid = crypto.verifySignature(message, signature, keyPair.publicKey);
    expect(isValid).toBe(true);
  });

  test('should reject invalid Falcon signatures', () => {
    const keyPair = libas.createKeyPair();
    const message = 'test message';
    const wrongMessage = 'wrong message';
    const signature = libas.falconSign(message, keyPair.privateKey);

    const isValid = crypto.verifySignature(wrongMessage, signature, keyPair.publicKey);
    expect(isValid).toBe(false);
  });

  test('should aggregate multiple signatures', () => {
    const keyPairs = [libas.createKeyPair(), libas.createKeyPair()];
    const messages = ['message1', 'message2'];
    const signatures = messages.map((msg, i) => 
      libas.falconSign(msg, keyPairs[i].privateKey)
    );
    const publicKeys = keyPairs.map(kp => kp.publicKey);

    const aggregateSignature = crypto.aggregateSignatures(messages, signatures, publicKeys);
    expect(aggregateSignature).toBeDefined();
    expect(typeof aggregateSignature).toBe('string');
  });

  test('should verify aggregate signatures', () => {
    const keyPairs = [libas.createKeyPair(), libas.createKeyPair()];
    const messages = ['message1', 'message2'];
    const signatures = messages.map((msg, i) => 
      libas.falconSign(msg, keyPairs[i].privateKey)
    );
    const publicKeys = keyPairs.map(kp => kp.publicKey);

    const aggregateSignature = crypto.aggregateSignatures(messages, signatures, publicKeys);
    const isValid = crypto.verifyAggregateSignature(aggregateSignature, messages, publicKeys);
    
    expect(isValid).toBe(true);
  });
}); 
