const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// API routes
const verifyRoutes = require('./api/verify');
const transactionRoutes = require('./api/transactions');

app.use('/api/verify', verifyRoutes);
app.use('/api/transactions', transactionRoutes);

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'feng-sui-network',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Feng-Sui Network running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Verify API: http://localhost:${PORT}/api/verify/status`);
  console.log(`📥 Transactions API: http://localhost:${PORT}/api/transactions/queue/status`);
});

module.exports = app; 

