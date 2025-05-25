const { SuiClient } = require('@mysten/sui/client');
const { getFullnodeUrl } = require('@mysten/sui/client');

class SuiSettlement {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.network = 'testnet'; // Start with testnet
    this.packageId = null; // Will be set when we deploy/connect to QUSD contracts
  }

  /**
   * Initialize the Sui client connection
   */
  async initialize() {
    try {
      const rpcUrl = getFullnodeUrl(this.network);
      this.client = new SuiClient({ url: rpcUrl });
      
      // Test the connection
      const chainId = await this.client.getChainIdentifier();
      console.log(`✅ SuiSettlement connected to ${this.network} (Chain ID: ${chainId})`);
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize SuiSettlement:', error.message);
      throw new Error(`SuiSettlement initialization failed: ${error.message}`);
    }
  }

  /**
   * Set the QUSD package ID for contract calls
   * @param {string} packageId - The deployed QUSD package ID
   */
  setPackageId(packageId) {
    this.packageId = packageId;
    console.log(`📦 QUSD Package ID set: ${packageId}`);
  }

  /**
   * Settle a batch of transactions on Sui
   * @param {Object} batch - The batch containing aggregated signature and transactions
   * @returns {Object} - Settlement result with transaction hash
   */
  async settleBatch(batch) {
    if (!this.initialized) {
      throw new Error('SuiSettlement not initialized. Call initialize() first.');
    }

    if (!this.packageId) {
      throw new Error('QUSD Package ID not set. Call setPackageId() first.');
    }

    try {
      console.log(`🔄 Settling batch ${batch.id} with ${batch.transactions.length} transactions`);

      // For now, we'll simulate the settlement call
      // In production, this would call the actual settlement contract
      const settlementResult = await this.simulateSettlement(batch);

      console.log(`✅ Batch ${batch.id} settled successfully: ${settlementResult.txHash}`);
      return settlementResult;

    } catch (error) {
      console.error(`❌ Failed to settle batch ${batch.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Simulate settlement for development/testing
   * @param {Object} batch - The batch to settle
   * @returns {Object} - Simulated settlement result
   */
  async simulateSettlement(batch) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a mock transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    return {
      success: true,
      txHash,
      batchId: batch.id,
      transactionCount: batch.transactions.length,
      aggregateSignature: batch.aggregateSignature,
      timestamp: new Date().toISOString(),
      network: this.network
    };
  }

  /**
   * Get the current network status
   */
  async getNetworkStatus() {
    if (!this.initialized) {
      return { connected: false, error: 'Not initialized' };
    }

    try {
      const chainId = await this.client.getChainIdentifier();
      const latestCheckpoint = await this.client.getLatestCheckpointSequenceNumber();
      
      return {
        connected: true,
        network: this.network,
        chainId,
        latestCheckpoint,
        packageId: this.packageId
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Check if the settlement service is ready
   */
  isReady() {
    return this.initialized && this.packageId !== null;
  }
}

module.exports = SuiSettlement; 
