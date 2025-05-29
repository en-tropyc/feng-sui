const express = require('express');
const FalconCrypto = require('../core/FalconCrypto');

const router = express.Router();
const crypto = new FalconCrypto();

// Initialize crypto service on startup
crypto.initialize().catch(error => {
  console.error('Failed to initialize FalconCrypto:', error);
});

/**
 * POST /api/verify/signature
 * Test endpoint for single signature verification
 */
router.post('/signature', (req, res) => {
  try {
    const { message, signature, publicKey } = req.body;

    // Validate input
    if (!message || !signature || !publicKey) {
      return res.status(400).json({
        error: 'Missing required fields: message, signature, publicKey'
      });
    }

    if (!crypto.isReady()) {
      return res.status(503).json({
        error: 'FalconCrypto not ready. Service starting up.'
      });
    }

    // Verify signature
    const isValid = crypto.verifySignature(message, signature, publicKey);

    res.json({
      valid: isValid,
      message: isValid ? 'Signature is valid' : 'Signature is invalid',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({
      error: 'Internal server error during signature verification'
    });
  }
});

/**
 * GET /api/verify/status
 * Check if the crypto service is ready
 */
router.get('/status', (req, res) => {
  res.json({
    ready: crypto.isReady(),
    service: 'FalconCrypto',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 
