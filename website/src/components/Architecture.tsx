import React from 'react';
import { Shield, Zap, Sparkles, Building2, CheckCircle, Lock, Scale } from 'lucide-react';

const Architecture: React.FC = () => {
  return (
    <section id="network-infrastructure" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Network Architecture
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Off-chain quantum payment network with on-chain settlement on Sui
          </p>
        </div>

        {/* Two-Layer Architecture Diagram */}
        <div className="mb-20">
          <div className="max-w-5xl mx-auto">
            {/* Feng-Sui Layer (Top) */}
            <div className="glass rounded-2xl p-10 mb-8 border-3 border-quantum-400/50 bg-gradient-to-br from-quantum-500/10 to-quantum-600/5 shadow-2xl shadow-quantum-400/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-quantum-400">
                      <Zap size={40} className="drop-shadow-lg" />
                    </div>
                    <h3 className="text-3xl font-bold text-quantum-400">Feng-Sui Network</h3>
                    <div className="bg-quantum-400/20 text-quantum-300 px-3 py-1 rounded-full text-sm font-semibold">
                      1000x FASTER
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg">Off-Chain Payment Layer</p>
                </div>
                <div className="bg-quantum-400/20 text-quantum-300 px-4 py-2 rounded-full text-sm font-bold">
                  90% LOWER COSTS
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="flex justify-center mb-3">
                    <Shield size={40} className="text-quantum-400" />
                  </div>
                  <div className="font-bold text-white text-lg mb-1">Quantum-Safe</div>
                  <div className="text-quantum-300 text-sm font-semibold mb-2">Falcon-512 Signatures</div>
                  <div className="text-gray-400 text-xs">Future-proof cryptography</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="flex justify-center mb-3">
                    <Zap size={40} className="text-quantum-400" />
                  </div>
                  <div className="font-bold text-white text-lg mb-1">Lightning-Fast</div>
                  <div className="text-quantum-300 text-sm font-semibold mb-2">&lt;100ms Processing</div>
                  <div className="text-gray-400 text-xs">Instant payment confirmation</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="flex justify-center mb-3">
                    <Sparkles size={40} className="text-quantum-400" />
                  </div>
                  <div className="font-bold text-white text-lg mb-1">Batch Efficiency</div>
                  <div className="text-quantum-300 text-sm font-semibold mb-2">Smart Aggregation</div>
                  <div className="text-gray-400 text-xs">Optimized for scale</div>
                </div>
              </div>
            </div>

            {/* Enhanced Settlement Flow */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-col items-center relative">
                <div className="bg-gradient-to-r from-quantum-400 to-crypto-400 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                  BATCH SETTLEMENT
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-quantum-400 to-crypto-400 mb-2"></div>
                  <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent border-t-crypto-400 drop-shadow-lg"></div>
                </div>
                
                {/* Flowing dots animation */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                  <div className="flex flex-col space-y-2 animate-pulse">
                    <div className="w-2 h-2 bg-crypto-300 rounded-full opacity-60"></div>
                    <div className="w-2 h-2 bg-crypto-400 rounded-full opacity-80"></div>
                    <div className="w-2 h-2 bg-crypto-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sui Layer (Bottom) */}
            <div className="glass rounded-2xl p-10 border-3 border-crypto-400/50 bg-gradient-to-br from-crypto-500/10 to-crypto-600/5 shadow-2xl shadow-crypto-400/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-crypto-400">
                      <Building2 size={40} className="drop-shadow-lg" />
                    </div>
                    <h3 className="text-3xl font-bold text-crypto-400">Sui Blockchain</h3>
                    <div className="bg-crypto-400/20 text-crypto-300 px-3 py-1 rounded-full text-sm font-semibold">
                      100% IMMUTABLE
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg">On-Chain Settlement Layer</p>
                </div>
                <div className="bg-crypto-400/20 text-crypto-300 px-4 py-2 rounded-full text-sm font-bold">
                  GLOBAL CONSENSUS
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="flex justify-center mb-3">
                    <CheckCircle size={40} className="text-crypto-400" />
                  </div>
                  <div className="font-bold text-white text-lg mb-1">Permanent Records</div>
                  <div className="text-crypto-300 text-sm font-semibold mb-2">Immutable Ledger</div>
                  <div className="text-gray-400 text-xs">Cannot be altered or deleted</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="flex justify-center mb-3">
                    <Lock size={40} className="text-crypto-400" />
                  </div>
                  <div className="font-bold text-white text-lg mb-1">Network Security</div>
                  <div className="text-crypto-300 text-sm font-semibold mb-2">Validator Consensus</div>
                  <div className="text-gray-400 text-xs">Decentralized validation</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="flex justify-center mb-3">
                    <Scale size={40} className="text-crypto-400" />
                  </div>
                  <div className="font-bold text-white text-lg mb-1">Final Settlement</div>
                  <div className="text-crypto-300 text-sm font-semibold mb-2">Cryptographic Proof</div>
                  <div className="text-gray-400 text-xs">Mathematical certainty</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Flow Steps */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">Payment Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <Shield size={48} className="text-quantum-400" />
              </div>
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
              <div className="flex justify-center mb-4">
                <Zap size={48} className="text-crypto-400" />
              </div>
              <div className="text-2xl font-bold text-crypto-400 mb-2">02</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Process</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Instant off-chain payment processing
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-1 bg-crypto-400 rounded"></div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <Sparkles size={48} className="text-quantum-400" />
              </div>
              <div className="text-2xl font-bold text-quantum-400 mb-2">03</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Batch</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Aggregate multiple transactions for efficiency
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-1 bg-quantum-400 rounded"></div>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="glass rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-crypto-400" />
              </div>
              <div className="text-2xl font-bold text-crypto-400 mb-2">04</div>
              <h3 className="text-xl font-semibold mb-3 text-white">Settle</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Final settlement on Sui blockchain
              </p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-1 bg-crypto-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Technical Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Security Features */}
          <div className="glass rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-quantum-400">Quantum Security</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Post-Quantum Signatures</div>
                  <div className="text-gray-300 text-sm">Falcon-512 protection against quantum computers</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Off-Chain Privacy</div>
                  <div className="text-gray-300 text-sm">Private payment processing before settlement</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-quantum-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Cryptographic Proof</div>
                  <div className="text-gray-300 text-sm">Verifiable settlement with mathematical guarantees</div>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Performance Metrics */}
          <div className="glass rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-crypto-400">Performance Benefits</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Instant Payments</div>
                  <div className="text-gray-300 text-sm">Sub-100ms off-chain processing</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Low Settlement Costs</div>
                  <div className="text-gray-300 text-sm">Batch processing reduces on-chain fees</div>
                </div>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-crypto-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-white">Unlimited Throughput</div>
                  <div className="text-gray-300 text-sm">Off-chain scaling with periodic settlement</div>
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
