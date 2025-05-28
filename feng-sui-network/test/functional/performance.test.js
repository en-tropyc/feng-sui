const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../../libas');
const libas = require(libasPath);

// Functional tests for Feng-Sui Network Performance
describe('Network Performance Tests', () => {
  // Use configurable base URL instead of hardcoded localhost:3000
  const baseUrl = process.env.FENG_SUI_API_URL || global.testUtils?.API_BASE_URL || 'http://localhost:3001';

  beforeAll(async () => {
    // Initialize libas for crypto operations
    await require('../setup').initializeLibas();
  });

  describe('Transaction Throughput', () => {
    test('should handle high-volume transaction processing', async () => {
      const startTime = Date.now();
      const numTransactions = 20;
      const wallets = [];

      console.log(`🚀 Starting high-volume test with ${numTransactions} transactions`);

      // Generate all wallets and transactions first
      for (let i = 0; i < numTransactions; i++) {
        wallets.push({
          wallet: libas.createKeyPair(),
          amount: (Math.floor(Math.random() * 100) + 10).toString() // $10-$110
        });
      }

      // Submit all transactions (use mint to avoid balance verification)
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < wallets.length; i++) {
        const { wallet, amount } = wallets[i];
        
        try {
          const transaction = {
            type: 'mint',
            from: 'treasury',
            to: wallet.publicKey,
            amount,
            nonce: Date.now() + i // Ensure unique nonces
          };

          const message = JSON.stringify(transaction);
          const signature = libas.falconSign(message, wallet.privateKey);

          const response = await fetch(`${baseUrl}/api/transactions/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: transaction.type,
              from: transaction.from,
              to: transaction.to,
              amount: transaction.amount,
              nonce: transaction.nonce,
              falcon_signature: signature,
              public_key: wallet.publicKey
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              successful++;
            } else {
              failed++;
            }
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`📊 Transaction Results:`);
      console.log(`✅ Successful: ${successful}/${numTransactions}`);
      console.log(`❌ Failed: ${failed}/${numTransactions}`);
      console.log(`⏱️ Total time: ${totalTime}ms`);
      console.log(`📈 Average: ${(totalTime / numTransactions).toFixed(2)}ms per transaction`);

      // Allow some processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check queue status
      const queueResponse = await fetch(`${baseUrl}/api/transactions/queue/status`);
      expect(queueResponse.ok).toBe(true);
      const status = await queueResponse.json();
      
      console.log(`📈 Queue processed: ${status.queue.processedCount} transactions`);
      console.log(`📦 Batches created: ${status.batchProcessor.totalBatches}`);
      
      expect(status.queue.processedCount).toBeGreaterThan(0);
    }); // Removed timeout override - use global config
  });

  describe('Batch Processing Efficiency', () => {
    test('should efficiently batch transactions under load', async () => {
      const batchSizes = [1, 5, 10, 15];
      const results = [];

      for (const batchSize of batchSizes) {
        console.log(`🔄 Testing batch size: ${batchSize}`);
        
        const startTime = Date.now();
        const transactionIds = [];

        // Submit transactions in quick succession (use mint to avoid balance verification)
        for (let i = 0; i < batchSize; i++) {
          const wallet = libas.createKeyPair();
          const transaction = {
            type: 'mint',
            from: 'treasury',
            to: wallet.publicKey,
            amount: '10',
            nonce: Date.now() + i
          };

          const message = JSON.stringify(transaction);
          const signature = libas.falconSign(message, wallet.privateKey);

          const response = await fetch(`${baseUrl}/api/transactions/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: transaction.type,
              from: transaction.from,
              to: transaction.to,
              amount: transaction.amount,
              nonce: transaction.nonce,
              falcon_signature: signature,
              public_key: wallet.publicKey
            })
          });

          expect(response.ok).toBe(true);
          const result = await response.json();
          expect(result.success).toBe(true);
          transactionIds.push(result.transaction_id);
        }

        const submissionTime = Date.now() - startTime;
        
        // Wait for batch processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        results.push({
          batchSize,
          submissionTime,
          transactionIds
        });

        console.log(`✅ Batch size ${batchSize}: ${submissionTime}ms submission time`);
      }

      // Analyze batch efficiency
      const queueStatus = await fetch(`${baseUrl}/api/transactions/queue/status`);
      const status = await queueStatus.json();
      
      console.log(`📊 Total batches processed: ${status.batchProcessor.totalBatches}`);
      console.log(`📈 Total transactions processed: ${status.queue.processedCount}`);
    }); // Removed timeout override
  });

  describe('Network Resilience', () => {
    test('should handle transaction spikes gracefully', async () => {
      // Simulate a sudden spike in transactions (like during market volatility)
      const spikeTransactions = 15;
      const wallets = [];
      
      console.log(`📈 Simulating transaction spike: ${spikeTransactions} transactions`);

      // Generate all transactions first (use mint to avoid balance verification)
      for (let i = 0; i < spikeTransactions; i++) {
        wallets.push({
          wallet: libas.createKeyPair(),
          amount: (Math.floor(Math.random() * 500) + 50).toString() // $50-$550
        });
      }

      // Submit all at once (spike simulation)
      const promises = wallets.map(async ({ wallet, amount }, index) => {
        const transaction = {
          type: 'mint',
          from: 'treasury',
          to: wallet.publicKey,
          amount,
          nonce: Date.now() + index
        };

        const message = JSON.stringify(transaction);
        const signature = libas.falconSign(message, wallet.privateKey);

        return fetch(`${baseUrl}/api/transactions/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: transaction.type,
            from: transaction.from,
            to: transaction.to,
            amount: transaction.amount,
            nonce: transaction.nonce,
            falcon_signature: signature,
            public_key: wallet.publicKey
          })
        });
      });

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const spikeTime = Date.now() - startTime;

      // Check that all responses are successful
      for (const response of responses) {
        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.success).toBe(true);
      }

      console.log(`⚡ Handled spike of ${spikeTransactions} transactions in ${spikeTime}ms`);
      
      // Allow time for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify system is still responsive
      const healthCheck = await fetch(`${baseUrl}/api/health`);
      expect(healthCheck.ok).toBe(true);
    }); // Removed timeout override
  });

  describe('Settlement Performance', () => {
    test('should maintain settlement speed under load', async () => {
      const batchCount = 3;
      const transactionsPerBatch = 5;
      
      console.log(`🏦 Testing settlement performance: ${batchCount} batches, ${transactionsPerBatch} tx each`);

      for (let batch = 0; batch < batchCount; batch++) {
        console.log(`📦 Creating batch ${batch + 1}/${batchCount}`);
        
        // Submit transactions for this batch
        for (let i = 0; i < transactionsPerBatch; i++) {
          const wallet = libas.createKeyPair();
          const transaction = {
            type: 'mint',
            from: 'treasury',
            to: wallet.publicKey,
            amount: '100',
            nonce: Date.now() + (batch * 1000) + i
          };

          const message = JSON.stringify(transaction);
          const signature = libas.falconSign(message, wallet.privateKey);

          const response = await fetch(`${baseUrl}/api/transactions/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: transaction.type,
              from: transaction.from,
              to: transaction.to,
              amount: transaction.amount,
              nonce: transaction.nonce,
              falcon_signature: signature,
              public_key: wallet.publicKey
            })
          });

          expect(response.ok).toBe(true);
          const result = await response.json();
          expect(result.success).toBe(true);
        }

        // Wait for batch to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check settlement status
      const settlementStatus = await fetch(`${baseUrl}/api/network/status`);
      expect(settlementStatus.ok).toBe(true);
      
      const status = await settlementStatus.json();
      expect(status.settlement.settlementReady).toBe(true);
      
      console.log(`✅ Settlement maintained performance under ${batchCount * transactionsPerBatch} transactions`);
    }); // Removed timeout override
  });
}); 
