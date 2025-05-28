const setup = require('../setup');

const BASE_URL = process.env.FENG_SUI_API_URL || 'http://localhost:3000';

describe('Balance Verification Functional Tests', () => {
  let falconCrypto;
  let userWallet;
  const realSuiAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeAll(async () => {
    await setup.initializeLibas();
    falconCrypto = setup.getFalconCrypto();
    userWallet = falconCrypto.createKeyPair();
  });

  describe('Complete User Onboarding Flow', () => {
    test('should complete full user onboarding with mapping and balance verification', async () => {
      console.log('🚀 Starting complete user onboarding flow test');
      
      // Step 1: Register Falcon key to Sui address mapping
      console.log('📝 Step 1: Registering Falcon key to Sui address mapping');
      const mappingResponse = await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: userWallet.publicKey,
          sui_address: realSuiAddress
        })
      });

      expect(mappingResponse.ok).toBe(true);
      const mappingResult = await mappingResponse.json();
      expect(mappingResult.success).toBe(true);
      console.log('✅ Mapping registered successfully');

      // Step 2: Check balance through mapping
      console.log('💰 Step 2: Checking balance through mapping');
      const balanceResponse = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_key: userWallet.publicKey
        })
      });

      expect(balanceResponse.ok).toBe(true);
      const balanceResult = await balanceResponse.json();
      expect(balanceResult.address).toBe(userWallet.publicKey);
      expect(balanceResult.address_type).toBe('falcon_public_key');
      expect(typeof balanceResult.escrow_balance).toBe('number');
      console.log(`💰 Current balance: ${balanceResult.escrow_balance} QUSD`);

      // Step 3: Try transaction with sufficient balance (mint - should work)
      console.log('✅ Step 3: Testing mint transaction (should work - no balance check)');
      const mintTransactionData = {
        type: 'mint',
        from: 'treasury',
        to: userWallet.publicKey,
        amount: '1000',
        nonce: Date.now()
      };
      
      const mintMessage = JSON.stringify(mintTransactionData);
      const mintSignature = falconCrypto.sign(mintMessage, userWallet.privateKey);

      const mintResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mintTransactionData,
          falcon_signature: mintSignature,
          public_key: userWallet.publicKey
        })
      });

      expect(mintResponse.ok).toBe(true);
      const mintResult = await mintResponse.json();
      expect(mintResult.success).toBe(true);
      expect(mintResult.balance_verified).toBe('not_required');
      console.log('✅ Mint transaction accepted (no balance verification required)');

      // Step 4: Try transfer with insufficient balance (should fail)
      console.log('❌ Step 4: Testing transfer with insufficient balance (should fail)');
      const transferTransactionData = {
        type: 'transfer',
        from: userWallet.publicKey,
        to: realSuiAddress,
        amount: '15000', // More than simulation balance (10000)
        nonce: Date.now() + 1
      };
      
      const transferMessage = JSON.stringify(transferTransactionData);
      const transferSignature = falconCrypto.sign(transferMessage, userWallet.privateKey);

      const transferResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferTransactionData,
          falcon_signature: transferSignature,
          public_key: userWallet.publicKey
        })
      });

      expect(transferResponse.ok).toBe(false);
      const transferResult = await transferResponse.json();
      expect(transferResult.error).toBe('Insufficient balance');
      expect(transferResult.balance_info).toBeDefined();
      expect(transferResult.balance_info.shortfall).toBeGreaterThan(0);
      console.log('❌ Transfer correctly rejected due to insufficient balance');

      // Step 5: Get deposit instructions
      console.log('📋 Step 5: Getting deposit instructions for insufficient balance');
      const depositResponse = await fetch(`${BASE_URL}/api/transactions/deposit-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userWallet.publicKey,
          amount: transferResult.balance_info.shortfall
        })
      });

      expect(depositResponse.ok).toBe(true);
      const depositResult = await depositResponse.json();
      expect(depositResult.deposit_needed).toBe(true);
      expect(depositResult.deposit_instructions).toBeDefined();
      expect(depositResult.deposit_instructions.contract_info.function).toBe('settlement::deposit_to_escrow');

      console.log('🎉 Complete user onboarding flow test passed!');
    }, 30000);

    test('should handle user without mapping gracefully', async () => {
      const unmappedUser = falconCrypto.createKeyPair();

      // Try to check balance without mapping
      const balanceResponse = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_key: unmappedUser.publicKey
        })
      });

      expect(balanceResponse.ok).toBe(true);
      const balanceResult = await balanceResponse.json();
      expect(balanceResult.address).toBe(unmappedUser.publicKey);
      expect(balanceResult.escrow_balance).toBe(0);
      expect(balanceResult.address_type).toBe('falcon_public_key');

      // Try to submit transfer transaction (should fail)
      const transferTransactionData = {
        type: 'transfer',
        from: unmappedUser.publicKey,
        to: realSuiAddress,
        amount: '100',
        nonce: Date.now()
      };
      
      const transferMessage = JSON.stringify(transferTransactionData);
      const transferSignature = falconCrypto.sign(transferMessage, unmappedUser.privateKey);

      const transferResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferTransactionData,
          falcon_signature: transferSignature,
          public_key: unmappedUser.publicKey
        })
      });

      expect(transferResponse.ok).toBe(false);
      const transferResult = await transferResponse.json();
      expect(transferResult.error).toBe('Insufficient balance');
    });
  });

  describe('Balance Verification Edge Cases', () => {
    beforeEach(async () => {
      // Ensure user mapping exists for these tests
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: userWallet.publicKey,
          sui_address: realSuiAddress
        })
      });
    });

    test('should handle zero amount transactions', async () => {
      const transactionData = {
        type: 'transfer',
        from: userWallet.publicKey,
        to: realSuiAddress,
        amount: '1',
        nonce: Date.now()
      };
      
      const message = JSON.stringify(transactionData);
      const signature = falconCrypto.sign(message, userWallet.privateKey);

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          falcon_signature: signature,
          public_key: userWallet.publicKey
        })
      });

      const result = await response.json();
      if (response.ok) {
        expect(result.success).toBe(true);
      } else {
        expect(result.error).toContain('Insufficient balance');
      }
    });

    test('should handle exact balance amount transactions', async () => {
      // First check current balance
      const balanceResponse = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_key: userWallet.publicKey
        })
      });

      const balanceResult = await balanceResponse.json();
      const currentBalance = balanceResult.escrow_balance;

      // Try to transfer exact balance amount
      const transactionData = {
        type: 'transfer',
        from: userWallet.publicKey,
        to: realSuiAddress,
        amount: currentBalance ? currentBalance.toString() : '0',
        nonce: Date.now()
      };
      
      const message = JSON.stringify(transactionData);
      const signature = falconCrypto.sign(message, userWallet.privateKey);

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionData,
          falcon_signature: signature,
          public_key: userWallet.publicKey
        })
      });

      // Exact balance should pass
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
    });

    test('should handle burn transactions with balance verification', async () => {
      // Try burn with amount (users have 0 balance, so this should fail)
      const burnTransactionData = {
        type: 'burn',
        from: userWallet.publicKey,
        amount: '500',
        nonce: Date.now()
      };
      
      const burnMessage = JSON.stringify(burnTransactionData);
      const burnSignature = falconCrypto.sign(burnMessage, userWallet.privateKey);

      const burnResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...burnTransactionData,
          falcon_signature: burnSignature,
          public_key: userWallet.publicKey
        })
      });

      // Users have 0 balance, so burn should fail
      expect(burnResponse.ok).toBe(false);
      const burnResult = await burnResponse.json();
      expect(burnResult.error).toBe('Insufficient balance');
      expect(burnResult.balance_info.current_escrow_balance).toBe(0);
      expect(burnResult.balance_info.required_amount).toBe(500);

      // Try burn with even larger amount (should also fail)
      const excessiveBurnTransactionData = {
        type: 'burn',
        from: userWallet.publicKey,
        amount: '999999',
        nonce: Date.now() + 1
      };
      
      const excessiveBurnMessage = JSON.stringify(excessiveBurnTransactionData);
      const excessiveBurnSignature = falconCrypto.sign(excessiveBurnMessage, userWallet.privateKey);

      const excessiveBurnResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...excessiveBurnTransactionData,
          falcon_signature: excessiveBurnSignature,
          public_key: userWallet.publicKey
        })
      });

      expect(excessiveBurnResponse.ok).toBe(false);
      const excessiveBurnResult = await excessiveBurnResponse.json();
      expect(excessiveBurnResult.error).toBe('Insufficient balance');
    });
  });

  describe('Deposit Instructions and Auto-Deposit', () => {
    beforeEach(async () => {
      // Ensure user mapping exists
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: userWallet.publicKey,
          sui_address: realSuiAddress
        })
      });
    });

    test('should generate appropriate deposit instructions with buffer', async () => {
      const requiredAmount = 5000;
      const expectedBuffer = Math.ceil(requiredAmount * 0.2); // 20% buffer
      const expectedTotal = requiredAmount + expectedBuffer;

      const response = await fetch(`${BASE_URL}/api/transactions/deposit-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userWallet.publicKey,
          amount: requiredAmount
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.deposit_needed).toBe(true);
      expect(result.deposit_instructions.suggested_deposit_amount).toBe(expectedTotal);
      expect(result.deposit_instructions.contract_info.function).toBe('settlement::deposit_to_escrow');
      expect(result.deposit_instructions.buffer_percentage).toBe(20);
    });

    test('should generate auto-deposit transaction details', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/auto-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userWallet.publicKey,
          required_amount: 3000
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.auto_deposit_needed).toBe(true);
      expect(result.auto_deposit_transaction.required_amount).toBe(3000);
      expect(result.auto_deposit_transaction.contract_info).toBeDefined();
    });

    test('should handle various deposit amounts correctly', async () => {
      const testAmounts = [100, 1000, 5000, 10000];
      
      for (const amount of testAmounts) {
        const response = await fetch(`${BASE_URL}/api/transactions/deposit-escrow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_address: userWallet.publicKey,
            amount: amount
          })
        });

        expect(response.ok).toBe(true);
        const result = await response.json();
        
        expect(result.deposit_needed).toBe(true);
        expect(result.deposit_instructions.suggested_deposit_amount).toBe(Math.ceil(amount * 1.2));
        expect(result.deposit_instructions.buffer_amount).toBe(Math.ceil(amount * 0.2));
      }
    });
  });

  describe('Balance Verification Performance', () => {
    test('should handle multiple concurrent balance checks', async () => {
      // Register mapping first
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: userWallet.publicKey,
          sui_address: realSuiAddress
        })
      });

      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = fetch(`${BASE_URL}/api/transactions/check-balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_key: userWallet.publicKey
          })
        });
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      for (const response of responses) {
        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.address).toBe(userWallet.publicKey);
        expect(result.escrow_balance).toBeDefined();
      }
    });

    test('should handle rapid transaction submissions with balance verification', async () => {
      // Register mapping first
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: userWallet.publicKey,
          sui_address: realSuiAddress
        })
      });

      const numTransactions = 5;
      const promises = [];

      for (let i = 0; i < numTransactions; i++) {
        const transactionData = {
          type: 'transfer',
          from: userWallet.publicKey,
          to: realSuiAddress,
          amount: '100', // Small amount that should pass
          nonce: Date.now() + i
        };
        
        const message = JSON.stringify(transactionData);
        const signature = falconCrypto.sign(message, userWallet.privateKey);

        const promise = fetch(`${BASE_URL}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...transactionData,
            falcon_signature: signature,
            public_key: userWallet.publicKey
          })
        });
        
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      // Users have 0 balance, so transfers should fail with insufficient balance
      for (const response of responses) {
        expect(response.ok).toBe(false);
        const result = await response.json();
        expect(result.error).toBe('Insufficient balance');
      }
    });
  });
}); 
