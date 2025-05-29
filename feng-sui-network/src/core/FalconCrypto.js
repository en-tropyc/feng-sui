const path = require('path');

class FalconCrypto {
  constructor() {
    this.libas = null;
    this.initialized = false;
  }

  /**
   * Initialize the libas library
   */
  async initialize() {
    try {
      // Load libas from the parent directory (feng-sui/libas)
      const libasPath = path.join(__dirname, '../../../libas');
      this.libas = require(libasPath);
      this.initialized = true;
      console.log('✅ FalconCrypto initialized with libas');
    } catch (error) {
      console.error('❌ Failed to initialize FalconCrypto:', error.message);
      throw new Error(`FalconCrypto initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify a single Falcon signature
   * @param {string} message - The message that was signed
   * @param {string} signature - The Falcon signature
   * @param {string} publicKey - The public key to verify against
   * @returns {boolean} - True if signature is valid
   */
  verifySignature(message, signature, publicKey) {
    if (!this.initialized) {
      throw new Error('FalconCrypto not initialized. Call initialize() first.');
    }

    try {
      return this.libas.falconVerify(message, signature, publicKey);
    } catch (error) {
      console.error('Signature verification error:', error.message);
      return false;
    }
  }

  /**
   * Aggregate multiple signatures
   * @param {Array} messages - Array of messages
   * @param {Array} signatures - Array of signatures
   * @param {Array} publicKeys - Array of public keys
   * @returns {string} - Aggregated signature
   */
  aggregateSignatures(messages, signatures, publicKeys) {
    if (!this.initialized) {
      throw new Error('FalconCrypto not initialized. Call initialize() first.');
    }

    try {
      return this.libas.aggregate(messages, signatures, publicKeys);
    } catch (error) {
      console.error('Signature aggregation error:', error.message);
      throw error;
    }
  }

  /**
   * Verify an aggregated signature
   * @param {string} aggregateSignature - The aggregated signature
   * @param {Array} messages - Array of original messages
   * @param {Array} publicKeys - Array of public keys
   * @returns {boolean} - True if aggregate signature is valid
   */
  verifyAggregateSignature(aggregateSignature, messages, publicKeys) {
    if (!this.initialized) {
      throw new Error('FalconCrypto not initialized. Call initialize() first.');
    }

    try {
      return this.libas.verify(aggregateSignature, messages, publicKeys);
    } catch (error) {
      console.error('Aggregate signature verification error:', error.message);
      return false;
    }
  }

  /**
   * Check if the crypto service is ready to use
   */
  isReady() {
    return this.initialized;
  }
}

module.exports = FalconCrypto; 
