#!/bin/bash

# Automated Contract Deployment and Configuration Update Script
# This script deploys the QUSD contracts and creates deployment.json config

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

# Navigate back to demo directory
cd feng-sui-network/demo

# Create/update config file for scripts to read from
echo "📝 Creating deployment configuration..."
cat > config.json << EOF
{
  "packageId": "$PACKAGE_ID",
  "treasuryId": "$TREASURY_ID",
  "settlementStateId": "$SETTLEMENT_STATE_ID",
  "adminAddress": "$ADMIN_ADDRESS",
  "deploymentDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "network": "localnet"
}
EOF

echo "✅ Configuration file created at config.json"

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
echo "   ✅ Configuration saved to config.json"
echo "   ✅ Scripts will automatically read from config file"
echo "   ✅ Admin authorized as minter"
echo ""
echo "🚀 Ready to run the demo with: node feng-sui-network/demo/demo.js" 
