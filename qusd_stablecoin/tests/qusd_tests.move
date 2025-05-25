// Copyright 2024 Feng-Sui. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module qusd_stablecoin::qusd_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin;
    use std::vector;
    use qusd_stablecoin::qusd::{Self, Treasury, QUSD};
    use qusd_stablecoin::settlement::{Self, SettlementState};

    const ADMIN: address = @0xAD;
    const VERIFIER: address = @0xBEEF;
    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;
    const CHARLIE: address = @0xCEE;

    #[test]
    fun test_qusd_initialization() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize QUSD
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Check treasury was created
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let treasury = test_scenario::take_shared<Treasury>(&scenario);
            assert!(qusd::get_batch_sequence(&treasury) == 0, 0);
            assert!(qusd::total_supply(&treasury) == 0, 1);
            assert!(!qusd::is_paused(&treasury), 2);
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_minter_management() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize QUSD
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Add verifier as minter
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            qusd::add_minter(&mut treasury, VERIFIER, test_scenario::ctx(&mut scenario));
            assert!(qusd::is_authorized_minter(&treasury, VERIFIER), 0);
            test_scenario::return_shared(treasury);
        };

        // Remove minter
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            qusd::remove_minter(&mut treasury, VERIFIER, test_scenario::ctx(&mut scenario));
            assert!(!qusd::is_authorized_minter(&treasury, VERIFIER), 1);
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_settlement_initialization() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize settlement
        {
            settlement::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Check settlement state was created
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            assert!(settlement::get_current_sequence(&settlement_state) == 0, 0);
            assert!(settlement::is_authorized_verifier(&settlement_state, ADMIN), 1);
            assert!(settlement::get_total_escrow(&settlement_state) == 0, 2);
            test_scenario::return_shared(settlement_state);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_escrow_deposit_withdraw() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
            settlement::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Setup: mint some QUSD to Alice
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            qusd::add_minter(&mut treasury, ADMIN, test_scenario::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(treasury);
        };

        // Alice deposits 60 QUSD to escrow
        test_scenario::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            let mut alice_coin = test_scenario::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            // Split coin: 60 QUSD to escrow, 40 QUSD back to Alice
            let deposit_coin = coin::split(&mut alice_coin, 60_00000000, test_scenario::ctx(&mut scenario));
            
            settlement::deposit_to_escrow(
                &mut settlement_state,
                deposit_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify escrow balance
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 60_00000000, 0);
            assert!(settlement::get_total_escrow(&settlement_state) == 60_00000000, 1);
            
            test_scenario::return_shared(settlement_state);
            test_scenario::return_to_sender(&scenario, alice_coin);
        };

        // Alice withdraws 20 QUSD from escrow
        test_scenario::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            
            settlement::withdraw_from_escrow(
                &mut settlement_state,
                20_00000000, // 20 QUSD
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify remaining escrow balance
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 40_00000000, 0);
            assert!(settlement::get_total_escrow(&settlement_state) == 40_00000000, 1);
            
            test_scenario::return_shared(settlement_state);
        };

        // Verify Alice received the withdrawn coin
        test_scenario::next_tx(&mut scenario, ALICE);
        {
            let withdrawn_coin = test_scenario::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&withdrawn_coin) == 20_00000000, 0);
            test_scenario::return_to_sender(&scenario, withdrawn_coin);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_transfer_batch_settlement() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
            settlement::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test_scenario::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test_scenario::ctx(&mut scenario));
            
            // Mint QUSD to Alice and Bob
            let recipients = vector[ALICE, BOB];
            let amounts = vector[100_00000000, 50_00000000]; // 100 QUSD to Alice, 50 QUSD to Bob
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(treasury);
            test_scenario::return_shared(settlement_state);
        };

        // Alice and Bob deposit to escrow
        test_scenario::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            let alice_coin = test_scenario::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            settlement::deposit_to_escrow(
                &mut settlement_state,
                alice_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(settlement_state);
        };

        test_scenario::next_tx(&mut scenario, BOB);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            let bob_coin = test_scenario::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            settlement::deposit_to_escrow(
                &mut settlement_state,
                bob_coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(settlement_state);
        };

        // Verify initial escrow balances
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 100_00000000, 0);
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 50_00000000, 1);
            assert!(settlement::get_total_escrow(&settlement_state) == 150_00000000, 2);
            test_scenario::return_shared(settlement_state);
        };

        // Verifier settles transfer batch: Alice sends 30 QUSD to Bob, Bob sends 20 QUSD to Charlie
        test_scenario::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            
            let from_addresses = vector[ALICE, BOB];
            let to_addresses = vector[BOB, CHARLIE];
            let amounts = vector[30_00000000, 20_00000000]; // 30 QUSD, 20 QUSD
            
            settlement::settle_transfer_batch(
                &mut settlement_state,
                from_addresses,
                to_addresses,
                amounts,
                1, // expected sequence (settlement sequence starts at 0)
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify final balances
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 70_00000000, 0); // 100 - 30
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 60_00000000, 1);   // 50 + 30 - 20
            assert!(settlement::get_escrow_balance(&settlement_state, CHARLIE) == 20_00000000, 2); // 0 + 20
            assert!(settlement::get_total_escrow(&settlement_state) == 150_00000000, 3); // Total unchanged
            assert!(settlement::get_current_sequence(&settlement_state) == 1, 4);
            
            test_scenario::return_shared(settlement_state);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_settlement_batch() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
            settlement::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Set verifier and add as minter
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            
            settlement::set_verifier(&mut settlement_state, VERIFIER, test_scenario::ctx(&mut scenario));
            qusd::add_minter(&mut treasury, VERIFIER, test_scenario::ctx(&mut scenario));
            
            test_scenario::return_shared(settlement_state);
            test_scenario::return_shared(treasury);
        };

        // Settle a batch (simulating verifier calling after successful off-chain verification)
        test_scenario::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            
            let recipients = vector[ALICE, BOB];
            let amounts = vector[1000000, 2000000]; // 10 QUSD, 20 QUSD (8 decimals)
            
            settlement::settle_batch(
                &mut settlement_state,
                &mut treasury,
                recipients,
                amounts,
                0, // no burns
                1, // expected sequence
                test_scenario::ctx(&mut scenario)
            );

            assert!(settlement::get_current_sequence(&settlement_state) == 1, 0);
            assert!(qusd::get_batch_sequence(&treasury) == 1, 1);
            assert!(qusd::total_supply(&treasury) == 3000000, 2);
            
            test_scenario::return_shared(settlement_state);
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_transfer_settlement() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
            settlement::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Set verifier
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            settlement::set_verifier(&mut settlement_state, VERIFIER, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(settlement_state);
        };

        // Settle transfers (no minting/burning, just sequence update)
        test_scenario::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            let treasury = test_scenario::take_shared<Treasury>(&scenario);
            
            settlement::settle_transfers(
                &mut settlement_state,
                &treasury,
                1, // expected sequence
                test_scenario::ctx(&mut scenario)
            );

            assert!(settlement::get_current_sequence(&settlement_state) == 1, 0);
            
            test_scenario::return_shared(settlement_state);
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_pause_functionality() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize QUSD
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Test pause/unpause
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test_scenario::take_shared<Treasury>(&scenario);
            
            // Pause
            qusd::set_pause_state(&mut treasury, true, test_scenario::ctx(&mut scenario));
            assert!(qusd::is_paused(&treasury), 0);
            
            // Unpause
            qusd::set_pause_state(&mut treasury, false, test_scenario::ctx(&mut scenario));
            assert!(!qusd::is_paused(&treasury), 1);
            
            test_scenario::return_shared(treasury);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = settlement::E_INSUFFICIENT_BALANCE)]
    fun test_insufficient_balance_transfer() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test_scenario::ctx(&mut scenario));
            settlement::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Setup verifier
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            settlement::set_verifier(&mut settlement_state, VERIFIER, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(settlement_state);
        };

        // Try to transfer more than Alice has (Alice has 0, trying to send 10)
        test_scenario::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test_scenario::take_shared<SettlementState>(&scenario);
            
            settlement::settle_transfer_batch(
                &mut settlement_state,
                vector[ALICE],
                vector[BOB],
                vector[10_00000000], // Alice doesn't have any QUSD
                1,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(settlement_state);
        };

        test_scenario::end(scenario);
    }
} 
