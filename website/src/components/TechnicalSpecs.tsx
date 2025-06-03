import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Database, Shield, Cpu, Network, Terminal } from 'lucide-react';

const TechnicalSpecs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('architecture');

  const tabs = [
    { id: 'architecture', label: 'Architecture', icon: <Network className="w-5 h-5" /> },
    { id: 'crypto', label: 'Cryptography', icon: <Shield className="w-5 h-5" /> },
    { id: 'performance', label: 'Performance', icon: <Cpu className="w-5 h-5" /> },
    { id: 'api', label: 'API Reference', icon: <Code className="w-5 h-5" /> },
  ];

  const specifications = {
    architecture: {
      title: "System Architecture",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-quantum-400" />
                Core Components
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>FalconCrypto:</strong> Quantum signature engine</li>
                <li>• <strong>TransactionQueue:</strong> Batching & ordering</li>
                <li>• <strong>BatchProcessor:</strong> Signature aggregation</li>
                <li>• <strong>SuiSettlement:</strong> On-chain execution</li>
              </ul>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Network className="w-5 h-5 text-crypto-400" />
                Network Topology
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Off-chain:</strong> Signature aggregation layer</li>
                <li>• <strong>On-chain:</strong> Sui settlement contracts</li>
                <li>• <strong>Hybrid:</strong> Best of both worlds</li>
                <li>• <strong>Escrow:</strong> Working capital management</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6">
            <h4 className="font-bold text-white mb-3">System Flow</h4>
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ User Wallet │───▶│ Feng-Sui Network │───▶│ Sui Blockchain  │
│             │    │                  │    │                 │
│ Falcon-512  │    │ • Batch sigs     │    │ • QUSD tokens   │
│ signatures  │    │ • Aggregate      │    │ • Escrow mgmt   │
│             │    │ • Verify         │    │ • Settlement    │
└─────────────┘    └──────────────────┘    └─────────────────┘`}
            </pre>
          </div>
        </div>
      )
    },
    crypto: {
      title: "Quantum-Resistant Cryptography",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-3">Falcon-512 Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Security Level:</span>
                  <span className="text-quantum-400">NIST Level 1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Public Key:</span>
                  <span className="text-crypto-400">897 bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Private Key:</span>
                  <span className="text-green-400">1,281 bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Signature:</span>
                  <span className="text-purple-400">666 bytes</span>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-3">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Keygen Time:</span>
                  <span className="text-quantum-400">~1.0ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sign Time:</span>
                  <span className="text-crypto-400">~4.8ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verify Time:</span>
                  <span className="text-green-400">~0.7ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Batch Verify:</span>
                  <span className="text-purple-400">~0.1ms/sig</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h4 className="font-bold text-white mb-3">Security Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-green-400 font-semibold mb-1">Quantum Resistance</div>
                <div className="text-gray-300 text-sm">Based on NTRU lattice problems, resistant to Shor's algorithm</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-blue-400 font-semibold mb-1">NIST Standardized</div>
                <div className="text-gray-300 text-sm">Winner of NIST Post-Quantum Cryptography competition</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="text-purple-400 font-semibold mb-1">Production Ready</div>
                <div className="text-gray-300 text-sm">Extensively tested and formally verified</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    performance: {
      title: "Performance Benchmarks",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-4">Transaction Throughput</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Single Signatures</span>
                    <span className="text-quantum-400">200 TPS</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-quantum-400 h-2 rounded-full w-[20%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Batch Processing</span>
                    <span className="text-crypto-400">10,000+ TPS</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-crypto-400 h-2 rounded-full w-[100%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Settlement Speed</span>
                    <span className="text-green-400">&lt; 1 second</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full w-[95%]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-4">Resource Usage</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">CPU Usage</span>
                    <span className="text-blue-400">Low</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full w-[25%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Memory Footprint</span>
                    <span className="text-purple-400">Minimal</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full w-[15%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Gas Efficiency</span>
                    <span className="text-orange-400">Optimized</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full w-[90%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h4 className="font-bold text-white mb-3">Scaling Characteristics</h4>
            <div className="bg-gray-900 rounded-xl p-4">
              <pre className="text-sm text-gray-300">
{`Batch Size    | Single TPS | Batch TPS | Gas Cost | Latency
------------- | ---------- | --------- | -------- | --------
1 tx          | 200        | 200       | 100%     | 700ms
10 tx         | 200        | 2,000     | 15%      | 800ms  
100 tx        | 200        | 20,000    | 3%       | 1.2s
1000 tx       | 200        | 200,000   | 1%       | 2.5s`}
              </pre>
            </div>
          </div>
        </div>
      )
    },
    api: {
      title: "Developer API Reference",
      content: (
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-quantum-400" />
              Core Endpoints
            </h4>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-quantum-400 font-mono mb-2">POST /api/transactions</div>
                <div className="text-gray-300 text-sm mb-2">Submit quantum-resistant transaction</div>
                <pre className="text-xs text-gray-400">
{`{
  "from": "0xa1c3...",
  "to": "0xb0b7...", 
  "amount": 100.00,
  "signature": "falcon_sig_...",
  "currency": "QUSD"
}`}
                </pre>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-crypto-400 font-mono mb-2">GET /api/verify/status</div>
                <div className="text-gray-300 text-sm mb-2">Check crypto service readiness</div>
                <pre className="text-xs text-gray-400">
{`{
  "ready": true,
  "service": "FalconCrypto",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                </pre>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-green-400 font-mono mb-2">POST /api/verify/signature</div>
                <div className="text-gray-300 text-sm mb-2">Verify Falcon-512 signature</div>
                <pre className="text-xs text-gray-400">
{`{
  "message": "transaction_data",
  "signature": "falcon_sig_...",
  "publicKey": "falcon_pk_...",
  "valid": true
}`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-3">SDK Integration</h4>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-gray-300">
{`npm install @feng-sui/sdk

import { FengSuiClient } from '@feng-sui/sdk';

const client = new FengSuiClient({
  network: 'mainnet',
  apiKey: 'your-api-key'
});

// Send quantum-resistant payment
const result = await client.transfer({
  to: 'recipient-address',
  amount: 100,
  currency: 'QUSD'
});`}
                </pre>
              </div>
            </div>
            
            <div className="glass rounded-xl p-6">
              <h4 className="font-bold text-white mb-3">Contract Integration</h4>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-xs text-gray-300">
{`// Sui Move integration
use feng_sui::settlement;

public fun quantum_payment(
    settlement_state: &mut SettlementState,
    from: address,
    to: address, 
    amount: u64,
    sequence: u64,
    ctx: &mut TxContext
) {
    settlement::settle_transfer_batch(
        settlement_state,
        vector[from],
        vector[to], 
        vector[amount],
        sequence,
        ctx
    );
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Technical</span> Specifications
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Deep dive into the technical architecture and implementation details
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 bg-gray-800/50 rounded-2xl p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-quantum-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              {specifications[activeTab as keyof typeof specifications].title}
            </h3>
            {specifications[activeTab as keyof typeof specifications].content}
          </div>
        </motion.div>

        {/* Integration Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Start Building?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Get started with our comprehensive documentation and developer tools. 
              Our team is here to help you integrate quantum-resistant payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-quantum-600 to-quantum-500 hover:from-quantum-500 hover:to-quantum-400 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                Access Developer Portal
              </button>
              <button className="glass hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300">
                Join Developer Discord
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnicalSpecs; 
