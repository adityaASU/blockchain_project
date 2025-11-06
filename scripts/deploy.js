/**
 * Deployment script for SupplyChainProvenance contract
 * 
 * This script:
 * 1. Deploys the main SupplyChainProvenance contract
 * 2. Sets up initial roles for testing/demo
 * 3. Saves deployment information for frontend integration
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  
  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy SupplyChainProvenance contract
  console.log("📦 Deploying SupplyChainProvenance contract...");
  const SupplyChainProvenance = await hre.ethers.getContractFactory("SupplyChainProvenance");
  const supplyChain = await SupplyChainProvenance.deploy();
  
  await supplyChain.waitForDeployment();
  const contractAddress = await supplyChain.getAddress();
  
  console.log("✅ SupplyChainProvenance deployed to:", contractAddress);
  console.log("📍 Network:", hre.network.name);
  console.log("⛓️  Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log();

  // Get role identifiers
  const PRODUCER_ROLE = await supplyChain.PRODUCER_ROLE();
  const DISTRIBUTOR_ROLE = await supplyChain.DISTRIBUTOR_ROLE();
  const RETAILER_ROLE = await supplyChain.RETAILER_ROLE();
  const REGULATOR_ROLE = await supplyChain.REGULATOR_ROLE();
  const DEFAULT_ADMIN_ROLE = await supplyChain.DEFAULT_ADMIN_ROLE();

  console.log("🔑 Role Identifiers:");
  console.log("   DEFAULT_ADMIN_ROLE:", DEFAULT_ADMIN_ROLE);
  console.log("   PRODUCER_ROLE:", PRODUCER_ROLE);
  console.log("   DISTRIBUTOR_ROLE:", DISTRIBUTOR_ROLE);
  console.log("   RETAILER_ROLE:", RETAILER_ROLE);
  console.log("   REGULATOR_ROLE:", REGULATOR_ROLE);
  console.log();

  // Setup demo accounts (only on localhost/testnet)
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("🎭 Setting up demo roles for testing...");
    
    const signers = await hre.ethers.getSigners();
    
    // Assign roles to different accounts for testing
    // Account 0: Admin (deployer)
    // Account 1: Producer
    // Account 2: Distributor
    // Account 3: Retailer
    // Account 4: Regulator
    
    if (signers.length >= 5) {
      console.log("   Granting PRODUCER_ROLE to:", signers[1].address);
      await supplyChain.grantSupplyChainRole(PRODUCER_ROLE, signers[1].address);
      
      console.log("   Granting DISTRIBUTOR_ROLE to:", signers[2].address);
      await supplyChain.grantSupplyChainRole(DISTRIBUTOR_ROLE, signers[2].address);
      
      console.log("   Granting RETAILER_ROLE to:", signers[3].address);
      await supplyChain.grantSupplyChainRole(RETAILER_ROLE, signers[3].address);
      
      console.log("   Granting REGULATOR_ROLE to:", signers[4].address);
      await supplyChain.grantSupplyChainRole(REGULATOR_ROLE, signers[4].address);
      
      console.log("✅ Demo roles configured!");
      console.log();
    }
  }

  // Save deployment information
  const deploymentInfo = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    roles: {
      DEFAULT_ADMIN_ROLE: DEFAULT_ADMIN_ROLE,
      PRODUCER_ROLE: PRODUCER_ROLE,
      DISTRIBUTOR_ROLE: DISTRIBUTOR_ROLE,
      RETAILER_ROLE: RETAILER_ROLE,
      REGULATOR_ROLE: REGULATOR_ROLE,
    },
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}-deployment.json`
  );
  
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log();

  // Display next steps
  console.log("✨ Deployment Complete! Next Steps:");
  console.log("   1. Save the contract address:", contractAddress);
  console.log("   2. Run tests: npx hardhat test");
  console.log("   3. Interact via console: npx hardhat console --network", hre.network.name);
  
  if (hre.network.name === "sepolia") {
    console.log("   4. Verify contract: npx hardhat verify --network sepolia", contractAddress);
    console.log("   5. View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);
  }
  
  console.log();
  console.log("📚 For frontend integration, use the deployment info from:");
  console.log("  ", deploymentFile);
  console.log();
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

