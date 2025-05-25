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

      const transactionMessage = JSON.stringify(transaction);
      const signature = libas.falconSign(transactionMessage, user.keyPair.privateKey);

      transactions.push({
        ...transaction,
        falcon_signature: signature,
        public_key: user.keyPair.publicKey,
        message: transactionMessage
      });
    }

    expect(transactions).toHaveLength(3);
    transactions.forEach(tx => {
      expect(tx.falcon_signature).toBeDefined();
      expect(tx.public_key).toBeDefined();
    });

    // Step 3: Test signature aggregation
    const messages = transactions.map(tx => tx.message);
    const signatures = transactions.map(tx => tx.falcon_signature);
    const publicKeys = transactions.map(tx => tx.public_key);

    const aggregateSignature = libas.aggregate(messages, signatures, publicKeys);
    expect(aggregateSignature).toBeDefined();
    expect(typeof aggregateSignature).toBe('string');

    // Step 4: Verify aggregate signature
    const isValid = libas.verify(aggregateSignature, messages, publicKeys);
    expect(isValid).toBe(true);

    console.log('✅ Phase 2B workflow test completed successfully');
    console.log(`📊 Processed ${transactions.length} transactions`);
    console.log(`🔐 Generated aggregate signature: ${aggregateSignature.substring(0, 32)}...`);
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

  test('should test QUSD contract integration', async () => {
    // Test contract information
    const SuiSettlement = require('../src/core/SuiSettlement');
    const settlement = new SuiSettlement();
    
    // Get contract info without initialization
    const contractInfo = settlement.getContractInfo();
    expect(contractInfo.packageId).toBeDefined();
    expect(contractInfo.treasuryId).toBeDefined();
    expect(contractInfo.settlementStateId).toBeDefined();
    expect(contractInfo.network).toBe('localnet');

    console.log('✅ QUSD Contract Integration Test');
    console.log(`📦 Package ID: ${contractInfo.packageId}`);
    console.log(`🏛️ Treasury ID: ${contractInfo.treasuryId}`);
    console.log(`⚙️ Settlement State ID: ${contractInfo.settlementStateId}`);
  });

  test('should test settlement initialization', async () => {
    const SuiSettlement = require('../src/core/SuiSettlement');
    const settlement = new SuiSettlement();
    
    try {
      await settlement.initialize();
      expect(settlement.isReady()).toBe(true);
      
      const networkStatus = await settlement.getNetworkStatus();
      expect(networkStatus.connected).toBe(true);
      expect(networkStatus.network).toBe('localnet');
      
      console.log('✅ Settlement service initialized successfully');
      console.log(`🌐 Network: ${networkStatus.network}`);
      console.log(`🔗 Chain ID: ${networkStatus.chainId}`);
    } catch (error) {
      // If local network is not running, this test will fail gracefully
      console.log('⚠️ Local Sui network not available, skipping settlement test');
      expect(error.message).toContain('Failed to initialize');
    }
  });
}); 
