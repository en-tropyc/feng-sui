const fs = require('fs');
const path = require('path');

/**
 * Shared configuration reader for Sui deployment
 * Reads from config.json in the same directory
 */
class SuiConfig {
  constructor() {
    this.configPath = path.join(__dirname, 'config.json');
    this._config = null;
  }

  /**
   * Load configuration from config.json
   * @returns {Object} The deployment configuration
   */
  load() {
    if (this._config) {
      return this._config;
    }

    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Configuration file not found: ${this.configPath}`);
      }

      const configData = fs.readFileSync(this.configPath, 'utf8');
      this._config = JSON.parse(configData);
      
      // Validate required fields
      const required = ['packageId', 'treasuryId', 'settlementStateId', 'adminAddress'];
      for (const field of required) {
        if (!this._config[field]) {
          throw new Error(`Missing required configuration field: ${field}`);
        }
      }

      return this._config;
    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
      console.error('💡 Make sure to run the deployment script first: ./feng-sui-network/demo/setup.sh');
      throw error;
    }
  }

  /**
   * Get the package ID
   */
  get packageId() {
    return this.load().packageId;
  }

  /**
   * Get the treasury ID
   */
  get treasuryId() {
    return this.load().treasuryId;
  }

  /**
   * Get the settlement state ID
   */
  get settlementStateId() {
    return this.load().settlementStateId;
  }

  /**
   * Get the admin address
   */
  get adminAddress() {
    return this.load().adminAddress;
  }

  /**
   * Get the full configuration object
   */
  get config() {
    return this.load();
  }

  /**
   * Reload configuration from file (useful after redeployment)
   */
  reload() {
    this._config = null;
    return this.load();
  }
}

// Export a singleton instance
module.exports = new SuiConfig(); 
