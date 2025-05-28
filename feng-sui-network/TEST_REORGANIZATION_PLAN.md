# Fen-Sui Network Test Reorganization Plan

## 🎯 Goals
1. **Eliminate Redundancy** - Remove duplicate test coverage
2. **Clear Organization** - Logical hierarchy by test type and scope
3. **Complete Coverage** - Include all new features (mapping, balance verification)
4. **Maintainable** - Easy to run, understand, and extend

## 📋 Current Issues
- **28 test files** with overlapping coverage
- **4 standalone scripts** (`test_*.js`) duplicating Jest tests
- **Missing Jest tests** for new mapping functionality
- **Unclear naming** (`settlement-fix.test.js` vs `settlement-debug.test.js`)
- **Mixed patterns** (Jest vs standalone scripts)

## 🏗️ Proposed New Structure

```
test/
├── unit/                           # Pure unit tests (no API calls)
│   ├── FalconCrypto.test.js       ✅ Keep - tests crypto functions
│   ├── TransactionQueue.test.js   ✅ Keep - tests queue logic  
│   ├── BatchProcessor.test.js     🆕 Add - tests batch processing
│   ├── SuiSettlement.test.js      🆕 Add - tests settlement logic
│   └── AddressMapping.test.js     🆕 Add - tests mapping functions
│
├── integration/                    # API integration tests
│   ├── transaction-api.test.js    🔄 Consolidate - all transaction endpoints
│   ├── balance-api.test.js        🆕 Add - balance & mapping endpoints
│   └── network-api.test.js        🔄 Rename - network status endpoints
│
├── e2e/                           # End-to-end workflow tests
│   ├── user-onboarding.test.js    🆕 Add - complete onboarding flow
│   ├── transaction-flow.test.js   ✅ Keep - basic transaction processing
│   ├── settlement-flow.test.js    🔄 Consolidate - settlement workflows
│   └── phase2b-complete.test.js   ✅ Keep - full Phase 2B validation
│
├── functional/                    # Business scenario tests
│   ├── user-journeys.test.js      ✅ Keep - P2P, merchant, remittance scenarios
│   ├── security.test.js           ✅ Keep - security & edge cases
│   ├── performance.test.js        ✅ Keep - load & performance testing
│   └── balance-verification.test.js 🆕 Add - balance workflow scenarios
│
└── manual/                        # Manual testing scripts (non-Jest)
    ├── debug-settlement.js        🔄 Rename from test_settlement.js
    ├── debug-integration.js       🔄 Rename from test_real_integration.js
    └── README.md                  🆕 Add - when to use manual vs Jest
```

## 🗑️ Files to Remove/Consolidate

### **Remove Completely:**
- `test_api_settlement.js` → Covered by integration tests
- `settlement-fix.test.js` → Merge into `settlement-flow.test.js`
- `settlement-debug.test.js` → Move to `manual/debug-settlement.js`
- `api-live.test.js` → Merge into `integration/transaction-api.test.js`

### **Rename/Reorganize:**
- `test_balance_verification.js` → Convert to `functional/balance-verification.test.js`
- `test_settlement.js` → Move to `manual/debug-settlement.js`
- `test_real_integration.js` → Move to `manual/debug-integration.js`
- `integration.test.js` → Rename to `integration/transaction-api.test.js`

## 🆕 New Tests Needed

### **1. Unit Tests:**
```javascript
// test/unit/AddressMapping.test.js
describe('Address Mapping', () => {
  test('should register Falcon key to Sui address mapping')
  test('should resolve Falcon key to mapped Sui address')
  test('should handle unmapped Falcon keys')
  test('should validate Sui address format')
})

// test/unit/SuiSettlement.test.js  
describe('SuiSettlement', () => {
  test('should check escrow balance for mapped address')
  test('should verify sufficient balance')
  test('should handle simulation mode')
})
```

### **2. Integration Tests:**
```javascript
// test/integration/balance-api.test.js
describe('Balance API', () => {
  test('POST /api/transactions/register-mapping')
  test('POST /api/transactions/get-mapping') 
  test('POST /api/transactions/check-balance')
  test('POST /api/transactions/verify-balance')
})
```

### **3. E2E Tests:**
```javascript
// test/e2e/user-onboarding.test.js
describe('Complete User Onboarding', () => {
  test('should complete full onboarding flow')
  // 1. Generate Falcon keypair
  // 2. Register Sui address mapping
  // 3. Check balance verification
  // 4. Submit transaction with balance check
})
```

## 🔧 Implementation Steps

### **Phase 1: Consolidation**
1. Remove redundant standalone scripts
2. Merge overlapping Jest tests  
3. Rename files for clarity

### **Phase 2: New Coverage**
1. Add missing unit tests
2. Create mapping integration tests
3. Build complete onboarding E2E test

### **Phase 3: Verification**
1. Run full test suite
2. Verify 90%+ coverage
3. Update CI/CD pipelines

## 📊 Expected Outcome

**Before:** 28 files, unclear coverage, redundancy
**After:** 15 files, complete coverage, clear organization

**Test Categories:**
- **Unit Tests:** 5 files (core component testing)
- **Integration Tests:** 3 files (API endpoint testing)  
- **E2E Tests:** 4 files (workflow testing)
- **Functional Tests:** 4 files (business scenario testing)
- **Manual Scripts:** 3 files (debugging only)

**Benefits:**
- ✅ **No redundancy** - Each test has clear purpose
- ✅ **Complete coverage** - Including new mapping features
- ✅ **Easy maintenance** - Clear organization
- ✅ **Fast CI/CD** - Reduced test execution time
- ✅ **Better debugging** - Focused test failures 
