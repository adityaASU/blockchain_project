const hre = require("hardhat");

/**
 * Demo Setup Script
 * This script helps set up a demo environment with sample data
 */

async function main() {
  console.log("🚀 Setting up demo environment...\n");

  // Get deployment address
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments/localhost-deployment.json');
  
  let contractAddress;
  
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    contractAddress = deployment.contractAddress || deployment.address;
    console.log(`📄 Found deployed contract at: ${contractAddress}\n`);
  } else {
    console.log("⚠️  No deployment found. Please deploy the contract first:");
    console.log("   npx hardhat run scripts/deploy.js --network localhost\n");
    return;
  }

  // Get contract instance
  const SupplyChainProvenance = await hre.ethers.getContractFactory("SupplyChainProvenance");
  const contract = SupplyChainProvenance.attach(contractAddress);

  // Get signers (Hardhat test accounts)
  const [admin, producer, distributor, retailer, regulator] = await hre.ethers.getSigners();

  console.log("👥 Roles:");
  console.log(`   Admin:       ${admin.address}`);
  console.log(`   Producer:    ${producer.address}`);
  console.log(`   Distributor: ${distributor.address}`);
  console.log(`   Retailer:    ${retailer.address}`);
  console.log(`   Regulator:   ${regulator.address}\n`);

  // Create sample products
  console.log("📦 Creating sample products...\n");

  const products = [
    {
      name: "Organic Colombian Coffee Beans",
      batchId: "COFFEE-2024-001",
      origin: "Colombia, South America",
      productionDate: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
    },
    {
      name: "Fair Trade Cocoa Powder",
      batchId: "COCOA-2024-002",
      origin: "Ghana, West Africa",
      productionDate: Math.floor(Date.now() / 1000) - 86400 * 5, // 5 days ago
    },
    {
      name: "Premium Olive Oil",
      batchId: "OLIVE-2024-003",
      origin: "Tuscany, Italy",
      productionDate: Math.floor(Date.now() / 1000) - 86400 * 3, // 3 days ago
    },
  ];

  const productIds = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`   [${i + 1}/${products.length}] Registering: ${product.name}`);
    
    const tx = await contract.connect(producer).registerProduct(
      product.name,
      product.batchId,
      product.origin,
      product.productionDate
    );
    
    const receipt = await tx.wait();
    
    // Get product ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'ProductCreated';
      } catch (e) {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      const productId = parsed.args.productId.toString();
      productIds.push(productId);
      console.log(`       ✓ Product ID: ${productId}`);
    }
  }

  console.log("\n🚚 Simulating supply chain transfers...\n");

  // Product 1: Complete journey
  if (productIds[0]) {
    console.log(`   Product 1: ${products[0].name}`);
    
    // Update to Dispatched
    console.log("       → Producer: Dispatching...");
    await (await contract.connect(producer).updateProductStatus(
      productIds[0],
      2, // Dispatched
      "Product dispatched from production facility"
    )).wait();
    
    // Transfer to distributor
    console.log("       → Transferring to Distributor...");
    await (await contract.connect(producer).transferProduct(
      productIds[0],
      distributor.address
    )).wait();
    
    // Update to In Transit
    console.log("       → Distributor: In transit...");
    await (await contract.connect(distributor).updateProductStatus(
      productIds[0],
      3, // InTransit
      "Product in transit to retailer"
    )).wait();
    
    // Transfer to retailer
    console.log("       → Transferring to Retailer...");
    await (await contract.connect(distributor).transferProduct(
      productIds[0],
      retailer.address
    )).wait();
    
    // Update to Received
    console.log("       → Retailer: Received...");
    await (await contract.connect(retailer).updateProductStatus(
      productIds[0],
      4, // Received
      "Product received at store in good condition"
    )).wait();
    
    // Regulator verification
    console.log("       → Regulator: Verifying...");
    await (await contract.connect(regulator).addVerification(
      productIds[0],
      "QmCertificateHashForCoffee123",
      "Product meets all organic certification standards. Quality verified."
    )).wait();
    
    console.log("       ✓ Complete journey with verification\n");
  }

  // Product 2: Mid-journey
  if (productIds[1]) {
    console.log(`   Product 2: ${products[1].name}`);
    
    // Update to Dispatched
    console.log("       → Producer: Dispatching...");
    await (await contract.connect(producer).updateProductStatus(
      productIds[1],
      2, // Dispatched
      "Product dispatched"
    )).wait();
    
    // Transfer to distributor
    console.log("       → Transferring to Distributor...");
    await (await contract.connect(producer).transferProduct(
      productIds[1],
      distributor.address
    )).wait();
    
    // Update to In Transit
    console.log("       → Distributor: In transit...");
    await (await contract.connect(distributor).updateProductStatus(
      productIds[1],
      3, // InTransit
      "En route to retailer"
    )).wait();
    
    console.log("       ✓ Currently in transit\n");
  }

  // Product 3: Just registered
  if (productIds[2]) {
    console.log(`   Product 3: ${products[2].name}`);
    console.log("       ✓ Newly registered, awaiting dispatch\n");
  }

  console.log("✅ Demo setup complete!\n");
  console.log("📋 Summary:");
  console.log(`   - ${productIds.length} products created`);
  console.log(`   - Product 1: Complete journey with verification`);
  console.log(`   - Product 2: In transit to retailer`);
  console.log(`   - Product 3: Awaiting dispatch\n`);
  
  console.log("🌐 You can now access the demo:");
  console.log("   Frontend: http://localhost:3000");
  console.log("   API:      http://localhost:3001\n");
  
  console.log("🎯 Demo Flow:");
  console.log("   1. Producer Dashboard - View all products");
  console.log("   2. Distributor Dashboard - View products in transit");
  console.log("   3. Retailer Dashboard - View received products");
  console.log("   4. Regulator Dashboard - Search any product ID");
  console.log("   5. Consumer View - Verify products (use any product ID)\n");
  
  console.log("📦 Product IDs for demo:");
  productIds.forEach((id, index) => {
    console.log(`   Product ${index + 1}: ${id}`);
  });
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

