# Feng-Sui Network Tests

This directory contains streamlined, essential tests for the Feng-Sui quantum-resistant QUSD system.

## Test Organization

### 🧪 Unit Tests (`/unit/`)
**Essential component testing:**
- **FalconCrypto.test.js** - Post-quantum cryptography core functions
  - Falcon signature verification
  - Signature aggregation
  - Post-quantum cryptographic integrity
- **BatchProcessor.test.js** - Transaction batching and processing
  - Batch creation and management
  - Signature aggregation workflows
  - Settlement coordination
- **TransactionQueue.test.js** - Queue management and validation
  - Transaction queuing logic
  - Batch trigger conditions
  - Queue status management

### 🚀 Functional Tests (`/functional/`)
**Complete end-to-end workflows:**
- **complete-e2e.test.js** - Comprehensive QUSD flow demonstration
  - **Mint → Deposit → Transfer** complete user journey
  - Quantum-resistant transaction authorization
  - Security vulnerability analysis
  - System integration verification

## Running Tests

```bash
# Run all tests
npm test

# Run comprehensive functional test (recommended)
npm test -- test/functional/complete-e2e.test.js

# Run unit tests only
npm test -- test/unit/

# Run with verbose output
npm test -- --verbose

# Watch mode for development
npm test -- --watch
```

## Test Philosophy

### 🎯 **Focused & Essential**
- Each test serves a clear, unique purpose
- No redundant or overlapping test coverage
- Concentrated on core functionality and security

### 📚 **Educational Value**
- Tests demonstrate quantum-resistant vs quantum-vulnerable components
- Clear security analysis and vulnerability demonstrations
- Real-world usage patterns and limitations

### ⚡ **Efficient Execution**
- Minimal test suite that covers maximum functionality
- Fast execution for development workflow
- Clear pass/fail criteria with meaningful output

## Key Demonstrations

### ✅ **Quantum-Resistant Components Tested**
- Falcon-512 signature generation and verification
- Post-quantum cryptographic aggregation
- Transaction authorization integrity
- Batch processing with quantum-safe signatures

### ⚠️ **Quantum Vulnerability Analysis**
- Storage layer vulnerability on classical blockchain
- Transport vs storage security dichotomy
- Real-world attack scenarios and implications

## Test Requirements

- **libas library** - Post-quantum cryptography at `../libas`
- **Jest framework** - Testing infrastructure
- **Running server** - For functional API tests (graceful fallback if unavailable)

## Expected Results

### ✅ **Unit Tests**
- All cryptographic functions work correctly
- Batch processing handles various scenarios
- Queue management operates reliably

### ✅ **Functional Tests**
- Complete QUSD mint → deposit → transfer flow
- Proper validation and error handling
- Clear security analysis output
- System status verification

## Security Insights

The test suite demonstrates the **quantum vulnerability paradox**:
- **Transport Protection**: Quantum-resistant Falcon signatures protect transaction authorization
- **Storage Vulnerability**: Final QUSD storage remains quantum-vulnerable on classical Sui blockchain
- **Overall Assessment**: System is only as secure as its weakest link (storage layer)

This makes Feng-Sui an excellent educational tool for understanding the challenges and limitations of implementing quantum-resistant financial systems in a classical blockchain environment.
