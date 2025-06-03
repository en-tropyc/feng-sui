import React, { useState } from 'react';
import { Play, User, CheckCircle, ArrowRight, Loader } from 'lucide-react';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed';
  duration: number;
}

const InteractiveDemo: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: 1,
      title: "Alice signs transaction",
      description: "Generating Falcon-512 quantum-resistant signature",
      status: 'pending',
      duration: 2000
    },
    {
      id: 2,
      title: "Network aggregation", 
      description: "Feng-Sui network collecting and aggregating signatures",
      status: 'pending',
      duration: 1500
    },
    {
      id: 3,
      title: "Batch verification",
      description: "Verifying quantum-resistant signature batch", 
      status: 'pending',
      duration: 1000
    },
    {
      id: 4,
      title: "Sui settlement",
      description: "Executing atomic settlement on blockchain",
      status: 'pending',
      duration: 1200
    }
  ]);

  const [demoData, setDemoData] = useState({
    sender: { name: "Alice Corp", balance: 10000, address: "0xa1c3..." },
    recipient: { name: "Bob Industries", balance: 5000, address: "0xb0b7..." },
    amount: 250,
    signature: "",
    batchId: "",
    txHash: ""
  });

  const runDemo = async () => {
    setIsRunning(true);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    
    for (let i = 0; i < steps.length; i++) {
      // Set current step to running
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'running' } : step
      ));
      
      // Simulate step execution with realistic data updates
      await new Promise(resolve => {
        setTimeout(() => {
          if (i === 0) {
            // Generate fake signature
            setDemoData(prev => ({
              ...prev,
              signature: "falcon_sig_" + Math.random().toString(36).substr(2, 16)
            }));
          } else if (i === 1) {
            // Generate batch ID
            setDemoData(prev => ({
              ...prev,
              batchId: "batch_" + Math.random().toString(36).substr(2, 8)
            }));
          } else if (i === 3) {
            // Generate transaction hash and update balances
            setDemoData(prev => ({
              ...prev,
              txHash: "0x" + Math.random().toString(16).substr(2, 16),
              sender: { ...prev.sender, balance: prev.sender.balance - prev.amount },
              recipient: { ...prev.recipient, balance: prev.recipient.balance + prev.amount }
            }));
          }
          resolve(undefined);
        }, steps[i].duration);
      });
      
      // Set current step to completed
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed' } : step
      ));
    }
    
    setIsRunning(false);
  };

  const resetDemo = () => {
    setIsRunning(false);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    setDemoData({
      sender: { name: "Alice Corp", balance: 10000, address: "0xa1c3..." },
      recipient: { name: "Bob Industries", balance: 5000, address: "0xb0b7..." },
      amount: 250,
      signature: "",
      batchId: "",
      txHash: ""
    });
  };

  return (
    <section id="live-demo" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            See quantum payments in action
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 font-light leading-relaxed">
            Experience the complete quantum-resistant payment flow from signature generation to settlement
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={runDemo}
              disabled={isRunning}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Running demo...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start demo
                </>
              )}
            </button>
            
            <button
              onClick={resetDemo}
              className="border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-medium transition-all duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Process Visualization */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Payment process</h3>
            
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`bg-gray-800 border rounded-xl p-6 transition-all duration-300 ${
                  step.status === 'running' ? 'border-primary-400 bg-primary-500/10' :
                  step.status === 'completed' ? 'border-green-400 bg-green-500/10' :
                  'border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'running' ? 'bg-primary-500/20' :
                    step.status === 'completed' ? 'bg-green-500/20' :
                    'bg-gray-700'
                  }`}>
                    {step.status === 'running' ? (
                      <Loader className="w-5 h-5 text-primary-400 animate-spin" />
                    ) : step.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <span className="text-gray-400 font-semibold">{step.id}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{step.title}</h4>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Transaction Details */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Live transaction data</h3>
            
            {/* Participants */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Participants</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">{demoData.sender.name}</div>
                      <div className="text-gray-400 text-sm">{demoData.sender.address}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-semibold">{demoData.sender.balance} QUSD</div>
                    <div className="text-gray-400 text-sm">Balance</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-semibold text-white">{demoData.recipient.name}</div>
                      <div className="text-gray-400 text-sm">{demoData.recipient.address}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">{demoData.recipient.balance} QUSD</div>
                    <div className="text-gray-400 text-sm">Balance</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Amount */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Transfer amount</h4>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-400 mb-2">{demoData.amount} QUSD</div>
                <div className="text-gray-400">Quantum-resistant payment</div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4">Technical details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Signature:</span>
                  <span className="text-primary-400 text-sm font-mono">
                    {demoData.signature || "Pending..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Batch ID:</span>
                  <span className="text-primary-400 text-sm font-mono">
                    {demoData.batchId || "Pending..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tx Hash:</span>
                  <span className="text-green-400 text-sm font-mono">
                    {demoData.txHash || "Pending..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Results */}
        {steps.every(step => step.status === 'completed') && (
          <div className="mt-12 bg-gray-800 border border-green-500/30 rounded-2xl p-8">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Transaction completed!</h3>
              <p className="text-gray-300 mb-6">
                Quantum-resistant payment successfully processed and settled on Sui blockchain
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-primary-400 text-2xl font-bold">100%</div>
                  <div className="text-gray-400">Quantum-safe</div>
                </div>
                <div className="text-center">
                  <div className="text-primary-400 text-2xl font-bold">&lt; 6s</div>
                  <div className="text-gray-400">Total time</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 text-2xl font-bold">Atomic</div>
                  <div className="text-gray-400">Settlement</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InteractiveDemo; 
