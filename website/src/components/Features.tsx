import React from 'react';
import { Shield, Zap, DollarSign, Code, Globe, Lock, TrendingUp, Cpu } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quantum-resistant security",
      description: "Future-proof your payments with Falcon-512 signatures that resist quantum computer attacks",
      stats: "100% quantum-safe"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning fast confirmation",
      description: "Sub-100ms confirmation with batched on-chain settlement for optimal security and performance",
      stats: "< 100ms confirmation"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Enterprise cost efficiency",
      description: "Dramatically reduce payment processing costs with batch settlement and gas optimization",
      stats: "90% cost reduction"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Developer-first API",
      description: "Simple REST APIs and SDKs for seamless integration into existing financial systems",
      stats: "< 1 hour integration"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global infrastructure",
      description: "Built on Sui's global network with instant cross-border payment capabilities",
      stats: "Global reach"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Enterprise compliance",
      description: "Built-in KYC/AML hooks and regulatory compliance features for institutional use",
      stats: "Regulatory ready"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Built for enterprise
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            The only payment infrastructure designed for the quantum computing era, 
            with institutional-grade security and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <div className="text-primary-600">
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
              
              <div className="inline-flex items-center px-3 py-1 bg-primary-50 rounded-full border border-primary-200">
                <span className="text-primary-700 text-sm font-medium">{feature.stats}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left: Why Now */}
          <div className="bg-white rounded-2xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-red-500" />
              The quantum threat is real
            </h3>
            
            <div className="space-y-6">
              <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="text-red-700 font-semibold mb-2">2030s: Quantum breakthrough expected</div>
                <div className="text-gray-600 leading-relaxed">IBM, Google, and other tech giants predict cryptographically relevant quantum computers within the next decade</div>
              </div>
              
              <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-orange-700 font-semibold mb-2">$2.1 trillion at risk</div>
                <div className="text-gray-600 leading-relaxed">Current financial systems rely on RSA and ECDSA encryption vulnerable to quantum attacks</div>
              </div>
              
              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-green-700 font-semibold mb-2">Act now, lead tomorrow</div>
                <div className="text-gray-600 leading-relaxed">Early adopters will have competitive advantage and customer trust when quantum computers arrive</div>
              </div>
            </div>
          </div>

          {/* Right: Technical Superiority */}
          <div className="bg-white rounded-2xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Cpu className="w-6 h-6 text-primary-500" />
              Technical superiority
            </h3>
            
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Signature size</span>
                  <span className="text-primary-600 font-semibold">666 bytes</span>
                </div>
                <div className="text-gray-500 text-sm">vs RSA-2048: 256 bytes (but quantum-vulnerable)</div>
              </div>
              
              <div className="pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Key generation</span>
                  <span className="text-primary-600 font-semibold">~1ms</span>
                </div>
                <div className="text-gray-500 text-sm">Fast enough for real-time applications</div>
              </div>
              
              <div className="pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Verification speed</span>
                  <span className="text-primary-600 font-semibold">~0.7ms</span>
                </div>
                <div className="text-gray-500 text-sm">Competitive with traditional schemes</div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Security level</span>
                  <span className="text-primary-600 font-semibold">NIST Level 1</span>
                </div>
                <div className="text-gray-500 text-sm">Equivalent to AES-128 against quantum attacks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gray-900 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Secure your stablecoin network today
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Adopt post-quantum protection that's already compliant with NIST standards and built for enterprise-scale systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200">
                Request PQC Readiness Assessment
              </button>
              <button className="border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-medium transition-all duration-200">
                Whitepaper (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 
