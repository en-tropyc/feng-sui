import React from 'react';
import { Shield, Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const links = {
    product: [
      { name: "Interactive demo", href: "#demo" },
      { name: "Technical specs", href: "#specs" },
      { name: "API documentation", href: "#api" },
      { name: "Security audit", href: "#security" },
    ],
    developers: [
      { name: "Getting started", href: "#start" },
      { name: "SDK downloads", href: "#sdk" },
      { name: "Code examples", href: "#examples" },
      { name: "Developer forum", href: "#forum" },
    ],
    enterprise: [
      { name: "Enterprise demo", href: "#enterprise" },
      { name: "Contact sales", href: "#sales" },
      { name: "Integration support", href: "#support" },
      { name: "Compliance", href: "#compliance" },
    ],
    resources: [
      { name: "Whitepaper", href: "#whitepaper" },
      { name: "Research papers", href: "#research" },
      { name: "Blog", href: "#blog" },
      { name: "Media kit", href: "#media" },
    ]
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Feng-Sui Network</h3>
                <p className="text-gray-600 text-sm">Quantum-resistant payments</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              The world's first quantum-resistant payment network. Built on Sui blockchain 
              with Falcon-512 signatures for enterprise-grade security and performance.
            </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/feng-sui" 
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Github className="w-5 h-5 text-gray-700" />
              </a>
              <a 
                href="https://twitter.com/fengsui" 
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Twitter className="w-5 h-5 text-gray-700" />
              </a>
              <a 
                href="https://discord.gg/fengsui" 
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5 text-gray-700" />
              </a>
              <a 
                href="mailto:hello@feng-sui.network" 
                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <Mail className="w-5 h-5 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-8 lg:col-span-3">
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {links.product.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Developers</h4>
              <ul className="space-y-3">
                {links.developers.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-gray-900 font-semibold mb-4">Enterprise</h4>
              <ul className="space-y-3">
                {links.enterprise.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quantum Threat Awareness */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-red-600 text-2xl font-bold mb-2">2030</div>
              <div className="text-gray-600 text-sm">Quantum computers expected to break current cryptography</div>
            </div>
            <div>
              <div className="text-orange-600 text-2xl font-bold mb-2">$2.1T</div>
              <div className="text-gray-600 text-sm">Financial systems at risk from quantum attacks</div>
            </div>
            <div>
              <div className="text-green-600 text-2xl font-bold mb-2">100%</div>
              <div className="text-gray-600 text-sm">Quantum-resistant with Feng-Sui Network</div>
            </div>
          </div>
        </div>

        {/* Built on Sui */}
        <div className="text-center mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6 inline-block">
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Powered by</span>
              <div className="text-2xl font-bold text-primary-600">Sui Network</div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Building the future of quantum-resistant finance on the fastest blockchain
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              © 2024 Feng-Sui Network. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Privacy policy
              </a>
              <a href="#terms" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Terms of service
              </a>
              <a href="#security" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
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
