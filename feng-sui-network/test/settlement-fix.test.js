const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

const SuiSettlement = require('../src/core/SuiSettlement');

describe('Settlement Fix Tests', () => {
  let settlement;

  beforeAll(async () => {
    settlement = new SuiSettlement();
    await settlement.initialize();
  });

  test('should settle batch with correct sequence', async () => {
    try {
      // Create a test batch
      const keyPair = libas.createKeyPair();
      const transaction = {
        type: 'transfer',
        from: '0x1234567890abcdef',
        to: '0xfedcba0987654321',
        amount: '100',
        nonce: Date.now()
      };

      const transactionMessage = JSON.stringify(transaction);
      const signature = libas.falconSign(transactionMessage, keyPair.privateKey);

      const testBatch = {
        id: 999, // Batch ID doesn't matter anymore
        transactions: [{
          id: 1,
          type: transaction.type,
          from: transaction.from,
          to: transaction.to,
          amount: transaction.amount,
          nonce: transaction.nonce,
          falcon_signature: signature,
          public_key: keyPair.publicKey,
          message: transactionMessage
        }],
        aggregateSignature: signature
      };

      console.log('🧪 Testing settlement with automatic sequence detection...');
      
      const result = await settlement.callSettleTransfers(testBatch);
      console.log('✅ Settlement successful!');
      console.log('📋 Result:', {
        txHash: result.txHash,
        sequence: result.sequence,
        batchId: result.batchId,
        onChain: result.onChain
      });

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
      expect(result.sequence).toBeDefined();
      expect(result.onChain).toBe(true);

    } catch (error) {
      console.error('❌ Settlement test failed:', error.message);
      throw error;
    }
  });

  test('should get updated sequence after settlement', async () => {
    try {
      const currentSequence = await settlement.getCurrentSequence();
      console.log('📊 Current sequence after settlement:', currentSequence);
      
      expect(currentSequence).toBeGreaterThan(2); // Should be at least 3 now
      
    } catch (error) {
      console.error('❌ Failed to get sequence:', error.message);
      throw error;
    }
  });
}); 
