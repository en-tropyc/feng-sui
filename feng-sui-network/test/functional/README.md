# Functional Test Suites

This directory contains functional tests that focus on real-world usage scenarios and business requirements for the QUSD network.

## Test Organization

### 🧑‍💼 User Journey Tests (`user-journey.test.js`)
Tests complete user workflows from a business perspective:

- **New User Onboarding**: Wallet creation and initial QUSD minting
- **Peer-to-Peer Transfers**: Simple and batch P2P transactions
- **Merchant Payment Processing**: Commercial payment scenarios
- **Cross-Border Remittances**: International money transfers
- **Treasury Operations**: QUSD redemption and burning

### ⚡ Performance Tests (`performance.test.js`)
Tests network scalability and throughput:

- **Transaction Throughput**: High-volume transaction processing
- **Batch Processing Efficiency**: Optimal batching under various loads
- **Network Resilience**: Handling transaction spikes gracefully
- **Settlement Performance**: On-chain settlement speed under load

### 🔒 Security Tests (`security.test.js`)
Tests security measures and edge cases:

- **Signature Security**: Invalid signatures, mismatched keys, replay attacks
- **Input Validation**: Missing fields, invalid amounts, malformed data
- **Rate Limiting & DoS Protection**: Rapid requests and concurrent access
- **Network Edge Cases**: Large amounts, long addresses, concurrent operations
- **Post-Quantum Security**: Falcon signature validation under various conditions

## Running Tests

### Run All Functional Tests
```bash
npm test -- test/functional/
```

### Run Specific Test Suites
```bash
# User journey tests
npm test -- test/functional/user-journey.test.js

# Performance tests
npm test -- test/functional/performance.test.js

# Security tests
npm test -- test/functional/security.test.js
```

### Run with Verbose Output
```bash
npm test -- test/functional/ --verbose
```

## Test Requirements

### Prerequisites
1. **Server Running**: The QUSD network server must be running on `http://localhost:3000`
2. **Sui Network**: Local Sui network should be active for settlement tests
3. **libas Library**: Post-quantum cryptography library must be available

### Starting the Server
```bash
npm start
```

## Test Scenarios

### User Journey Scenarios
- **New User**: Creates wallet → Receives QUSD → Verifies balance
- **P2P Transfer**: User A → User B transfer with verification
- **Merchant Payment**: Customer → Merchant payment processing
- **Remittance**: Cross-border transfer simulation
- **Redemption**: QUSD → USD conversion

### Performance Scenarios
- **High Volume**: 20+ concurrent transactions
- **Batch Testing**: Various batch sizes (1, 5, 10, 15 transactions)
- **Spike Handling**: Sudden transaction volume increases
- **Settlement Load**: Multiple batches with settlement verification

### Security Scenarios
- **Attack Simulation**: Invalid signatures, replay attacks
- **Input Fuzzing**: Malformed data, edge case inputs
- **DoS Testing**: Rapid requests, concurrent access
- **Validation Testing**: Field validation, data integrity

## Expected Outcomes

### Success Criteria
- ✅ All user journeys complete successfully
- ✅ Performance meets throughput requirements
- ✅ Security measures reject invalid transactions
- ✅ System remains stable under load
- ✅ Post-quantum signatures work correctly

### Performance Benchmarks
- **Throughput**: >10 TPS for transaction submission
- **Batching**: Efficient aggregation within 5 seconds
- **Settlement**: On-chain settlement within 10 seconds
- **Resilience**: Handle 15+ concurrent transactions

### Security Validations
- **Signature Verification**: 100% invalid signature rejection
- **Input Validation**: Proper error handling for malformed data
- **Rate Limiting**: Graceful handling of rapid requests
- **Edge Cases**: Robust handling of unusual inputs

## Future Enhancements

### Planned Improvements
- **Nonce Tracking**: Replay attack prevention
- **Amount Validation**: Min/max transaction limits
- **Rate Limiting**: Request throttling implementation
- **Enhanced Logging**: Detailed transaction audit trails
- **Monitoring**: Real-time performance metrics

### Additional Test Scenarios
- **Multi-user Workflows**: Complex interaction patterns
- **Failure Recovery**: Network interruption handling
- **Upgrade Testing**: System update scenarios
- **Integration Testing**: External service interactions 
