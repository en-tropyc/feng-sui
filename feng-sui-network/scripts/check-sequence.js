const { SuiClient } = require('@mysten/sui/client');
const { Transaction } = require('@mysten/sui/transactions');

async function checkBatchSequence() {
  const client = new SuiClient({ url: 'http://127.0.0.1:9000' });
  const packageId = '0xd64ce8879c11168550fc4b2586c7063d785803a0b4a14900c35bdaee204d9e5b';
  const treasuryId = '0xd3f6e0ade58c6c0b7d588e296595bd6d73deac52c667f5b72a38770522e6275e';
  
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
  const packageId = '0xd64ce8879c11168550fc4b2586c7063d785803a0b4a14900c35bdaee204d9e5b';
  const settlementStateId = '0xb618969c40f830f074e9847bc1a7d3c81681e68957fbb2071f1d561cf44967f5';
  
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
