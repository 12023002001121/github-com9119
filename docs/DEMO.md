# PayStream Lite — Demo Script & Walkthrough (1-2 Minute Video Guide)

This guide provides the exact 1-2 minute video demo script and step-by-step presentation outline for the Level 3 submission.

---

## 🎬 1-2 Minute Video Demo Script

### [0:00 - 0:20] Introduction & Architecture Overview
> *"Hello! This is PayStream Lite, a production-grade milestone escrow and on-chain freelancer reputation platform built on Stellar Soroban smart contracts for the Level 3 (Orange Belt) challenge."*
> *"Our architecture features two smart contracts: EscrowContract holding milestone funds in USDC, and ReputationContract tracking verified earnings and completions via inter-contract calls."*

### [0:20 - 0:45] Milestone Creation & Funding
> *"First, as a Client, I connect my Freighter wallet on Soroban Testnet and click 'Create Milestone'. I specify the freelancer address, amount (500 USDC), and deadline. Once created, I click 'Fund Escrow' to lock tokens into the contract."*

### [0:45 - 1:10] Deliverable Submission & Real-Time Event Notification
> *"Now switching to the Freelancer view, I see the assigned milestone. I submit my deliverable IPFS CID. Notice the live Soroban RPC event toast notification appearing in real time without refreshing!"*

### [1:10 - 1:40] Approval, Inter-Contract Call & Reputation Update
> *"Finally, the Client reviews the deliverable link and clicks 'Approve Deliverable'. EscrowContract transfers the 500 USDC directly to the freelancer AND executes a secure inter-contract call to ReputationContract.record_completion(). The freelancer's on-chain score immediately updates to 1 completed milestone and $500 earned!"*

### [1:40 - 2:00] Conclusion & CI/CD Pipeline
> *"Our repository features 10+ passing unit tests across Rust Soroban SDK and Vitest, automated GitHub Actions CI/CD workflows, and testnet deployment scripts. Thank you!"*

---

## 📱 Mobile Responsiveness Verification
- Mobile View (375px Breakpoint)
- Tablet View (768px Breakpoint)
- Desktop View (1024px+ Breakpoint)
