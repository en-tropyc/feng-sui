const express = require('express');
const FalconCrypto = require('../core/FalconCrypto');
const TransactionQueue = require('../core/TransactionQueue');
const BatchProcessor = require('../core/BatchProcessor');
const SuiSettlement = require('../core/SuiSettlement');

const router = express.Router();
const crypto = new FalconCrypto();
const batchProcessor = new BatchProcessor();
const queue = new TransactionQueue();
const suiSettlement = new SuiSettlement();

// Initialize services
let servicesInitialized = false;

async function initializeServices() {
  if (servicesInitialized) return;
  
  try {
    await crypto.initialize();
    await batchProcessor.initialize();
    await suiSettlement.initialize();
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

/**
 * GET /api/transactions/network/status
 * Get Sui network and contract status
 */
router.get('/network/status', async (req, res) => {
  try {
    const networkStatus = await batchProcessor.settlement.getNetworkStatus();
    const contractInfo = batchProcessor.settlement.getContractInfo();
    
    res.json({
      network: networkStatus,
      contracts: contractInfo,
      settlement_ready: batchProcessor.settlement.isReady(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get network status',
      details: error.message
    });
  }
});

/**
 * GET /api/transactions/contracts
 * Get QUSD contract information
 */
router.get('/contracts', (req, res) => {
  const contractInfo = batchProcessor.settlement.getContractInfo();
  res.json({
    ...contractInfo,
    deployment_status: 'deployed',
    network_type: 'localnet',
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
router.post('/submit', async (req, res) => {
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
    // Match the exact format used by the client for signature generation
    // We need to reconstruct the message exactly as the client created it
    const transactionData = {
      type,
      from
    };
    
    // Add 'to' field in the same position if it was provided in the request
    if (to !== undefined && to !== null) {
      transactionData.to = to;
    }
    
    // Add remaining fields
    transactionData.amount = amount;
    transactionData.nonce = nonce;
    
    const transactionMessage = JSON.stringify(transactionData);

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

    // Check user balance for debit transactions (transfer, burn)
    if ((type === 'transfer' || type === 'burn') && suiSettlement.isReady()) {
      const amountInBaseUnits = parseInt(amount) * 100000000; // Convert QUSD to base units
      const hasBalance = await suiSettlement.verifyUserBalance(from, amountInBaseUnits);
      
      if (!hasBalance) {
        // Get current balance and calculate shortfall
        const currentBalance = await suiSettlement.getUserEscrowBalance(from);
        const currentBalanceQUSD = currentBalance / 100000000;
        const requiredAmount = parseInt(amount);
        const shortfall = requiredAmount - currentBalanceQUSD;
        const suggestedDeposit = Math.ceil(shortfall * 1.2); // 20% buffer
        
        return res.status(400).json({
          error: 'Insufficient balance',
          details: `User ${from} does not have sufficient QUSD balance in escrow for this transaction`,
          balance_info: {
            current_escrow_balance: currentBalanceQUSD,
            required_amount: requiredAmount,
            shortfall: shortfall,
            suggested_deposit: suggestedDeposit
          },
          next_steps: {
            option_1: 'Use the /api/transactions/deposit-escrow endpoint to get deposit instructions',
            option_2: 'Use the /api/transactions/auto-deposit endpoint for optimized auto-deposit',
            option_3: 'Manually call settlement::deposit_to_escrow on Sui with QUSD coins'
          },
          api_examples: {
            check_balance: `GET /api/transactions/balance/${from}`,
            get_deposit_instructions: `POST /api/transactions/deposit-escrow`,
            get_auto_deposit: `POST /api/transactions/auto-deposit`
          },
          currency: 'QUSD'
        });
      }
      
      console.log(`✅ Balance verification passed for ${from}: ${amount} QUSD`);
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
      batch_processor_ready: batchProcessor.isReady(),
      balance_verified: (type === 'transfer' || type === 'burn') ? true : 'not_required'
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
 * GET /api/transactions/balance/:address
 * Get user's escrow balance
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        error: 'Address parameter is required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    const balanceInBaseUnits = await suiSettlement.getUserEscrowBalance(address);
    const balanceInQUSD = balanceInBaseUnits / 100000000; // Convert to QUSD

    res.json({
      address,
      escrow_balance: balanceInQUSD,
      escrow_balance_base_units: balanceInBaseUnits,
      currency: 'QUSD',
      timestamp: new Date().toISOString(),
      network: 'localnet'
    });

  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({
      error: 'Failed to check balance',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/verify-balance
 * Verify if user has sufficient balance for a transaction
 */
router.post('/verify-balance', async (req, res) => {
  try {
    const { address, amount } = req.body;
    
    if (!address || !amount) {
      return res.status(400).json({
        error: 'Address and amount are required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    const amountInBaseUnits = parseInt(amount) * 100000000;
    const hasBalance = await suiSettlement.verifyUserBalance(address, amountInBaseUnits);
    const currentBalance = await suiSettlement.getUserEscrowBalance(address);

    res.json({
      address,
      required_amount: parseFloat(amount),
      current_balance: currentBalance / 100000000,
      has_sufficient_balance: hasBalance,
      shortfall: hasBalance ? 0 : (amountInBaseUnits - currentBalance) / 100000000,
      currency: 'QUSD',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Balance verification error:', error);
    res.status(500).json({
      error: 'Failed to verify balance',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/deposit-escrow
 * Help user deposit QUSD to escrow for Feng-Sui transactions
 */
router.post('/deposit-escrow', async (req, res) => {
  try {
    const { user_address, amount, buffer_percentage = 20 } = req.body;
    
    if (!user_address || !amount) {
      return res.status(400).json({
        error: 'user_address and amount are required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    // Calculate deposit amount with buffer
    const baseAmount = parseFloat(amount);
    const bufferAmount = (baseAmount * buffer_percentage) / 100;
    const totalDepositAmount = baseAmount + bufferAmount;
    const totalDepositBaseUnits = Math.ceil(totalDepositAmount * 100000000);

    // Get current balance
    const currentBalance = await suiSettlement.getUserEscrowBalance(user_address);
    const currentBalanceQUSD = currentBalance / 100000000;

    // Check if deposit is actually needed
    if (currentBalance >= baseAmount * 100000000) {
      return res.json({
        deposit_needed: false,
        message: 'User already has sufficient escrow balance',
        current_balance: currentBalanceQUSD,
        required_amount: baseAmount,
        currency: 'QUSD'
      });
    }

    // Generate deposit transaction instructions
    const depositInstructions = {
      action: 'deposit_to_escrow',
      user_address,
      suggested_deposit_amount: totalDepositAmount,
      suggested_deposit_base_units: totalDepositBaseUnits,
      base_amount: baseAmount,
      buffer_amount: bufferAmount,
      buffer_percentage,
      current_escrow_balance: currentBalanceQUSD,
      shortfall: (baseAmount * 100000000 - currentBalance) / 100000000,
      
      // Sui contract call details
      contract_info: {
        package_id: suiSettlement.packageId,
        settlement_state_id: suiSettlement.settlementStateId,
        function: 'settlement::deposit_to_escrow',
        required_coins: `${totalDepositAmount} QUSD`
      },
      
      // Next steps for the user
      instructions: [
        '1. Obtain QUSD coins from your wallet',
        `2. Call settlement::deposit_to_escrow with ${totalDepositAmount} QUSD`,
        '3. Wait for transaction confirmation',
        '4. Retry your original transaction'
      ]
    };

    res.json({
      deposit_needed: true,
      deposit_instructions: depositInstructions,
      message: `Please deposit ${totalDepositAmount} QUSD to your escrow account`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Escrow deposit instruction error:', error);
    res.status(500).json({
      error: 'Failed to generate deposit instructions',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/auto-deposit
 * Generate auto-deposit transaction for seamless transfers
 */
router.post('/auto-deposit', async (req, res) => {
  try {
    const { user_address, required_amount, buffer_percentage = 20 } = req.body;
    
    if (!user_address || !required_amount) {
      return res.status(400).json({
        error: 'user_address and required_amount are required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    // Get current balance
    const currentBalance = await suiSettlement.getUserEscrowBalance(user_address);
    const currentBalanceQUSD = currentBalance / 100000000;
    const requiredAmountNum = parseFloat(required_amount);

    // Check if auto-deposit is needed
    if (currentBalance >= requiredAmountNum * 100000000) {
      return res.json({
        auto_deposit_needed: false,
        message: 'User already has sufficient escrow balance',
        current_balance: currentBalanceQUSD,
        required_amount: requiredAmountNum
      });
    }

    // Calculate optimal auto-deposit amount
    const shortfall = requiredAmountNum - currentBalanceQUSD;
    const bufferAmount = (shortfall * buffer_percentage) / 100;
    const autoDepositAmount = shortfall + bufferAmount;
    const autoDepositBaseUnits = Math.ceil(autoDepositAmount * 100000000);

    // Generate auto-deposit transaction
    const autoDepositTx = {
      action: 'auto_deposit_for_transfer',
      user_address,
      required_amount: requiredAmountNum,
      auto_deposit_amount: autoDepositAmount,
      auto_deposit_base_units: autoDepositBaseUnits,
      buffer_percentage,
      current_balance: currentBalanceQUSD,
      shortfall: shortfall,
      
      // Sui contract call details
      contract_info: {
        package_id: suiSettlement.packageId,
        settlement_state_id: suiSettlement.settlementStateId,
        function: 'settlement::auto_deposit_for_transfer',
        parameters: [
          'settlement_state: &mut SettlementState',
          `coin: Coin<QUSD> (${autoDepositAmount} QUSD)`,
          `required_amount: ${requiredAmountNum * 100000000}`,
          `buffer_percentage: ${buffer_percentage}`
        ]
      },
      
      optimization: {
        description: 'Auto-deposit with buffer to avoid frequent deposits',
        benefit: `Deposits ${autoDepositAmount} QUSD (including ${bufferAmount} QUSD buffer) to reduce future deposit transactions`
      }
    };

    res.json({
      auto_deposit_needed: true,
      auto_deposit_transaction: autoDepositTx,
      message: `Auto-deposit ${autoDepositAmount} QUSD for seamless transactions`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auto-deposit transaction error:', error);
    res.status(500).json({
      error: 'Failed to generate auto-deposit transaction',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/check-balance
 * Check user's escrow balance (for long addresses like Falcon public keys)
 */
router.post('/check-balance', async (req, res) => {
  try {
    const { address, public_key } = req.body;
    
    // Use public_key as address if provided, otherwise use address
    const userAddress = public_key || address;
    
    if (!userAddress) {
      return res.status(400).json({
        error: 'Either address or public_key parameter is required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    const balanceInBaseUnits = await suiSettlement.getUserEscrowBalance(userAddress);
    const balanceInQUSD = balanceInBaseUnits / 100000000; // Convert to QUSD

    res.json({
      address: userAddress,
      address_type: public_key ? 'falcon_public_key' : 'standard_address',
      escrow_balance: balanceInQUSD,
      escrow_balance_base_units: balanceInBaseUnits,
      currency: 'QUSD',
      timestamp: new Date().toISOString(),
      network: 'localnet'
    });

  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({
      error: 'Failed to check balance',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/register-mapping
 * Register a mapping between Falcon public key and Sui address
 */
router.post('/register-mapping', async (req, res) => {
  try {
    const { falcon_public_key, sui_address } = req.body;
    
    if (!falcon_public_key || !sui_address) {
      return res.status(400).json({
        error: 'falcon_public_key and sui_address are required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    // Register the mapping
    const success = suiSettlement.registerFalconToSuiMapping(falcon_public_key, sui_address);
    
    if (success) {
      res.json({
        success: true,
        message: 'Falcon public key to Sui address mapping registered successfully',
        falcon_public_key: falcon_public_key.substring(0, 20) + '...', // Truncate for response
        sui_address,
        timestamp: new Date().toISOString(),
        instructions: [
          '1. Ensure your Sui address has QUSD tokens',
          '2. Deposit QUSD to escrow using: settlement::deposit_to_escrow',
          '3. Your Falcon signatures will now check balance at this Sui address'
        ]
      });
    } else {
      res.status(400).json({
        error: 'Failed to register mapping. Check that sui_address is valid.'
      });
    }

  } catch (error) {
    console.error('Mapping registration error:', error);
    res.status(500).json({
      error: 'Failed to register mapping',
      details: error.message
    });
  }
});

/**
 * POST /api/transactions/get-mapping
 * Get the Sui address for a Falcon public key
 */
router.post('/get-mapping', async (req, res) => {
  try {
    const { falcon_public_key } = req.body;
    
    if (!falcon_public_key) {
      return res.status(400).json({
        error: 'falcon_public_key is required'
      });
    }

    if (!suiSettlement.isReady()) {
      return res.status(503).json({
        error: 'Settlement service not ready'
      });
    }

    const suiAddress = suiSettlement.getSuiAddressForFalconKey(falcon_public_key);
    
    if (suiAddress) {
      res.json({
        falcon_public_key: falcon_public_key.substring(0, 20) + '...', // Truncate for response
        sui_address: suiAddress,
        mapping_exists: true,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        falcon_public_key: falcon_public_key.substring(0, 20) + '...', // Truncate for response
        mapping_exists: false,
        message: 'No Sui address mapping found for this Falcon public key',
        next_steps: [
          'Register a mapping using POST /api/transactions/register-mapping',
          'Provide your real Sui address where you have QUSD tokens'
        ]
      });
    }

  } catch (error) {
    console.error('Mapping lookup error:', error);
    res.status(500).json({
      error: 'Failed to lookup mapping',
      details: error.message
    });
  }
});

module.exports = router; 
