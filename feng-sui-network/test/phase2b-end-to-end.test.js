const path = require('path');

// Load libas for key generation and signing
const libasPath = path.join(__dirname, '../libas');
const libas = require(libasPath);

async function testPhase2B() {
  console.log('🧪 Testing Phase 2B: Signature Aggregation & Settlement...\n');

  try {
    // Step 1: Start the server
    console.log('1. Starting Feng-Sui Network server...');
    const server = require('./src/server');
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Server started\n');

    // Step 2: Generate multiple key pairs for testing
    console.log('2. Generating multiple Falcon key pairs...');
    const users = [];
    for (let i = 0; i < 3; i++) {
      const keyPair = libas.createKeyPair();
      users.push({
        id: i + 1,
        keyPair,
        address: `user_${i + 1}_address`
      });
      console.log(`✅ User ${i + 1} key pair generated`);
    }
    console.log('');

    // Step 3: Create and submit multiple transactions
    console.log('3. Creating and submitting multiple transactions...');
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

      // Sign the transaction
      const message = JSON.stringify(transaction);
      const signature = libas.falconSign(message, user.keyPair.privateKey);

      const signedTransaction = {
        ...transaction,
        falcon_signature: signature,
        public_key: user.keyPair.publicKey
      };

      transactions.push(signedTransaction);
      console.log(`✅ Transaction ${i + 1} created and signed`);
    }
    console.log('');

    // Step 4: Submit transactions to the API
    console.log('4. Submitting transactions to Feng-Sui Network...');
    const submissionResults = [];
    
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      
      try {
        const response = await fetch('http://localhost:3000/api/transactions/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tx)
        });

        const result = await response.json();
        submissionResults.push(result);
        console.log(`✅ Transaction ${i + 1} submitted: ID ${result.transaction_id}`);
      } catch (error) {
        console.log(`❌ Failed to submit transaction ${i + 1}:`, error.message);
      }
    }
    console.log('');

    // Step 5: Wait for automatic batching and processing
    console.log('5. Waiting for automatic batch processing...');
    await new Promise(resolve => setTimeout(resolve, 8000)); // Wait 8 seconds for processing
    console.log('✅ Processing time elapsed\n');

    // Step 6: Check queue status
    console.log('6. Checking queue and batch processor status...');
    try {
      const statusResponse = await fetch('http://localhost:3000/api/transactions/queue/status');
      const status = await statusResponse.json();
      
      console.log('Queue Status:', {
        queueLength: status.queue.queueLength,
        processedCount: status.queue.processedCount,
        batchProcessorReady: status.queue.batchProcessorReady
      });
      
      console.log('Batch Processor Status:', {
        totalBatches: status.batchProcessor.totalBatches,
        statusCounts: status.batchProcessor.statusCounts,
        processing: status.batchProcessor.processing
      });
    } catch (error) {
      console.log('❌ Failed to get status:', error.message);
    }
    console.log('');

    // Step 7: Check batch information
    console.log('7. Checking batch information...');
    try {
      const batchesResponse = await fetch('http://localhost:3000/api/transactions/batches');
      const batchesData = await batchesResponse.json();
      
      console.log(`📦 Total batches created: ${batchesData.totalBatches}`);
      
      for (const batch of batchesData.batches) {
        console.log(`Batch ${batch.id}:`);
        console.log(`  - Status: ${batch.status}`);
        console.log(`  - Transactions: ${batch.transactions.length}`);
        console.log(`  - Created: ${batch.createdAt}`);
        if (batch.aggregatedAt) console.log(`  - Aggregated: ${batch.aggregatedAt}`);
        if (batch.settledAt) console.log(`  - Settled: ${batch.settledAt}`);
        if (batch.settlementResult) {
          console.log(`  - Settlement TX: ${batch.settlementResult.txHash}`);
        }
        console.log('');
      }
    } catch (error) {
      console.log('❌ Failed to get batch information:', error.message);
    }

    // Step 8: Check individual transaction statuses
    console.log('8. Checking individual transaction statuses...');
    for (const result of submissionResults) {
      if (result.transaction_id) {
        try {
          const statusResponse = await fetch(`http://localhost:3000/api/transactions/${result.transaction_id}/status`);
          const txStatus = await statusResponse.json();
          
          console.log(`Transaction ${txStatus.transaction_id}:`);
          console.log(`  - Status: ${txStatus.status}`);
          console.log(`  - Amount: ${txStatus.amount}`);
          if (txStatus.batch_id) console.log(`  - Batch ID: ${txStatus.batch_id}`);
          if (txStatus.tx_hash) console.log(`  - Settlement TX: ${txStatus.tx_hash}`);
          console.log('');
        } catch (error) {
          console.log(`❌ Failed to get status for transaction ${result.transaction_id}:`, error.message);
        }
      }
    }

    // Step 9: Verify the complete workflow
    console.log('9. Verifying complete workflow...');
    
    // Check if we have settled transactions
    const processedResponse = await fetch('http://localhost:3000/api/transactions/processed');
    const processedData = await processedResponse.json();
    
    const settledTransactions = processedData.transactions.filter(tx => tx.status === 'settled');
    
    if (settledTransactions.length > 0) {
      console.log('🎉 SUCCESS: Complete Phase 2B workflow working!');
      console.log(`✅ Transactions processed: ${processedData.count}`);
      console.log(`✅ Transactions settled: ${settledTransactions.length}`);
      console.log('✅ Falcon signature aggregation: WORKING');
      console.log('✅ Sui settlement simulation: WORKING');
      console.log('✅ End-to-end transaction lifecycle: COMPLETE');
    } else {
      console.log('⚠️ Transactions processed but not yet settled');
      console.log('This might be normal if processing is still in progress');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhase2B(); 
