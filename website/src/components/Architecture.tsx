import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Cpu, Database, Users, CheckCircle } from 'lucide-react';

const Architecture: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "User Signs Transaction",
      description: "User creates transaction with Falcon-512 quantum-resistant signature",
      icon: <Users className="w-6 h-6" />,
      color: "quantum"
    },
    {
      title: "Signature Aggregation", 
      description: "Feng-Sui network aggregates multiple signatures off-chain",
      icon: <Cpu className="w-6 h-6" />,
      color: "crypto"
    },
    {
      title: "Batch Verification",
      description: "Batch verification of Falcon signatures ensures quantum security",
      icon: <Shield className="w-6 h-6" />,
      color: "green"
    },
    {
      title: "On-Chain Settlement",
      description: "Verified batches settled atomically on Sui blockchain",
      icon: <Database className="w-6 h-6" />,
      color: "blue"
    }
  ];

  return (
    <section className="py-24 bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Quantum-Resistant</span>
            <br />
            Architecture
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built for the post-quantum era with enterprise-grade security and performance
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <div className="relative mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  activeStep === index ? 'bg-white/10 scale-105' : 'hover:bg-white/5'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className={`w-12 h-12 rounded-xl bg-${step.color}-500/20 flex items-center justify-center mb-4`}>
                  <div className={`text-${step.color}-400`}>
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
                
                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left: Technical Stack */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-7 h-7 text-quantum-400" />
              Quantum-Safe Stack
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Falcon-512 Signatures</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-white">Sui Blockchain Settlement</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <span className="text-white">QUSD Stablecoin</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-white">Escrow-Based Transfers</span>
              </div>
            </div>
          </div>

          {/* Right: Performance Metrics */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Cpu className="w-7 h-7 text-crypto-400" />
              Performance Metrics
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Settlement Speed</span>
                  <span className="text-quantum-400 font-semibold">&lt; 1s</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-quantum-500 to-quantum-400 h-2 rounded-full w-[95%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Quantum Resistance</span>
                  <span className="text-green-400 font-semibold">100%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Transaction Throughput</span>
                  <span className="text-crypto-400 font-semibold">10K+ TPS</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-crypto-500 to-crypto-400 h-2 rounded-full w-[88%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Gas Efficiency</span>
                  <span className="text-blue-400 font-semibold">Ultra Low</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Simple Integration</h3>
            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm">
                <code className="text-gray-300">
{`// Initialize Feng-Sui quantum payment
const payment = new FengSuiPayment({
  network: 'mainnet',
  quantumSafe: true
});

// Create quantum-resistant transaction
const transaction = await payment.createTransfer({
  from: 'alice@quantum-wallet',
  to: 'bob@quantum-wallet', 
  amount: 100.00,
  currency: 'QUSD'
});

// Sign with Falcon-512
const signature = await wallet.signQuantum(transaction);

// Submit to network
const result = await payment.submit(transaction, signature);
console.log('Settlement hash:', result.hash);`}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Architecture; 
