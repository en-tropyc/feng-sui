import React from 'react';
import { Shield, Zap, Sparkles, Building2, CheckCircle, Lock, Scale } from 'lucide-react';

const Architecture: React.FC = () => {
  return (
    <section id="network-infrastructure" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Network Architecture
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            Off-chain quantum payment network with on-chain settlement on Sui
          </p>
        </div>

        {/* Two-Layer Architecture Diagram */}
        <div className="mb-24">
          <div className="max-w-6xl mx-auto">
            {/* Feng-Sui Layer (Top) */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 mb-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Zap size={32} className="text-primary-500" />
                    <h3 className="text-3xl font-bold text-gray-900">Feng-Sui Network</h3>
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      Off-Chain
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg font-light">Payment processing layer</p>
                </div>
                <div className="hidden lg:block bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                  Initiated
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <Shield size={32} className="text-primary-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">Quantum-Safe</h4>
                  <p className="text-primary-600 text-sm font-medium mb-2">Falcon-512 Signatures</p>
                  <p className="text-gray-500 text-sm">Future-proof cryptography</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <Zap size={32} className="text-primary-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">Lightning-Fast</h4>
                  <p className="text-primary-600 text-sm font-medium mb-2">&lt;100ms Confirmation</p>
                  <p className="text-gray-500 text-sm">Instant off-chain processing</p>
                </div>
                <div className="text-center p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <Sparkles size={32} className="text-primary-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-2">Batch Efficiency</h4>
                  <p className="text-primary-600 text-sm font-medium mb-2">Smart Aggregation</p>
                  <p className="text-gray-500 text-sm">Optimized for scale</p>
                </div>
              </div>
            </div>

            {/* Settlement Flow */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-col items-center">
                <div className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
                  Batch Settlement
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>
            </div>

            {/* Sui Layer (Bottom) */}
            <div className="bg-gray-900 text-white rounded-2xl p-12 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Building2 size={32} className="text-primary-400" />
                    <h3 className="text-3xl font-bold text-white">Sui Blockchain</h3>
                    <span className="bg-primary-900 text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                      On-Chain
                    </span>
                  </div>
                  <p className="text-gray-300 text-lg font-light">Settlement layer</p>
                </div>
                <div className="hidden lg:block bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Finalized
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <CheckCircle size={32} className="text-primary-400" />
                  </div>
                  <h4 className="font-semibold text-white text-lg mb-2">Escrow Enforcement</h4>
                  <p className="text-primary-300 text-sm font-medium mb-2">On-Chain Safeguards</p>
                  <p className="text-gray-400 text-sm">Escrow contract guarantees enforceable capital allocation for quantum transfers.</p>
                </div>
                <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <Lock size={32} className="text-primary-400" />
                  </div>
                  <h4 className="font-semibold text-white text-lg mb-2">Quantum Settlement Proofs</h4>
                  <p className="text-primary-300 text-sm font-medium mb-2">Batch Verification Interface</p>
                  <p className="text-gray-400 text-sm">Verifies pre-aggregated Falcon signatures via authorized verifier.</p>
                </div>
                <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors duration-200">
                  <div className="flex justify-center mb-4">
                    <Scale size={32} className="text-primary-400" />
                  </div>
                  <h4 className="font-semibold text-white text-lg mb-2">Stablecoin Compliance Layer</h4>
                  <p className="text-primary-300 text-sm font-medium mb-2">Regulated Asset Framework</p>
                  <p className="text-gray-400 text-sm">Supports QUSD operations with Move-based access control and pause functions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gray-50 rounded-2xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Security advantages</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Post-quantum signatures</h4>
                  <p className="text-gray-600 leading-relaxed">Falcon-512 protection against quantum computers</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Off-chain privacy</h4>
                  <p className="text-gray-600 leading-relaxed">Private payment processing before settlement</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Cryptographic proof</h4>
                  <p className="text-gray-600 leading-relaxed">Verifiable settlement with mathematical guarantees</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Performance benefits</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant confirmations</h4>
                  <p className="text-gray-600 leading-relaxed">Sub-100ms off-chain transaction confirmation</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Low settlement costs</h4>
                  <p className="text-gray-600 leading-relaxed">Batch processing reduces on-chain fees</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Unlimited throughput</h4>
                  <p className="text-gray-600 leading-relaxed">Off-chain scaling with periodic settlement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture; 
