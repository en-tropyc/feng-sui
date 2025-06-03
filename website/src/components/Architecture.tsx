import React from 'react';

const Architecture: React.FC = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Payment Flow Architecture
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our quantum-resistant network processes payments through multiple layers of security and efficiency
          </p>
        </div>
        
        {/* Flow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Step 1 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">🔐</div>
            <div className="text-2xl font-bold text-quantum-400 mb-2">01</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Quantum Signature</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Generate Falcon-512 signature for transaction
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-quantum-400 rounded"></div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-2xl font-bold text-crypto-400 mb-2">02</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Off-chain Aggregation</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bundle multiple signatures for efficiency
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-crypto-400 rounded"></div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">💰</div>
            <div className="text-2xl font-bold text-quantum-400 mb-2">03</div>
            <h3 className="text-xl font-semibold mb-3 text-white">QUSD Transfer</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Execute stablecoin transfer with escrow
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-1 bg-quantum-400 rounded"></div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-2xl font-bold text-crypto-400 mb-2">04</div>
            <h3 className="text-xl font-semibold mb-3 text-white">Sui Settlement</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Final settlement on Sui blockchain
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
            <h3 className="text-2xl font-bold mb-6 text-quantum-400">Security Features</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Post-Quantum Cryptography</div>
                  <div className="text-gray-300 text-sm">Falcon-512 signatures resistant to quantum attacks</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Multi-Layer Validation</div>
                  <div className="text-gray-300 text-sm">Multiple verification stages before settlement</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Escrow Protection</div>
                  <div className="text-gray-300 text-sm">Funds held in secure escrow during processing</div>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Performance Metrics */}
          <div className="glass rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-crypto-400">Performance Metrics</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Lightning Fast</div>
                  <div className="text-gray-300 text-sm">Sub-100ms transaction processing</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">High Throughput</div>
                  <div className="text-gray-300 text-sm">1000+ transactions per second capacity</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">99.9% Uptime</div>
                  <div className="text-gray-300 text-sm">Enterprise-grade reliability guarantee</div>
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
