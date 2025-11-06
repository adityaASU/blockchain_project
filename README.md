# Blockchain-Based Supply Chain Provenance System

## 📋 Project Description

A decentralized supply chain provenance tracking system built on Ethereum that enables transparent, tamper-evident tracking of products from origin to consumer. The system uses smart contracts to create an immutable chain of custody, ensuring traceability and authenticity across all supply chain participants.

### Key Features
- **Immutable Product Registration**: Producers can register products/batches with origin and production details
- **Role-Based Access Control (RBAC)**: Different permissions for Producers, Distributors, Retailers, Regulators, and Consumers
- **Ownership Transfer Tracking**: Complete chain of custody with timestamps and metadata
- **Product Verification**: Regulators/Certifiers can add verifications and certificates
- **Consumer Transparency**: QR code-based product history access for end consumers
- **Event-Driven Architecture**: All actions emit blockchain events for complete auditability

### Problem Statement
Current supply chains suffer from fragmented record-keeping, enabling fraud, counterfeiting, and breaking traceability. This erodes consumer trust and makes recalls/audits difficult. Our solution provides a shared, tamper-evident source of truth accessible to all stakeholders.

### Use Cases
1. **Producer**: Register new products/batches with origin certificates
2. **Distributor**: Receive products and transfer custody with shipment metadata
3. **Retailer**: Confirm delivery and update product status
4. **Regulator**: Add compliance verifications and certificates
5. **Consumer**: Scan QR code to view complete product history and certifications

---

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity ^0.8.20
- **Development Framework**: Hardhat
- **Blockchain**: Ethereum (Sepolia Testnet for deployment)
- **Testing**: Mocha/Chai with Hardhat
- **Access Control**: OpenZeppelin Contracts (AccessControl, Ownable)
- **Languages**: JavaScript/TypeScript

---

## 📦 Dependencies

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- Git

### Required Packages
```json
{
  "hardhat": "^2.19.0",
  "@openzeppelin/contracts": "^5.0.0",
  "@nomicfoundation/hardhat-toolbox": "^4.0.0",
  "ethers": "^6.9.0"
}
```

---

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
# Network Configuration
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_test_wallet_private_key

# Optional: Etherscan API for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Security Note**: Never commit `.env` file or real private keys to version control!

### 4. Compile Contracts
```bash
npx hardhat compile
```

### 5. Run Tests
```bash
npx hardhat test
```

### 6. Deploy to Local Network
```bash
# Terminal 1 - Start local node
npx hardhat node

# Terminal 2 - Deploy
npx hardhat run scripts/deploy.js --network localhost
```

---

## 📝 How to Use

### For Development

#### Run Local Blockchain Node
```bash
npx hardhat node
```
This starts a local Ethereum node at `http://127.0.0.1:8545/` with 20 pre-funded test accounts.

#### Deploy Contracts Locally
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Note the deployed contract address from console output.

#### Interact via Console
```bash
npx hardhat console --network localhost
```

Example interaction:
```javascript
// Get deployed contract
const SupplyChain = await ethers.getContractFactory("SupplyChainProvenance");
const contract = await SupplyChain.attach("DEPLOYED_ADDRESS");

// Register a product (as Producer)
const tx = await contract.registerProduct(
  "Organic Coffee Beans",
  "BATCH-2024-001",
  "Colombia",
  Math.floor(Date.now() / 1000)
);
await tx.wait();
console.log("Product registered!");
```

### For Testing

#### Run All Tests
```bash
npx hardhat test
```

#### Run Specific Test File
```bash
npx hardhat test test/SupplyChainProvenance.test.js
```

#### Generate Coverage Report
```bash
npx hardhat coverage
```

### For Deployment (Testnet)

#### Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### Verify Contract on Etherscan
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

---

## 📁 Project Structure

```
Project/
├── contracts/              # Solidity smart contracts
│   ├── SupplyChainProvenance.sol    # Main contract
│   └── interfaces/         # Contract interfaces
│       └── ISupplyChain.sol
│
├── scripts/                # Deployment and utility scripts
│   └── deploy.js          # Main deployment script
│
├── test/                   # Test files
│   └── SupplyChainProvenance.test.js
│
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Node dependencies
├── .env.example          # Environment template
└── README.md             # This file
```

---

## 🎯 Smart Contract Architecture

### Core Contract: `SupplyChainProvenance`

#### Main Components

**1. Roles (RBAC using OpenZeppelin AccessControl)**
- `PRODUCER_ROLE`: Can register new products
- `DISTRIBUTOR_ROLE`: Can transfer and receive products
- `RETAILER_ROLE`: Can receive products and update status
- `REGULATOR_ROLE`: Can add verifications/certifications
- `DEFAULT_ADMIN_ROLE`: Can grant/revoke roles

**2. Data Structures**
```solidity
struct Product {
    uint256 productId;
    string name;
    string batchId;
    address currentOwner;
    string origin;
    uint256 productionDate;
    ProductStatus status;
    uint256 createdAt;
    uint256 lastUpdatedBlock;
}

enum ProductStatus {
    Created,
    Dispatched,
    InTransit,
    Received,
    Delivered,
    Verified,
    Exception
}
```

**3. Key Functions**
- `registerProduct()`: Create new product (Producer only)
- `transferProduct()`: Transfer custody (Current owner only)
- `updateProductStatus()`: Update status with notes (Role-based)
- `addVerification()`: Add certification (Regulator only)
- `getProductHistory()`: Retrieve complete history via events

**4. Events**
- `ProductCreated`: Emitted when new product registered
- `OwnershipTransferred`: Emitted on custody transfer
- `StatusUpdated`: Emitted on status change
- `ProductVerified`: Emitted when regulator adds verification

---

## 🔐 Security Features

- **Access Control**: Role-based permissions using OpenZeppelin's battle-tested contracts
- **Reentrancy Protection**: Using checks-effects-interactions pattern
- **Input Validation**: Comprehensive validation on all public functions
- **Event Logging**: All state changes emit events for transparency
- **Immutability**: Product history is tamper-evident on blockchain
- **Emergency Pause**: Contract can be paused by admin in emergencies

---

## 🧪 Testing Strategy

### Unit Tests
- ✅ Product registration by authorized producers
- ✅ Role-based access control enforcement
- ✅ Ownership transfer validation
- ✅ Status update permissions
- ✅ Verification by regulators
- ✅ Event emission verification
- ✅ Edge cases and error conditions

### Integration Tests (Planned)
- End-to-end product lifecycle flow
- Multi-party interaction scenarios
- Gas optimization validation

### Test Coverage Goal
- Minimum 85% code coverage on core functionality

---

## 📊 Current Status

### ✅ Completed (Checkpoint 1)
- [x] Project planning and architecture design
- [x] README documentation
- [x] Contract interfaces and signatures
- [x] Basic project structure setup
- [x] High-level implementation comments

### 🚧 In Progress
- [ ] Complete contract implementation
- [ ] Comprehensive unit tests
- [ ] Deployment scripts
- [ ] Local testing and validation

### 📅 Planned (Future Phases)
- [ ] Backend API (Node.js/Express)
- [ ] Frontend dashboard (React)
- [ ] IPFS integration for documents
- [ ] QR code generation and scanning
- [ ] Testnet deployment (Sepolia)
- [ ] IoT sensor integration (optional)

---

## 🎓 Learning Objectives Demonstrated

1. **Smart Contract Development**: Writing secure, efficient Solidity code
2. **Access Control**: Implementing role-based permissions
3. **Event-Driven Design**: Using events for off-chain monitoring
4. **State Management**: Managing complex product lifecycles on-chain
5. **Gas Optimization**: Balancing functionality with transaction costs
6. **Testing**: Comprehensive test coverage for contract security
7. **Deployment**: Understanding mainnet vs. testnet deployment strategies

---

## 🤝 Contributing

This is a course project. For questions or suggestions:
- Review the `plan.md` file for detailed implementation roadmap
- Check existing issues and tests for implementation details
- Follow Solidity best practices and OpenZeppelin guidelines

---

## 📄 License

This project is developed for educational purposes as part of a Blockchain course.

---

## 🔗 Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Development Tutorial](https://ethereum.org/en/developers/docs/)

---

## 📞 Support

For issues or questions related to this project, please refer to the course materials or consult with the instructor.

---

**Project Status**: 🟡 In Development - Checkpoint 1  
**Last Updated**: November 3, 2025

