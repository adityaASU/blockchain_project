/**
 * Grant roles to demo wallets
 * Run this if roles weren't granted during deployment
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔑 Granting roles to demo wallets...\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "..", "deployments", "localhost-deployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  console.log("Contract Address:", deployment.contractAddress);
  
  // Get contract
  const SupplyChainProvenance = await hre.ethers.getContractFactory("SupplyChainProvenance");
  const contract = SupplyChainProvenance.attach(deployment.contractAddress);
  
  // Get role identifiers
  const PRODUCER_ROLE = await contract.PRODUCER_ROLE();
  const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
  const RETAILER_ROLE = await contract.RETAILER_ROLE();
  const REGULATOR_ROLE = await contract.REGULATOR_ROLE();
  
  // Get signers
  const signers = await hre.ethers.getSigners();
  
  console.log("\nGranting roles to addresses:");
  console.log("Producer (Account 1):", signers[1].address);
  console.log("Distributor (Account 2):", signers[2].address);
  console.log("Retailer (Account 3):", signers[3].address);
  console.log("Regulator (Account 4):", signers[4].address);
  console.log();
  
  // Grant roles
  console.log("Granting PRODUCER_ROLE...");
  let tx = await contract.grantSupplyChainRole(PRODUCER_ROLE, signers[1].address);
  await tx.wait();
  console.log("✓ PRODUCER_ROLE granted");
  
  console.log("Granting DISTRIBUTOR_ROLE...");
  tx = await contract.grantSupplyChainRole(DISTRIBUTOR_ROLE, signers[2].address);
  await tx.wait();
  console.log("✓ DISTRIBUTOR_ROLE granted");
  
  console.log("Granting RETAILER_ROLE...");
  tx = await contract.grantSupplyChainRole(RETAILER_ROLE, signers[3].address);
  await tx.wait();
  console.log("✓ RETAILER_ROLE granted");
  
  console.log("Granting REGULATOR_ROLE...");
  tx = await contract.grantSupplyChainRole(REGULATOR_ROLE, signers[4].address);
  await tx.wait();
  console.log("✓ REGULATOR_ROLE granted");
  
  console.log("\n✅ All roles granted successfully!");
  
  // Verify roles
  console.log("\nVerifying roles...");
  const hasProducerRole = await contract.hasRole(PRODUCER_ROLE, signers[1].address);
  const hasDistributorRole = await contract.hasRole(DISTRIBUTOR_ROLE, signers[2].address);
  const hasRetailerRole = await contract.hasRole(RETAILER_ROLE, signers[3].address);
  const hasRegulatorRole = await contract.hasRole(REGULATOR_ROLE, signers[4].address);
  
  console.log("Producer has role:", hasProducerRole);
  console.log("Distributor has role:", hasDistributorRole);
  console.log("Retailer has role:", hasRetailerRole);
  console.log("Regulator has role:", hasRegulatorRole);
  
  if (hasProducerRole && hasDistributorRole && hasRetailerRole && hasRegulatorRole) {
    console.log("\n✅ All roles verified successfully!");
  } else {
    console.log("\n⚠️  Some roles may not have been granted correctly!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

