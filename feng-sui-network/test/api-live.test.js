const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

describe('Live API Tests', () => {
  const baseUrl = 'http://localhost:3000';
  let testTransactionId;

  beforeAll(async () => {
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  test('should get queue status', async () => {
    const response = await fetch(`${baseUrl}/api/transactions/queue/status`);
    expect(response.ok).toBe(true);
    
    const status = await response.json();
    expect(status.queue).toBeDefined();
    expect(status.batchProcessor).toBeDefined();
    expect(status.service).toBe('TransactionQueue');
    
    console.log('📊 Queue Status:', {
      queueLength: status.queue.queueLength,
      processedCount: status.queue.processedCount,
      batchProcessorReady: status.queue.batchProcessorReady
    });
  });

  test('should submit a transaction via API', async () => {
    // Generate test data
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

    // Submit transaction
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
    
    testTransactionId = result.transaction_id;
    console.log('✅ Transaction submitted:', testTransactionId);
  });

  test('should get transaction status', async () => {
    if (!testTransactionId) {
      throw new Error('No test transaction ID available');
    }

    const response = await fetch(`${baseUrl}/api/transactions/${testTransactionId}/status`);
    expect(response.ok).toBe(true);
    
    const status = await response.json();
    expect(status.transaction_id).toBeDefined();
    expect(status.transaction_id).toBe(testTransactionId);
    
    console.log('📋 Transaction Status:', {
      id: status.transaction_id,
      status: status.status,
      type: status.type
    });
  });

  test('should get batches list', async () => {
    const response = await fetch(`${baseUrl}/api/transactions/batches`);
    expect(response.ok).toBe(true);
    
    const status = await response.json();
    expect(status.batches).toBeDefined();
    expect(status.totalBatches).toBeDefined();
    
    console.log('🔄 Batches Status:', {
      totalBatches: status.totalBatches,
      batchCount: status.batches.length
    });
  });

  test('should get network status', async () => {
    const response = await fetch(`${baseUrl}/api/transactions/network/status`);
    expect(response.ok).toBe(true);
    
    const status = await response.json();
    expect(status.network).toBeDefined();
    expect(status.settlement_ready).toBeDefined();
    
    console.log('🌐 Network Status:', {
      settlementReady: status.settlement_ready,
      network: status.network?.environment || 'unknown'
    });
  });

  test('should submit multiple transactions and trigger batching', async () => {
    const transactions = [];
    
    // Submit 3 transactions
    for (let i = 0; i < 3; i++) {
      const keyPair = libas.createKeyPair();
      const transaction = {
        type: 'transfer',
        from: `0x${i.toString().padStart(40, '0')}`,
        to: `0x${(i + 1).toString().padStart(40, '0')}`,
        amount: (100 + i * 10).toString(),
        nonce: Date.now() + i
      };

      const transactionMessage = JSON.stringify(transaction);
      const signature = libas.falconSign(transactionMessage, keyPair.privateKey);

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
      transactions.push(result.transaction_id);
    }

    console.log('📦 Submitted batch of transactions:', transactions);

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check final queue status
    const queueResponse = await fetch(`${baseUrl}/api/transactions/queue/status`);
    const queueStatus = await queueResponse.json();
    
    console.log('📊 Final Queue Status:', {
      queueLength: queueStatus.queue.queueLength,
      processedCount: queueStatus.queue.processedCount,
      totalBatches: queueStatus.batchProcessor.totalBatches
    });

    expect(queueStatus.queue.processedCount).toBeGreaterThan(0);
  }, 10000); // Increase timeout to 10 seconds
}); 
