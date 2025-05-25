const express = require('express');
const FalconCrypto = require('../core/FalconCrypto');
const TransactionQueue = require('../core/TransactionQueue');
const BatchProcessor = require('../core/BatchProcessor');

const router = express.Router();
const crypto = new FalconCrypto();
const batchProcessor = new BatchProcessor();
const queue = new TransactionQueue();

// Initialize services
let servicesInitialized = false;

async function initializeServices() {
  if (servicesInitialized) return;
  
  try {
    await crypto.initialize();
    await batchProcessor.initialize();
    queue.setBatchProcessor(batchProcessor);
    servicesInitialized = true;
    console.log('✅ All transaction services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize transaction services:', error);
  }
}

// Initialize on startup
initializeServices();

/**
 * GET /api/transactions/queue/status
 * Get queue status (must come before /:id/status)
 */
router.get('/queue/status', (req, res) => {
  const queueStatus = queue.getStatus();
  const batchStatus = batchProcessor.getStatus();
  
  res.json({
    queue: queueStatus,
    batchProcessor: batchStatus,
    service: 'TransactionQueue',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/transactions/batches
 * Get all batches
 */
router.get('/batches', (req, res) => {
  const batches = batchProcessor.getAllBatches();
  res.json({
    batches,
    totalBatches: batches.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/transactions/batches/:id/status
 * Get batch status
 */
router.get('/batches/:id/status', (req, res) => {
  const batchId = parseInt(req.params.id);
  const batch = batchProcessor.getBatch(batchId);
  
  if (!batch) {
    return res.status(404).json({
      error: `Batch ${batchId} not found`
    });
  }

  res.json({
    batch_id: batch.id,
    status: batch.status,
    transaction_count: batch.transactions.length,
    created_at: batch.createdAt,
    aggregated_at: batch.aggregatedAt,
    settled_at: batch.settledAt,
    settlement_result: batch.settlementResult,
    error: batch.error,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/transactions/submit
 * Submit a Falcon-signed transaction
 */
router.post('/submit', (req, res) => {
  try {
    const { type, from, to, amount, nonce, falcon_signature, public_key } = req.body;

    // Validate required fields
    if (!type || !from || !amount || !nonce || !falcon_signature || !public_key) {
      return res.status(400).json({
        error: 'Missing required fields: type, from, amount, nonce, falcon_signature, public_key'
      });
    }

    if (!crypto.isReady()) {
      return res.status(503).json({
        error: 'FalconCrypto not ready. Service starting up.'
      });
    }

    // Create transaction message for verification
    const transactionMessage = JSON.stringify({
      type,
      from,
      to: to || null,
      amount,
      nonce
    });

    // Verify Falcon signature
    const isValidSignature = crypto.verifySignature(
      transactionMessage, 
      falcon_signature, 
      public_key
    );

    if (!isValidSignature) {
      return res.status(400).json({
        error: 'Invalid Falcon signature'
      });
    }

    // Add to transaction queue (will automatically batch when conditions are met)
    const queuedTransaction = queue.addTransaction({
      type,
      from,
      to,
      amount,
      nonce,
      falcon_signature,
      public_key,
      message: transactionMessage
    });

    res.json({
      success: true,
      transaction_id: queuedTransaction.id,
      status: queuedTransaction.status,
      message: 'Transaction verified and queued for batching',
      timestamp: queuedTransaction.timestamp,
      batch_processor_ready: batchProcessor.isReady()
    });

  } catch (error) {
    console.error('Transaction submission error:', error);
    res.status(500).json({
      error: 'Internal server error during transaction submission'
    });
  }
});

/**
 * GET /api/transactions/:id/status
 * Get transaction status
 */
router.get('/:id/status', (req, res) => {
  const transactionId = parseInt(req.params.id);
  
  // Get transaction from queue (includes processed transactions)
  const transaction = queue.getTransaction(transactionId);
  
  if (!transaction) {
    return res.status(404).json({
      error: `Transaction ${transactionId} not found`
    });
  }

  // Enhanced status response
  const response = {
    transaction_id: transaction.id,
    status: transaction.status,
    type: transaction.type,
    from: transaction.from,
    to: transaction.to,
    amount: transaction.amount,
    timestamp: transaction.timestamp,
    batched_at: transaction.batchedAt,
    settled_at: transaction.settledAt,
    tx_hash: transaction.txHash
  };

  // Add batch information if available
  if (transaction.status === 'batched' || transaction.status === 'settled') {
    // Find the batch this transaction belongs to
    const batches = batchProcessor.getAllBatches();
    const batch = batches.find(b => 
      b.transactions.some(tx => tx.id === transactionId)
    );
    
    if (batch) {
      response.batch_id = batch.id;
      response.batch_status = batch.status;
      response.aggregate_signature = batch.aggregateSignature;
    }
  }

  res.json(response);
});

/**
 * GET /api/transactions/processed
 * Get all processed transactions
 */
router.get('/processed', (req, res) => {
  const processedTransactions = queue.getAllProcessedTransactions();
  res.json({
    transactions: processedTransactions,
    count: processedTransactions.length,
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 
