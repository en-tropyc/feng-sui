const { SuiClient } = require('@mysten/sui/client');
const { getFullnodeUrl } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');

class SuiSettlement {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.network = 'localnet'; // Use local network for development
    
    // Real deployed QUSD contract addresses
    this.packageId = '0x2603af81ab9682f0f04a6740d6d55a5b32d3732b4c736044572b4206d33e989c';
    this.treasuryId = '0x0e1f417b6d79be5badc86a794cc11b0673022b7f4f654b2b5ee0ef73acbaefa5';
    this.settlementStateId = '0x9d288348eee491c7ba89639c0bd2f97af4e26f338e4220d594797e9cabbeabcc';
    
    // Real admin keypair for settlement transactions
    this.adminKeypair = null;
    this.adminAddress = '0xf1c3d2d98f56fc397f2855b31cb9245f2778b71891debe4229dc77e9a5d31791';
  }

  /**
   * Initialize the Sui client connection
   */
  async initialize() {
    try {
      // Connect to local network
      const rpcUrl = 'http://127.0.0.1:9000';
      this.client = new SuiClient({ url: rpcUrl });
      
      // Test the connection
      const chainId = await this.client.getChainIdentifier();
      console.log(`✅ SuiSettlement connected to local network (Chain ID: ${chainId})`);
      
      // Load the admin keypair for settlement transactions
      const adminPrivateKey = 'suiprivkey1qqqzqgcz4kmsxnrppwsfrsx050c73d4yuy4qhp5n8p9gfhw2nd4yzwlkhf9';
      this.adminKeypair = Ed25519Keypair.fromSecretKey(adminPrivateKey);
      
      const derivedAddress = this.adminKeypair.getPublicKey().toSuiAddress();
      if (derivedAddress !== this.adminAddress) {
        throw new Error(`Address mismatch: expected ${this.adminAddress}, got ${derivedAddress}`);
      }
      
      console.log(`🔑 Settlement admin address: ${this.adminAddress}`);
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize SuiSettlement:', error.message);
      throw new Error(`SuiSettlement initialization failed: ${error.message}`);
    }
  }

  /**
   * Settle a batch of transactions on Sui using real QUSD contracts
   * @param {Object} batch - The batch containing aggregated signature and transactions
   * @returns {Object} - Settlement result with transaction hash
   */
  async settleBatch(batch) {
    if (!this.initialized) {
      throw new Error('SuiSettlement not initialized. Call initialize() first.');
    }

    try {
      console.log(`🔄 Settling batch ${batch.id} with ${batch.transactions.length} transactions on-chain`);

      // For now, we'll call the simple settle_transfers function
      // This updates the settlement sequence without minting/burning
      const settlementResult = await this.callSettleTransfers(batch);

      console.log(`✅ Batch ${batch.id} settled on-chain: ${settlementResult.txHash}`);
      return settlementResult;

    } catch (error) {
      console.error(`❌ Failed to settle batch ${batch.id}:`, error.message);
      // Fall back to simulation if on-chain call fails
      console.log('🔄 Falling back to simulation...');
      return await this.simulateSettlement(batch);
    }
  }

  /**
   * Get the current sequence number from the settlement contract
   */
  async getCurrentSequence() {
    if (!this.initialized) {
      throw new Error('SuiSettlement not initialized');
    }

    try {
      const settlementState = await this.client.getObject({
        id: this.settlementStateId,
        options: {
          showContent: true
        }
      });

      if (settlementState.data && settlementState.data.content && settlementState.data.content.fields) {
        const currentSequence = parseInt(settlementState.data.content.fields.current_sequence);
        console.log(`📊 Current settlement sequence: ${currentSequence}`);
        return currentSequence;
      }

      throw new Error('Could not read current sequence from settlement state');
    } catch (error) {
      console.error('❌ Failed to get current sequence:', error.message);
      throw error;
    }
  }

  /**
   * Call the settle_transfers function on the QUSD settlement contract
   * @param {Object} batch - The batch to settle
   * @returns {Object} - Settlement result
   */
  async callSettleTransfers(batch) {
    try {
      // Get the current sequence from the contract
      const currentSequence = await this.getCurrentSequence();
      const expectedSequence = currentSequence + 1;
      
      console.log(`🔢 Using sequence ${expectedSequence} for batch ${batch.id} (current: ${currentSequence})`);

      const tx = new Transaction();
      
      // Call settlement::settle_transfers with the correct sequence
      tx.moveCall({
        target: `${this.packageId}::settlement::settle_transfers`,
        arguments: [
          tx.object(this.settlementStateId),
          tx.object(this.treasuryId),
          tx.pure.u64(expectedSequence), // Use the correct next sequence
        ],
      });

      // Execute the transaction with the admin keypair
      console.log(`🔐 Executing settlement transaction for batch ${batch.id} with sequence ${expectedSequence}...`);
      const result = await this.client.signAndExecuteTransaction({
        transaction: tx,
        signer: this.adminKeypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      if (result.effects.status.status === 'success') {
        console.log(`✅ Settlement transaction successful: ${result.digest}`);
        
        return {
          success: true,
          txHash: result.digest,
          batchId: batch.id,
          sequence: expectedSequence,
          transactionCount: batch.transactions.length,
          aggregateSignature: batch.aggregateSignature,
          timestamp: new Date().toISOString(),
          network: 'localnet',
          onChain: true,
          gasUsed: result.effects.gasUsed,
          events: result.events
        };
      } else {
        throw new Error(`Transaction failed: ${result.effects.status.error}`);
      }

    } catch (error) {
      console.error('❌ On-chain settlement failed:', error.message);
      throw error;
    }
  }

  /**
   * Simulate settlement for development/testing (fallback)
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
      network: 'localnet',
      onChain: false, // Indicates this was simulated
      simulated: true
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
        network: 'localnet',
        chainId,
        latestCheckpoint,
        packageId: this.packageId,
        treasuryId: this.treasuryId,
        settlementStateId: this.settlementStateId
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

  /**
   * Get contract information
   */
  getContractInfo() {
    return {
      packageId: this.packageId,
      treasuryId: this.treasuryId,
      settlementStateId: this.settlementStateId,
      network: 'localnet'
    };
  }
}

module.exports = SuiSettlement; 
