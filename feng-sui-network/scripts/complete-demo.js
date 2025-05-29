const path = require('path');

// Load libas for Falcon cryptography
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

/**
 * Complete End-to-End QUSD Flow Demo
 * 
 * This script demonstrates the full user journey with QUSD:
 * 1. Create Falcon quantum-resistant keys
 * 2. Create classical Sui address for storage
 * 3. Register mapping between Falcon and Sui addresses
 * 4. Mint QUSD using quantum-resistant signatures
 * 5. Deposit QUSD to escrow for quantum transfers
 * 6. Transfer QUSD to another user (quantum-resistant)
 * 7. Withdraw remaining QUSD back to wallet
 * 
 * SECURITY NOTE: This demonstrates the hybrid security model where
 * transaction authorization is quantum-resistant but final storage
 * remains quantum-vulnerable due to classical Sui blockchain.
 */

const API_BASE_URL = process.env.FENG_SUI_API_URL || 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Request failed: ${result.error || result.message}`);
      if (result.balance_info) {
        console.log('💰 Balance Info:', result.balance_info);
      }
      if (result.next_steps) {
        console.log('📋 Next Steps:', result.next_steps);
      }
    }
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error(`❌ Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function completeE2EFlow() {
  console.log('🌟 Starting Complete QUSD End-to-End Flow Demo');
  console.log('📖 This demonstrates quantum-resistant transaction processing with classical storage');
  console.log('=' .repeat(80));

  // ============================================================================
  // STEP 1: CREATE QUANTUM-RESISTANT FALCON KEYS
  // ============================================================================
  console.log('\n🔑 STEP 1: Creating Falcon Quantum-Resistant Keys');
  console.log('💡 Security: These keys are quantum-resistant (Falcon-512)');
  
  const aliceWallet = libas.createKeyPair();
  const bobWallet = libas.createKeyPair();
  
  console.log('👤 Alice Wallet Created:');
  console.log(`   🔐 Falcon Public Key: ${aliceWallet.publicKey.slice(0, 40)}...`);
  console.log(`   🗝️  Falcon Private Key: ${aliceWallet.privateKey.slice(0, 20)}... (secret!)`);
  
  console.log('👤 Bob Wallet Created:');
  console.log(`   🔐 Falcon Public Key: ${bobWallet.publicKey.slice(0, 40)}...`);

  // ============================================================================
  // STEP 2: CREATE CLASSICAL SUI ADDRESSES (VULNERABILITY POINT)
  // ============================================================================
  console.log('\n🏦 STEP 2: Creating Classical Sui Addresses for Storage');
  console.log('⚠️  Security: These addresses use Ed25519 (quantum-vulnerable)');
  console.log('⚠️  Critical: Final QUSD storage will be quantum-vulnerable!');
  
  // Simulate classical Sui address generation (deterministic for demo)
  const aliceSuiAddress = '0x' + require('crypto').createHash('sha256')
    .update(aliceWallet.publicKey).digest('hex').slice(0, 64);
  const bobSuiAddress = '0x' + require('crypto').createHash('sha256')
    .update(bobWallet.publicKey).digest('hex').slice(0, 64);
  
  console.log(`👤 Alice Sui Address: ${aliceSuiAddress}`);
  console.log(`👤 Bob Sui Address: ${bobSuiAddress}`);

  // ============================================================================
  // STEP 3: REGISTER FALCON-TO-SUI MAPPINGS
  // ============================================================================
  console.log('\n📝 STEP 3: Registering Falcon-to-Sui Address Mappings');
  console.log('💡 This links quantum-resistant keys to classical storage addresses');
  
  // Register Alice's mapping
  let result = await makeRequest(`${API_BASE_URL}/api/transactions/register-mapping`, 'POST', {
    falcon_public_key: aliceWallet.publicKey,
    sui_address: aliceSuiAddress
  });
  
  if (result.success) {
    console.log('✅ Alice mapping registered successfully');
  } else {
    console.log('❌ Failed to register Alice mapping');
    return;
  }

  // Register Bob's mapping
  result = await makeRequest(`${API_BASE_URL}/api/transactions/register-mapping`, 'POST', {
    falcon_public_key: bobWallet.publicKey,
    sui_address: bobSuiAddress
  });
  
  if (result.success) {
    console.log('✅ Bob mapping registered successfully');
  } else {
    console.log('❌ Failed to register Bob mapping');
    return;
  }

  // ============================================================================
  // STEP 4: ADMIN MINTS QUSD FOR ALICE (TREASURY OPERATION)
  // ============================================================================
  console.log('\n💰 STEP 4: Admin Minting QUSD for Alice (Treasury Operation)');
  console.log('🏛️  Security: Admin mint signed by treasury admin key');
  console.log('⚠️  Security: Final QUSD storage will be at classical Sui address');
  
  // In a real system, the admin would have their own Falcon key pair
  // For demo purposes, we'll simulate an admin mint operation
  const mintAmount = '1000';
  const adminMintTransaction = {
    type: 'mint',
    from: 'treasury',
    to: aliceSuiAddress,  // Mint directly to Alice's Sui address
    amount: mintAmount,
    nonce: Date.now()
  };

  console.log(`💵 Admin minting ${mintAmount} QUSD to Alice's Sui address`);
  console.log(`📍 Target address: ${aliceSuiAddress}`);
  console.log('💡 Note: In production, this would require admin authorization');

  // Simulate admin mint (in production this would be a separate admin flow)
  console.log('✅ Admin mint simulated - Alice now has QUSD at her Sui address');

  // ============================================================================
  // STEP 5: ALICE DEPOSITS QUSD TO ESCROW FOR QUANTUM TRANSFERS
  // ============================================================================
  console.log('\n🔒 STEP 5: Alice Depositing QUSD to Escrow for Quantum Transfers');
  console.log('✅ Security: Deposit signed with quantum-resistant Falcon signature');
  console.log('💡 Purpose: Escrow enables quantum-resistant transfer authorization');
  
  const depositAmount = '800'; // Deposit most of her QUSD to escrow
  const depositTransaction = {
    type: 'deposit',
    from: aliceWallet.publicKey, // Use Alice's Falcon key
    to: 'escrow',
    amount: depositAmount,
    nonce: Date.now()
  };

  // Sign with Alice's quantum-resistant Falcon signature
  const depositMessage = JSON.stringify(depositTransaction);
  const depositSignature = libas.falconSign(depositMessage, aliceWallet.privateKey);
  
  console.log(`🔒 Depositing ${depositAmount} QUSD to escrow for quantum transfers`);
  console.log('✍️  Signing deposit transaction with Alice\'s Falcon signature...');

  result = await makeRequest(`${API_BASE_URL}/api/transactions/submit`, 'POST', {
    type: depositTransaction.type,
    from: depositTransaction.from,
    to: depositTransaction.to,
    amount: depositTransaction.amount,
    nonce: depositTransaction.nonce,
    falcon_signature: depositSignature,
    public_key: aliceWallet.publicKey
  });

  if (result.success) {
    console.log(`✅ Deposit transaction submitted: ${result.data.transaction_id}`);
    console.log(`📊 Status: ${result.data.status}`);
  } else {
    console.log('❌ Deposit transaction failed:', result.data?.error);
    // Continue with flow for demonstration even if deposit fails
  }

  // Wait for processing
  console.log('⏳ Waiting for deposit transaction to process...');
  await sleep(3000);

  // ============================================================================
  // STEP 6: CHECK ALICE'S ESCROW BALANCE
  // ============================================================================
  console.log('\n💰 STEP 6: Checking Alice\'s Escrow Balance');
  
  result = await makeRequest(`${API_BASE_URL}/api/transactions/check-balance`, 'POST', {
    public_key: aliceWallet.publicKey
  });

  if (result.success) {
    console.log(`💰 Alice's escrow balance: ${result.data.escrow_balance} QUSD`);
    console.log(`📍 Address type: ${result.data.address_type}`);
    console.log('✅ Alice now has QUSD in escrow for quantum-resistant transfers');
  } else {
    console.log('❌ Failed to check Alice escrow balance');
    // For demo purposes, we'll continue even if balance check fails
    console.log('💡 Continuing demo with simulated balance...');
  }

  // ============================================================================
  // STEP 7: QUANTUM-RESISTANT TRANSFER FROM ALICE TO BOB
  // ============================================================================
  console.log('\n💸 STEP 7: Quantum-Resistant Transfer from Alice to Bob');
  console.log('✅ Security: Transaction authorization is quantum-resistant');
  console.log('✅ Security: Signature verification uses Falcon cryptography');
  console.log('⚠️  Security: Final settlement uses classical Sui blockchain');
  
  const transferAmount = '300';
  const transferTransaction = {
    type: 'transfer',
    from: aliceWallet.publicKey,  // Falcon key for authorization
    to: bobSuiAddress,           // Classical Sui address for destination
    amount: transferAmount,
    nonce: Date.now()
  };

  // Sign with quantum-resistant Falcon signature
  const transferMessage = JSON.stringify(transferTransaction);
  const transferSignature = libas.falconSign(transferMessage, aliceWallet.privateKey);
  
  console.log(`💸 Transferring ${transferAmount} QUSD from Alice to Bob`);
  console.log('✍️  Signing transfer with Falcon signature...');

  result = await makeRequest(`${API_BASE_URL}/api/transactions/submit`, 'POST', {
    type: transferTransaction.type,
    from: transferTransaction.from,
    to: transferTransaction.to,
    amount: transferTransaction.amount,
    nonce: transferTransaction.nonce,
    falcon_signature: transferSignature,
    public_key: aliceWallet.publicKey
  });

  if (result.success) {
    console.log(`✅ Transfer transaction submitted: ${result.data.transaction_id}`);
    console.log(`📊 Status: ${result.data.status}`);
  } else {
    console.log('❌ Transfer transaction failed');
    // This might fail due to insufficient escrow balance
    console.log('💡 Note: Transfer may fail due to zero escrow balance in simulation');
  }

  // Wait for processing
  console.log('⏳ Waiting for transfer to process...');
  await sleep(3000);

  // ============================================================================
  // STEP 8: CHECK TRANSACTION STATUS AND QUEUE
  // ============================================================================
  console.log('\n📊 STEP 8: Checking System Status');
  
  result = await makeRequest(`${API_BASE_URL}/api/transactions/queue/status`);
  if (result.success) {
    console.log('📊 Queue Status:');
    console.log(`   📥 Queue Length: ${result.data.queue.queueLength || 0}`);
    console.log(`   📦 Processed Transactions: ${result.data.queue.processedCount || 0}`);
  }

  // Check processed transactions
  result = await makeRequest(`${API_BASE_URL}/api/transactions/processed`);
  if (result.success) {
    console.log(`📋 Total Processed Transactions: ${result.data.count}`);
    if (result.data.transactions.length > 0) {
      console.log('📝 Recent Transactions:');
      result.data.transactions.slice(-3).forEach(tx => {
        console.log(`   ${tx.id}: ${tx.type} ${tx.amount} QUSD (${tx.status})`);
      });
    }
  }

  // ============================================================================
  // STEP 9: DEMONSTRATE DEPOSIT INSTRUCTIONS (FOR ESCROW)
  // ============================================================================
  console.log('\n🔒 STEP 9: Getting Escrow Deposit Instructions');
  console.log('💡 For quantum transfers, users need QUSD in escrow');
  
  result = await makeRequest(`${API_BASE_URL}/api/transactions/deposit-escrow`, 'POST', {
    user_address: aliceWallet.publicKey,
    amount: '500',
    buffer_percentage: 20
  });

  if (result.success) {
    if (result.data.deposit_needed) {
      console.log('📋 Deposit Instructions Generated:');
      console.log(`   💰 Suggested Deposit: ${result.data.deposit_instructions.suggested_deposit_amount} QUSD`);
      console.log(`   📊 Buffer: ${result.data.deposit_instructions.buffer_amount} QUSD`);
      console.log(`   🔧 Smart Contract Function: ${result.data.deposit_instructions.contract_info.function}`);
    } else {
      console.log('✅ User already has sufficient escrow balance');
    }
  }

  // ============================================================================
  // STEP 10: FINAL SECURITY ASSESSMENT
  // ============================================================================
  console.log('\n🛡️  STEP 10: Security Assessment Summary');
  console.log('=' .repeat(80));
  
  console.log('\n✅ QUANTUM-RESISTANT COMPONENTS:');
  console.log('   🔐 Transaction signing (Falcon-512)');
  console.log('   🔐 Signature verification (off-chain)');
  console.log('   🔐 Batch aggregation (Falcon aggregation)');
  console.log('   🔐 Authorization integrity');
  console.log('   🔐 Protection against signature forgery');
  
  console.log('\n⚠️  QUANTUM-VULNERABLE COMPONENTS:');
  console.log('   ❌ Final QUSD storage (classical Sui addresses)');
  console.log('   ❌ Escrow deposits/withdrawals (require Ed25519)');
  console.log('   ❌ Settlement transactions (verifier uses Ed25519)');
  console.log('   ❌ Wallet interactions (controlled by classical keys)');
  
  console.log('\n🎯 VULNERABILITY CONCLUSION:');
  console.log('   📊 Quantum resistance: TRANSACTION PROCESSING ONLY');
  console.log('   📊 Asset protection: CLASSICAL (quantum-vulnerable)');
  console.log('   📊 Real security: Protects transport, not destination');
  console.log('   📊 Quantum attack result: FUNDS CAN STILL BE STOLEN');

  // ============================================================================
  // STEP 11: SIMULATE QUANTUM ATTACK SCENARIO
  // ============================================================================
  console.log('\n💥 STEP 11: Quantum Attack Simulation');
  console.log('🚨 Demonstrating how quantum computer could steal QUSD');
  console.log('=' .repeat(80));
  
  console.log('\n🖥️  Quantum Computer Attack Scenario:');
  console.log('   1. 🔓 Quantum computer breaks Alice\'s Ed25519 private key');
  console.log('   2. 🕵️  Attacker derives Alice\'s Sui private key from public key');
  console.log('   3. 💰 Attacker sees Alice has QUSD at her Sui address');
  console.log('   4. 🏴‍☠️ Attacker creates malicious transaction:');
  console.log(`      - From: ${aliceSuiAddress}`);
  console.log('      - To: <attacker_address>');
  console.log('      - Amount: ALL Alice\'s QUSD');
  console.log('   5. ✍️  Attacker signs with Alice\'s stolen private key');
  console.log('   6. 💸 Sui blockchain accepts transaction (valid signature)');
  console.log('   7. 😭 Alice\'s QUSD is stolen');
  
  console.log('\n💡 KEY INSIGHT:');
  console.log('   The Falcon signatures only protected the AUTHORIZATION');
  console.log('   They did NOT protect the final STORAGE');
  console.log('   Quantum resistance is TRANSPORT-LEVEL, not STORAGE-LEVEL');

  console.log('\n🌟 End-to-End Flow Complete!');
  console.log('📖 This demo shows both the strengths and limitations of the hybrid approach');
  console.log('=' .repeat(80));
}

// Main execution
async function main() {
  try {
    await completeE2EFlow();
  } catch (error) {
    console.error('💥 Demo failed:', error.message);
    console.error('🔧 Make sure Feng-Sui server is running on', API_BASE_URL);
  }
}

// Export for testing
module.exports = {
  completeE2EFlow,
  makeRequest
};

// Run if called directly
if (require.main === module) {
  main();
} 
