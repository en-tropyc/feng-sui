#!/bin/bash

# Automated Contract Deployment and Configuration Update Script
# This script deploys the QUSD contracts and automatically updates all configuration files

set -e  # Exit on any error

echo "🚀 Starting automated QUSD contract deployment..."

# Navigate to contracts directory
cd qusd-contracts

# Build contracts first
echo "🔨 Building contracts..."
sui move build

# Deploy contracts and capture output
echo "📦 Deploying contracts..."
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

# Extract key information from deployment output
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
TREASURY_ID=$(echo "$DEPLOY_OUTPUT" | jq -r '.objectChanges[] | select(.objectType != null and (.objectType | contains("::qusd::Treasury"))) | .objectId')
SETTLEMENT_STATE_ID=$(echo "$DEPLOY_OUTPUT" | jq -r '.objectChanges[] | select(.objectType != null and (.objectType | contains("::settlement::SettlementState"))) | .objectId')

# Get the admin address (sender of the deployment transaction)
ADMIN_ADDRESS=$(echo "$DEPLOY_OUTPUT" | jq -r '.transaction.data.sender')

echo "✅ Deployment successful!"
echo "📋 Extracted information:"
echo "   Package ID: $PACKAGE_ID"
echo "   Treasury ID: $TREASURY_ID"
echo "   Settlement State ID: $SETTLEMENT_STATE_ID"
echo "   Admin Address: $ADMIN_ADDRESS"

# Navigate back to root
cd ..

# Update live-quantum-demo.js
echo "🔄 Updating live-quantum-demo.js..."
sed -i "s/this\.packageId = '0x[a-fA-F0-9]*'/this.packageId = '$PACKAGE_ID'/" feng-sui-network/scripts/live-quantum-demo.js
sed -i "s/this\.settlementStateId = '0x[a-fA-F0-9]*'/this.settlementStateId = '$SETTLEMENT_STATE_ID'/" feng-sui-network/scripts/live-quantum-demo.js

# Update treasury ID references in live-quantum-demo.js
sed -i 's/`--args 0x[a-fA-F0-9]*`, \/\/ Treasury ID/`--args '$TREASURY_ID'`, \/\/ Treasury ID/g' feng-sui-network/scripts/live-quantum-demo.js

# Update admin address references
sed -i "s/0x[a-fA-F0-9]*', \/\/ Admin address/$ADMIN_ADDRESS', \/\/ Admin address/g" feng-sui-network/scripts/live-quantum-demo.js
sed -i "s/sui client switch --address 0x[a-fA-F0-9]*/sui client switch --address $ADMIN_ADDRESS/g" feng-sui-network/scripts/live-quantum-demo.js

# Update check-sequence.js
echo "🔄 Updating check-sequence.js..."
sed -i "s/const packageId = '0x[a-fA-F0-9]*'/const packageId = '$PACKAGE_ID'/" feng-sui-network/scripts/check-sequence.js
sed -i "s/const treasuryId = '0x[a-fA-F0-9]*'/const treasuryId = '$TREASURY_ID'/" feng-sui-network/scripts/check-sequence.js
sed -i "s/const settlementStateId = '0x[a-fA-F0-9]*'/const settlementStateId = '$SETTLEMENT_STATE_ID'/" feng-sui-network/scripts/check-sequence.js
sed -i "s/sender: '0x[a-fA-F0-9]*'/sender: '$ADMIN_ADDRESS'/g" feng-sui-network/scripts/check-sequence.js

# Create/update config file for future reference
echo "📝 Creating config file..."
cat > config/deployment.json << EOF
{
  "packageId": "$PACKAGE_ID",
  "treasuryId": "$TREASURY_ID",
  "settlementStateId": "$SETTLEMENT_STATE_ID",
  "adminAddress": "$ADMIN_ADDRESS",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "network": "localnet"
}
EOF

# Add admin as minter
echo "🔑 Adding admin as authorized minter..."
sui client switch --address "$ADMIN_ADDRESS"
sui client call \
  --package "$PACKAGE_ID" \
  --module qusd \
  --function add_minter \
  --args "$TREASURY_ID" "$ADMIN_ADDRESS" \
  --gas-budget 20000000

echo ""
echo "🎉 Deployment and configuration complete!"
echo "📋 Summary:"
echo "   ✅ Contracts deployed and built"
echo "   ✅ Configuration files updated"
echo "   ✅ Admin authorized as minter"
echo "   ✅ Deployment info saved to config/deployment.json"
echo ""
echo "🚀 Ready to run the demo with: node feng-sui-network/scripts/live-quantum-demo.js" 
