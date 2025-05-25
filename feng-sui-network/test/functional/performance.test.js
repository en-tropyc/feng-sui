const path = require('path');

// Load libas for test data generation
const libasPath = path.join(__dirname, '../../../libas');
const libas = require(libasPath);

describe('Network Performance Tests', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Transaction Throughput', () => {
    test('should handle high-volume transaction processing', async () => {
      const startTime = Date.now();
      const numTransactions = 20;
      const wallets = [];
      const transactions = [];

      // Generate wallets and transactions
      for (let i = 0; i < numTransactions; i++) {
        const senderWallet = libas.createKeyPair();
        const receiverWallet = libas.createKeyPair();
        
        const transaction = {
          type: 'transfer',
          from: senderWallet.publicKey,
          to: receiverWallet.publicKey,
          amount: (Math.floor(Math.random() * 1000) + 1).toString(),
          nonce: Date.now() + i
        };

        const message = JSON.stringify(transaction);
        const signature = libas.falconSign(message, senderWallet.privateKey);

        wallets.push({ sender: senderWallet, receiver: receiverWallet });
        transactions.push({
          transaction,
          signature,
          senderWallet
        });
      }

      console.log(`🚀 Starting high-volume test with ${numTransactions} transactions`);

      // Submit all transactions
      const results = [];
      for (const { transaction, signature, senderWallet } of transactions) {
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
            public_key: senderWallet.publicKey
          })
        });

        const result = await response.json();
        expect(result.success).toBe(true);
        results.push(result.transaction_id);
      }

      const submissionTime = Date.now() - startTime;
      console.log(`📊 Submitted ${numTransactions} transactions in ${submissionTime}ms`);
      console.log(`⚡ Throughput: ${(numTransactions / submissionTime * 1000).toFixed(2)} TPS`);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check final status
      const queueStatus = await fetch(`${baseUrl}/api/transactions/queue/status`);
      const status = await queueStatus.json();
      
      console.log(`📈 Queue processed: ${status.queue.processedCount} transactions`);
      console.log(`📦 Batches created: ${status.batchProcessor.totalBatches}`);
      
      expect(status.queue.processedCount).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for high-volume test
  });

  describe('Batch Processing Efficiency', () => {
    test('should efficiently batch transactions under load', async () => {
      const batchSizes = [1, 5, 10, 15];
      const results = [];

      for (const batchSize of batchSizes) {
        console.log(`🔄 Testing batch size: ${batchSize}`);
        
        const startTime = Date.now();
        const transactionIds = [];

        // Submit transactions in quick succession
        for (let i = 0; i < batchSize; i++) {
          const wallet = libas.createKeyPair();
          const transaction = {
            type: 'transfer',
            from: wallet.publicKey,
            to: wallet.publicKey, // Self-transfer for testing
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

          const result = await response.json();
          expect(result.success).toBe(true);
          transactionIds.push(result.transaction_id);
        }

        const submissionTime = Date.now() - startTime;
        
        // Wait for batch processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
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
    });
  });

  describe('Network Resilience', () => {
    test('should handle transaction spikes gracefully', async () => {
      // Simulate a sudden spike in transactions (like during market volatility)
      const spikeTransactions = 15;
      const wallets = [];
      
      console.log(`📈 Simulating transaction spike: ${spikeTransactions} transactions`);

      // Generate all transactions first
      for (let i = 0; i < spikeTransactions; i++) {
        wallets.push({
          wallet: libas.createKeyPair(),
          amount: (Math.floor(Math.random() * 500) + 50).toString() // $50-$550
        });
      }

      // Submit all at once (spike simulation)
      const promises = wallets.map(async ({ wallet, amount }, index) => {
        const transaction = {
          type: 'transfer',
          from: wallet.publicKey,
          to: wallets[(index + 1) % wallets.length].wallet.publicKey,
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

      // Verify all transactions were accepted
      for (const response of responses) {
        const result = await response.json();
        expect(result.success).toBe(true);
      }

      console.log(`⚡ Handled spike of ${spikeTransactions} transactions in ${spikeTime}ms`);
      console.log(`🔥 Spike throughput: ${(spikeTransactions / spikeTime * 1000).toFixed(2)} TPS`);

      // Wait for processing and verify system stability
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const queueStatus = await fetch(`${baseUrl}/api/transactions/queue/status`);
      const status = await queueStatus.json();
      
      expect(status.queue).toBeDefined();
      expect(status.batchProcessor).toBeDefined();
      
      console.log(`✅ System stable after spike - Queue length: ${status.queue.queueLength}`);
    });
  });

  describe('Settlement Performance', () => {
    test('should maintain settlement speed under load', async () => {
      // Test settlement performance with multiple batches
      const numBatches = 3;
      const transactionsPerBatch = 5;
      
      console.log(`🏦 Testing settlement performance: ${numBatches} batches, ${transactionsPerBatch} tx each`);

      for (let batch = 0; batch < numBatches; batch++) {
        console.log(`📦 Creating batch ${batch + 1}/${numBatches}`);
        
        // Submit transactions for this batch
        for (let tx = 0; tx < transactionsPerBatch; tx++) {
          const wallet = libas.createKeyPair();
          const transaction = {
            type: 'transfer',
            from: wallet.publicKey,
            to: wallet.publicKey,
            amount: '25',
            nonce: Date.now() + (batch * 1000) + tx
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

          const result = await response.json();
          expect(result.success).toBe(true);
        }

        // Wait for batch to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check final settlement status
      const batchesResponse = await fetch(`${baseUrl}/api/transactions/batches`);
      const batchesData = await batchesResponse.json();
      
      console.log(`🎯 Settlement results:`);
      console.log(`📊 Total batches: ${batchesData.totalBatches}`);
      
      // Check individual batch statuses
      let settledBatches = 0;
      for (const batch of batchesData.batches) {
        if (batch.status === 'settled') {
          settledBatches++;
        }
      }
      
      console.log(`✅ Settled batches: ${settledBatches}/${batchesData.totalBatches}`);
      expect(batchesData.totalBatches).toBeGreaterThan(0);
    });
  });
}); 
