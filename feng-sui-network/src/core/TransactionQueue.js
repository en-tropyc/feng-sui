class TransactionQueue {
  constructor(batchProcessor = null) {
    this.queue = [];
    this.batchSize = 100;
    this.batchTimeout = 5000; // 5 seconds
    this.nextId = 1;
    this.batchProcessor = batchProcessor;
    this.lastBatchTime = Date.now();
    this.batchTimer = null;
    this.processedTransactions = new Map(); // Track processed transactions by ID
  }

  /**
   * Set the batch processor for automatic batching
   * @param {BatchProcessor} batchProcessor - The batch processor instance
   */
  setBatchProcessor(batchProcessor) {
    this.batchProcessor = batchProcessor;
    console.log('🔗 BatchProcessor connected to TransactionQueue');
  }

  /**
   * Add a transaction to the queue
   * @param {Object} transaction - The transaction object
   * @returns {Object} - Transaction with assigned ID and status
   */
  addTransaction(transaction) {
    const queuedTransaction = {
      id: this.nextId++,
      ...transaction,
      status: 'queued',
      timestamp: new Date().toISOString()
    };

    this.queue.push(queuedTransaction);
    console.log(`📥 Transaction ${queuedTransaction.id} added to queue (${this.queue.length} total)`);

    // Check if we should create a batch
    this.checkBatchConditions();

    return queuedTransaction;
  }

  /**
   * Check if batch conditions are met and create batch if needed
   */
  checkBatchConditions() {
    const shouldBatch = this.queue.length >= this.batchSize || 
                       (this.queue.length > 0 && Date.now() - this.lastBatchTime >= this.batchTimeout);

    if (shouldBatch && this.batchProcessor && this.batchProcessor.isReady()) {
      this.createBatch();
    } else if (this.queue.length > 0 && !this.batchTimer) {
      // Set a timer for timeout-based batching
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        if (this.queue.length > 0) {
          this.checkBatchConditions();
        }
      }, this.batchTimeout);
    }
  }

  /**
   * Create a batch from queued transactions
   */
  createBatch() {
    if (this.queue.length === 0) {
      return null;
    }

    // Clear any pending timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Take all queued transactions for the batch
    const batchTransactions = this.queue.splice(0, this.queue.length);
    this.lastBatchTime = Date.now();

    console.log(`📦 Creating batch with ${batchTransactions.length} transactions`);

    // Update transaction statuses
    batchTransactions.forEach(tx => {
      tx.status = 'batched';
      tx.batchedAt = new Date().toISOString();
      this.processedTransactions.set(tx.id, tx);
    });

    // Create the batch using the batch processor
    if (this.batchProcessor) {
      try {
        const batch = this.batchProcessor.createBatch(batchTransactions);
        console.log(`✅ Batch ${batch.id} created and sent for processing`);
        return batch;
      } catch (error) {
        console.error('❌ Failed to create batch:', error.message);
        // Put transactions back in queue on failure
        this.queue.unshift(...batchTransactions);
        batchTransactions.forEach(tx => {
          tx.status = 'queued';
          delete tx.batchedAt;
        });
      }
    }

    return null;
  }

  /**
   * Get transaction by ID (including processed transactions)
   * @param {number} transactionId - The transaction ID
   * @returns {Object|null} - The transaction or null if not found
   */
  getTransaction(transactionId) {
    // Check processed transactions first
    const processed = this.processedTransactions.get(transactionId);
    if (processed) {
      return processed;
    }

    // Check current queue
    return this.queue.find(tx => tx.id === transactionId) || null;
  }

  /**
   * Update transaction status (called by batch processor)
   * @param {number} transactionId - The transaction ID
   * @param {string} status - The new status
   * @param {Object} additionalData - Additional data to merge
   */
  updateTransactionStatus(transactionId, status, additionalData = {}) {
    const transaction = this.processedTransactions.get(transactionId);
    if (transaction) {
      transaction.status = status;
      Object.assign(transaction, additionalData);
      console.log(`📊 Transaction ${transactionId} status updated to: ${status}`);
    }
  }

  /**
   * Get transactions ready for batching (legacy method)
   * @returns {Array} - Array of transactions to batch
   */
  getTransactionsForBatch() {
    if (this.queue.length === 0) {
      return [];
    }

    // Take up to batchSize transactions
    const batchTransactions = this.queue.splice(0, this.batchSize);
    
    console.log(`📦 Manual batch creation with ${batchTransactions.length} transactions`);
    return batchTransactions;
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processedCount: this.processedTransactions.size,
      batchSize: this.batchSize,
      batchTimeout: this.batchTimeout,
      nextId: this.nextId,
      lastBatchTime: new Date(this.lastBatchTime).toISOString(),
      batchProcessorConnected: this.batchProcessor !== null,
      batchProcessorReady: this.batchProcessor ? this.batchProcessor.isReady() : false
    };
  }

  /**
   * Check if queue has transactions ready for batching
   */
  isReadyForBatch() {
    return this.queue.length >= this.batchSize;
  }

  /**
   * Get all transactions (for debugging)
   */
  getAllTransactions() {
    return [...this.queue];
  }

  /**
   * Get all processed transactions
   */
  getAllProcessedTransactions() {
    return Array.from(this.processedTransactions.values());
  }

  /**
   * Clear the queue (for testing)
   */
  clear() {
    this.queue = [];
    this.processedTransactions.clear();
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    console.log('🧹 Transaction queue cleared');
  }
}

module.exports = TransactionQueue; 
