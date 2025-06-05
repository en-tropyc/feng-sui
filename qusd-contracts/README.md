# QUSD: Quantum-Resistant Stablecoin

A quantum-secure USD stablecoin built on Sui blockchain with off-chain Falcon signature verification through the Feng-Sui network.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌───────────────────────┐
│   Sui Wallets   │    │  Escrow Contract │    │ Feng-Sui Network      │
│                 │    │                  │    │                       │
│ Users hold QUSD │───▶│ Working capital  │◀──▶│ Falcon signatures &   │
│ tokens normally │    │ for fast xfers   │    │ batch settlement      │
└─────────────────┘    └──────────────────┘    └───────────────────────┘
```

**Off-chain**: Falcon wallets and transaction signing, signature aggregation/verification  
**On-chain**: Simple settlement interface, escrow management, QUSD token

## User Experience
```
👤 Alice wants to send 50 QUSD to Bob
📱 Opens Feng-Sui app, enters: Bob's address, 50 QUSD
🔐 Signs with Falcon signature (quantum-resistant)
✅ Transaction submitted to Feng-Sui network

🤖 BEHIND THE SCENES (invisible to Alice):
- App checks: Alice has 30 QUSD in escrow
- App auto-deposits: 25 QUSD (20 needed + 5 buffer)
- Falcon signature gets aggregated & verified
- Settlement happens on Sui blockchain
```

## Core Components

### `qusd.move`
- Standard Sui coin implementation
- Batch minting/burning with sequence tracking
- Role-based access control and emergency pause
- Compatible with existing Sui DeFi ecosystem

### `settlement.move`
- Escrow system for quantum-resistant transfers
- Batch settlement of verified Falcon-signed transactions
- Automatic escrow deposits for simple UX
- Atomic transfers

## User Experience

### Primary Flow
1. User deposits QUSD to escrow for Feng-Sui usage
2. User signs transfers with Falcon signatures (quantum-secure)
3. Feng-Sui network aggregates and verifies signatures off-chain
4. Verifier settles batches on-chain, updating escrow balances
5. Users can withdraw QUSD back to Sui wallets anytime

### Auto-Deposit Optimization
```move
// Automatically deposits required amount + buffer
auto_deposit_for_transfer(coin, required_amount, buffer_percentage)
```

Users maintain autonomy while enjoying seamless quantum-resistant transfers.

## Key Features

- **Quantum Resistance**: Falcon signatures protect against quantum attacks
- **Escrow-Based Transfers**: No coin splitting, precise amounts, batch efficiency  
- **Hybrid Model**: Quantum transfers via Feng-Sui, DeFi via standard Sui
- **Progressive UX**: Auto-deposit eliminates manual escrow management
- **Battle-Tested**: 16 Move tests verify the contracts (run with `sui move test`)

## Usage

### Deploy
```bash
sui move build
sui move test
```

### Basic Operations
```move
// Deposit to escrow for Feng-Sui transfers
settlement::deposit_to_escrow(settlement_state, coin, ctx)

// Auto-deposit with buffer for seamless UX  
settlement::auto_deposit_for_transfer(settlement_state, coin, amount, buffer_pct, ctx)

// Withdraw back to Sui wallet
settlement::withdraw_from_escrow(settlement_state, amount, ctx)

// Settle verified Falcon-signed transfer batch (verifier only)
settlement::settle_transfer_batch(settlement_state, from_addrs, to_addrs, amounts, sequence, ctx)
```

## Smart Transfer Functions

The settlement system provides two user experience patterns:

### For Clean Wallet Accounting
```move
// Returns all remaining escrow balance to wallet after transfer
settlement::smart_transfer_return_remaining(settlement_state, treasury, from, to, amount, sequence, ctx)
settlement::smart_transfer_with_coin_return_remaining(settlement_state, treasury, coin, from, to, amount, sequence, ctx)
```
- All QUSD visible in wallet (no hidden escrow funds)
- Better for occasional transfers and transparent accounting
- Auto-deposits only what's needed, returns the rest

### For High-Frequency Transfers  
```move
// Keeps remaining balance in escrow for future transfers
settlement::smart_transfer_with_escrow(settlement_state, treasury, from, to, amount, sequence, ctx)
settlement::smart_transfer_with_coin(settlement_state, treasury, coin, from, to, amount, sequence, ctx)
```
- Optimized for multiple transfers (reduces gas costs)
- Suited for power users, exchanges, automated systems
- Avoids repeated deposit/withdrawal overhead

Both patterns:
1. Check individual escrow balance first
2. Auto-deposit only if insufficient funds  
3. Execute quantum-resistant transfer with auto-withdrawal
4. Maintain proper individual user accounting (not shared pool)

## Security Model

- **Escrow Safety**: Smart contract guarantees, auditable on-chain
- **Quantum Security**: Falcon signatures verified off-chain in Feng-Sui
- **Access Control**: Only authorized verifier can settle batches
- **Sequence Protection**: Prevents replay attacks and ensures ordering
- **Emergency Controls**: Admin pause functionality for crisis response
