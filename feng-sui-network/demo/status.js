const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');
const config = require('./config');

async function checkBatchSequence() {
  const client = new SuiClient({ url: 'http://127.0.0.1:9000' });
  
  console.log('🔍 Checking QUSD Treasury Batch Sequence...');
  console.log(`📦 Using Package: ${config.packageId}`);
  console.log(`🏦 Using Treasury: ${config.treasuryId}`);
  
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${config.packageId}::qusd::get_batch_sequence`,
      arguments: [tx.object(config.treasuryId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: config.adminAddress,
    });
    
    if (result.results && result.results[0] && result.results[0].returnValues) {
      const currentSequence = parseInt(result.results[0].returnValues[0][0]);
      console.log(`\n✅ Current Treasury Batch Sequence: ${currentSequence}`);
      console.log(`📈 Next Treasury Sequence to Use: ${currentSequence + 1}`);
      
      return currentSequence;
    } else {
      console.log('❌ Could not retrieve treasury sequence number');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error checking treasury sequence: ${error.message}`);
    return null;
  }
}

async function checkSettlementSequence() {
  const client = new SuiClient({ url: 'http://127.0.0.1:9000' });
  
  console.log('🔍 Checking Settlement Current Sequence...');
  console.log(`📦 Using Package: ${config.packageId}`);
  console.log(`⚙️  Using Settlement State: ${config.settlementStateId}`);
  
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${config.packageId}::settlement::get_current_sequence`,
      arguments: [tx.object(config.settlementStateId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: config.adminAddress,
    });
    
    if (result.results && result.results[0] && result.results[0].returnValues) {
      const currentSequence = parseInt(result.results[0].returnValues[0][0]);
      console.log(`\n✅ Current Settlement Sequence: ${currentSequence}`);
      console.log(`📈 Next Settlement Sequence to Use: ${currentSequence + 1}`);
      
      return currentSequence;
    } else {
      console.log('❌ Could not retrieve settlement sequence number');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error checking settlement sequence: ${error.message}`);
    return null;
  }
}

if (require.main === module) {
  Promise.all([
    checkBatchSequence(),
    checkSettlementSequence()
  ]).catch(console.error);
}

module.exports = { checkBatchSequence, checkSettlementSequence }; 
