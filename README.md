Demonstration of quantum-resistant payments using Falcon-512 signatures and escrow deposits on Sui.

## Quick Start

### 1. Start Local Sui Network
```bash
sui start --with-faucet --force-regenesis
```

### 2. Fund Your Account
```bash
sui client faucet
```

### 3. Deploy & Configure Contracts
```bash
./feng-sui-network/demo/setup.sh
```
This script automatically:
- Deploys the QUSD contracts
- Extracts deployment IDs
- Creates `config.json` configuration
- Authorizes admin as minter

Upon success you should see: `🎉 Deployment and configuration complete!`

### 4. Run Demo
```bash
node feng-sui-network/demo/demo.js
```
Track finalized transactions on [Suiscan](https://custom.suiscan.xyz/) or other explorer.

## What You'll See

The demo shows:
- 🔐 Falcon-512 keygen, signing, aggregation and verification
- 💰 Escrow deposits with coin splitting
- 🔄 Live balance updates during transfers
- ✅ On-chain settlement execution
- 📊 Real-time batch and settlement sequence tracking
