const SuiSettlement = require('./src/core/SuiSettlement');

async function testSettlement() {
  console.log('🧪 Testing Settlement with Corrected Addresses...\n');
  
  try {
    // Initialize settlement
    const settlement = new SuiSettlement();
    await settlement.initialize();
    
    console.log('✅ Settlement initialized successfully');
    
    // Test getting current sequence
    console.log('\n📊 Testing getCurrentSequence...');
    const currentSequence = await settlement.getCurrentSequence();
    console.log(`✅ Current sequence: ${currentSequence}`);
    
    // Test contract info
    console.log('\n📋 Contract Information:');
    const contractInfo = settlement.getContractInfo();
    console.log(`Package ID: ${contractInfo.packageId}`);
    console.log(`Treasury ID: ${contractInfo.treasuryId}`);
    console.log(`Settlement State ID: ${contractInfo.settlementStateId}`);
    
    // Test network status
    console.log('\n🌐 Network Status:');
    const networkStatus = await settlement.getNetworkStatus();
    console.log(`Connected: ${networkStatus.connected}`);
    if (networkStatus.connected) {
      console.log(`Chain ID: ${networkStatus.chainId}`);
      console.log(`Latest Checkpoint: ${networkStatus.latestCheckpoint}`);
    }
    
    console.log('\n🎉 All settlement tests passed! Settlement is working correctly.');
    
  } catch (error) {
    console.error('❌ Settlement test failed:', error.message);
    process.exit(1);
  }
}

testSettlement(); 
