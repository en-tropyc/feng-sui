import React from 'react';
import Hero from './components/Hero';
import Architecture from './components/Architecture';
import Features from './components/Features';
import InteractiveDemo from './components/InteractiveDemo';
import TechnicalSpecs from './components/TechnicalSpecs';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Hero />
      <Architecture />
      <Features />
      <InteractiveDemo />
      <TechnicalSpecs />
      <Footer />
    </div>
  );
}

export default App;
