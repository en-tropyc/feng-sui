// Global test setup and utilities

// Remove conflicting timeout setting - now handled in jest.config.js
// jest.setTimeout(15000); // REMOVED - conflicts with jest.config.js

let libas = null;
let server = null;

// Test setup functions
const initializeLibas = async () => {
  try {
    const path = require('path');
    const libasPath = path.join(__dirname, '../../libas');
    libas = require(libasPath);
    console.log('✅ libas library loaded successfully');
    return libas;
  } catch (error) {
    console.error('❌ Failed to load libas library:', error.message);
    throw new Error('libas library is required for tests');
  }
};

const startTestServer = async () => {
  if (server) return server;
  
  try {
    const app = require('../src/server');
    const port = process.env.TEST_PORT || 3001; // Use different port for tests
    
    return new Promise((resolve, reject) => {
      server = app.listen(port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`✅ Test server started on port ${port}`);
          resolve(server);
        }
      });
    });
  } catch (error) {
    console.error('❌ Failed to start test server:', error.message);
    throw error;
  }
};

const stopTestServer = async () => {
  if (server) {
    return new Promise((resolve) => {
      server.close(() => {
        console.log('✅ Test server stopped');
        server = null;
        resolve();
      });
    });
  }
};

const getFalconCrypto = () => {
  if (!libas) {
    throw new Error('libas not initialized. Call initializeLibas() first.');
  }
  
  // Return a wrapper object that matches what tests expect
  return {
    createKeyPair: () => libas.createKeyPair(),
    sign: (message, privateKey) => libas.falconSign(message, privateKey),
    verify: (message, signature, publicKey) => libas.falconVerify(message, signature, publicKey),
    // Also expose the raw libas methods for direct access
    falconSign: (message, privateKey) => libas.falconSign(message, privateKey),
    falconVerify: (message, signature, publicKey) => libas.falconVerify(message, signature, publicKey)
  };
};

// Export functions for use in tests
module.exports = {
  initializeLibas,
  getFalconCrypto,
  startTestServer,
  stopTestServer
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
  
  // API base URL (use test port)
  API_BASE_URL: `http://localhost:${process.env.TEST_PORT || 3001}`
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
global.cleanup = async () => {
  await stopTestServer();
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
