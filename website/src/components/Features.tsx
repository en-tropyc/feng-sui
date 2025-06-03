import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, DollarSign, Code, Globe, Lock, TrendingUp, Cpu } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quantum-Resistant Security",
      description: "Future-proof your payments with Falcon-512 signatures that resist quantum computer attacks",
      color: "quantum",
      stats: "100% Quantum-Safe"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Settlement",
      description: "Sub-second finality with batch processing optimized for high-frequency trading",
      color: "crypto", 
      stats: "< 1s Settlement"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Enterprise Cost Efficiency",
      description: "Dramatically reduce payment processing costs with batch settlements and gas optimization",
      color: "green",
      stats: "90% Cost Reduction"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Developer-First API",
      description: "Simple REST APIs and SDKs for seamless integration into existing financial systems",
      color: "blue",
      stats: "< 1 Hour Integration"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Infrastructure",
      description: "Built on Sui's global network with instant cross-border payment capabilities",
      color: "purple",
      stats: "180+ Countries"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Enterprise Compliance",
      description: "Built-in KYC/AML hooks and regulatory compliance features for institutional use",
      color: "orange",
      stats: "SOC 2 Compliant"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
            Built for <span className="gradient-text">Enterprise</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The only payment infrastructure designed for the quantum computing era, 
            with institutional-grade security and performance
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`text-${feature.color}-400`}>
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              
              <div className={`inline-flex items-center px-3 py-1 bg-${feature.color}-500/20 rounded-full border border-${feature.color}-500/30`}>
                <span className={`text-${feature.color}-400 text-sm font-semibold`}>{feature.stats}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left: Why Now */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-red-400" />
              The Quantum Threat is Real
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-red-400 font-semibold mb-2">2030: Quantum Breakthrough Expected</div>
                <div className="text-gray-300 text-sm">IBM, Google, and other tech giants predict cryptographically relevant quantum computers within this decade</div>
              </div>
              
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-orange-400 font-semibold mb-2">$2.1 Trillion at Risk</div>
                <div className="text-gray-300 text-sm">Current financial systems rely on RSA and ECDSA encryption vulnerable to quantum attacks</div>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-green-400 font-semibold mb-2">Act Now, Lead Tomorrow</div>
                <div className="text-gray-300 text-sm">Early adopters will have competitive advantage and customer trust when quantum computers arrive</div>
              </div>
            </div>
          </div>

          {/* Right: Technical Superiority */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Cpu className="w-7 h-7 text-quantum-400" />
              Technical Superiority
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Signature Size</span>
                  <span className="text-quantum-400 font-semibold">666 bytes</span>
                </div>
                <div className="text-gray-500 text-sm">vs RSA-2048: 256 bytes (but quantum-vulnerable)</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Key Generation</span>
                  <span className="text-crypto-400 font-semibold">~1ms</span>
                </div>
                <div className="text-gray-500 text-sm">Fast enough for real-time applications</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Verification Speed</span>
                  <span className="text-green-400 font-semibold">~0.7ms</span>
                </div>
                <div className="text-gray-500 text-sm">Competitive with traditional schemes</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Security Level</span>
                  <span className="text-purple-400 font-semibold">NIST Level 1</span>
                </div>
                <div className="text-gray-500 text-sm">Equivalent to AES-128 against quantum attacks</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Secure Your Financial Future?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join forward-thinking enterprises already building on quantum-resistant infrastructure. 
              The future of finance starts with Feng-Sui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-quantum-600 to-quantum-500 hover:from-quantum-500 hover:to-quantum-400 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                Schedule Enterprise Demo
              </button>
              <button className="glass hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300">
                Download Technical Whitepaper
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 
