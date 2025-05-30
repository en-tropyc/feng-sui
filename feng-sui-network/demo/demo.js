#!/usr/bin/env node

/**
 * LIVE QUANTUM-RESISTANT PAYMENT DEMONSTRATION
 * 
 * This script demonstrates the complete quantum payment flow with
 * periodic balance updates so you can follow the transfer logic:
 * 
 * 1. Initial state check
 * 2. Generate Falcon-512 signatures 
 * 3. Aggregate and verify signatures
 * 4. Execute settlement on-chain
 * 5. Show final balance changes
 */

const path = require('path');
const crypto = require('crypto');
const { SuiClient } = require('@mysten/sui/client');
const { execSync } = require('child_process');
const { checkBatchSequence, checkSettlementSequence } = require('./status');
const config = require('./config');

// Load libas for Falcon crypto operations
const libasPath = path.join(__dirname, '../../libas');
const libas = require(libasPath);

class LiveQuantumDemo {
  constructor() {
    this.client = new SuiClient({ url: 'http://127.0.0.1:9000' });
    
    // Load configuration from deployment.json
    console.log('🔧 Loading deployment configuration...');
    this.packageId = config.packageId;
    this.settlementStateId = config.settlementStateId;
    this.treasuryId = config.treasuryId;
    this.adminAddress = config.adminAddress;
    
    console.log(`📦 Package ID: ${this.packageId}`);
    console.log(`⚙️  Settlement State: ${this.settlementStateId}`);
    console.log(`🏦 Treasury: ${this.treasuryId}`);
    console.log(`👑 Admin: ${this.adminAddress}`);
    
    // Users will be dynamically created
    this.users = {};
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearScreen() {
    process.stdout.write('\x1b[2J\x1b[0f');
  }

  async createNewSuiAddress() {
    console.log('🔧 Generating new Sui address...');
    try {
      const result = execSync('sui client new-address ed25519', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Extract address from output - looks for pattern like "Created new keypair and saved it to keystore."
      // followed by "0x..." address
      const addressMatch = result.match(/0x[a-fA-F0-9]+/);
      if (!addressMatch) {
        throw new Error('Could not extract address from sui client output');
      }
      
      const address = addressMatch[0];
      console.log(`   ✅ Generated: ${address}`);
      return address;
    } catch (error) {
      console.error('❌ Failed to create new address:', error.message);
      throw error;
    }
  }

  async getSuiBalance(address) {
    try {
      const balance = await this.client.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      });
      return parseInt(balance.totalBalance);
    } catch (error) {
      return 0; // If error, assume 0 balance
    }
  }

  async requestFaucetFunding(address) {
    console.log(`   💰 Requesting SUI from faucet for ${address.slice(0, 8)}...`);
    try {
      const result = execSync(`curl -X POST "http://127.0.0.1:9123/gas" -H "Content-Type: application/json" -d '{"FixedAmountRequest": {"recipient": "${address}"}}'`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Check if the request was successful
      if (result.includes('error') || result.includes('Error')) {
        throw new Error(`Faucet request failed: ${result}`);
      }
      
      console.log(`   ✅ Faucet request submitted`);
      return true;
    } catch (error) {
      console.log(`   ⚠️  Faucet request failed: ${error.message}`);
      return false;
    }
  }

  async waitForFunding(address, minBalance = 1000000000, maxWaitTime = 10000) {
    console.log(`   ⏳ Waiting for funding to appear...`);
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const balance = await this.getSuiBalance(address);
      if (balance >= minBalance) {
        console.log(`   ✅ Funding confirmed: ${balance / 1000000000} SUI`);
        return true;
      }
      await this.sleep(1000); // Wait 1 second before checking again
    }
    
    console.log(`   ❌ Funding timeout after ${maxWaitTime/1000}s`);
    return false;
  }

  async ensureGasFunding(address, minBalance = 1000000000) { // 1 SUI minimum
    const currentBalance = await this.getSuiBalance(address);
    
    if (currentBalance >= minBalance) {
      console.log(`   ✅ Already funded: ${currentBalance / 1000000000} SUI`);
      return true;
    }
    
    console.log(`   💸 Current balance: ${currentBalance / 1000000000} SUI (need ${minBalance / 1000000000} SUI)`);
    
    // Request funding from faucet
    const faucetSuccess = await this.requestFaucetFunding(address);
    if (!faucetSuccess) {
      throw new Error('Faucet funding request failed');
    }
    
    // Wait for funding to appear
    const fundingSuccess = await this.waitForFunding(address, minBalance);
    if (!fundingSuccess) {
      throw new Error('Funding verification failed');
    }
    
    return true;
  }

  async generateDemoUsers() {
    console.log('\n🏗️  CREATING DEMO USERS');
    console.log('═'.repeat(80));
    
    const userRoles = {
      alice: 'sender',
      bob: 'recipient', 
      carol: 'sender',
      dave: 'recipient'
    };
    
    for (const [name, role] of Object.entries(userRoles)) {
      console.log(`\n👤 Creating ${name.toUpperCase()}:`);
      
      // Generate new address
      const address = await this.createNewSuiAddress();
      
      // Ensure gas funding
      await this.ensureGasFunding(address);
      
      this.users[name] = { 
        address, 
        role,
        isNewlyCreated: true 
      };
      
      console.log(`   🎯 ${name.toUpperCase()} ready: ${address}`);
      await this.sleep(500);
    }
    
    console.log('\n🎉 All demo users created and funded!');
    return this.users;
  }

  async checkUserBalance(name, address) {
    try {
      // Check direct QUSD
      const balance = await this.client.getBalance({
        owner: address,
        coinType: `${this.packageId}::qusd::QUSD`
      });
      const directQUSD = parseInt(balance.totalBalance) / 100000000;
      
      // Check escrow balance
      let escrowQUSD = 0;
      try {
        const { Transaction } = require('@mysten/sui/transactions');
        const tx = new Transaction();
        tx.moveCall({
          target: `${this.packageId}::settlement::get_escrow_balance`,
          arguments: [
            tx.object(this.settlementStateId),
            tx.pure.address(address)
          ],
        });
        
        const escrowResult = await this.client.devInspectTransactionBlock({
          transactionBlock: tx,
          sender: address,
        });
        
        if (escrowResult.results?.[0]?.returnValues) {
          escrowQUSD = parseInt(escrowResult.results[0].returnValues[0][0]) / 100000000;
        }
      } catch (e) {
        // Escrow check failed, that's ok
      }
      
      return { direct: directQUSD, escrow: escrowQUSD, total: directQUSD + escrowQUSD };
    } catch (error) {
      return { direct: 0, escrow: 0, total: 0 };
    }
  }

  async displayCurrentBalances(title, showDiff = false, previousBalances = null) {
    console.log(`\n🔍 ${title}`);
    console.log('═'.repeat(80));
    
    const currentBalances = {};
    
    for (const [name, user] of Object.entries(this.users)) {
      const balance = await this.checkUserBalance(name, user.address);
      currentBalances[name] = balance;
      
      let diffStr = '';
      if (showDiff && previousBalances && previousBalances[name]) {
        const totalDiff = balance.total - previousBalances[name].total;
        if (totalDiff > 0) {
          diffStr = ` (📈 +${totalDiff} QUSD)`;
        } else if (totalDiff < 0) {
          diffStr = ` (📉 ${totalDiff} QUSD)`;
        } else {
          diffStr = ` (➡️  no change)`;
        }
      }
      
      const emoji = user.role === 'sender' ? '💸' : '💰';
      console.log(`${emoji} ${name.padEnd(6).toUpperCase()} | Direct: ${balance.direct.toString().padStart(4)} | Escrow: ${balance.escrow.toString().padStart(4)} | Total: ${balance.total.toString().padStart(4)} QUSD${diffStr}`);
    }
    
    return currentBalances;
  }

  async generateFalconSignatures(transactions) {
    console.log('\n🔐 GENERATING QUANTUM-RESISTANT SIGNATURES');
    console.log('═'.repeat(80));
    
    // Generate Falcon keypairs
    for (const name of Object.keys(this.users)) {
      const keypair = libas.createKeyPair();
      this.users[name].falconPublicKey = keypair.publicKey;
      this.users[name].falconPrivateKey = keypair.privateKey;
      console.log(`✅ ${name.toUpperCase()}: Generated Falcon-512 keypair (${keypair.publicKey.length} bytes)`);
      await this.sleep(500);
    }

    console.log('\n📋 TRANSACTION BATCH:');
    transactions.forEach((tx, i) => {
      // Add IDs for signature generation
      tx.id = `tx${(i+1).toString().padStart(3, '0')}`;
      console.log(`${i+1}. ${tx.id}: ${tx.from.toUpperCase()} → ${tx.to.toUpperCase()} (${tx.amount} QUSD) - ${tx.description}`);
    });

    console.log('\n✍️  SIGNING TRANSACTIONS WITH FALCON-512:');
    const signatures = [];
    const publicKeys = [];
    const messages = [];

    for (const tx of transactions) {
      console.log(`🔐 Signing ${tx.id}...`);
      
      // Create canonical message
      const transferData = {
        type: 'quantum_transfer',
        id: tx.id,
        from_address: this.users[tx.from].address,
        to_address: this.users[tx.to].address,
        amount: tx.amount,
        timestamp: new Date().toISOString(),
        nonce: crypto.randomBytes(16).toString('hex'),
        description: tx.description
      };

      const canonicalMessage = JSON.stringify(transferData, Object.keys(transferData).sort());
      
      // Sign with Falcon
      const signature = libas.falconSign(canonicalMessage, this.users[tx.from].falconPrivateKey);
      
      signatures.push(signature);
      publicKeys.push(this.users[tx.from].falconPublicKey);
      messages.push(canonicalMessage);
      
      console.log(`   ✅ Signature generated: ${signature.length} bytes`);
      await this.sleep(300);
    }

    console.log('\n🔗 AGGREGATING QUANTUM SIGNATURES:');
    console.log('🔄 Combining 4 individual Falcon signatures...');
    const aggregateSignature = libas.aggregate(messages, signatures, publicKeys);
    console.log(`✅ Aggregate signature created: ${aggregateSignature.length} characters`);
    
    console.log('\n🔍 VERIFYING AGGREGATE SIGNATURE:');
    const isValid = libas.verify(aggregateSignature, messages, publicKeys);
    console.log(`✅ Verification result: ${isValid ? '🟢 VALID' : '🔴 INVALID'}`);
    
    if (!isValid) {
      throw new Error('Aggregate signature verification failed!');
    }

    return { transactions, aggregateSignature, isValid };
  }

  async executeSettlement(transactions) {
    console.log('\n⚡ EXECUTING ON-CHAIN SETTLEMENT');
    console.log('═'.repeat(80));
    
    // Extract settlement parameters
    const fromAddresses = transactions.map(tx => this.users[tx.from].address);
    const toAddresses = transactions.map(tx => this.users[tx.to].address);
    const amounts = transactions.map(tx => (tx.amount * 100000000).toString());
    
    console.log('🔄 Preparing settlement transaction...');
    console.log('📦 Package ID:', this.packageId);
    console.log('⚙️  Settlement State:', this.settlementStateId);
    console.log('📊 Batch size:', transactions.length, 'transfers');
    
    // Get current settlement sequence
    console.log('📊 Getting current settlement sequence...');
    const currentSequence = await checkSettlementSequence();
    
    if (currentSequence === null) {
      console.error('❌ Could not retrieve current settlement sequence');
      return false;
    }
    
    const nextSequence = currentSequence + 1;
    console.log(`📈 Using settlement sequence: ${nextSequence} (current: ${currentSequence})`);
    
    // Construct the command as a single line
    const command = [
      'sui client call',
      `--package ${this.packageId}`,
      '--module settlement',
      '--function settle_transfer_batch_with_withdrawal',
      `--args ${this.settlementStateId}`,
      `"[${fromAddresses.join(',')}]"`,
      `"[${toAddresses.join(',')}]"`,
      `"[${amounts.join(',')}]"`,
      nextSequence.toString(),
      '--gas-budget 30000000'
    ].join(' ');

    console.log('\n🚀 Executing settlement...');
    console.log('🔧 Command:', command);
    
    try {
      // Switch to admin address first
      execSync(`sui client switch --address ${this.adminAddress}`, { stdio: 'pipe' });
      
      // Execute the settlement
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Settlement executed successfully!');
      console.log('🔗 Transaction completed on Sui blockchain');
      
      return true;
    } catch (error) {
      console.error('❌ Settlement failed:', error.message);
      console.error('📋 Full error output:', error.stdout || error.stderr || 'No additional output');
      return false;
    }
  }

  async fundUsersWithQUSD() {
    console.log('\n💵 FUNDING USERS WITH QUSD');
    console.log('═'.repeat(80));
    
    // Target balances for each user to have enough for demo
    const targetBalances = {
      alice: 100,  // Will send 25 total (10+15)
      bob: 150,    // Will send 20, should have buffer
      carol: 50,   // Will receive 20, needs some buffer
      dave: 150    // Will send 5, should have buffer
    };
    
    console.log('🎯 Target balances for demo:');
    for (const [user, amount] of Object.entries(targetBalances)) {
      console.log(`   ${user.toUpperCase()}: ${amount} QUSD`);
    }
    
    // Check which users need funding
    const usersToFund = [];
    const amountsToMint = [];
    
    for (const [user, targetAmount] of Object.entries(targetBalances)) {
      const address = this.users[user].address;
      const balance = await this.checkUserBalance(user, address);
      
      console.log(`\n🔍 ${user.toUpperCase()} current balance: ${balance.total} QUSD`);
      
      if (balance.total < targetAmount) {
        const needed = targetAmount - balance.total;
        console.log(`💰 Need to mint ${needed} QUSD for ${user.toUpperCase()}`);
        usersToFund.push(address);
        amountsToMint.push((needed * 100000000).toString()); // Convert to base units
      } else {
        console.log(`✅ ${user.toUpperCase()} has sufficient balance`);
      }
    }
    
    if (usersToFund.length === 0) {
      console.log('\n🎉 All users already have sufficient funds!');
      return true;
    }
    
    try {
      // First, ensure admin is an authorized minter
      console.log('\n🔧 Setting up minting authorization...');
      const addMinterCommand = [
        'sui client call',
        `--package ${this.packageId}`,
        '--module qusd',
        '--function add_minter',
        `--args ${this.treasuryId}`, // Treasury ID
        this.adminAddress, // Admin address
        '--gas-budget 20000000'
      ].join(' ');
      
      execSync(`sui client switch --address ${this.adminAddress}`, { stdio: 'pipe' });
      
      try {
        execSync(addMinterCommand, { stdio: 'pipe' });
        console.log('✅ Admin authorized as minter');
      } catch (e) {
        // Admin might already be a minter, that's fine
        console.log('ℹ️  Admin already authorized as minter');
      }
      
      // Get current sequence number
      console.log('📊 Getting current batch sequence...');
      const currentSequence = await checkBatchSequence();
      
      if (currentSequence === null) {
        throw new Error('Could not retrieve current batch sequence');
      }
      
      const nextSequence = currentSequence + 1;
      console.log(`📈 Using sequence number: ${nextSequence} (current: ${currentSequence})`);
      
      // Execute batch mint
      console.log(`💸 Minting QUSD for ${usersToFund.length} users...`);
      const batchMintCommand = [
        'sui client call',
        `--package ${this.packageId}`,
        '--module qusd',
        '--function batch_mint',
        `--args ${this.treasuryId}`, // Treasury ID
        `"[${usersToFund.join(',')}]"`,
        `"[${amountsToMint.join(',')}]"`,
        nextSequence.toString(),
        '--gas-budget 30000000'
      ].join(' ');
      
      const result = execSync(batchMintCommand, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      console.log('✅ Successfully batch minted QUSD!');
      
      // Verify funding worked
      console.log('\n🔍 Verifying funding results:');
      for (const [user, targetAmount] of Object.entries(targetBalances)) {
        const address = this.users[user].address;
        const balance = await this.checkUserBalance(user, address);
        console.log(`   ${user.toUpperCase()}: ${balance.total} QUSD (target: ${targetAmount})`);
      }
      
      await this.sleep(1000);
    } catch (error) {
      console.error(`❌ Failed to batch mint QUSD:`, error.message);
      return false;
    }
    
    console.log('\n🎉 All users funded successfully!');
    return true;
  }

  async initiateTransactionsAndEscrow() {
    console.log('\n🎯 TRANSACTION INITIATION & PRECISE ESCROW DEPOSITS');
    console.log('═'.repeat(80));
    
    // Define transaction intents (what users want to do)
    const transactions = [
      { from: 'alice', to: 'bob', amount: 10, description: '☕ Coffee payment' },
      { from: 'alice', to: 'dave', amount: 15, description: '💼 Small consulting fee' }, 
      { from: 'bob', to: 'carol', amount: 20, description: '🍕 Lunch payment' },
      { from: 'dave', to: 'alice', amount: 5, description: '💸 Reimbursement' }
    ];
    
    console.log('💭 Users initiating quantum-resistant transactions:');
    transactions.forEach((tx, i) => {
      console.log(`${i+1}. ${tx.from.toUpperCase()}: "I want to send ${tx.to.toUpperCase()} ${tx.amount} QUSD for ${tx.description}"`);
    });
    
    // Calculate escrow needed per user
    const escrowNeeded = {};
    transactions.forEach(tx => {
      if (!escrowNeeded[tx.from]) escrowNeeded[tx.from] = 0;
      escrowNeeded[tx.from] += tx.amount;
    });
    
    console.log('\n🔒 Processing precise escrow deposits (depositing only what\'s needed):');
    
    // Deposit escrow for each user using direct sui client commands
    for (const [userName, amount] of Object.entries(escrowNeeded)) {
      console.log(`\n👤 ${userName.toUpperCase()} needs to deposit ${amount} QUSD to escrow`);
      
      const userAddress = this.users[userName].address;
      
      try {
        // Switch to user's address and call deposit_to_escrow
        const { execSync } = require('child_process');
        
        execSync(`sui client switch --address ${userAddress}`, { stdio: 'pipe' });
        
        console.log(`   🔒 Depositing ${amount} QUSD to escrow...`);
        
        // Get user's QUSD coins first
        const objectsResult = execSync(`sui client objects --json`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        const objects = JSON.parse(objectsResult);
        const qusdCoins = objects.filter(obj => 
          obj.data && obj.data.type && obj.data.type.includes('qusd::QUSD')
        );
        
        if (qusdCoins.length === 0) {
          throw new Error(`No QUSD coins found for ${userName}`);
        }
        
        // Use the first QUSD coin for deposit
        const firstQusdCoin = qusdCoins[0].data.objectId;
        const coinBalance = parseInt(qusdCoins[0].data.content.fields.balance);
        const requiredBaseUnits = amount * 100000000;
        
        console.log(`   📊 User has ${coinBalance / 100000000} QUSD, needs to deposit ${amount} QUSD`);
        console.log(`   💡 Using new partial deposit function to deposit exactly ${amount} QUSD`);
        
        // Use the new deposit_for_transfer function for precise deposits
        const command = [
          'sui client call',
          `--package ${this.packageId}`,
          '--module settlement',
          '--function deposit_for_transfer',
          `--args ${this.settlementStateId} ${firstQusdCoin} ${requiredBaseUnits}`,
          '--gas-budget 20000000'
        ].join(' ');
        
        const result = execSync(command, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        console.log(`   ✅ ${userName.toUpperCase()} deposited exactly ${amount} QUSD to escrow`);
        console.log(`   💰 Remaining ${(coinBalance - requiredBaseUnits) / 100000000} QUSD returned to wallet`);
      } catch (error) {
        console.error(`   ❌ Escrow deposit failed for ${userName}:`, error.message);
        throw new Error(`Escrow deposit failed for ${userName}: ${error.message}`);
      }
      
      await this.sleep(1000);
    }
    
    console.log('\n🎉 All escrow deposits complete! Transactions ready for batch processing...');
    return transactions;
  }

  async runLiveDemo() {
    this.clearScreen();
    
    console.log('🌟'.repeat(40));
    console.log('🚀 LIVE QUANTUM-RESISTANT PAYMENT DEMONSTRATION 🚀');
    console.log('🌟'.repeat(40));
    console.log('');
    console.log('This demo will show real-time balance changes as we:');
    console.log('1. 🏗️  Create fresh demo users with new Sui addresses');
    console.log('2. ⛽ Fund each user with SUI for gas fees');
    console.log('3. 💰 Fund users with QUSD for transactions');
    console.log('4. 🎯 Users initiate transactions & deposit required escrow with precise coin splitting');
    console.log('5. 🔐 Generate quantum-resistant Falcon-512 signatures');
    console.log('6. 🔗 Aggregate signatures using advanced cryptography');
    console.log('7. ✅ Verify aggregate signature integrity');
    console.log('8. ⚡ Execute settlement on Sui blockchain');
    console.log('9. 📊 Show final balance changes');
    
    console.log('\n⏳ Starting demo in 3 seconds...');
    await this.sleep(3000);

    try {
      // Step 1: Generate demo users with fresh addresses
      await this.generateDemoUsers();
      await this.sleep(2000);

      // Step 2: Initial balances  
      const initialBalances = await this.displayCurrentBalances('STEP 1: INITIAL BALANCES');
      await this.sleep(2000);

      // Step 3: Fund users with sufficient QUSD
      const fundingSuccess = await this.fundUsersWithQUSD();
      
      if (!fundingSuccess) {
        console.log('\n❌ User funding failed. Please check the logs above.');
        return;
      }
      
      await this.sleep(2000);

      // Step 4: Show balances after funding
      const postFundingBalances = await this.displayCurrentBalances('STEP 2: POST-FUNDING BALANCES', true, initialBalances);
      await this.sleep(2000);

      // Step 3: Transaction initiation & escrow deposits
      const transactions = await this.initiateTransactionsAndEscrow();
      const postEscrowBalances = await this.displayCurrentBalances('STEP 3: POST-ESCROW BALANCES', true, postFundingBalances);
      await this.sleep(2000);

      // Step 4: Generate signatures for the initiated transactions
      const { aggregateSignature, isValid } = await this.generateFalconSignatures(transactions);
      
      if (!isValid) {
        console.log('\n❌ Signature verification failed. Cannot proceed.');
        return;
      }
      
      await this.sleep(2000);

      // Step 5: Show balances before settlement  
      const preSettlementBalances = await this.displayCurrentBalances('STEP 4: PRE-SETTLEMENT BALANCES', true, postEscrowBalances);
      await this.sleep(2000);

      // Step 6: Execute settlement
      const settlementSuccess = await this.executeSettlement(transactions);
      
      if (settlementSuccess) {
        await this.sleep(3000); // Wait for settlement to complete
        
        // Step 7: Final balances
        const finalBalances = await this.displayCurrentBalances('STEP 5: POST-SETTLEMENT BALANCES', true, preSettlementBalances);
        
        // Summary
        console.log('\n🎉 QUANTUM-RESISTANT PAYMENT COMPLETED!');
        console.log('═'.repeat(80));
        console.log('✅ Users funded with sufficient QUSD');
        console.log('✅ Falcon-512 signatures generated and verified');
        console.log('✅ Quantum-resistant signature aggregation successful');
        console.log('✅ On-chain settlement executed');
        console.log('✅ Balance changes recorded on blockchain');
        
        console.log('\n📈 FINAL BALANCE CHANGES:');
        for (const [name, user] of Object.entries(this.users)) {
          const initialTotal = initialBalances[name].total;
          const finalTotal = finalBalances[name].total;
          const change = finalTotal - initialTotal;
          
          const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
          const changeStr = change > 0 ? `+${change}` : change.toString();
          console.log(`${emoji} ${name.toUpperCase().padEnd(6)}: ${initialTotal} → ${finalTotal} (${changeStr} QUSD)`);
        }
        
        console.log('\n🔐 Demo completed... One step closer to making Sui quantum secure! 🚀');
        
      } else {
        console.log('\n❌ Settlement failed. Please check the logs above.');
      }

    } catch (error) {
      console.error('\n❌ Demo failed:', error.message);
      throw error;
    }
  }
}

// Run the live demo
if (require.main === module) {
  const demo = new LiveQuantumDemo();
  demo.runLiveDemo().catch(console.error);
}

module.exports = LiveQuantumDemo;
