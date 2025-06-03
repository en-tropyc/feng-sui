import React from 'react';

const Architecture: React.FC = () => {
  return (
    <section id="network-infrastructure" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Network Infrastructure
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Post-quantum stablecoin infrastructure built for enterprise scale on Sui
          </p>
        </div>
        
        {/* Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Step 1 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">🔐</div>
            <div className="text-2xl font-bold text-quantum-400 mb-2">01</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Sign</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Generate Falcon-512 quantum-resistant signature
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-quantum-400 rounded"></div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-2xl font-bold text-crypto-400 mb-2">02</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Batch</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Aggregate transactions for optimal throughput
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-crypto-400 rounded"></div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">💰</div>
            <div className="text-2xl font-bold text-quantum-400 mb-2">03</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Settle</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Execute atomic QUSD transfers
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-quantum-400 rounded"></div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-2xl font-bold text-crypto-400 mb-2">04</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Finalize</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Record immutable proof on Sui
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-crypto-400 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Technical Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Security Features */}
          <div className="glass rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-quantum-400">Security</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Quantum-Resistant</div>
                  <div className="text-gray-300 text-sm">Falcon-512 signatures protect against quantum attacks</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Enterprise Validation</div>
                  <div className="text-gray-300 text-sm">Multi-layer verification for institutional requirements</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Atomic Settlement</div>
                  <div className="text-gray-300 text-sm">Guaranteed execution with cryptographic finality</div>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Performance Metrics */}
          <div className="glass rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-crypto-400">Performance</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Ultra-Low Latency</div>
                  <div className="text-gray-300 text-sm">Sub-100ms settlement optimized for Sui</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Parallel Execution</div>
                  <div className="text-gray-300 text-sm">Unlimited throughput via parallel processing</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">99.9% Uptime</div>
                  <div className="text-gray-300 text-sm">Enterprise-grade reliability guarantees</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture; 
