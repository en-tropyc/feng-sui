const FalconCrypto = require('./FalconCrypto');
const SuiSettlement = require('./SuiSettlement');

class BatchProcessor {
  constructor() {
    this.crypto = new FalconCrypto();
    this.settlement = new SuiSettlement();
    this.initialized = false;
    this.batches = new Map(); // Store batches by ID
    this.nextBatchId = 1;
    this.processingInterval = null;
  }

  /**
   * Initialize the batch processor
   */
  async initialize() {
    try {
      await this.crypto.initialize();
      await this.settlement.initialize();
      
      // Set a mock package ID for testing (in production, this would be the real deployed package)
      this.settlement.setPackageId('0x1234567890abcdef1234567890abcdef12345678');
      
      this.initialized = true;
      console.log('✅ BatchProcessor initialized');
      
      // Start the batch processing loop
      this.startProcessing();
      
    } catch (error) {
      console.error('❌ Failed to initialize BatchProcessor:', error.message);
      throw error;
    }
  }

  /**
   * Start the batch processing loop
   */
  startProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Process batches every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processPendingBatches();
    }, 5000);

    console.log('🔄 Batch processing started (5-second intervals)');
  }

  /**
   * Stop the batch processing loop
   */
  stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Batch processing stopped');
    }
  }

  /**
   * Create a batch from queued transactions
   * @param {Array} transactions - Array of verified transactions
   * @returns {Object} - Created batch
   */
  createBatch(transactions) {
    if (!transactions || transactions.length === 0) {
      throw new Error('Cannot create batch with no transactions');
    }

    const batchId = this.nextBatchId++;
    const batch = {
      id: batchId,
      transactions,
      status: 'created',
      createdAt: new Date().toISOString(),
      aggregateSignature: null,
      settlementResult: null
    };

    this.batches.set(batchId, batch);
    console.log(`📦 Created batch ${batchId} with ${transactions.length} transactions`);
    
    return batch;
  }

  /**
   * Aggregate signatures for a batch
   * @param {Object} batch - The batch to process
   * @returns {Object} - Updated batch with aggregate signature
   */
  async aggregateSignatures(batch) {
    if (!this.initialized) {
      throw new Error('BatchProcessor not initialized');
    }

    try {
      console.log(`🔐 Aggregating signatures for batch ${batch.id}...`);

      // Extract messages, signatures, and public keys
      const messages = batch.transactions.map(tx => tx.message);
      const signatures = batch.transactions.map(tx => tx.falcon_signature);
      const publicKeys = batch.transactions.map(tx => tx.public_key);

      // Aggregate the signatures using libas
      const aggregateSignature = this.crypto.aggregateSignatures(messages, signatures, publicKeys);

      // Verify the aggregate signature
      const isValid = this.crypto.verifyAggregateSignature(aggregateSignature, messages, publicKeys);
      
      if (!isValid) {
        throw new Error('Aggregate signature verification failed');
      }

      // Update the batch
      batch.aggregateSignature = aggregateSignature;
      batch.status = 'aggregated';
      batch.aggregatedAt = new Date().toISOString();

      console.log(`✅ Batch ${batch.id} signatures aggregated and verified`);
      return batch;

    } catch (error) {
      batch.status = 'aggregation_failed';
      batch.error = error.message;
      console.error(`❌ Failed to aggregate signatures for batch ${batch.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Settle a batch on Sui blockchain
   * @param {Object} batch - The batch with aggregated signature
   * @returns {Object} - Updated batch with settlement result
   */
  async settleBatch(batch) {
    if (!batch.aggregateSignature) {
      throw new Error('Cannot settle batch without aggregate signature');
    }

    try {
      console.log(`🌐 Settling batch ${batch.id} on Sui...`);

      const settlementResult = await this.settlement.settleBatch(batch);

      // Update the batch
      batch.settlementResult = settlementResult;
      batch.status = 'settled';
      batch.settledAt = new Date().toISOString();

      // Update individual transaction statuses
      batch.transactions.forEach(tx => {
        tx.status = 'settled';
        tx.txHash = settlementResult.txHash;
        tx.settledAt = batch.settledAt;
      });

      console.log(`✅ Batch ${batch.id} settled on Sui: ${settlementResult.txHash}`);
      return batch;

    } catch (error) {
      batch.status = 'settlement_failed';
      batch.error = error.message;
      console.error(`❌ Failed to settle batch ${batch.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Process all pending batches
   */
  async processPendingBatches() {
    const pendingBatches = Array.from(this.batches.values()).filter(
      batch => batch.status === 'created'
    );

    if (pendingBatches.length === 0) {
      return;
    }

    console.log(`🔄 Processing ${pendingBatches.length} pending batches...`);

    for (const batch of pendingBatches) {
      try {
        // Step 1: Aggregate signatures
        await this.aggregateSignatures(batch);
        
        // Step 2: Settle on Sui
        await this.settleBatch(batch);
        
      } catch (error) {
        console.error(`❌ Failed to process batch ${batch.id}:`, error.message);
      }
    }
  }

  /**
   * Get batch by ID
   * @param {number} batchId - The batch ID
   * @returns {Object|null} - The batch or null if not found
   */
  getBatch(batchId) {
    return this.batches.get(batchId) || null;
  }

  /**
   * Get all batches
   * @returns {Array} - Array of all batches
   */
  getAllBatches() {
    return Array.from(this.batches.values());
  }

  /**
   * Get processor status
   */
  getStatus() {
    const batches = this.getAllBatches();
    const statusCounts = batches.reduce((counts, batch) => {
      counts[batch.status] = (counts[batch.status] || 0) + 1;
      return counts;
    }, {});

    return {
      initialized: this.initialized,
      totalBatches: batches.length,
      statusCounts,
      processing: this.processingInterval !== null,
      cryptoReady: this.crypto.isReady(),
      settlementReady: this.settlement.isReady()
    };
  }

  /**
   * Check if the processor is ready
   */
  isReady() {
    return this.initialized && this.crypto.isReady() && this.settlement.isReady();
  }
}

module.exports = BatchProcessor; 
