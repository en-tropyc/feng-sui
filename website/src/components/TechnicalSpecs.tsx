import React, { useState } from 'react';
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
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-500" />
                Core Components
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">FalconCrypto:</strong> Quantum signature engine</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">TransactionQueue:</strong> Batching & ordering</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">BatchProcessor:</strong> Signature aggregation</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">SuiSettlement:</strong> On-chain execution</div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary-500" />
                Network Topology
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">Off-chain:</strong> Signature aggregation layer</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">On-chain:</strong> Sui settlement contracts</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">Hybrid:</strong> Best of both worlds</div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <div><strong className="text-gray-900">Escrow:</strong> Working capital management</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    crypto: {
      title: "Quantum-Resistant Cryptography",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Falcon-512 Parameters</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Security Level:</span>
                  <span className="text-primary-600 font-medium">NIST Level 1</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Public Key:</span>
                  <span className="text-gray-900 font-medium">897 bytes</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Private Key:</span>
                  <span className="text-gray-900 font-medium">1,281 bytes</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Signature:</span>
                  <span className="text-gray-900 font-medium">666 bytes</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Keygen Time:</span>
                  <span className="text-primary-600 font-medium">~1.0ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Sign Time:</span>
                  <span className="text-gray-900 font-medium">~4.8ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Verify Time:</span>
                  <span className="text-gray-900 font-medium">~0.7ms</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Batch Verify:</span>
                  <span className="text-gray-900 font-medium">~0.1ms/sig</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Security Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-700 font-semibold mb-2">Quantum Resistance</div>
                <div className="text-gray-600 text-sm leading-relaxed">Based on NTRU lattice problems, resistant to Shor's algorithm</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-700 font-semibold mb-2">NIST Standardized</div>
                <div className="text-gray-600 text-sm leading-relaxed">Winner of NIST Post-Quantum Cryptography competition</div>
              </div>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="text-primary-700 font-semibold mb-2">Production Ready</div>
                <div className="text-gray-600 text-sm leading-relaxed">Extensively tested and formally verified</div>
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
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-6">Transaction Throughput</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Single Signatures</span>
                    <span className="text-primary-600 font-semibold">200 TPS</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full w-[20%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Batch Processing</span>
                    <span className="text-primary-600 font-semibold">10,000+ TPS</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full w-[100%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Settlement Speed</span>
                    <span className="text-green-600 font-semibold">&lt; 1 second</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-[95%]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-6">Resource Usage</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">CPU Usage</span>
                    <span className="text-blue-600 font-semibold">Low</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[25%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Memory Footprint</span>
                    <span className="text-purple-600 font-semibold">Minimal</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-[15%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Gas Efficiency</span>
                    <span className="text-orange-600 font-semibold">Optimized</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full w-[90%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-6">Latency Analysis</h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">&lt; 100ms</div>
                <div className="text-gray-600 font-medium mb-2">Network Latency</div>
                <div className="text-gray-500 text-sm">Off-chain signature aggregation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt; 500ms</div>
                <div className="text-gray-600 font-medium mb-2">Batch Processing</div>
                <div className="text-gray-500 text-sm">Signature verification & batching</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">&lt; 1s</div>
                <div className="text-gray-600 font-medium mb-2">Final Settlement</div>
                <div className="text-gray-500 text-sm">On-chain Sui blockchain finality</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    api: {
      title: "API Reference",
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">REST API Endpoints</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">POST</span>
                  <code className="text-gray-800 font-mono">/api/v1/transactions</code>
                </div>
                <p className="text-gray-600 text-sm mb-3">Submit a new quantum-resistant transaction</p>
                <div className="bg-gray-50 rounded p-3">
                  <pre className="text-xs text-gray-700 font-mono">{`{
  "from": "0xa1c3...",
  "to": "0xb0b7...", 
  "amount": "250.00",
  "signature": "falcon_sig_..."
}`}</pre>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">GET</span>
                  <code className="text-gray-800 font-mono">/api/v1/transactions/&#123;id&#125;</code>
                </div>
                <p className="text-gray-600 text-sm mb-3">Get transaction status and details</p>
                <div className="bg-gray-50 rounded p-3">
                  <pre className="text-xs text-gray-700 font-mono">{`{
  "id": "tx_123...",
  "status": "settled",
  "batch_id": "batch_456...",
  "sui_hash": "0xabc..."
}`}</pre>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">GET</span>
                  <code className="text-gray-800 font-mono">/api/v1/batches/&#123;id&#125;</code>
                </div>
                <p className="text-gray-600 text-sm mb-3">Get batch processing information</p>
                <div className="bg-gray-50 rounded p-3">
                  <pre className="text-xs text-gray-700 font-mono">{`{
  "batch_id": "batch_456...",
  "transactions": 150,
  "status": "verified",
  "settlement_hash": "0xdef..."
}`}</pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">SDK Libraries</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">JavaScript/TypeScript</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">npm install @feng-sui/sdk</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Python</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">pip install feng-sui</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rust</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">cargo add feng-sui</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Go</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">go get feng-sui/sdk</code>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Rate Limits</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Free Tier</span>
                  <span className="text-gray-900 font-medium">100 req/min</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Developer</span>
                  <span className="text-gray-900 font-medium">1,000 req/min</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Enterprise</span>
                  <span className="text-gray-900 font-medium">10,000 req/min</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Custom</span>
                  <span className="text-primary-600 font-medium">Contact sales</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Start Example</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <pre className="text-sm text-gray-700 font-mono overflow-x-auto">{`import { FengSui } from '@feng-sui/sdk';

const client = new FengSui({
  apiKey: 'your-api-key',
  network: 'mainnet'
});

// Create quantum-resistant payment
const payment = await client.createPayment({
  from: wallet.address,
  to: recipient.address,
  amount: '100.00',
  currency: 'QUSD'
});

// Sign with Falcon-512
const signature = await wallet.signQuantum(payment.hash);

// Submit transaction
const result = await client.submitTransaction({
  payment,
  signature
});

console.log('Transaction ID:', result.id);`}</pre>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Technical Specifications
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Deep dive into the technical architecture and implementation details
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            {specifications[activeTab as keyof typeof specifications].title}
          </h3>
          {specifications[activeTab as keyof typeof specifications].content}
        </div>
      </div>
    </section>
  );
};

export default TechnicalSpecs; 
