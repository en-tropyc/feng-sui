import React from 'react';

const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-quantum-400 via-crypto-400 to-quantum-500 bg-clip-text text-transparent animate-pulse-slow leading-tight py-2">
          Feng-Sui
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          Quantum-Safe Stablecoins
        </h2>
        
        {/* Subtitle */}
        {/* <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed font-semibold">
          Powered by Falcon-512 Signatures on Sui
        </p> */}
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          Built with post-quantum cryptography to protect digital assets in the quantum computing era.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button 
            onClick={() => scrollToSection('network-infrastructure')}
            className="bg-quantum-500 hover:bg-quantum-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-quantum-500/25"
          >
            Explore Infrastructure
          </button>
          <button 
            onClick={() => scrollToSection('live-demo')}
            className="glass border-2 border-crypto-400 hover:bg-crypto-400/10 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Live Demo
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-crypto-400 mb-2">&lt;100ms</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Network Latency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-quantum-400 mb-2">Falcon-512</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Post-Quantum Signatures</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-crypto-400 mb-2">∞</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider">Quantum-Resistant</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
