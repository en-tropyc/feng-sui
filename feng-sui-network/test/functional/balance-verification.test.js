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
          address: userWallet.publicKey
        })
      });

      expect(balanceResponse.ok).toBe(true);
      const balanceResult = await balanceResponse.json();
      expect(balanceResult.success).toBe(true);
      expect(balanceResult.sui_address).toBe(realSuiAddress);
      expect(typeof balanceResult.balance).toBe('number');
      console.log(`💰 Current balance: ${balanceResult.balance} QUSD`);

      // Step 3: Try transaction with sufficient balance (mint - should work)
      console.log('✅ Step 3: Testing mint transaction (should work - no balance check)');
      const mintMessage = JSON.stringify({
        type: 'mint',
        from: 'treasury',
        to: userWallet.publicKey,
        amount: '1000',
        nonce: Date.now()
      });

      const mintSignature = falconCrypto.sign(mintMessage, userWallet.privateKey);

      const mintResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: mintMessage,
          signature: mintSignature,
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
      const transferMessage = JSON.stringify({
        type: 'transfer',
        from: userWallet.publicKey,
        to: realSuiAddress,
        amount: '15000', // More than simulation balance (10000)
        nonce: Date.now() + 1
      });

      const transferSignature = falconCrypto.sign(transferMessage, userWallet.privateKey);

      const transferResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transferMessage,
          signature: transferSignature,
          public_key: userWallet.publicKey
        })
      });

      expect(transferResponse.ok).toBe(false);
      const transferResult = await transferResponse.json();
      expect(transferResult.success).toBe(false);
      expect(transferResult.error).toContain('Insufficient balance');
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
      expect(depositResult.success).toBe(true);
      expect(depositResult.deposit_instructions).toBeDefined();
      expect(depositResult.deposit_instructions.target_address).toBe(realSuiAddress);
      console.log('📋 Deposit instructions generated successfully');

      console.log('🎉 Complete user onboarding flow test passed!');
    }, 30000);

    test('should handle user without mapping gracefully', async () => {
      const unmappedUser = falconCrypto.createKeyPair();

      // Try to check balance without mapping
      const balanceResponse = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: unmappedUser.publicKey
        })
      });

      expect(balanceResponse.ok).toBe(true);
      const balanceResult = await balanceResponse.json();
      expect(balanceResult.success).toBe(true);
      expect(balanceResult.balance).toBe(0);
      expect(balanceResult.mapping_status).toBe('unmapped');

      // Try to submit transfer transaction (should fail)
      const transferMessage = JSON.stringify({
        type: 'transfer',
        from: unmappedUser.publicKey,
        to: realSuiAddress,
        amount: '100',
        nonce: Date.now()
      });

      const transferSignature = falconCrypto.sign(transferMessage, unmappedUser.privateKey);

      const transferResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transferMessage,
          signature: transferSignature,
          public_key: unmappedUser.publicKey
        })
      });

      expect(transferResponse.ok).toBe(false);
      const transferResult = await transferResponse.json();
      expect(transferResult.success).toBe(false);
      expect(transferResult.error).toContain('Insufficient balance');
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
      const message = JSON.stringify({
        type: 'transfer',
        from: userWallet.publicKey,
        to: realSuiAddress,
        amount: '0',
        nonce: Date.now()
      });

      const signature = falconCrypto.sign(message, userWallet.privateKey);

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
          public_key: userWallet.publicKey
        })
      });

      // Zero amount should pass balance verification
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
    });

    test('should handle exact balance amount transactions', async () => {
      // First check current balance
      const balanceResponse = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: userWallet.publicKey
        })
      });

      const balanceResult = await balanceResponse.json();
      const currentBalance = balanceResult.balance;

      // Try to transfer exact balance amount
      const message = JSON.stringify({
        type: 'transfer',
        from: userWallet.publicKey,
        to: realSuiAddress,
        amount: currentBalance.toString(),
        nonce: Date.now()
      });

      const signature = falconCrypto.sign(message, userWallet.privateKey);

      const response = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
          public_key: userWallet.publicKey
        })
      });

      // Exact balance should pass
      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
    });

    test('should handle burn transactions with balance verification', async () => {
      // Try burn with amount less than balance
      const burnMessage = JSON.stringify({
        type: 'burn',
        from: userWallet.publicKey,
        amount: '5000', // Less than simulation balance (10000)
        nonce: Date.now()
      });

      const burnSignature = falconCrypto.sign(burnMessage, userWallet.privateKey);

      const burnResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: burnMessage,
          signature: burnSignature,
          public_key: userWallet.publicKey
        })
      });

      expect(burnResponse.ok).toBe(true);
      const burnResult = await burnResponse.json();
      expect(burnResult.success).toBe(true);

      // Try burn with amount more than balance
      const excessiveBurnMessage = JSON.stringify({
        type: 'burn',
        from: userWallet.publicKey,
        amount: '20000', // More than simulation balance (10000)
        nonce: Date.now() + 1
      });

      const excessiveBurnSignature = falconCrypto.sign(excessiveBurnMessage, userWallet.privateKey);

      const excessiveBurnResponse = await fetch(`${BASE_URL}/api/transactions/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: excessiveBurnMessage,
          signature: excessiveBurnSignature,
          public_key: userWallet.publicKey
        })
      });

      expect(excessiveBurnResponse.ok).toBe(false);
      const excessiveBurnResult = await excessiveBurnResponse.json();
      expect(excessiveBurnResult.success).toBe(false);
      expect(excessiveBurnResult.error).toContain('Insufficient balance');
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
      
      expect(result.success).toBe(true);
      expect(result.deposit_instructions.amount).toBe(expectedTotal);
      expect(result.deposit_instructions.target_address).toBe(realSuiAddress);
      expect(result.deposit_instructions.contract_function).toBe('settlement::deposit_to_escrow');
      expect(result.deposit_instructions.buffer_percentage).toBe(20);
    });

    test('should generate auto-deposit transaction details', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/auto-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userWallet.publicKey,
          amount: 3000
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.auto_deposit.optimized_amount).toBe(3600); // 3000 + 20%
      expect(result.auto_deposit.gas_estimate).toBeDefined();
      expect(result.auto_deposit.transaction_data).toBeDefined();
      expect(result.auto_deposit.target_address).toBe(realSuiAddress);
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
        
        expect(result.success).toBe(true);
        expect(result.deposit_instructions.amount).toBe(Math.ceil(amount * 1.2));
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
            address: userWallet.publicKey
          })
        });
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      for (const response of responses) {
        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.success).toBe(true);
        expect(result.balance).toBeDefined();
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
        const message = JSON.stringify({
          type: 'transfer',
          from: userWallet.publicKey,
          to: realSuiAddress,
          amount: '100', // Small amount that should pass
          nonce: Date.now() + i
        });

        const signature = falconCrypto.sign(message, userWallet.privateKey);

        const promise = fetch(`${BASE_URL}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            signature,
            public_key: userWallet.publicKey
          })
        });
        
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      // All should succeed (small amounts within balance)
      for (const response of responses) {
        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.success).toBe(true);
      }
    });
  });
}); 
