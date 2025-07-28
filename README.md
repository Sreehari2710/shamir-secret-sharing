# shamir-secret-sharing

# 🔐 Shamir's Secret Sharing Solver

A comprehensive implementation of Shamir's Secret Sharing algorithm with multiple interfaces and thorough validation.

## ✨ Features

- 🔢 **Multi-base Support**: Decode values from bases 2-36
- 🧮 **Lagrange Interpolation**: Mathematically sound polynomial reconstruction
- ✅ **Solution Validation**: Automatic verification of results
- 🌐 **Web Interface**: Beautiful, interactive HTML solver
- 💻 **Command Line**: Full-featured CLI tool
- 🐍 **Python Implementation**: Alternative Python version
- 🧪 **Comprehensive Tests**: Full test suite with edge cases

## 🚀 Quick Start

### Web Interface (Easiest)
1. Open `shamir-solver.html` in your browser
2. Upload JSON test case or paste directly
3. Get instant results with validation!

### Command Line
```bash
# Test with built-in cases
node cli.js --test

# Solve specific file
node cli.js testcase1.json

# Show help
node cli.js --help
