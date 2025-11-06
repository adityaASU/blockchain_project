/**
 * Test suite for SupplyChainProvenance contract
 * 
 * Test Coverage:
 * 1. Deployment and initialization
 * 2. Role management (RBAC)
 * 3. Product registration
 * 4. Ownership transfers
 * 5. Status updates
 * 6. Verifications
 * 7. Access control enforcement
 * 8. Edge cases and error conditions
 * 9. Event emissions
 * 
 * Testing Framework: Hardhat + Chai
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SupplyChainProvenance", function () {
  
  // ============================================
  // FIXTURES - Setup Functions for Tests
  // ============================================
  
  /**
   * Fixture: Deploy fresh contract for each test
   * Returns deployed contract and test accounts with roles
   */
  async function deploySupplyChainFixture() {
    // Get test accounts
    const [admin, producer, distributor, retailer, regulator, consumer, unauthorized] = 
      await ethers.getSigners();

    // Deploy contract
    const SupplyChainProvenance = await ethers.getContractFactory("SupplyChainProvenance");
    const supplyChain = await SupplyChainProvenance.deploy();
    await supplyChain.waitForDeployment();

    // Get role identifiers
    const PRODUCER_ROLE = await supplyChain.PRODUCER_ROLE();
    const DISTRIBUTOR_ROLE = await supplyChain.DISTRIBUTOR_ROLE();
    const RETAILER_ROLE = await supplyChain.RETAILER_ROLE();
    const REGULATOR_ROLE = await supplyChain.REGULATOR_ROLE();
    const DEFAULT_ADMIN_ROLE = await supplyChain.DEFAULT_ADMIN_ROLE();

    // Grant roles to test accounts
    await supplyChain.grantSupplyChainRole(PRODUCER_ROLE, producer.address);
    await supplyChain.grantSupplyChainRole(DISTRIBUTOR_ROLE, distributor.address);
    await supplyChain.grantSupplyChainRole(RETAILER_ROLE, retailer.address);
    await supplyChain.grantSupplyChainRole(REGULATOR_ROLE, regulator.address);

    return {
      supplyChain,
      admin,
      producer,
      distributor,
      retailer,
      regulator,
      consumer,
      unauthorized,
      roles: {
        PRODUCER_ROLE,
        DISTRIBUTOR_ROLE,
        RETAILER_ROLE,
        REGULATOR_ROLE,
        DEFAULT_ADMIN_ROLE,
      },
    };
  }

  /**
   * Fixture: Deploy contract with a registered product
   * Useful for testing transfer, status update, and verification functions
   */
  async function deployWithProductFixture() {
    const fixture = await deploySupplyChainFixture();
    const { supplyChain, producer } = fixture;

    // Register a test product
    const productName = "Organic Coffee Beans";
    const batchId = "BATCH-2024-001";
    const origin = "Colombia";
    const productionDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday

    const tx = await supplyChain.connect(producer).registerProduct(
      productName,
      batchId,
      origin,
      productionDate
    );
    
    const receipt = await tx.wait();
    const productId = 1; // First product

    return {
      ...fixture,
      productId,
      productData: { productName, batchId, origin, productionDate },
    };
  }

  // ============================================
  // TEST SUITE 1: Deployment & Initialization
  // ============================================
  
  describe("Deployment", function () {
    it("Should deploy successfully and set admin role", async function () {
      const { supplyChain, admin, roles } = await loadFixture(deploySupplyChainFixture);
      
      // Check admin has DEFAULT_ADMIN_ROLE
      expect(await supplyChain.hasRole(roles.DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should initialize with zero products", async function () {
      const { supplyChain } = await loadFixture(deploySupplyChainFixture);
      
      expect(await supplyChain.getTotalProducts()).to.equal(0);
    });

    it("Should have correct role identifiers", async function () {
      const { supplyChain } = await loadFixture(deploySupplyChainFixture);
      
      // Verify role hashes match expected values
      expect(await supplyChain.PRODUCER_ROLE()).to.equal(
        ethers.keccak256(ethers.toUtf8Bytes("PRODUCER_ROLE"))
      );
    });
  });

  // ============================================
  // TEST SUITE 2: Role Management (RBAC)
  // ============================================
  
  describe("Role Management", function () {
    it("Should grant roles successfully by admin", async function () {
      const { supplyChain, admin, producer, roles } = await loadFixture(deploySupplyChainFixture);
      
      // Verify producer has PRODUCER_ROLE (granted in fixture)
      expect(await supplyChain.hasRole(roles.PRODUCER_ROLE, producer.address)).to.be.true;
    });

    it("Should register participant when granting role", async function () {
      const { supplyChain, admin, producer } = await loadFixture(deploySupplyChainFixture);
      
      // Check producer is registered (done in fixture)
      expect(await supplyChain.isRegisteredParticipant(producer.address)).to.be.true;
    });

    it("Should emit RoleGrantedToParticipant event", async function () {
      const { supplyChain, admin, unauthorized, roles } = await loadFixture(deploySupplyChainFixture);
      
      // Grant new role and check event
      await expect(supplyChain.connect(admin).grantSupplyChainRole(
        roles.PRODUCER_ROLE,
        unauthorized.address
      ))
        .to.emit(supplyChain, "RoleGrantedToParticipant")
        .withArgs(roles.PRODUCER_ROLE, unauthorized.address, admin.address);
    });

    it("Should reject role grant from non-admin", async function () {
      const { supplyChain, unauthorized, consumer, roles } = await loadFixture(deploySupplyChainFixture);
      
      // Non-admin tries to grant role
      await expect(
        supplyChain.connect(unauthorized).grantSupplyChainRole(roles.PRODUCER_ROLE, consumer.address)
      ).to.be.reverted; // AccessControl: account ... is missing role
    });

    it("Should reject role grant to zero address", async function () {
      const { supplyChain, admin, roles } = await loadFixture(deploySupplyChainFixture);
      
      await expect(
        supplyChain.connect(admin).grantSupplyChainRole(
          roles.PRODUCER_ROLE,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid address: zero address");
    });
  });

  // ============================================
  // TEST SUITE 3: Product Registration
  // ============================================
  
  describe("Product Registration", function () {
    it("Should register product successfully by producer", async function () {
      const { supplyChain, producer } = await loadFixture(deploySupplyChainFixture);
      
      const productName = "Organic Coffee Beans";
      const batchId = "BATCH-2024-001";
      const origin = "Colombia";
      const productionDate = Math.floor(Date.now() / 1000) - 86400;

      const tx = await supplyChain.connect(producer).registerProduct(
        productName,
        batchId,
        origin,
        productionDate
      );

      // Check transaction succeeded
      expect(tx).to.not.be.reverted;
      
      // Verify product count increased
      expect(await supplyChain.getTotalProducts()).to.equal(1);
    });

    it("Should emit ProductCreated event with correct parameters", async function () {
      const { supplyChain, producer } = await loadFixture(deploySupplyChainFixture);
      
      const productName = "Organic Coffee Beans";
      const batchId = "BATCH-2024-001";
      const origin = "Colombia";
      const productionDate = Math.floor(Date.now() / 1000) - 86400;

      // Check event emission
      await expect(
        supplyChain.connect(producer).registerProduct(
          productName,
          batchId,
          origin,
          productionDate
        )
      )
        .to.emit(supplyChain, "ProductCreated")
        .withArgs(1, producer.address, productName, batchId, origin, await time.latest() + 1);
    });

    it("Should set correct initial product data", async function () {
      const { supplyChain, productId, productData, producer } = 
        await loadFixture(deployWithProductFixture);
      
      const product = await supplyChain.getProduct(productId);
      
      expect(product.productId).to.equal(productId);
      expect(product.name).to.equal(productData.productName);
      expect(product.batchId).to.equal(productData.batchId);
      expect(product.currentOwner).to.equal(producer.address);
      expect(product.origin).to.equal(productData.origin);
      expect(product.productionDate).to.equal(productData.productionDate);
      expect(product.status).to.equal(0); // ProductStatus.Created
    });

    it("Should reject registration by non-producer", async function () {
      const { supplyChain, unauthorized } = await loadFixture(deploySupplyChainFixture);
      
      await expect(
        supplyChain.connect(unauthorized).registerProduct(
          "Test Product",
          "BATCH-001",
          "USA",
          Math.floor(Date.now() / 1000)
        )
      ).to.be.reverted; // AccessControl: account ... is missing role
    });

    it("Should reject empty product name", async function () {
      const { supplyChain, producer } = await loadFixture(deploySupplyChainFixture);
      
      await expect(
        supplyChain.connect(producer).registerProduct(
          "", // Empty name
          "BATCH-001",
          "USA",
          Math.floor(Date.now() / 1000)
        )
      ).to.be.revertedWith("String cannot be empty");
    });

    it("Should reject future production date", async function () {
      const { supplyChain, producer } = await loadFixture(deploySupplyChainFixture);
      
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      
      await expect(
        supplyChain.connect(producer).registerProduct(
          "Test Product",
          "BATCH-001",
          "USA",
          futureDate
        )
      ).to.be.revertedWith("Production date cannot be in the future");
    });
  });

  // ============================================
  // TEST SUITE 4: Ownership Transfers
  // ============================================
  
  describe("Ownership Transfers", function () {
    it("Should transfer product successfully by current owner", async function () {
      const { supplyChain, productId, producer, distributor } = 
        await loadFixture(deployWithProductFixture);
      
      const metadata = JSON.stringify({ location: "Warehouse A", temp: "4C" });
      
      await expect(
        supplyChain.connect(producer).transferProduct(productId, distributor.address, metadata)
      ).to.not.be.reverted;
      
      // Verify new owner
      const product = await supplyChain.getProduct(productId);
      expect(product.currentOwner).to.equal(distributor.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      const { supplyChain, productId, producer, distributor } = 
        await loadFixture(deployWithProductFixture);
      
      const metadata = JSON.stringify({ location: "Warehouse A" });
      
      await expect(
        supplyChain.connect(producer).transferProduct(productId, distributor.address, metadata)
      )
        .to.emit(supplyChain, "OwnershipTransferred")
        .withArgs(productId, producer.address, distributor.address, await time.latest() + 1, metadata);
    });

    it("Should reject transfer by non-owner", async function () {
      const { supplyChain, productId, distributor, retailer } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(distributor).transferProduct(productId, retailer.address, "")
      ).to.be.revertedWith("Only current owner can perform this action");
    });

    it("Should reject transfer to zero address", async function () {
      const { supplyChain, productId, producer } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(producer).transferProduct(productId, ethers.ZeroAddress, "")
      ).to.be.revertedWith("Invalid address: zero address");
    });

    it("Should reject transfer to self", async function () {
      const { supplyChain, productId, producer } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(producer).transferProduct(productId, producer.address, "")
      ).to.be.revertedWith("Cannot transfer to yourself");
    });

    it("Should reject transfer to address without supply chain role", async function () {
      const { supplyChain, productId, producer, unauthorized } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(producer).transferProduct(productId, unauthorized.address, "")
      ).to.be.revertedWith("New owner must have a valid supply chain role");
    });
  });

  // ============================================
  // TEST SUITE 5: Status Updates
  // ============================================
  
  describe("Status Updates", function () {
    it("Should update status successfully by authorized role", async function () {
      const { supplyChain, productId, producer } = 
        await loadFixture(deployWithProductFixture);
      
      // Producer can set to Dispatched
      await expect(
        supplyChain.connect(producer).updateProductStatus(productId, 1, "Shipped from farm") // 1 = Dispatched
      ).to.not.be.reverted;
      
      const product = await supplyChain.getProduct(productId);
      expect(product.status).to.equal(1);
    });

    it("Should emit StatusUpdated event", async function () {
      const { supplyChain, productId, producer } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(producer).updateProductStatus(productId, 1, "Dispatched")
      )
        .to.emit(supplyChain, "StatusUpdated")
        .withArgs(productId, producer.address, 0, 1, await time.latest() + 1, "Dispatched");
    });

    it("Should reject status update by unauthorized role", async function () {
      const { supplyChain, productId, unauthorized } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(unauthorized).updateProductStatus(productId, 1, "Test")
      ).to.be.reverted;
    });

    it("Should enforce role-based status permissions", async function () {
      const { supplyChain, productId, distributor } = 
        await loadFixture(deployWithProductFixture);
      
      // Distributor cannot set to Created (producer only)
      await expect(
        supplyChain.connect(distributor).updateProductStatus(productId, 0, "Test")
      ).to.be.revertedWith("Only producers can set Created or Dispatched status");
    });
  });

  // ============================================
  // TEST SUITE 6: Verifications
  // ============================================
  
  describe("Verifications", function () {
    it("Should add verification successfully by regulator", async function () {
      const { supplyChain, productId, regulator } = 
        await loadFixture(deployWithProductFixture);
      
      const certificateHash = "QmXyZ123..."; // IPFS CID
      const notes = "Organic certification verified";
      
      await expect(
        supplyChain.connect(regulator).addVerification(productId, certificateHash, notes)
      ).to.not.be.reverted;
    });

    it("Should emit ProductVerified event", async function () {
      const { supplyChain, productId, regulator } = 
        await loadFixture(deployWithProductFixture);
      
      const certificateHash = "QmXyZ123...";
      const notes = "Verified";
      
      await expect(
        supplyChain.connect(regulator).addVerification(productId, certificateHash, notes)
      )
        .to.emit(supplyChain, "ProductVerified")
        .withArgs(productId, regulator.address, certificateHash, await time.latest() + 1, notes);
    });

    it("Should store verification data correctly", async function () {
      const { supplyChain, productId, regulator } = 
        await loadFixture(deployWithProductFixture);
      
      const certificateHash = "QmXyZ123...";
      const notes = "Organic certification";
      
      await supplyChain.connect(regulator).addVerification(productId, certificateHash, notes);
      
      const verifications = await supplyChain.getProductVerifications(productId);
      expect(verifications.length).to.equal(1);
      expect(verifications[0].verifier).to.equal(regulator.address);
      expect(verifications[0].certificateHash).to.equal(certificateHash);
      expect(verifications[0].notes).to.equal(notes);
    });

    it("Should reject verification by non-regulator", async function () {
      const { supplyChain, productId, producer } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(producer).addVerification(productId, "QmXyZ", "Test")
      ).to.be.reverted; // AccessControl: missing role
    });

    it("Should reject empty certificate hash", async function () {
      const { supplyChain, productId, regulator } = 
        await loadFixture(deployWithProductFixture);
      
      await expect(
        supplyChain.connect(regulator).addVerification(productId, "", "Test")
      ).to.be.revertedWith("String cannot be empty");
    });
  });

  // ============================================
  // TEST SUITE 7: View Functions
  // ============================================
  
  describe("View Functions", function () {
    it("Should return product data correctly", async function () {
      const { supplyChain, productId, productData } = 
        await loadFixture(deployWithProductFixture);
      
      const product = await supplyChain.getProduct(productId);
      expect(product.name).to.equal(productData.productName);
    });

    it("Should check product existence correctly", async function () {
      const { supplyChain, productId } = await loadFixture(deployWithProductFixture);
      
      expect(await supplyChain.productExists(productId)).to.be.true;
      expect(await supplyChain.productExists(999)).to.be.false;
    });

    it("Should return correct total products count", async function () {
      const { supplyChain, productId } = await loadFixture(deployWithProductFixture);
      
      expect(await supplyChain.getTotalProducts()).to.equal(1);
    });

    it("Should revert when querying non-existent product", async function () {
      const { supplyChain } = await loadFixture(deploySupplyChainFixture);
      
      await expect(
        supplyChain.getProduct(999)
      ).to.be.revertedWith("Product does not exist");
    });
  });

  // ============================================
  // TEST SUITE 8: Pausable Functionality
  // ============================================
  
  describe("Pausable", function () {
    it("Should pause contract by admin", async function () {
      const { supplyChain, admin } = await loadFixture(deploySupplyChainFixture);
      
      await expect(supplyChain.connect(admin).pause()).to.not.be.reverted;
    });

    it("Should reject operations when paused", async function () {
      const { supplyChain, admin, producer } = await loadFixture(deploySupplyChainFixture);
      
      await supplyChain.connect(admin).pause();
      
      await expect(
        supplyChain.connect(producer).registerProduct("Test", "B1", "USA", Math.floor(Date.now() / 1000))
      ).to.be.reverted; // Pausable: paused
    });

    it("Should unpause contract by admin", async function () {
      const { supplyChain, admin } = await loadFixture(deploySupplyChainFixture);
      
      await supplyChain.connect(admin).pause();
      await expect(supplyChain.connect(admin).unpause()).to.not.be.reverted;
    });

    it("Should reject pause by non-admin", async function () {
      const { supplyChain, unauthorized } = await loadFixture(deploySupplyChainFixture);
      
      await expect(supplyChain.connect(unauthorized).pause()).to.be.reverted;
    });
  });

  // ============================================
  // TEST SUITE 9: Integration Tests
  // ============================================
  
  describe("Integration: Complete Product Lifecycle", function () {
    it("Should execute full lifecycle: register → transfer → status → verify", async function () {
      const { supplyChain, producer, distributor, retailer, regulator } = 
        await loadFixture(deploySupplyChainFixture);
      
      // 1. Producer registers product
      const tx = await supplyChain.connect(producer).registerProduct(
        "Premium Coffee",
        "BATCH-2024-100",
        "Ethiopia",
        Math.floor(Date.now() / 1000) - 86400
      );
      const productId = 1;
      
      // 2. Producer transfers to distributor
      await supplyChain.connect(producer).transferProduct(
        productId,
        distributor.address,
        JSON.stringify({ location: "Port A" })
      );
      
      // 3. Distributor updates status to InTransit
      await supplyChain.connect(distributor).updateProductStatus(
        productId,
        2, // InTransit
        "Shipped via air freight"
      );
      
      // 4. Distributor transfers to retailer
      await supplyChain.connect(distributor).transferProduct(
        productId,
        retailer.address,
        JSON.stringify({ location: "Store 123" })
      );
      
      // 5. Retailer marks as Received
      await supplyChain.connect(retailer).updateProductStatus(
        productId,
        3, // Received
        "Received in good condition"
      );
      
      // 6. Regulator adds verification
      await supplyChain.connect(regulator).addVerification(
        productId,
        "QmCertificate123",
        "Organic certification valid"
      );
      
      // Verify final state
      const product = await supplyChain.getProduct(productId);
      expect(product.currentOwner).to.equal(retailer.address);
      expect(product.status).to.equal(5); // Verified
      
      const verifications = await supplyChain.getProductVerifications(productId);
      expect(verifications.length).to.equal(1);
    });
  });

  // ============================================
  // Additional test suites can be added:
  // - Gas optimization tests
  // - Stress tests (many products)
  // - Reentrancy attack tests
  // - Front-running scenarios
  // ============================================
});

