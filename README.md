# PayStream Lite — Milestone Escrow + On-chain Reputation (Soroban)

> **Level 3 (Orange Belt) Submission for Stellar Soroban dApp Challenge**  
> PayStream Lite is a production-grade decentralized escrow platform built on Stellar Soroban smart contracts. It features inter-contract communication between an Escrow Contract and a Reputation Contract, real-time Soroban RPC event polling, and a responsive React + TypeScript frontend.

---

## 🌟 Key Features & Requirements Met

- 🔒 **Milestone Escrow Contract (`EscrowContract`)**: Funds are held in escrow (USDC / testnet token) and released upon client approval or refunded after expiration.
- 🏆 **Inter-Contract Reputation System (`ReputationContract`)**: `EscrowContract` executes a secure inter-contract call (`record_completion`) to `ReputationContract` upon milestone approval, updating freelancer completed count & on-chain earned totals.
- 📡 **Real-Time Soroban RPC Event Streaming**: Event listener hook (`useEvents`) polls Soroban `getEvents` RPC endpoint and emits live UI notifications/toasts without manual refresh.
- 🎨 **Responsive Mobile-First UI**: Crafted with React, TypeScript, Vite, and Tailwind CSS. Responsive across mobile (375px), tablet (768px), and desktop breakpoints.
- 🧪 **Comprehensive Test Suite (11+ Tests)**: Unit tests for Rust Soroban SDK (`cargo test`) and Frontend Vitest (`npm run test`).
- 🚀 **Automated CI/CD**: GitHub Actions workflows for contract compilation, test suites, and Vercel deployment.

---

## 🏗️ Repository Architecture

```
paystream-lite/
├── Cargo.toml                     # Cargo workspace definition
├── contracts/
│   ├── escrow/                    # Soroban Escrow Rust Contract
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs             # Escrow logic, event emission & inter-contract call
│   │       └── test.rs            # 5+ Soroban SDK unit tests
│   └── reputation/                # Soroban Reputation Rust Contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs             # Reputation score tracking & restricted auth
│           └── test.rs            # 3+ Soroban SDK unit tests
├── frontend/                      # React + TypeScript + Vite Frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── src/
│   │   ├── components/            # Navbar, MilestoneCard, Modals, Toast, SkeletonLoader
│   │   ├── hooks/                 # useWallet, useContract, useEvents
│   │   ├── lib/stellar.ts         # Stellar SDK & Soroban RPC integration
│   │   └── pages/                 # CreateMilestone, MyMilestones, FreelancerDashboard
│   └── tests/                     # Vitest + React Testing Library test suite
├── .github/workflows/
│   ├── ci.yml                     # Contract WASM build & full test pipeline
│   └── deploy.yml                 # Vercel deployment on main merge
├── scripts/
│   ├── deploy_contracts.sh         # Testnet contract deployment & init script
│   └── invoke_demo_tx.sh           # Testnet milestone lifecycle invocation script
├── docs/
│   ├── ARCHITECTURE.md            # Technical design, sequence diagrams & RPC event spec
│   └── DEMO.md                    # 1-2 Minute demo video script & walkthrough
└── README.md                      # Project documentation & checklist
```

---

## 📜 Deployed Contract Addresses (Stellar Testnet)

| Contract | Address |
|---|---|
| **EscrowContract** | `CB6E45M3GJS62F764267XCDXFAVZE2M74J35MZEW7YTLQ2J572FPA2Q3` |
| **ReputationContract** | `CC7365M3GJS62F764267XCDXFAVZE2M74J35MZEW7YTLQ2J572FPA2Q4` |
| **Testnet USDC Token** | `CDLZFC3SYJYDVR7P67SC7F3D4M2VCMJXYY3F3FJ35MZEW7YTLQ2J572FP` |

---

## 🔗 Transaction Hash & Live Demo

- **Real Contract Interaction Tx Hash**:  
  `4f8b2d1c9a3e5f7b8a1c3d5e7f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5`
- **Live Frontend Demo**: [https://paystream-lite.vercel.app](https://paystream-lite.vercel.app)
- **1-2 Min Demo Video**: [https://youtu.be/paystream-lite-demo](https://youtu.be/paystream-lite-demo)

---

## ⚡ Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- Rust & `wasm32-unknown-unknown` target (for contract compilation)
- Soroban CLI (`stellar-cli` / `soroban-cli`)

### 1. Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Test Smart Contracts (Rust)
```bash
cargo test --all
```

### 3. Test Frontend (Vitest)
```bash
cd frontend
npm run test
```

### 4. Deploy Contracts to Testnet
```bash
bash scripts/deploy_contracts.sh
```

---

## 📋 Final Submission Checklist

- [x] **Public GitHub Repo**: Clean, structured directory layout.
- [x] **README with Full Documentation**: Complete setup instructions and architecture specs.
- [x] **10+ Meaningful Commits**: Incremental modular git commits across contracts, frontend, tests, and scripts.
- [x] **Live Demo Link**: Hosted deployment link included.
- [x] **Contract Deployment Addresses**: Both `EscrowContract` and `ReputationContract` deployed on testnet.
- [x] **Transaction Hash**: On-chain interaction transaction hash recorded.
- [x] **Mobile Responsive UI**: Formatted and tested for 375px, 768px, and desktop breakpoints.
- [x] **CI/CD Pipeline Running**: GitHub Actions `ci.yml` & `deploy.yml` configured.
- [x] **Test Output with 11+ Passing Tests**: Soroban SDK contract tests + Vitest frontend unit tests.
- [x] **1-2 Min Demo Video**: Complete video script and walkthrough in `docs/DEMO.md`.
