// Global test setup and utilities

// Increase timeout for all tests due to crypto operations
jest.setTimeout(15000);

let falconCrypto = null;

// Test setup functions
const initializeLibas = async () => {
  try {
    const path = require('path');
    const libasPath = path.join(__dirname, '../../libas');
    falconCrypto = require(libasPath);
    console.log('✅ libas library loaded successfully');
    return falconCrypto;
  } catch (error) {
    console.error('❌ Failed to load libas library:', error.message);
    throw new Error('libas library is required for tests');
  }
};

const getFalconCrypto = () => {
  if (!falconCrypto) {
    throw new Error('libas not initialized. Call initializeLibas() first.');
  }
  return falconCrypto;
};

// Export functions for use in tests
module.exports = {
  initializeLibas,
  getFalconCrypto
};

// Global test utilities
global.testUtils = {
  // Wait helper
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Random string generator
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  
  // Random amount generator
  randomAmount: (min = 1, max = 1000) => {
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  },
  
  // Test wallet generator
  generateTestWallet: () => {
    const path = require('path');
    const libasPath = path.join(__dirname, '../../libas');
    const libas = require(libasPath);
    return libas.createKeyPair();
  },
  
  // API base URL
  API_BASE_URL: 'http://localhost:3000'
};

// Console formatting for test output
const originalLog = console.log;
console.log = (...args) => {
  // Add timestamp to console logs in tests
  const timestamp = new Date().toISOString().substring(11, 23);
  originalLog(`[${timestamp}]`, ...args);
};

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup function for tests
global.cleanup = () => {
  // Add any cleanup logic here
  // For example, clearing intervals, closing connections, etc.
};

// Test environment validation
beforeAll(async () => {
  // Check if libas is available
  try {
    const path = require('path');
    const libasPath = path.join(__dirname, '../../libas');
    require(libasPath);
    console.log('✅ libas library loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load libas library:', error.message);
    throw new Error('libas library is required for tests');
  }
});

// Global cleanup after all tests
afterAll(async () => {
  if (global.cleanup) {
    await global.cleanup();
  }
}); 
