import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-quantum-900/20 via-gray-900 to-crypto-900/20" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse-slow" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-quantum-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-quantum-600/20 border border-quantum-500/30 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-quantum-400" />
            <span className="text-sm text-quantum-200">Quantum-Resistant Payments</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Feng-Sui</span>
            <br />
            <span className="text-white">Network</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            The world's first quantum-resistant payment network built on Sui blockchain. 
            Secure your financial future with <strong className="text-quantum-400">Falcon-512 signatures</strong> 
            and enterprise-grade infrastructure.
          </p>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-quantum-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">100% Quantum-Safe</div>
            <div className="text-gray-400">Falcon-512 signatures protect against quantum attacks</div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-center mb-3">
              <Zap className="w-8 h-8 text-crypto-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">Sub-Second Settlement</div>
            <div className="text-gray-400">Batch processing with instant finality on Sui</div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-center mb-3">
              <Globe className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">Enterprise Ready</div>
            <div className="text-gray-400">Built for institutional scale and compliance</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="group bg-gradient-to-r from-quantum-600 to-quantum-500 hover:from-quantum-500 hover:to-quantum-400 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-quantum-500/25">
            <span className="flex items-center gap-2">
              Try Interactive Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="group glass hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
            <span className="flex items-center gap-2">
              Technical Documentation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-16 bg-gradient-to-b from-quantum-400 to-transparent rounded-full"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero; 
