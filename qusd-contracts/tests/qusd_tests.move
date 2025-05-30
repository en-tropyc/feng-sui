module qusd_contracts::qusd_tests {
    use sui::test_scenario::{Self as test};
    use sui::coin;
    use qusd_contracts::qusd::{Self, Treasury, QUSD};
    use qusd_contracts::settlement::{Self, SettlementState};

    const ADMIN: address = @0xAD;
    const VERIFIER: address = @0xBEEF;
    const ALICE: address = @0xA11CE;
    const BOB: address = @0xB0B;
    const CHARLIE: address = @0xCEE;

    #[test]
    fun test_qusd_initialization() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize QUSD
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
        };

        // Check treasury was created
        test::next_tx(&mut scenario, ADMIN);
        {
            let treasury = test::take_shared<Treasury>(&scenario);
            assert!(qusd::get_batch_sequence(&treasury) == 0, 0);
            assert!(qusd::total_supply(&treasury) == 0, 1);
            assert!(!qusd::is_paused(&treasury), 2);
            test::return_shared(treasury);
        };

        test::end(scenario);
    }

    #[test]
    fun test_minter_management() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize QUSD
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
        };

        // Add verifier as minter
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            qusd::add_minter(&mut treasury, VERIFIER, test::ctx(&mut scenario));
            assert!(qusd::is_authorized_minter(&treasury, VERIFIER), 0);
            test::return_shared(treasury);
        };

        // Remove minter
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            qusd::remove_minter(&mut treasury, VERIFIER, test::ctx(&mut scenario));
            assert!(!qusd::is_authorized_minter(&treasury, VERIFIER), 1);
            test::return_shared(treasury);
        };

        test::end(scenario);
    }

    #[test]
    fun test_settlement_initialization() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize settlement
        {
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Check settlement state was created
        test::next_tx(&mut scenario, ADMIN);
        {
            let settlement_state = test::take_shared<SettlementState>(&scenario);
            assert!(settlement::get_current_sequence(&settlement_state) == 0, 0);
            assert!(settlement::is_authorized_verifier(&settlement_state, ADMIN), 1);
            assert!(settlement::get_total_escrow(&settlement_state) == 0, 2);
            test::return_shared(settlement_state);
        };

        test::end(scenario);
    }

    #[test]
    fun test_escrow_deposit_withdraw() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint some QUSD to Alice
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
        };

        // Alice deposits 60 QUSD to escrow
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            // Split coin: 60 QUSD to escrow, 40 QUSD back to Alice
            let deposit_coin = coin::split(&mut alice_coin, 60_00000000, test::ctx(&mut scenario));
            
            settlement::deposit_to_escrow(
                &mut settlement_state,
                deposit_coin,
                test::ctx(&mut scenario)
            );
            
            // Verify escrow balance
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 60_00000000, 0);
            assert!(settlement::get_total_escrow(&settlement_state) == 60_00000000, 1);
            
            test::return_shared(settlement_state);
            test::return_to_sender(&scenario, alice_coin);
        };

        // Alice withdraws 20 QUSD from escrow
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            settlement::withdraw_from_escrow(
                &mut settlement_state,
                20_00000000, // 20 QUSD
                test::ctx(&mut scenario)
            );
            
            // Verify remaining escrow balance
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 40_00000000, 0);
            assert!(settlement::get_total_escrow(&settlement_state) == 40_00000000, 1);
            
            test::return_shared(settlement_state);
        };

        // Verify Alice received the withdrawn coin
        test::next_tx(&mut scenario, ALICE);
        {
            let withdrawn_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&withdrawn_coin) == 20_00000000, 0);
            test::return_to_sender(&scenario, withdrawn_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_transfer_batch_settlement() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            // Mint QUSD to Alice and Bob
            let recipients = vector[ALICE, BOB];
            let amounts = vector[100_00000000, 50_00000000]; // 100 QUSD to Alice, 50 QUSD to Bob
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Alice and Bob deposit to escrow
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            settlement::deposit_to_escrow(
                &mut settlement_state,
                alice_coin,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(settlement_state);
        };

        test::next_tx(&mut scenario, BOB);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let bob_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            settlement::deposit_to_escrow(
                &mut settlement_state,
                bob_coin,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(settlement_state);
        };

        // Verify initial escrow balances
        test::next_tx(&mut scenario, ADMIN);
        {
            let settlement_state = test::take_shared<SettlementState>(&scenario);
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 100_00000000, 0);
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 50_00000000, 1);
            assert!(settlement::get_total_escrow(&settlement_state) == 150_00000000, 2);
            test::return_shared(settlement_state);
        };

        // Verifier settles transfer batch: Alice sends 30 QUSD to Bob, Bob sends 20 QUSD to Charlie
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            let from_addresses = vector[ALICE, BOB];
            let to_addresses = vector[BOB, CHARLIE];
            let amounts = vector[30_00000000, 20_00000000]; // 30 QUSD, 20 QUSD
            
            settlement::settle_transfer_batch(
                &mut settlement_state,
                from_addresses,
                to_addresses,
                amounts,
                1, // expected sequence (settlement sequence starts at 0)
                test::ctx(&mut scenario)
            );
            
            // Verify final balances
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 70_00000000, 0); // 100 - 30
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 60_00000000, 1);   // 50 + 30 - 20
            assert!(settlement::get_escrow_balance(&settlement_state, CHARLIE) == 20_00000000, 2); // 0 + 20
            assert!(settlement::get_total_escrow(&settlement_state) == 150_00000000, 3); // Total unchanged
            assert!(settlement::get_current_sequence(&settlement_state) == 1, 4);
            
            test::return_shared(settlement_state);
        };

        test::end(scenario);
    }

    #[test]
    fun test_settlement_batch() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Set verifier and add as minter
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            qusd::add_minter(&mut treasury, VERIFIER, test::ctx(&mut scenario));
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        // Settle a batch (simulating verifier calling after successful off-chain verification)
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            
            let recipients = vector[ALICE, BOB];
            let amounts = vector[1000000, 2000000]; // 10 QUSD, 20 QUSD (8 decimals)
            
            settlement::settle_batch(
                &mut settlement_state,
                &mut treasury,
                recipients,
                amounts,
                0, // no burns
                1, // expected sequence
                test::ctx(&mut scenario)
            );

            assert!(settlement::get_current_sequence(&settlement_state) == 1, 0);
            assert!(qusd::get_batch_sequence(&treasury) == 1, 1);
            assert!(qusd::total_supply(&treasury) == 3000000, 2);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        test::end(scenario);
    }

    #[test]
    fun test_transfer_settlement() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            test::return_shared(settlement_state);
        };

        // Settle transfers (no minting/burning, just sequence update)
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let treasury = test::take_shared<Treasury>(&scenario);
            
            settlement::settle_transfers(
                &mut settlement_state,
                &treasury,
                1, // expected sequence
                test::ctx(&mut scenario)
            );

            assert!(settlement::get_current_sequence(&settlement_state) == 1, 0);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        test::end(scenario);
    }

    #[test]
    fun test_pause_functionality() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize QUSD
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
        };

        // Test pause/unpause
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            
            // Pause
            qusd::set_pause_state(&mut treasury, true, test::ctx(&mut scenario));
            assert!(qusd::is_paused(&treasury), 0);
            
            // Unpause
            qusd::set_pause_state(&mut treasury, false, test::ctx(&mut scenario));
            assert!(!qusd::is_paused(&treasury), 1);
            
            test::return_shared(treasury);
        };

        test::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = settlement::E_INSUFFICIENT_BALANCE)]
    fun test_insufficient_balance_transfer() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            test::return_shared(settlement_state);
        };

        // Try to transfer more than Alice has (Alice has 0, trying to send 10)
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            settlement::settle_transfer_batch(
                &mut settlement_state,
                vector[ALICE],
                vector[BOB],
                vector[10_00000000], // Alice doesn't have any QUSD
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(settlement_state);
        };

        test::end(scenario);
    }

    #[test]
    fun test_auto_deposit_for_transfer() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD to Alice and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Alice auto-deposits for a 30 QUSD transfer with 10% buffer
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            // Split coin: 33 QUSD for auto-deposit (30 + 10% buffer), rest stays with Alice
            let deposit_coin = coin::split(&mut alice_coin, 33_00000000, test::ctx(&mut scenario));
            
            settlement::auto_deposit_for_transfer(
                &mut settlement_state,
                deposit_coin,
                30_00000000, // 30 QUSD transfer
                10, // 10% buffer
                test::ctx(&mut scenario)
            );
            
            // Should deposit 33 QUSD (30 + 10% buffer)
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 33_00000000, 0);
            assert!(coin::value(&alice_coin) == 67_00000000, 1); // 100 - 33 remaining
            
            test::return_shared(settlement_state);
            test::return_to_sender(&scenario, alice_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_smart_transfer_return_remaining() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Alice already has some escrow balance
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            let deposit_coin = coin::split(&mut alice_coin, 20_00000000, test::ctx(&mut scenario));
            settlement::deposit_to_escrow(
                &mut settlement_state,
                deposit_coin,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(settlement_state);
            test::return_to_sender(&scenario, alice_coin);
        };

        // Verifier executes smart transfer that returns remaining balance
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            
            // Alice sends 15 QUSD to Bob (has 20 in escrow, so 5 should be returned)
            settlement::smart_transfer_return_remaining(
                &mut settlement_state,
                &mut treasury,
                ALICE,
                BOB,
                15_00000000, // 15 QUSD
                1,
                test::ctx(&mut scenario)
            );
            
            // Alice should have 0 in escrow (all returned to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 0, 0);
            // Bob should have 0 in escrow (coins sent directly to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 0, 1);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        // Alice should receive the remaining 5 QUSD back to her wallet
        test::next_tx(&mut scenario, ALICE);
        {
            let returned_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&returned_coin) == 5_00000000, 0); // 20 - 15 = 5 returned
            test::return_to_sender(&scenario, returned_coin);
        };

        // Bob should receive 15 QUSD in his wallet
        test::next_tx(&mut scenario, BOB);
        {
            let bob_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&bob_coin) == 15_00000000, 0); // 15 QUSD transferred
            test::return_to_sender(&scenario, bob_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_smart_transfer_with_coin_return_remaining() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Verifier executes smart transfer with coin (auto-deposit + return remaining)
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let alice_coin = test::take_from_address<coin::Coin<QUSD>>(&scenario, ALICE);
            
            // Alice sends 30 QUSD to Bob using her coin
            settlement::smart_transfer_with_coin_return_remaining(
                &mut settlement_state,
                &mut treasury,
                alice_coin,
                ALICE,
                BOB,
                30_00000000, // 30 QUSD
                1,
                test::ctx(&mut scenario)
            );
            
            // Alice should have 0 in escrow (all returned to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 0, 0);
            // Bob should have 0 in escrow (coins sent directly to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 0, 1);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        // Alice should receive the remaining 70 QUSD back to her wallet
        test::next_tx(&mut scenario, ALICE);
        {
            let returned_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&returned_coin) == 70_00000000, 0); // 100 - 30 = 70 returned
            test::return_to_sender(&scenario, returned_coin);
        };

        // Bob should receive 30 QUSD in his wallet
        test::next_tx(&mut scenario, BOB);
        {
            let bob_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&bob_coin) == 30_00000000, 0); // 30 QUSD transferred
            test::return_to_sender(&scenario, bob_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_smart_transfer_with_escrow() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Alice already has some escrow balance
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            let deposit_coin = coin::split(&mut alice_coin, 40_00000000, test::ctx(&mut scenario));
            settlement::deposit_to_escrow(
                &mut settlement_state,
                deposit_coin,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(settlement_state);
            test::return_to_sender(&scenario, alice_coin);
        };

        // Verifier executes smart transfer that keeps remaining in escrow
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            
            // Alice sends 25 QUSD to Bob (has 40 in escrow, so 15 should remain in escrow)
            settlement::smart_transfer_with_escrow(
                &mut settlement_state,
                &mut treasury,
                ALICE,
                BOB,
                25_00000000, // 25 QUSD
                1,
                test::ctx(&mut scenario)
            );
            
            // Alice should have 15 QUSD remaining in escrow
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 15_00000000, 0);
            // Bob should have 0 in escrow (coins sent directly to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 0, 1);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        // Bob should receive 25 QUSD in his wallet
        test::next_tx(&mut scenario, BOB);
        {
            let bob_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&bob_coin) == 25_00000000, 0); // 25 QUSD transferred
            test::return_to_sender(&scenario, bob_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_smart_transfer_with_coin() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Verifier executes smart transfer with coin (auto-deposit + keep in escrow)
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let alice_coin = test::take_from_address<coin::Coin<QUSD>>(&scenario, ALICE);
            
            // Alice sends 35 QUSD to Bob using her coin
            settlement::smart_transfer_with_coin(
                &mut settlement_state,
                &mut treasury,
                alice_coin,
                ALICE,
                BOB,
                35_00000000, // 35 QUSD
                1,
                test::ctx(&mut scenario)
            );
            
            // Alice should have 65 QUSD remaining in escrow (100 - 35)
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 65_00000000, 0);
            // Bob should have 0 in escrow (coins sent directly to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 0, 1);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        // Bob should receive 35 QUSD in his wallet
        test::next_tx(&mut scenario, BOB);
        {
            let bob_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&bob_coin) == 35_00000000, 0); // 35 QUSD transferred
            test::return_to_sender(&scenario, bob_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_smart_transfer_optimization_logic() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize both QUSD and settlement
        {
            qusd::init_for_testing(test::ctx(&mut scenario));
            settlement::init_for_testing(test::ctx(&mut scenario));
        };

        // Setup: mint QUSD and set verifier
        test::next_tx(&mut scenario, ADMIN);
        {
            let mut treasury = test::take_shared<Treasury>(&scenario);
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            
            qusd::add_minter(&mut treasury, ADMIN, test::ctx(&mut scenario));
            settlement::set_verifier(&mut settlement_state, VERIFIER, test::ctx(&mut scenario));
            
            let recipients = vector[ALICE];
            let amounts = vector[100_00000000]; // 100 QUSD
            
            qusd::batch_mint(
                &mut treasury,
                recipients,
                amounts,
                1,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(treasury);
            test::return_shared(settlement_state);
        };

        // Alice already has sufficient escrow balance
        test::next_tx(&mut scenario, ALICE);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            
            let deposit_coin = coin::split(&mut alice_coin, 50_00000000, test::ctx(&mut scenario));
            settlement::deposit_to_escrow(
                &mut settlement_state,
                deposit_coin,
                test::ctx(&mut scenario)
            );
            
            test::return_shared(settlement_state);
            test::return_to_sender(&scenario, alice_coin);
        };

        // Verifier executes smart transfer - should NOT auto-deposit since Alice has enough
        test::next_tx(&mut scenario, VERIFIER);
        {
            let mut settlement_state = test::take_shared<SettlementState>(&scenario);
            let mut treasury = test::take_shared<Treasury>(&scenario);
            
            // Alice sends 30 QUSD to Bob (has 50 in escrow, so no auto-deposit needed)
            settlement::smart_transfer_with_escrow(
                &mut settlement_state,
                &mut treasury,
                ALICE,
                BOB,
                30_00000000, // 30 QUSD
                1,
                test::ctx(&mut scenario)
            );
            
            // Alice should have 20 QUSD remaining in escrow (50 - 30)
            assert!(settlement::get_escrow_balance(&settlement_state, ALICE) == 20_00000000, 0);
            // Bob should have 0 in escrow (coins sent directly to wallet)
            assert!(settlement::get_escrow_balance(&settlement_state, BOB) == 0, 1);
            
            test::return_shared(settlement_state);
            test::return_shared(treasury);
        };

        // Alice should still have her remaining 50 QUSD in wallet (no auto-deposit occurred)
        test::next_tx(&mut scenario, ALICE);
        {
            let alice_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&alice_coin) == 50_00000000, 0); // Original 100 - 50 deposited = 50 remaining
            test::return_to_sender(&scenario, alice_coin);
        };

        // Bob should receive 30 QUSD in his wallet
        test::next_tx(&mut scenario, BOB);
        {
            let bob_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
            assert!(coin::value(&bob_coin) == 30_00000000, 0); // 30 QUSD transferred
            test::return_to_sender(&scenario, bob_coin);
        };

        test::end(scenario);
    }

    #[test]
    fun test_partial_deposit_functionality() {
        let mut scenario = test::begin(ADMIN);
        
        // Initialize the system
        {
            let ctx = test::ctx(&mut scenario);
            qusd::init_for_testing(ctx);
            settlement::init_for_testing(ctx);
        };
        
        // Get the objects
        test::next_tx(&mut scenario, ADMIN);
        let mut treasury = test::take_shared<Treasury>(&scenario);
        let mut settlement_state = test::take_shared<SettlementState>(&scenario);
        
        // Add as authorized minter
        test::next_tx(&mut scenario, ADMIN);
        {
            let ctx = test::ctx(&mut scenario);
            qusd::add_minter(&mut treasury, ADMIN, ctx);
        };
        
        // Mint some QUSD
        test::next_tx(&mut scenario, ADMIN);
        {
            let ctx = test::ctx(&mut scenario);
            let recipients = vector[ADMIN];
            let amounts = vector[1000];
            qusd::batch_mint(&mut treasury, recipients, amounts, 1, ctx);
        };
        
        // Get the minted coin
        test::next_tx(&mut scenario, ADMIN);
        let coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
        
        // Test partial deposit: deposit 300 out of 1000
        test::next_tx(&mut scenario, ADMIN);
        {
            let ctx = test::ctx(&mut scenario);
            settlement::deposit_partial_to_escrow(&mut settlement_state, coin, 300, ctx);
        };
        
        // Check that escrow balance is 300
        test::next_tx(&mut scenario, ADMIN);
        {
            let escrow_balance = settlement::get_escrow_balance(&settlement_state, ADMIN);
            assert!(escrow_balance == 300, 101);
            
            let total_escrow = settlement::get_total_escrow(&settlement_state);
            assert!(total_escrow == 300, 102);
        };
        
        // Get the returned coin (should be 700)
        let returned_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
        assert!(coin::value(&returned_coin) == 700, 103);
        
        // Test deposit_for_transfer functionality
        test::next_tx(&mut scenario, ADMIN);
        {
            let ctx = test::ctx(&mut scenario);
            // Need 500 total for transfer, currently have 300 in escrow
            // Should deposit exactly 200 more and return 500
            settlement::deposit_for_transfer(&mut settlement_state, returned_coin, 500, ctx);
        };
        
        // Check that escrow balance is now 500
        test::next_tx(&mut scenario, ADMIN);
        {
            let escrow_balance = settlement::get_escrow_balance(&settlement_state, ADMIN);
            assert!(escrow_balance == 500, 104);
            
            let total_escrow = settlement::get_total_escrow(&settlement_state);
            assert!(total_escrow == 500, 105);
        };
        
        // Get the returned coin (should be 500)
        let final_coin = test::take_from_sender<coin::Coin<QUSD>>(&scenario);
        assert!(coin::value(&final_coin) == 500, 106);
        
        // Clean up
        test::return_to_sender(&scenario, final_coin);
        test::return_shared(treasury);
        test::return_shared(settlement_state);
        test::end(scenario);
    }
} 
