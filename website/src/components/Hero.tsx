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
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Main Content */}
        <div className="animate-fade-in">
          <h1 className="text-[6rem] sm:text-[7rem] lg:text-[9rem] xl:text-[12rem] font-bold text-white mb-8 tracking-tight leading-none">
            Feng-Sui
          </h1>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-200 mb-8 tracking-wide max-w-5xl mx-auto">
            Quantum-resistant stablecoin infrastructure 
            <br className="hidden sm:block" />
            built for enterprise scale
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Unrivaled security coupled with instant settlement means your payments 
            stay protected when quantum computing arrives
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button 
              onClick={() => scrollToSection('network-infrastructure')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/25 min-w-[180px]"
            >
              Get started
            </button>
            <button 
              onClick={() => scrollToSection('live-demo')}
              className="border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 hover:text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 min-w-[180px]"
            >
              Learn about Feng-Sui
            </button>
          </div>
        </div>
        
        {/* Metrics Section - Sui style */}
        <div className="animate-slide-up">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">
                Settlement time
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-400 group-hover:text-primary-300 transition-colors duration-200">
                &lt;100ms
              </div>
              <div className="text-gray-600 text-sm mt-1">
                Average finality
              </div>
            </div>
            
            <div className="text-center group">
              <div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">
                Quantum protection
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-400 group-hover:text-primary-300 transition-colors duration-200">
                Falcon-512
              </div>
              <div className="text-gray-600 text-sm mt-1">
                Post-quantum signatures
              </div>
            </div>
            <div className="text-center group">
              <div className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">
                Future-proof
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary-400 group-hover:text-primary-300 transition-colors duration-200">
                ∞
              </div>
              <div className="text-gray-600 text-sm mt-1">
                Quantum resistance
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 
