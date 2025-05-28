module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js'
  ],
  
  // Test timeout (increased for crypto operations)
  testTimeout: 20000,
  
  // ES Module handling for Sui SDK
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@mysten/sui|@noble/.*)/)'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Enable when needed
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude server entry point
    '!**/node_modules/**'
  ],
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Module resolution
  moduleDirectories: ['node_modules', 'src'],
  
  // Verbose output for debugging
  verbose: false,
  
  // Fail fast on first test failure (useful for CI)
  bail: false,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: false,
  
  // Silent mode (reduce noise)
  silent: false
}; 
