const setup = require('../setup');

const BASE_URL = process.env.FENG_SUI_API_URL || 'http://localhost:3000';

describe('Balance and Mapping API Integration Tests', () => {
  let falconCrypto;
  let testUser;
  const testSuiAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeAll(async () => {
    await setup.initializeLibas();
    falconCrypto = setup.getFalconCrypto();
    
    // Generate a test user
    testUser = falconCrypto.createKeyPair();
  });

  describe('Address Mapping Endpoints', () => {
    test('POST /api/transactions/register-mapping should register Falcon to Sui mapping', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey,
          sui_address: testSuiAddress
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('mapping registered successfully');
      expect(result.falcon_public_key).toContain(testUser.publicKey.substring(0, 20));
      expect(result.sui_address).toBe(testSuiAddress);
    });

    test('POST /api/transactions/get-mapping should retrieve registered mapping', async () => {
      // First register a mapping (if not already done)
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey,
          sui_address: testSuiAddress
        })
      });

      // Now retrieve the mapping
      const response = await fetch(`${BASE_URL}/api/transactions/get-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.sui_address).toBe(testSuiAddress);
      expect(result.falcon_public_key).toBe(testUser.publicKey);
    });

    test('POST /api/transactions/get-mapping should handle unmapped Falcon keys', async () => {
      const unmappedUser = falconCrypto.createKeyPair();

      const response = await fetch(`${BASE_URL}/api/transactions/get-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: unmappedUser.publicKey
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No Sui address mapping found');
    });

    test('should validate Falcon public key format in mapping endpoints', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: 'invalid-key',
          sui_address: testSuiAddress
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Falcon public key');
    });

    test('should validate Sui address format in mapping registration', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey,
          sui_address: 'invalid-address'
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Sui address');
    });
  });

  describe('Balance Checking Endpoints', () => {
    beforeEach(async () => {
      // Ensure mapping exists for balance tests
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey,
          sui_address: testSuiAddress
        })
      });
    });

    test('POST /api/transactions/check-balance should return balance for mapped Falcon key', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testUser.publicKey
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.address).toBe(testUser.publicKey);
      expect(result.sui_address).toBe(testSuiAddress);
      expect(typeof result.balance).toBe('number');
      expect(result.currency).toBe('QUSD');
    });

    test('GET /api/transactions/balance/:address should work for short addresses', async () => {
      const shortAddress = testSuiAddress; // Use Sui address directly

      const response = await fetch(`${BASE_URL}/api/transactions/balance/${shortAddress}`);

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.address).toBe(shortAddress);
      expect(typeof result.balance).toBe('number');
      expect(result.currency).toBe('QUSD');
    });

    test('POST /api/transactions/verify-balance should verify sufficient balance', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/verify-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testUser.publicKey,
          amount: 5000 // Should be less than mock balance (10000)
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.has_sufficient_balance).toBe(true);
      expect(result.current_balance).toBeGreaterThanOrEqual(5000);
      expect(result.required_amount).toBe(5000);
    });

    test('POST /api/transactions/verify-balance should detect insufficient balance', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/verify-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testUser.publicKey,
          amount: 20000 // Should be more than mock balance (10000)
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.has_sufficient_balance).toBe(false);
      expect(result.current_balance).toBeLessThan(20000);
      expect(result.required_amount).toBe(20000);
      expect(result.shortfall).toBeGreaterThan(0);
    });

    test('should handle unmapped addresses in balance checking', async () => {
      const unmappedUser = falconCrypto.createKeyPair();

      const response = await fetch(`${BASE_URL}/api/transactions/check-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: unmappedUser.publicKey
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.balance).toBe(0);
      expect(result.mapping_status).toBe('unmapped');
    });
  });

  describe('Deposit Instruction Endpoints', () => {
    beforeEach(async () => {
      // Ensure mapping exists for deposit tests
      await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey,
          sui_address: testSuiAddress
        })
      });
    });

    test('POST /api/transactions/deposit-escrow should generate deposit instructions', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/deposit-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: testUser.publicKey,
          amount: 5000
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.deposit_instructions).toBeDefined();
      expect(result.deposit_instructions.amount).toBe(6000); // 5000 + 20% buffer
      expect(result.deposit_instructions.target_address).toBe(testSuiAddress);
      expect(result.deposit_instructions.contract_function).toBe('settlement::deposit_to_escrow');
    });

    test('POST /api/transactions/auto-deposit should generate auto-deposit transaction', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/auto-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: testUser.publicKey,
          amount: 3000
        })
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.auto_deposit).toBeDefined();
      expect(result.auto_deposit.optimized_amount).toBe(3600); // 3000 + 20% buffer
      expect(result.auto_deposit.gas_estimate).toBeDefined();
      expect(result.auto_deposit.transaction_data).toBeDefined();
    });

    test('should handle unmapped addresses in deposit instructions', async () => {
      const unmappedUser = falconCrypto.createKeyPair();

      const response = await fetch(`${BASE_URL}/api/transactions/deposit-escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: unmappedUser.publicKey,
          amount: 1000
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No Sui address mapping found');
    });
  });

  describe('Error Handling and Validation', () => {
    test('should validate required fields in mapping registration', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          falcon_public_key: testUser.publicKey
          // Missing sui_address
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('sui_address');
    });

    test('should validate required fields in balance verification', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/verify-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testUser.publicKey
          // Missing amount
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('amount');
    });

    test('should handle malformed JSON gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/register-mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{'
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    test('should handle negative amounts in balance verification', async () => {
      const response = await fetch(`${BASE_URL}/api/transactions/verify-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testUser.publicKey,
          amount: -1000
        })
      });

      expect(response.ok).toBe(false);
      const result = await response.json();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('positive');
    });
  });
}); 
