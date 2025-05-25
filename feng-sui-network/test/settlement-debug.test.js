const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

const SuiSettlement = require('../src/core/SuiSettlement');

describe('Settlement Debug Tests', () => {
  let settlement;

  beforeAll(async () => {
    settlement = new SuiSettlement();
    await settlement.initialize();
  });

  test('should check current settlement state', async () => {
    try {
      // Get current network status
      const networkStatus = await settlement.getNetworkStatus();
      console.log('🌐 Network Status:', networkStatus);

      // Get contract info
      const contractInfo = settlement.getContractInfo();
      console.log('📋 Contract Info:', contractInfo);

      // Try to get the current settlement state from the contract
      const settlementStateId = settlement.settlementStateId;
      console.log('🏛️ Settlement State ID:', settlementStateId);

      // Query the settlement state object to see current sequence
      const settlementState = await settlement.client.getObject({
        id: settlementStateId,
        options: {
          showContent: true,
          showType: true
        }
      });

      console.log('📊 Current Settlement State:', JSON.stringify(settlementState, null, 2));

      if (settlementState.data && settlementState.data.content && settlementState.data.content.fields) {
        const fields = settlementState.data.content.fields;
        console.log('🔢 Current Sequence:', fields.sequence || 'Not found');
        console.log('📈 Settlement Fields:', fields);
      }

    } catch (error) {
      console.error('❌ Error checking settlement state:', error.message);
    }
  });

  test('should test settlement with correct sequence', async () => {
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
        id: 1, // Try with sequence 1
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
        aggregateSignature: signature // For testing, use single signature
      };

      console.log('🧪 Testing settlement with batch ID 1...');
      
      // Try to settle with different sequence numbers
      for (let seq = 0; seq <= 3; seq++) {
        try {
          console.log(`🔄 Trying sequence ${seq}...`);
          testBatch.id = seq;
          
          const result = await settlement.callSettleTransfers(testBatch);
          console.log(`✅ Success with sequence ${seq}:`, result.txHash);
          break; // If successful, stop trying
          
        } catch (error) {
          console.log(`❌ Sequence ${seq} failed:`, error.message.substring(0, 100));
        }
      }

    } catch (error) {
      console.error('❌ Settlement test error:', error.message);
    }
  });

  test('should check treasury balance', async () => {
    try {
      const treasuryId = settlement.treasuryId;
      console.log('🏛️ Treasury ID:', treasuryId);

      const treasury = await settlement.client.getObject({
        id: treasuryId,
        options: {
          showContent: true,
          showType: true
        }
      });

      console.log('💰 Treasury State:', JSON.stringify(treasury, null, 2));

    } catch (error) {
      console.error('❌ Error checking treasury:', error.message);
    }
  });
}); 
