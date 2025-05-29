#!/bin/bash

# Complete End-to-End QUSD Flow Demo Runner
# This script runs the comprehensive demonstration of quantum-resistant transaction processing

set -e  # Exit on any error

echo "🌟 Feng-Sui Complete End-to-End Demo"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "complete-demo.js" ]; then
    echo "❌ Error: Please run this script from the scripts directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected file: complete-demo.js"
    exit 1
fi

# Check if libas is available
if [ ! -d "../../libas" ]; then
    echo "❌ Error: libas directory not found"
    echo "   Expected location: ../../libas"
    echo "   This is required for Falcon cryptography"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "   Please install Node.js to run this demo"
    exit 1
fi

echo "📋 Pre-flight checks:"
echo "   ✅ Script location: $(pwd)"
echo "   ✅ Libas available: ../../libas"
echo "   ✅ Node.js version: $(node --version)"
echo ""

# Ask user which demo to run
echo "🚀 Select Demo Option:"
echo "   1) Run Complete Interactive Demo Script"
echo "   2) Run Comprehensive Test Suite"  
echo "   3) Run Basic Transaction Tests"
echo "   4) Show Security Analysis Only"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎬 Running Complete Interactive Demo..."
        echo "📖 This will show the full end-to-end flow with security analysis"
        echo ""
        node complete-demo.js
        ;;
    2)
        echo ""
        echo "🧪 Running Comprehensive Test Suite..."
        echo "📊 This includes all functional tests and security demonstrations"
        echo ""
        if command -v npm &> /dev/null; then
            cd ..
            npm test test/functional/complete-e2e.test.js
            cd scripts
        else
            echo "❌ npm not found, running with node directly"
            echo "⚠️  Some test framework features may not work"
            cd ..
            node test/functional/complete-e2e.test.js
            cd scripts
        fi
        ;;
    3)
        echo ""
        echo "⚡ Running Basic Transaction Tests..."
        echo "🔧 This tests core transaction functionality"
        echo ""
        if command -v npm &> /dev/null; then
            cd ..
            npm test test/transaction-flow.test.js
            cd scripts
        else
            echo "❌ npm not found, trying to run basic test"
            cd ..
            node test/transaction-flow.test.js
            cd scripts
        fi
        ;;
    4)
        echo ""
        echo "🛡️  Security Analysis Summary"
        echo "=============================="
        echo ""
        echo "✅ QUANTUM-RESISTANT COMPONENTS:"
        echo "   🔐 Transaction signing (Falcon-512)"
        echo "   🔐 Signature verification (off-chain)"
        echo "   🔐 Batch aggregation"
        echo "   🔐 Authorization integrity"
        echo ""
        echo "❌ QUANTUM-VULNERABLE COMPONENTS:"
        echo "   💰 Final QUSD storage (classical Sui addresses)"
        echo "   🏦 Escrow deposits/withdrawals (Ed25519)"
        echo "   📝 Settlement transactions (verifier Ed25519)"
        echo "   🔑 Wallet interactions (classical keys)"
        echo ""
        echo "🎯 CRITICAL FINDING:"
        echo "   The system protects TRANSPORT but not DESTINATION"
        echo "   Quantum computers can still steal funds from storage addresses"
        echo "   Overall security: QUANTUM-VULNERABLE"
        echo ""
        echo "💡 To see the full demonstration, run option 1 or 2"
        ;;
    *)
        echo "❌ Invalid choice: $choice"
        echo "   Please run the script again and choose 1-4"
        exit 1
        ;;
esac

echo ""
echo "📖 For more information:"
echo "   📄 Read: README-DEMO.md"
echo "   🔗 View: complete-demo.js"
echo "   🧪 Tests: ../test/functional/complete-e2e.test.js"
echo ""
echo "✅ Demo completed!" 
