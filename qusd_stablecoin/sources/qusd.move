// Copyright 2024 Feng-Sui. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/// QUSD - Quantum-resistant USD Stablecoin
/// This module implements a stablecoin designed for quantum-resistant transactions
/// through the Feng-Sui off-chain network with batch settlement on Sui.
module qusd_stablecoin::qusd {
    use sui::coin::{Self, Coin, TreasuryCap, CoinMetadata};
    use sui::url;
    use std::string;

    /// The QUSD coin type
    public struct QUSD has drop {}

    /// Capability for minting QUSD tokens
    public struct MintCap has key, store {
        id: UID,
    }

    /// Treasury object that manages QUSD operations
    public struct Treasury has key {
        id: UID,
        /// Treasury capability for minting/burning
        treasury_cap: TreasuryCap<QUSD>,
        /// Authorized minter addresses
        authorized_minters: vector<address>,
        /// Batch sequence number for state synchronization
        batch_sequence: u64,
        /// Emergency pause state
        is_paused: bool,
        /// Admin address
        admin: address,
    }

    /// Event emitted when QUSD is minted via batch processing
    public struct BatchMint has copy, drop {
        batch_id: u64,
        total_amount: u64,
        recipients: vector<address>,
        amounts: vector<u64>,
    }

    /// Event emitted when QUSD is burned via batch processing
    public struct BatchBurn has copy, drop {
        batch_id: u64,
        total_amount: u64,
        burners: vector<address>,
        amounts: vector<u64>,
    }

    /// Event emitted when treasury is paused/unpaused
    public struct PauseStateChanged has copy, drop {
        is_paused: bool,
    }

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_PAUSED: u64 = 2;
    const E_INVALID_BATCH: u64 = 3;
    const E_SEQUENCE_MISMATCH: u64 = 4;

    /// Initialize the QUSD stablecoin
    fun init(witness: QUSD, ctx: &mut TxContext) {
        // Create the treasury cap and metadata
        let (treasury_cap, metadata) = coin::create_currency<QUSD>(
            witness,
            8, // decimals
            b"QUSD",
            b"Quantum USD",
            b"Quantum-resistant USD stablecoin for the Feng-Sui network",
            option::some(url::new_unsafe_from_bytes(b"https://feng-sui.io/qusd-icon.png")),
            ctx
        );

        // Create the treasury object
        let treasury = Treasury {
            id: object::new(ctx),
            treasury_cap,
            authorized_minters: vector::empty(),
            batch_sequence: 0,
            is_paused: false,
            admin: tx_context::sender(ctx),
        };

        // Share the treasury and metadata objects
        transfer::share_object(treasury);
        transfer::public_freeze_object(metadata);
    }

    /// Add an authorized minter (only admin)
    public entry fun add_minter(
        treasury: &mut Treasury,
        minter: address,
        ctx: &TxContext
    ) {
        assert!(treasury.admin == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        vector::push_back(&mut treasury.authorized_minters, minter);
    }

    /// Remove an authorized minter (only admin)
    public entry fun remove_minter(
        treasury: &mut Treasury,
        minter: address,
        ctx: &TxContext
    ) {
        assert!(treasury.admin == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        let (found, index) = vector::index_of(&treasury.authorized_minters, &minter);
        if (found) {
            vector::remove(&mut treasury.authorized_minters, index);
        };
    }

    /// Pause/unpause the treasury (only admin)
    public entry fun set_pause_state(
        treasury: &mut Treasury,
        paused: bool,
        ctx: &TxContext
    ) {
        assert!(treasury.admin == tx_context::sender(ctx), E_NOT_AUTHORIZED);
        treasury.is_paused = paused;
        
        sui::event::emit(PauseStateChanged {
            is_paused: paused,
        });
    }

    /// Batch mint QUSD tokens (only authorized minters)
    /// This function processes a batch of mints from the Feng-Sui network
    public entry fun batch_mint(
        treasury: &mut Treasury,
        recipients: vector<address>,
        amounts: vector<u64>,
        expected_sequence: u64,
        ctx: &mut TxContext
    ) {
        // Verify authorization and state
        assert!(!treasury.is_paused, E_PAUSED);
        assert!(vector::contains(&treasury.authorized_minters, &tx_context::sender(ctx)), E_NOT_AUTHORIZED);
        assert!(treasury.batch_sequence + 1 == expected_sequence, E_SEQUENCE_MISMATCH);
        assert!(vector::length(&recipients) == vector::length(&amounts), E_INVALID_BATCH);

        let mut total_amount = 0;
        let mut i = 0;
        let len = vector::length(&recipients);

        // Process each mint in the batch
        while (i < len) {
            let recipient = *vector::borrow(&recipients, i);
            let amount = *vector::borrow(&amounts, i);
            
            if (amount > 0) {
                let coin = coin::mint(&mut treasury.treasury_cap, amount, ctx);
                transfer::public_transfer(coin, recipient);
                total_amount = total_amount + amount;
            };
            
            i = i + 1;
        };

        // Update sequence number
        treasury.batch_sequence = expected_sequence;

        // Emit batch mint event
        sui::event::emit(BatchMint {
            batch_id: expected_sequence,
            total_amount,
            recipients,
            amounts,
        });
    }

    /// Batch burn QUSD tokens (only authorized minters)
    /// This function processes a batch of burns from the Feng-Sui network
    public entry fun batch_burn(
        treasury: &mut Treasury,
        mut coins: vector<Coin<QUSD>>,
        expected_sequence: u64,
        ctx: &mut TxContext
    ) {
        // Verify authorization and state
        assert!(!treasury.is_paused, E_PAUSED);
        assert!(vector::contains(&treasury.authorized_minters, &tx_context::sender(ctx)), E_NOT_AUTHORIZED);
        assert!(treasury.batch_sequence + 1 == expected_sequence, E_SEQUENCE_MISMATCH);

        let mut total_amount = 0;
        let mut burners = vector::empty<address>();
        let mut amounts = vector::empty<u64>();

        // Process each burn in the batch
        while (!vector::is_empty(&coins)) {
            let coin = vector::pop_back(&mut coins);
            let amount = coin::value(&coin);
            
            if (amount > 0) {
                coin::burn(&mut treasury.treasury_cap, coin);
                total_amount = total_amount + amount;
                vector::push_back(&mut amounts, amount);
                vector::push_back(&mut burners, tx_context::sender(ctx));
            } else {
                // Return zero-value coins
                transfer::public_transfer(coin, tx_context::sender(ctx));
            };
        };

        // Clean up empty vector
        vector::destroy_empty(coins);

        // Update sequence number
        treasury.batch_sequence = expected_sequence;

        // Emit batch burn event
        sui::event::emit(BatchBurn {
            batch_id: expected_sequence,
            total_amount,
            burners,
            amounts,
        });
    }

    /// Get current batch sequence number
    public fun get_batch_sequence(treasury: &Treasury): u64 {
        treasury.batch_sequence
    }

    /// Get total supply of QUSD
    public fun total_supply(treasury: &Treasury): u64 {
        coin::total_supply(&treasury.treasury_cap)
    }

    /// Check if treasury is paused
    public fun is_paused(treasury: &Treasury): bool {
        treasury.is_paused
    }

    /// Check if address is authorized minter
    public fun is_authorized_minter(treasury: &Treasury, addr: address): bool {
        vector::contains(&treasury.authorized_minters, &addr)
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(QUSD {}, ctx)
    }
} 
