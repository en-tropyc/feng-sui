const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');

async function checkBatchSequence() {
  const client = new SuiClient({ url: 'http://127.0.0.1:9000' });
  const packageId = '0xc02d533bd6412192ca6fc90463dcd118dfe0101c8083c956e68524215611da23';
  const treasuryId = '0x43fa9f9665b8456a60caa7aeecc7d3a0422c03dffe63756e550c0050b6da87e0';
  
  console.log('🔍 Checking QUSD Treasury Batch Sequence...');
  
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::qusd::get_batch_sequence`,
      arguments: [tx.object(treasuryId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x7eca513ab0e0f17c2456f0935868928bf091370a974d1fa8884e562a9793d6fe',
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
  const packageId = '0xc02d533bd6412192ca6fc90463dcd118dfe0101c8083c956e68524215611da23';
  const settlementStateId = '0x1267a8d011b188fe33865c43fbe131c9b817b76dbd3ceb2c47485a7cde513e6b';
  
  console.log('🔍 Checking Settlement Current Sequence...');
  
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::settlement::get_current_sequence`,
      arguments: [tx.object(settlementStateId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x7eca513ab0e0f17c2456f0935868928bf091370a974d1fa8884e562a9793d6fe',
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
