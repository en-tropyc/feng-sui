import React from 'react';
import { Shield, Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const links = {
    product: [
      { name: "Interactive demo", href: "#live-demo" },
      { name: "Technical specs", href: "#technical-specs" },
      { name: "API documentation", href: "/docs/api" },
    ],
    developers: [
      { name: "Getting started", href: "/docs/quickstart" },
      { name: "SDK downloads", href: "/downloads" },
      { name: "Developer forum", href: "https://forum.feng-sui.network" },
    ],
    enterprise: [
      { name: "Enterprise demo", href: "/enterprise/demo" },
      { name: "Contact sales", href: "mailto:sales@feng-sui.network" },
      { name: "Integration support", href: "/support" },
    ],
    resources: [
      { name: "Whitepaper", href: "/whitepaper.pdf" },
      { name: "Research papers", href: "/research" },
      { name: "Blog", href: "https://blog.feng-sui.network" },
      { name: "Media kit", href: "/media" },
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
                <h3 className="text-xl font-bold text-gray-900">Feng-Sui</h3>
                <p className="text-gray-600 text-sm">Quantum-resistant payments</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              The world's first quantum-resistant payment network. Built on Sui blockchain 
              with Falcon-512 signatures for enterprise-grade security and performance.
            </p>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/en-tropyc/feng-sui" 
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

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              © 2024 Feng-Sui. All rights reserved.
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
