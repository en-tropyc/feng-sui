// Copyright 2024 Feng-Sui. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/// Settlement Module
/// This module handles simple settlement of verified transactions from the Feng-Sui network.
/// All quantum cryptography and signature verification happens off-chain.
module qusd_stablecoin::settlement {
    use std::vector;
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::table::{Self, Table};
    use qusd_stablecoin::qusd::{Self, Treasury, QUSD};

    /// Settlement state for tracking batches and escrow
    public struct SettlementState has key {
        id: UID,
        /// Current settlement sequence
        current_sequence: u64,
        /// Authorized verifier address (your off-chain verifier)
        verifier: address,
        /// Admin address
        admin: address,
        /// User escrow balances (address -> QUSD amount)
        user_balances: Table<address, u64>,
        /// Escrow treasury holding all deposited QUSD
        escrow_treasury: Coin<QUSD>,
    }

    /// Event emitted when a batch is settled
    public struct BatchSettled has copy, drop {
        sequence: u64,
        mint_count: u64,
        burn_count: u64,
        transfer_count: u64,
        total_mint_amount: u64,
        total_burn_amount: u64,
        total_transfer_amount: u64,
        verifier: address,
    }

    /// Event emitted when user deposits to escrow
    public struct EscrowDeposit has copy, drop {
        user: address,
        amount: u64,
        new_balance: u64,
    }

    /// Event emitted when user withdraws from escrow
    public struct EscrowWithdraw has copy, drop {
        user: address,
        amount: u64,
        remaining_balance: u64,
    }

    /// Event emitted for each transfer in a batch
    public struct TransferExecuted has copy, drop {
        from: address,
        to: address,
        amount: u64,
        sequence: u64,
    }

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_SEQUENCE: u64 = 2;
    const E_TREASURY_PAUSED: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;
    const E_INVALID_BATCH: u64 = 5;
    const E_ZERO_AMOUNT: u64 = 6;

    /// Initialize the settlement system
    fun init(ctx: &mut TxContext) {
        let settlement_state = SettlementState {
            id: object::new(ctx),
            current_sequence: 0,
            verifier: tx_context::sender(ctx),
            admin: tx_context::sender(ctx),
            user_balances: table::new(ctx),
            escrow_treasury: coin::zero<QUSD>(ctx),
        };

        transfer::share_object(settlement_state);
    }

    /// Set the authorized verifier (admin only)
    public entry fun set_verifier(
        settlement_state: &mut SettlementState,
        new_verifier: address,
        ctx: &TxContext
    ) {
        assert!(settlement_state.admin == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        settlement_state.verifier = new_verifier;
    }

    /// Deposit QUSD to escrow for Feng-Sui network usage
    public entry fun deposit_to_escrow(
        settlement_state: &mut SettlementState,
        coin: Coin<QUSD>,
        ctx: &TxContext
    ) {
        let amount = coin::value(&coin);
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        let user = tx_context::sender(ctx);
        
        // Add to user's escrow balance
        let current_balance = if (settlement_state.user_balances.contains(user)) {
            *settlement_state.user_balances.borrow(user)
        } else {
            settlement_state.user_balances.add(user, 0);
            0
        };
        
        let new_balance = current_balance + amount;
        *settlement_state.user_balances.borrow_mut(user) = new_balance;
        
        // Add coin to escrow treasury
        coin::join(&mut settlement_state.escrow_treasury, coin);
        
        event::emit(EscrowDeposit {
            user,
            amount,
            new_balance,
        });
    }

    /// Withdraw QUSD from escrow
    public entry fun withdraw_from_escrow(
        settlement_state: &mut SettlementState,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        let user = tx_context::sender(ctx);
        assert!(settlement_state.user_balances.contains(user), E_INSUFFICIENT_BALANCE);
        
        let current_balance = *settlement_state.user_balances.borrow(user);
        assert!(current_balance >= amount, E_INSUFFICIENT_BALANCE);
        
        // Update user's balance
        let remaining_balance = current_balance - amount;
        *settlement_state.user_balances.borrow_mut(user) = remaining_balance;
        
        // Create coin and transfer to user
        let coin = coin::split(&mut settlement_state.escrow_treasury, amount, ctx);
        transfer::public_transfer(coin, user);
        
        event::emit(EscrowWithdraw {
            user,
            amount,
            remaining_balance,
        });
    }

    /// Settle a batch of verified transactions (mints, burns, and transfers)
    public entry fun settle_batch(
        settlement_state: &mut SettlementState,
        treasury: &mut Treasury,
        mint_recipients: vector<address>,
        mint_amounts: vector<u64>,
        burn_amount: u64,
        expected_sequence: u64,
        ctx: &mut TxContext
    ) {
        // Verify authorization - only the verifier can call this
        assert!(settlement_state.verifier == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        assert!(!qusd::is_paused(treasury), E_TREASURY_PAUSED);
        
        // Verify sequence number
        assert!(settlement_state.current_sequence + 1 == expected_sequence, E_INVALID_SEQUENCE);

        let mint_count = vector::length(&mint_recipients);
        let total_mint_amount = calculate_total_amount(&mint_amounts);

        // Execute mints if any
        if (mint_count > 0) {
            qusd::batch_mint(
                treasury,
                mint_recipients,
                mint_amounts,
                expected_sequence,
                ctx
            );
        };

        // Execute burns if needed (simplified for now)
        // In practice, you might handle burns differently based on your Feng-Sui design

        // Update sequence
        settlement_state.current_sequence = expected_sequence;

        // Emit settlement event
        event::emit(BatchSettled {
            sequence: expected_sequence,
            mint_count,
            burn_count: if (burn_amount > 0) 1 else 0,
            transfer_count: 0, // No transfers in this function
            total_mint_amount,
            total_burn_amount: burn_amount,
            total_transfer_amount: 0,
            verifier: tx_context::sender(ctx),
        });
    }

    /// Settle a batch of transfers using escrowed QUSD
    public entry fun settle_transfer_batch(
        settlement_state: &mut SettlementState,
        from_addresses: vector<address>,
        to_addresses: vector<address>,
        amounts: vector<u64>,
        expected_sequence: u64,
        ctx: &TxContext
    ) {
        // Verify authorization
        assert!(settlement_state.verifier == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        assert!(settlement_state.current_sequence + 1 == expected_sequence, E_INVALID_SEQUENCE);
        
        // Validate batch structure
        let transfer_count = vector::length(&from_addresses);
        assert!(transfer_count == vector::length(&to_addresses), E_INVALID_BATCH);
        assert!(transfer_count == vector::length(&amounts), E_INVALID_BATCH);
        assert!(transfer_count > 0, E_INVALID_BATCH);

        // Validate all transfers first (all-or-nothing approach)
        let mut i = 0;
        while (i < transfer_count) {
            let from = *vector::borrow(&from_addresses, i);
            let amount = *vector::borrow(&amounts, i);
            
            assert!(amount > 0, E_ZERO_AMOUNT);
            assert!(settlement_state.user_balances.contains(from), E_INSUFFICIENT_BALANCE);
            
            let from_balance = *settlement_state.user_balances.borrow(from);
            assert!(from_balance >= amount, E_INSUFFICIENT_BALANCE);
            
            i = i + 1;
        };

        // Execute all transfers (now that we know they'll all succeed)
        let mut total_transfer_amount = 0;
        i = 0;
        while (i < transfer_count) {
            let from = *vector::borrow(&from_addresses, i);
            let to = *vector::borrow(&to_addresses, i);
            let amount = *vector::borrow(&amounts, i);
            
            // Update from balance
            let from_balance = *settlement_state.user_balances.borrow(from);
            *settlement_state.user_balances.borrow_mut(from) = from_balance - amount;
            
            // Update to balance
            let to_balance = if (settlement_state.user_balances.contains(to)) {
                *settlement_state.user_balances.borrow(to)
            } else {
                settlement_state.user_balances.add(to, 0);
                0
            };
            *settlement_state.user_balances.borrow_mut(to) = to_balance + amount;
            
            total_transfer_amount = total_transfer_amount + amount;
            
            // Emit transfer event
            event::emit(TransferExecuted {
                from,
                to,
                amount,
                sequence: expected_sequence,
            });
            
            i = i + 1;
        };

        // Update sequence
        settlement_state.current_sequence = expected_sequence;

        // Emit batch settlement event
        event::emit(BatchSettled {
            sequence: expected_sequence,
            mint_count: 0,
            burn_count: 0,
            transfer_count,
            total_mint_amount: 0,
            total_burn_amount: 0,
            total_transfer_amount,
            verifier: tx_context::sender(ctx),
        });
    }

    /// Simple transfer settlement (for pure transfers that don't change total supply)
    /// This might be used for rebalancing or other operations
    public entry fun settle_transfers(
        settlement_state: &mut SettlementState,
        _treasury: &Treasury, // Reference for validation but no minting/burning
        expected_sequence: u64,
        ctx: &TxContext
    ) {
        // Verify authorization
        assert!(settlement_state.verifier == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        assert!(settlement_state.current_sequence + 1 == expected_sequence, E_INVALID_SEQUENCE);

        // For pure transfers, we just update the sequence
        // The actual balance changes are tracked off-chain in Feng-Sui
        settlement_state.current_sequence = expected_sequence;

        event::emit(BatchSettled {
            sequence: expected_sequence,
            mint_count: 0,
            burn_count: 0,
            transfer_count: 0,
            total_mint_amount: 0,
            total_burn_amount: 0,
            total_transfer_amount: 0,
            verifier: tx_context::sender(ctx),
        });
    }

    /// Calculate total amount from vector
    fun calculate_total_amount(amounts: &vector<u64>): u64 {
        let mut total = 0;
        let mut i = 0;
        while (i < vector::length(amounts)) {
            total = total + *vector::borrow(amounts, i);
            i = i + 1;
        };
        total
    }

    /// Get current settlement sequence
    public fun get_current_sequence(settlement_state: &SettlementState): u64 {
        settlement_state.current_sequence
    }

    /// Check if address is authorized verifier
    public fun is_authorized_verifier(settlement_state: &SettlementState, addr: address): bool {
        settlement_state.verifier == addr
    }

    /// Get user's escrow balance
    public fun get_escrow_balance(settlement_state: &SettlementState, user: address): u64 {
        if (settlement_state.user_balances.contains(user)) {
            *settlement_state.user_balances.borrow(user)
        } else {
            0
        }
    }

    /// Get total escrow treasury value
    public fun get_total_escrow(settlement_state: &SettlementState): u64 {
        coin::value(&settlement_state.escrow_treasury)
    }

    /// Auto-deposit with buffer for seamless transfers
    /// Deposits the required amount plus a buffer to avoid frequent deposits
    public entry fun auto_deposit_for_transfer(
        settlement_state: &mut SettlementState,
        coin: Coin<QUSD>,
        required_amount: u64,
        buffer_percentage: u64, // e.g., 20 for 20% buffer
        ctx: &mut TxContext
    ) {
        let coin_value = coin::value(&coin);
        let user = tx_context::sender(ctx);
        
        // Calculate current balance
        let current_balance = if (settlement_state.user_balances.contains(user)) {
            *settlement_state.user_balances.borrow(user)
        } else {
            0
        };
        
        // Check if we need to deposit
        if (current_balance >= required_amount) {
            // User already has enough, just return the coin
            transfer::public_transfer(coin, user);
        } else {
            // Calculate how much we need to deposit
            let needed = required_amount - current_balance;
            let buffer = (needed * buffer_percentage) / 100;
            let total_to_deposit = needed + buffer;
            
            assert!(coin_value >= total_to_deposit, E_INSUFFICIENT_BALANCE);
            
            // Handle the deposit
            if (coin_value == total_to_deposit) {
                // Deposit the entire coin
                let new_balance = current_balance + coin_value;
                
                if (settlement_state.user_balances.contains(user)) {
                    *settlement_state.user_balances.borrow_mut(user) = new_balance;
                } else {
                    settlement_state.user_balances.add(user, new_balance);
                };
                
                coin::join(&mut settlement_state.escrow_treasury, coin);
                
                event::emit(EscrowDeposit {
                    user,
                    amount: coin_value,
                    new_balance,
                });
            } else {
                // Split coin: deposit part, return the rest
                let mut remaining_coin = coin;
                let deposit_coin = coin::split(&mut remaining_coin, total_to_deposit, ctx);
                let deposit_amount = coin::value(&deposit_coin);
                
                let new_balance = current_balance + deposit_amount;
                
                if (settlement_state.user_balances.contains(user)) {
                    *settlement_state.user_balances.borrow_mut(user) = new_balance;
                } else {
                    settlement_state.user_balances.add(user, new_balance);
                };
                
                coin::join(&mut settlement_state.escrow_treasury, deposit_coin);
                transfer::public_transfer(remaining_coin, user);
                
                event::emit(EscrowDeposit {
                    user,
                    amount: deposit_amount,
                    new_balance,
                });
            }
        }
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
} 
