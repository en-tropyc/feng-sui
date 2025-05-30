const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');

async function checkBatchSequence() {
  const client = new SuiClient({ url: 'http://127.0.0.1:9000' });
  const packageId = '0x85130d00c41129b40066397e664db755cf2711c660644937e309eff2a59168c4';
  const treasuryId = '0xc6044fc294fd88a39094dcba1f8159d1b04a64a1ec049087ccb760462a3132b7';
  
  console.log('🔍 Checking QUSD Treasury Batch Sequence...');
  
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::qusd::get_batch_sequence`,
      arguments: [tx.object(treasuryId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0xf1c3d2d98f56fc397f2855b31cb9245f2778b71891debe4229dc77e9a5d31791',
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
  const packageId = '0x85130d00c41129b40066397e664db755cf2711c660644937e309eff2a59168c4';
  const settlementStateId = '0x09870818153edca1cead7c49943d0962b920d2ee20e93af4dd67d3d0cf7b479d';
  
  console.log('🔍 Checking Settlement Current Sequence...');
  
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::settlement::get_current_sequence`,
      arguments: [tx.object(settlementStateId)],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0xf1c3d2d98f56fc397f2855b31cb9245f2778b71891debe4229dc77e9a5d31791',
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
