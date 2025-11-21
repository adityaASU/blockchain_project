/**
 * Complete Demo Flow Script
 * This script simulates the complete supply chain journey for demo purposes
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎬 Starting Supply Chain Demo Flow...\n");

  // Load deployment
  const deploymentFile = path.join(__dirname, "..", "deployments", "localhost-deployment.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  // Get contract
  const SupplyChainProvenance = await hre.ethers.getContractFactory("SupplyChainProvenance");
  const contract = SupplyChainProvenance.attach(deployment.contractAddress);
  
  // Get signers
  const [admin, producer, distributor, retailer, regulator] = await hre.ethers.getSigners();
  
  console.log("📋 Participants:");
  console.log("  Producer:", producer.address);
  console.log("  Distributor:", distributor.address);
  console.log("  Retailer:", retailer.address);
  console.log("  Regulator:", regulator.address);
  console.log();

  // Check existing products
  const totalProducts = await contract.getTotalProducts();
  console.log(`📦 Found ${totalProducts} existing product(s)\n`);
  
  let productId;
  
  if (totalProducts.toString() === "0") {
    // Step 1: Producer registers a product
    console.log("Step 1: 🏭 Producer registers a new product...");
    const tx1 = await contract.connect(producer).registerProduct(
      "Organic Coffee Beans - Premium Blend",
      "BATCH-2024-001",
      "Colombia, South America",
      Math.floor(Date.now() / 1000)
    );
    const receipt1 = await tx1.wait();
    
    // Get product ID from event
    for (const log of receipt1.logs) {
      try {
        const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
        if (parsed && parsed.name === 'ProductCreated') {
          productId = parsed.args.productId.toString();
          break;
        }
      } catch (e) { continue; }
    }
    console.log(`✅ Product registered! ID: ${productId}`);
    console.log(`   Status: Created\n`);
  } else {
    productId = "1"; // Use existing product
    const product = await contract.getProduct(productId);
    console.log(`Using existing product ID: ${productId}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Current Owner: ${product.currentOwner}`);
    console.log(`   Status: ${product.status}\n`);
  }

  // Get current product state
  let product = await contract.getProduct(productId);
  
  // Step 2: Producer dispatches to Distributor
  if (product.currentOwner.toLowerCase() === producer.address.toLowerCase() && product.status < 1) {
    console.log("Step 2: 📤 Producer dispatches product to distributor...");
    const tx2 = await contract.connect(producer).updateProductStatus(
      productId,
      1, // Dispatched
      "Shipped via FedEx, Tracking: FX123456789"
    );
    await tx2.wait();
    console.log("✅ Status updated: Dispatched\n");
  }

  // Step 3: Producer transfers to Distributor
  product = await contract.getProduct(productId);
  if (product.currentOwner.toLowerCase() === producer.address.toLowerCase()) {
    console.log("Step 3: 🚚 Producer transfers product to distributor...");
    const tx3 = await contract.connect(producer).transferProduct(
      productId,
      distributor.address,
      JSON.stringify({ location: "Distribution Center A", temperature: "5°C" })
    );
    await tx3.wait();
    console.log("✅ Product transferred to distributor\n");
  }

  // Step 4: Distributor marks as In Transit
  product = await contract.getProduct(productId);
  if (product.currentOwner.toLowerCase() === distributor.address.toLowerCase() && product.status < 2) {
    console.log("Step 4: 🚛 Distributor marks product as in transit...");
    const tx4 = await contract.connect(distributor).updateProductStatus(
      productId,
      2, // InTransit
      "En route to regional distribution hub"
    );
    await tx4.wait();
    console.log("✅ Status updated: In Transit\n");
  }

  // Step 5: Distributor transfers to Retailer
  product = await contract.getProduct(productId);
  if (product.currentOwner.toLowerCase() === distributor.address.toLowerCase()) {
    console.log("Step 5: 🏪 Distributor transfers product to retailer...");
    const tx5 = await contract.connect(distributor).transferProduct(
      productId,
      retailer.address,
      JSON.stringify({ location: "Retail Store #42", receivedBy: "Store Manager" })
    );
    await tx5.wait();
    console.log("✅ Product transferred to retailer\n");
  }

  // Step 6: Retailer marks as Received
  product = await contract.getProduct(productId);
  if (product.currentOwner.toLowerCase() === retailer.address.toLowerCase() && product.status < 3) {
    console.log("Step 6: ✅ Retailer confirms receipt...");
    const tx6 = await contract.connect(retailer).updateProductStatus(
      productId,
      3, // Received
      "Product received in perfect condition"
    );
    await tx6.wait();
    console.log("✅ Status updated: Received\n");
  }

  // Step 7: Regulator verifies product
  product = await contract.getProduct(productId);
  if (product.status < 5) {
    console.log("Step 7: 🎖️ Regulator verifies product authenticity...");
    const tx7 = await contract.connect(regulator).addVerification(
      productId,
      "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX", // Mock IPFS hash
      "Organic certification verified. Lab tests passed. Quality standards met."
    );
    await tx7.wait();
    console.log("✅ Product verified and certified!\n");
  }

  // Final state
  product = await contract.getProduct(productId);
  const verifications = await contract.getProductVerifications(productId);
  
  console.log("=" .repeat(60));
  console.log("🎉 DEMO COMPLETE! Final Product State:");
  console.log("=" .repeat(60));
  console.log(`Product ID: ${productId}`);
  console.log(`Name: ${product.name}`);
  console.log(`Batch: ${product.batchId}`);
  console.log(`Origin: ${product.origin}`);
  console.log(`Current Owner: ${product.currentOwner}`);
  console.log(`Status: ${["Created", "Dispatched", "InTransit", "Received", "Delivered", "Verified", "Exception"][product.status]}`);
  console.log(`Verifications: ${verifications.length}`);
  console.log(`Created: ${new Date(Number(product.createdAt) * 1000).toLocaleString()}`);
  console.log("=" .repeat(60));
  
  console.log("\n📱 Consumer View URL:");
  console.log(`   http://localhost:3002/consumer?id=${productId}`);
  console.log("\n✨ Open this URL to see the complete product journey!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

