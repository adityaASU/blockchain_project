/**
 * Example interaction script for SupplyChainProvenance contract
 * 
 * This script demonstrates how to interact with the deployed contract
 * and shows a complete product lifecycle example.
 * 
 * Usage:
 *   npx hardhat run scripts/interact-example.js --network localhost
 */

const hre = require("hardhat");

async function main() {
  console.log("🔗 Interacting with SupplyChainProvenance contract\n");

  // Get signers (test accounts)
  const [admin, producer, distributor, retailer, regulator] = await hre.ethers.getSigners();

  console.log("👥 Using accounts:");
  console.log("   Admin:", admin.address);
  console.log("   Producer:", producer.address);
  console.log("   Distributor:", distributor.address);
  console.log("   Retailer:", retailer.address);
  console.log("   Regulator:", regulator.address);
  console.log();

  // TODO: Update this with your deployed contract address
  // You can find this in deployments/localhost-deployment.json after running deploy.js
  const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
  
  // If you don't have a deployed contract, uncomment these lines to deploy:
  // console.log("📦 Deploying contract...");
  // const SupplyChain = await hre.ethers.getContractFactory("SupplyChainProvenance");
  // const supplyChain = await SupplyChain.deploy();
  // await supplyChain.waitForDeployment();
  // CONTRACT_ADDRESS = await supplyChain.getAddress();
  // console.log("✅ Contract deployed to:", CONTRACT_ADDRESS, "\n");

  // Attach to deployed contract
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChainProvenance");
  const supplyChain = await SupplyChain.attach(CONTRACT_ADDRESS);

  console.log("📍 Contract address:", CONTRACT_ADDRESS);
  console.log();

  // ============================================
  // STEP 1: Setup Roles
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 1: Setting up roles");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const PRODUCER_ROLE = await supplyChain.PRODUCER_ROLE();
  const DISTRIBUTOR_ROLE = await supplyChain.DISTRIBUTOR_ROLE();
  const RETAILER_ROLE = await supplyChain.RETAILER_ROLE();
  const REGULATOR_ROLE = await supplyChain.REGULATOR_ROLE();

  console.log("Granting roles...");
  await supplyChain.connect(admin).grantSupplyChainRole(PRODUCER_ROLE, producer.address);
  console.log("✓ Producer role granted");
  
  await supplyChain.connect(admin).grantSupplyChainRole(DISTRIBUTOR_ROLE, distributor.address);
  console.log("✓ Distributor role granted");
  
  await supplyChain.connect(admin).grantSupplyChainRole(RETAILER_ROLE, retailer.address);
  console.log("✓ Retailer role granted");
  
  await supplyChain.connect(admin).grantSupplyChainRole(REGULATOR_ROLE, regulator.address);
  console.log("✓ Regulator role granted");
  console.log();

  // ============================================
  // STEP 2: Register Product
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 2: Producer registers product");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const productName = "Organic Coffee Beans - Premium Grade";
  const batchId = "BATCH-2024-001";
  const origin = "Colombia";
  const productionDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday

  console.log("Registering product:");
  console.log("   Name:", productName);
  console.log("   Batch ID:", batchId);
  console.log("   Origin:", origin);
  console.log("   Production Date:", new Date(productionDate * 1000).toLocaleDateString());

  const registerTx = await supplyChain.connect(producer).registerProduct(
    productName,
    batchId,
    origin,
    productionDate
  );
  await registerTx.wait();

  const productId = 1; // First product
  console.log("✅ Product registered with ID:", productId);
  console.log();

  // Get and display product details
  let product = await supplyChain.getProduct(productId);
  console.log("📋 Product Details:");
  console.log("   ID:", product.productId.toString());
  console.log("   Name:", product.name);
  console.log("   Batch:", product.batchId);
  console.log("   Owner:", product.currentOwner);
  console.log("   Origin:", product.origin);
  console.log("   Status:", getStatusName(product.status));
  console.log();

  // ============================================
  // STEP 3: Producer Dispatches Product
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 3: Producer dispatches product");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await supplyChain.connect(producer).updateProductStatus(
    productId,
    1, // Dispatched
    "Shipped from farm via refrigerated truck"
  );
  console.log("✅ Status updated to: Dispatched");
  console.log();

  // ============================================
  // STEP 4: Transfer to Distributor
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 4: Transfer to distributor");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const transferMetadata = JSON.stringify({
    location: "Distribution Center - Port of Cartagena",
    temperature: "4°C",
    shipmentId: "SHIP-2024-A123",
    carrier: "Global Logistics Co."
  });

  await supplyChain.connect(producer).transferProduct(
    productId,
    distributor.address,
    transferMetadata
  );

  product = await supplyChain.getProduct(productId);
  console.log("✅ Ownership transferred");
  console.log("   New owner:", product.currentOwner);
  console.log("   Metadata:", transferMetadata);
  console.log();

  // ============================================
  // STEP 5: Distributor Updates Status
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 5: Distributor updates status");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await supplyChain.connect(distributor).updateProductStatus(
    productId,
    2, // InTransit
    "In transit via sea freight to USA"
  );
  console.log("✅ Status updated to: InTransit");
  console.log();

  // ============================================
  // STEP 6: Transfer to Retailer
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 6: Transfer to retailer");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const retailerMetadata = JSON.stringify({
    location: "Store #123 - New York City",
    warehouse: "Warehouse B, Aisle 5",
    receivedBy: "John Doe",
    receivedDate: new Date().toISOString()
  });

  await supplyChain.connect(distributor).transferProduct(
    productId,
    retailer.address,
    retailerMetadata
  );

  product = await supplyChain.getProduct(productId);
  console.log("✅ Ownership transferred to retailer");
  console.log("   New owner:", product.currentOwner);
  console.log();

  // ============================================
  // STEP 7: Retailer Confirms Receipt
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 7: Retailer confirms receipt");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await supplyChain.connect(retailer).updateProductStatus(
    productId,
    3, // Received
    "Product received in excellent condition. Temperature maintained throughout transit."
  );
  console.log("✅ Status updated to: Received");
  console.log();

  // ============================================
  // STEP 8: Regulator Adds Verification
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 8: Regulator adds verification");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const certificateHash = "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"; // Example IPFS CID
  const verificationNotes = "Organic certification verified. Product meets USDA Organic standards. Certificate expires: 2025-12-31.";

  await supplyChain.connect(regulator).addVerification(
    productId,
    certificateHash,
    verificationNotes
  );

  console.log("✅ Verification added");
  console.log("   Certificate Hash:", certificateHash);
  console.log("   Notes:", verificationNotes);
  console.log();

  // ============================================
  // STEP 9: View Final Product State
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 9: Final product state");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  product = await supplyChain.getProduct(productId);
  console.log("📦 Product Summary:");
  console.log("   ID:", product.productId.toString());
  console.log("   Name:", product.name);
  console.log("   Batch:", product.batchId);
  console.log("   Origin:", product.origin);
  console.log("   Current Owner:", product.currentOwner);
  console.log("   Status:", getStatusName(product.status));
  console.log("   Production Date:", new Date(Number(product.productionDate) * 1000).toLocaleDateString());
  console.log("   Created At:", new Date(Number(product.createdAt) * 1000).toLocaleString());
  console.log();

  // Get verifications
  const verifications = await supplyChain.getProductVerifications(productId);
  console.log("🔐 Verifications:", verifications.length);
  verifications.forEach((v, i) => {
    console.log(`   [${i + 1}] Verifier:`, v.verifier);
    console.log(`       Certificate:`, v.certificateHash);
    console.log(`       Date:`, new Date(Number(v.timestamp) * 1000).toLocaleString());
    console.log(`       Notes:`, v.notes);
  });
  console.log();

  // ============================================
  // Summary
  // ============================================
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Complete lifecycle demonstration finished!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 Summary:");
  console.log("   ✓ Product registered by producer");
  console.log("   ✓ Transferred to distributor with metadata");
  console.log("   ✓ Status updated during transit");
  console.log("   ✓ Transferred to retailer");
  console.log("   ✓ Receipt confirmed by retailer");
  console.log("   ✓ Verification added by regulator");
  console.log();

  console.log("🎯 This demonstrates:");
  console.log("   • Role-based access control");
  console.log("   • Complete chain of custody");
  console.log("   • Status lifecycle tracking");
  console.log("   • Third-party verification");
  console.log("   • Immutable audit trail");
  console.log();

  console.log("💡 Next steps:");
  console.log("   • Query events for complete history");
  console.log("   • Build frontend UI for QR code scanning");
  console.log("   • Integrate IPFS for certificate storage");
  console.log("   • Add IoT sensor data integration");
  console.log();
}

// Helper function to convert status enum to readable name
function getStatusName(statusCode) {
  const statuses = [
    "Created",
    "Dispatched",
    "InTransit",
    "Received",
    "Delivered",
    "Verified",
    "Exception"
  ];
  return statuses[Number(statusCode)] || "Unknown";
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

