class TransactionQueue {
  constructor() {
    this.queue = [];
    this.batchSize = 100;
    this.batchTimeout = 5000; // 5 seconds
    this.nextId = 1;
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

    return queuedTransaction;
  }

  /**
   * Get transactions ready for batching
   * @returns {Array} - Array of transactions to batch
   */
  getTransactionsForBatch() {
    if (this.queue.length === 0) {
      return [];
    }

    // Take up to batchSize transactions
    const batchTransactions = this.queue.splice(0, this.batchSize);
    
    console.log(`📦 Creating batch with ${batchTransactions.length} transactions`);
    return batchTransactions;
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      batchSize: this.batchSize,
      batchTimeout: this.batchTimeout,
      nextId: this.nextId
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
   * Clear the queue (for testing)
   */
  clear() {
    this.queue = [];
    console.log('🧹 Transaction queue cleared');
  }
}

module.exports = TransactionQueue; 
