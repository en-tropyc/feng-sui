import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const links = {
    product: [
      { name: "Interactive Demo", href: "#demo" },
      { name: "Technical Specs", href: "#specs" },
      { name: "API Documentation", href: "#api" },
      { name: "Security Audit", href: "#security" },
    ],
    developers: [
      { name: "Getting Started", href: "#start" },
      { name: "SDK Downloads", href: "#sdk" },
      { name: "Code Examples", href: "#examples" },
      { name: "Developer Forum", href: "#forum" },
    ],
    enterprise: [
      { name: "Enterprise Demo", href: "#enterprise" },
      { name: "Contact Sales", href: "#sales" },
      { name: "Integration Support", href: "#support" },
      { name: "Compliance", href: "#compliance" },
    ],
    resources: [
      { name: "Whitepaper", href: "#whitepaper" },
      { name: "Research Papers", href: "#research" },
      { name: "Blog", href: "#blog" },
      { name: "Media Kit", href: "#media" },
    ]
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-quantum-500 to-crypto-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text">Feng-Sui Network</h3>
                  <p className="text-gray-400 text-sm">Quantum-Resistant Payments</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                The world's first quantum-resistant payment network. Built on Sui blockchain 
                with Falcon-512 signatures for enterprise-grade security and performance.
              </p>
              
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/feng-sui" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-300" />
                </a>
                <a 
                  href="https://twitter.com/fengsui" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-300" />
                </a>
                <a 
                  href="https://discord.gg/fengsui" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-gray-300" />
                </a>
                <a 
                  href="mailto:hello@feng-sui.network" 
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-300" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-8 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {links.product.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-quantum-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-3">
                {links.developers.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-crypto-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="col-span-2 md:col-span-1"
            >
              <h4 className="text-white font-semibold mb-4">Enterprise</h4>
              <ul className="space-y-3">
                {links.enterprise.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Quantum Threat Awareness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-red-400 text-2xl font-bold mb-2">2030</div>
              <div className="text-gray-300 text-sm">Quantum computers expected to break current cryptography</div>
            </div>
            <div>
              <div className="text-orange-400 text-2xl font-bold mb-2">$2.1T</div>
              <div className="text-gray-300 text-sm">Financial systems at risk from quantum attacks</div>
            </div>
            <div>
              <div className="text-green-400 text-2xl font-bold mb-2">100%</div>
              <div className="text-gray-300 text-sm">Quantum-resistant with Feng-Sui Network</div>
            </div>
          </div>
        </motion.div>

        {/* Built on Sui */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="glass rounded-xl p-6 inline-block">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Powered by</span>
              <div className="text-2xl font-bold gradient-text">Sui Network</div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Building the future of quantum-resistant finance on the fastest blockchain
            </p>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 Feng-Sui Network. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#security" className="text-gray-400 hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
