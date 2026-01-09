# Blockchain-Based Supply Chain Provenance System

## Description

A decentralized supply chain provenance tracking system built on Ethereum that enables transparent, tamper-evident tracking of products from origin to consumer. The system uses smart contracts to create an immutable chain of custody, ensuring traceability and authenticity across all supply chain participants.

### Key Features
- Immutable Product Registration
- Role-Based Access Control (Producer, Distributor, Retailer, Regulator, Consumer)
- Ownership Transfer Tracking
- Product Verification by Regulators
- Consumer Transparency via QR codes

---

## Dependencies

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x

### Tech Stack
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- React (Frontend)
- Express.js (API)
- Ethers.js

---

## Setup & Deployment

You need **3 terminals** to run the full application:

### Terminal 1 - Start Local Blockchain
```bash
npm install
npx hardhat node
```

### Terminal 2 - Deploy Contract & Start API
```bash
npx hardhat run scripts/deploy.js --network localhost
cd api
npm install
npm start
```

### Terminal 3 - Start Frontend
```bash
cd web
npm install
npm start
```

---

## Project Structure

```
Project/
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment scripts
├── test/               # Test files
├── api/                # Backend API (Express.js)
├── web/                # Frontend (React)
├── hardhat.config.js   # Hardhat configuration
└── package.json        # Root dependencies
```
