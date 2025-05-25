const express = require('express');
const FalconCrypto = require('../core/FalconCrypto');
const TransactionQueue = require('../core/TransactionQueue');

const router = express.Router();
const crypto = new FalconCrypto();
const queue = new TransactionQueue();

// Initialize crypto service
crypto.initialize().catch(error => {
  console.error('Failed to initialize FalconCrypto:', error);
});

/**
 * GET /api/transactions/queue/status
 * Get queue status (must come before /:id/status)
 */
router.get('/queue/status', (req, res) => {
  const status = queue.getStatus();
  res.json({
    ...status,
    service: 'TransactionQueue',
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

    // Add to transaction queue
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
      timestamp: queuedTransaction.timestamp
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
  
  // For now, just return basic status (we'll enhance this later)
  res.json({
    transaction_id: transactionId,
    status: 'queued', // Will be enhanced with real status tracking
    message: 'Transaction is in queue awaiting batch processing',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 
