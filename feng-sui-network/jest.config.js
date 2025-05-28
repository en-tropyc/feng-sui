module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js'
  ],
  
  // Test timeout (15 seconds for API calls)
  testTimeout: 15000,
  
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
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Performance settings
  maxWorkers: '50%', // Use half the available CPU cores
  
  // Global settings for better stability
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Better error handling
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
}; 
