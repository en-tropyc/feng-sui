import React from 'react';
import { motion } from 'framer-motion';
import Hero from './components/Hero';
import Architecture from './components/Architecture';
import Features from './components/Features';
import InteractiveDemo from './components/InteractiveDemo';
import TechnicalSpecs from './components/TechnicalSpecs';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="App bg-gray-900 text-white">
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
