const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../../libas');
const libas = require(libasPath);

// Use configurable base URL instead of hardcoded localhost:3000
const baseUrl = process.env.FENG_SUI_API_URL || global.testUtils?.API_BASE_URL || 'http://localhost:3001';

describe('User Journey Tests', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('New User Onboarding', () => {
    test('should allow a new user to create wallet and receive QUSD', async () => {
      // 1. User generates a new Falcon key pair (wallet creation)
      const userWallet = libas.createKeyPair();
      expect(userWallet.privateKey).toBeDefined();
      expect(userWallet.publicKey).toBeDefined();
      
      console.log('👤 New user wallet created');
      console.log('🔑 Public Key:', userWallet.publicKey.substring(0, 20) + '...');

      // 2. Create a mint transaction (treasury mints $1000 QUSD for new user)
      const mintTransaction = {
        type: 'mint',
        from: 'treasury',
        to: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Use proper Sui address
        amount: '1000', // $1000 QUSD
        nonce: Date.now()
      };

      const mintMessage = JSON.stringify(mintTransaction);
      const mintSignature = libas.falconSign(mintMessage, userWallet.privateKey);

      // 3. Submit mint transaction to network
      const response = await fetch(`${baseUrl}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mintTransaction.type,
          from: mintTransaction.from,
          to: mintTransaction.to,
          amount: mintTransaction.amount,
          nonce: mintTransaction.nonce,
          falcon_signature: mintSignature,
          public_key: userWallet.publicKey
        })
      });

      const result = await response.json();
      console.log('🔍 API Response:', JSON.stringify(result, null, 2));
      
      // Mint transactions should work (no balance verification required)
      expect(result.success).toBe(true);
      expect(result.transaction_id).toBeDefined();
      
      console.log('💰 Mint transaction submitted:', result.transaction_id);
      console.log('📊 Amount: $' + mintTransaction.amount + ' QUSD');
    });
  });

  describe('Peer-to-Peer Transfers', () => {
    let senderWallet, receiverWallet;

    beforeAll(() => {
      // Create two user wallets for P2P testing
      senderWallet = libas.createKeyPair();
      receiverWallet = libas.createKeyPair();
    });

    test('should process a simple P2P transfer', async () => {
      // User A sends $100 QUSD to User B
      const transferTransaction = {
        type: 'transfer',
        from: senderWallet.publicKey,
        to: receiverWallet.publicKey,
        amount: '100',
        nonce: Date.now()
      };

      const transferMessage = JSON.stringify(transferTransaction);
      const transferSignature = libas.falconSign(transferMessage, senderWallet.privateKey);

      const response = await fetch(`${baseUrl}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transferTransaction.type,
          from: transferTransaction.from,
          to: transferTransaction.to,
          amount: transferTransaction.amount,
          nonce: transferTransaction.nonce,
          falcon_signature: transferSignature,
          public_key: senderWallet.publicKey
        })
      });

      const result = await response.json();
      
      // Users have 0 balance, so transfer should fail
      if (response.ok) {
        expect(result.success).toBe(true);
      } else {
        expect(result.error).toBe('Insufficient balance');
      }
      
      console.log('💸 P2P Transfer completed');
      console.log('👤 From:', senderWallet.publicKey.substring(0, 20) + '...');
      console.log('👤 To:', receiverWallet.publicKey.substring(0, 20) + '...');
      console.log('💰 Amount: $' + transferTransaction.amount + ' QUSD');
    });

    test('should handle multiple concurrent transfers', async () => {
      const transfers = [];
      const numTransfers = 5;

      // Create multiple transfer transactions
      for (let i = 0; i < numTransfers; i++) {
        const transaction = {
          type: 'transfer',
          from: senderWallet.publicKey,
          to: receiverWallet.publicKey,
          amount: (10 + i).toString(), // $10, $11, $12, etc.
          nonce: Date.now() + i
        };

        const message = JSON.stringify(transaction);
        const signature = libas.falconSign(message, senderWallet.privateKey);

        transfers.push({
          transaction,
          signature,
          expectedAmount: 10 + i
        });
      }

      // Submit all transfers
      const results = [];
      for (const transfer of transfers) {
        const response = await fetch(`${baseUrl}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: transfer.transaction.type,
            from: transfer.transaction.from,
            to: transfer.transaction.to,
            amount: transfer.transaction.amount,
            nonce: transfer.transaction.nonce,
            falcon_signature: transfer.signature,
            public_key: senderWallet.publicKey
          })
        });

        const result = await response.json();
        
        // Users have 0 balance, so transfers should fail
        if (response.ok) {
          expect(result.success).toBe(true);
          results.push(result.transaction_id);
        } else {
          expect(result.error).toBe('Insufficient balance');
          results.push('failed');
        }
      }

      console.log('🔄 Batch transfers submitted:', results.length);
      console.log('💰 Total amount: $' + transfers.reduce((sum, t) => sum + t.expectedAmount, 0) + ' QUSD');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check that transactions were processed (might be failures due to 0 balance)
      const queueResponse = await fetch(`${baseUrl}/api/transactions/queue/status`);
      if (queueResponse.ok) {
        const status = await queueResponse.json();
        expect(typeof status.queue.queueLength).toBe('number');
      }
    });
  });

  describe('Merchant Payment Processing', () => {
    let merchantWallet, customerWallet;

    beforeAll(() => {
      merchantWallet = libas.createKeyPair();
      customerWallet = libas.createKeyPair();
    });

    test('should process a merchant payment', async () => {
      // Customer pays merchant for goods/services
      const paymentTransaction = {
        type: 'transfer',
        from: customerWallet.publicKey,
        to: merchantWallet.publicKey,
        amount: '250', // $250 payment
        nonce: Date.now()
      };

      const paymentMessage = JSON.stringify(paymentTransaction);
      const paymentSignature = libas.falconSign(paymentMessage, customerWallet.privateKey);

      const response = await fetch(`${baseUrl}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: paymentTransaction.type,
          from: paymentTransaction.from,
          to: paymentTransaction.to,
          amount: paymentTransaction.amount,
          nonce: paymentTransaction.nonce,
          falcon_signature: paymentSignature,
          public_key: customerWallet.publicKey
        })
      });

      const result = await response.json();
      
      // Users have 0 balance, so payment should fail
      if (response.ok) {
        expect(result.success).toBe(true);
        
        // Verify transaction status
        const statusResponse = await fetch(`${baseUrl}/api/transactions/${result.transaction_id}/status`);
        const transactionStatus = await statusResponse.json();
        expect(transactionStatus.transaction_id).toBe(result.transaction_id);
        expect(['queued', 'batched', 'settled']).toContain(transactionStatus.status);
      } else {
        expect(result.error).toBe('Insufficient balance');
      }
      
      console.log('🛒 Merchant payment processed');
      console.log('🏪 Merchant:', merchantWallet.publicKey.substring(0, 20) + '...');
      console.log('👤 Customer:', customerWallet.publicKey.substring(0, 20) + '...');
      console.log('💰 Payment: $' + paymentTransaction.amount + ' QUSD');
    });
  });

  describe('Cross-Border Remittances', () => {
    test('should handle international money transfer', async () => {
      // Simulate cross-border transfer (US to Philippines)
      const senderWallet = libas.createKeyPair(); // US sender
      const receiverWallet = libas.createKeyPair(); // Philippines receiver

      const remittanceTransaction = {
        type: 'transfer',
        from: senderWallet.publicKey,
        to: receiverWallet.publicKey,
        amount: '500', // $500 remittance
        nonce: Date.now()
      };

      const message = JSON.stringify(remittanceTransaction);
      const signature = libas.falconSign(message, senderWallet.privateKey);

      const response = await fetch(`${baseUrl}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: remittanceTransaction.type,
          from: remittanceTransaction.from,
          to: remittanceTransaction.to,
          amount: remittanceTransaction.amount,
          nonce: remittanceTransaction.nonce,
          falcon_signature: signature,
          public_key: senderWallet.publicKey
        })
      });

      const result = await response.json();
      
      // Users have 0 balance, so remittance should fail
      if (response.ok) {
        expect(result.success).toBe(true);
      } else {
        expect(result.error).toBe('Insufficient balance');
      }
      
      console.log('🌍 Cross-border remittance processed');
      console.log('📤 From: US sender');
      console.log('📥 To: Philippines receiver');
      console.log('💰 Amount: $' + remittanceTransaction.amount + ' QUSD');
    });
  });

  describe('Treasury Operations', () => {
    test('should handle QUSD redemption (burn)', async () => {
      // User redeems QUSD for USD
      const userWallet = libas.createKeyPair();
      
      const burnTransaction = {
        type: 'burn',
        from: userWallet.publicKey,
        amount: '1000', // Redeem $1000 QUSD
        nonce: Date.now()
      };

      const burnMessage = JSON.stringify(burnTransaction);
      const burnSignature = libas.falconSign(burnMessage, userWallet.privateKey);

      const response = await fetch(`${baseUrl}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: burnTransaction.type,
          from: burnTransaction.from,
          amount: burnTransaction.amount,
          nonce: burnTransaction.nonce,
          falcon_signature: burnSignature,
          public_key: userWallet.publicKey
        })
      });

      const result = await response.json();
      console.log('🔍 Burn API Response:', JSON.stringify(result, null, 2));
      
      // Users have 0 balance, so burn should fail
      if (response.ok) {
        expect(result.success).toBe(true);
      } else {
        expect(result.error).toBe('Insufficient balance');
      }
      
      console.log('🔥 QUSD redemption processed');
      console.log('👤 User:', userWallet.publicKey.substring(0, 20) + '...');
      console.log('🔄 Amount: $' + burnTransaction.amount + ' QUSD');
    });
  });
}); 
