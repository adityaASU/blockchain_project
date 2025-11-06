// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ISupplyChain.sol";

/**
 * @title SupplyChainProvenance
 * @dev Main contract for blockchain-based supply chain product tracking and provenance
 * @notice This contract provides a tamper-evident, role-based system for tracking products
 *         from origin through the entire supply chain to end consumers
 * 
 * Key Features:
 * - Immutable product registration and history
 * - Role-based access control (Producer, Distributor, Retailer, Regulator)
 * - Complete chain of custody tracking
 * - Verification and certification by authorities
 * - Event-driven architecture for off-chain indexing
 * 
 * Security Features:
 * - OpenZeppelin AccessControl for role management
 * - Pausable for emergency stops
 * - ReentrancyGuard for security
 * - Input validation on all state-changing functions
 * 
 * @author Blockchain Supply Chain Team
 * @custom:security-contact security@example.com
 */
contract SupplyChainProvenance is ISupplyChain, AccessControl, Pausable, ReentrancyGuard {
    
    // ============================================
    // ROLE DEFINITIONS
    // ============================================
    
    /// @dev Role identifier for producers who can register new products
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    
    /// @dev Role identifier for distributors who handle product transportation
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    /// @dev Role identifier for retailers who receive and sell products
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    
    /// @dev Role identifier for regulators/certifiers who verify products
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR_ROLE");
    
    // ============================================
    // STATE VARIABLES
    // ============================================
    
    /// @dev Counter for generating unique product IDs
    /// @notice Starts at 1, increments with each new product registration
    uint256 private _productIdCounter;
    
    /// @dev Mapping from product ID to Product struct
    /// @notice Core storage for all product data
    mapping(uint256 => Product) private _products;
    
    /// @dev Mapping from product ID to array of verifications
    /// @notice Stores all verification records added by regulators
    mapping(uint256 => Verification[]) private _verifications;
    
    /// @dev Mapping to track which addresses are registered participants
    /// @notice Used for additional validation beyond role checks
    mapping(address => bool) private _registeredParticipants;
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Initialize the contract and set up the deployer as admin
     * @notice The deployer receives DEFAULT_ADMIN_ROLE and can grant other roles
     * 
     * The admin can:
     * - Grant and revoke roles to other addresses
     * - Pause/unpause the contract in emergencies
     * - Manage role-based permissions
     */
    constructor() {
        // Grant the contract deployer the default admin role
        // This allows them to grant and revoke roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Initialize product counter
        _productIdCounter = 0;
    }
    
    // ============================================
    // MODIFIERS
    // ============================================
    
    /**
     * @dev Modifier to check if a product exists
     * @param productId ID of the product to check
     */
    modifier productMustExist(uint256 productId) {
        require(_products[productId].productId != 0, "Product does not exist");
        _;
    }
    
    /**
     * @dev Modifier to check if caller is the current owner of a product
     * @param productId ID of the product
     */
    modifier onlyProductOwner(uint256 productId) {
        require(
            _products[productId].currentOwner == msg.sender,
            "Only current owner can perform this action"
        );
        _;
    }
    
    /**
     * @dev Modifier to validate that an address is not zero
     * @param account Address to validate
     */
    modifier validAddress(address account) {
        require(account != address(0), "Invalid address: zero address");
        _;
    }
    
    /**
     * @dev Modifier to validate that a string is not empty
     * @param str String to validate
     */
    modifier nonEmptyString(string memory str) {
        require(bytes(str).length > 0, "String cannot be empty");
        _;
    }
    
    // ============================================
    // ROLE MANAGEMENT FUNCTIONS
    // ============================================
    
    /**
     * @dev Grant a supply chain role to an address and register them as a participant
     * @notice Only admin can grant roles
     * @param role The role to grant (PRODUCER_ROLE, DISTRIBUTOR_ROLE, etc.)
     * @param account Address to receive the role
     * 
     * This is a convenience function that combines role granting with participant registration
     * and emits a custom event for better tracking
     */
    function grantSupplyChainRole(bytes32 role, address account) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE)
        validAddress(account)
    {
        grantRole(role, account);
        _registeredParticipants[account] = true;
        emit RoleGrantedToParticipant(role, account, msg.sender);
    }
    
    /**
     * @dev Check if an address is a registered participant
     * @param account Address to check
     * @return bool True if registered, false otherwise
     */
    function isRegisteredParticipant(address account) external view returns (bool) {
        return _registeredParticipants[account];
    }
    
    // ============================================
    // PRODUCT REGISTRATION
    // ============================================
    
    /**
     * @dev Register a new product in the supply chain
     * @notice Only producers can register products. This is the entry point for all products.
     * 
     * @param name Product name or description (e.g., "Organic Coffee Beans")
     * @param batchId Batch or lot identifier for grouping related products
     * @param origin Geographic origin (e.g., "Colombia", "Ethiopia")
     * @param productionDate Unix timestamp of when the product was produced
     * @return productId Unique identifier assigned to the new product
     * 
     * Requirements:
     * - Caller must have PRODUCER_ROLE
     * - name must not be empty
     * - productionDate must not be in the future
     * - Contract must not be paused
     * 
     * Effects:
     * - Creates new Product struct in storage
     * - Increments product counter
     * - Sets caller as initial owner
     * - Sets status to Created
     * - Emits ProductCreated event
     * 
     * Gas Optimization Notes:
     * - Large metadata (certificates, images) should be stored off-chain (IPFS)
     *   with only the hash/CID stored on-chain or in events
     */
    function registerProduct(
        string memory name,
        string memory batchId,
        string memory origin,
        uint256 productionDate
    ) 
        external 
        override
        onlyRole(PRODUCER_ROLE)
        whenNotPaused
        nonReentrant
        nonEmptyString(name)
        returns (uint256 productId)
    {
        // Validate production date is not in the future
        require(
            productionDate <= block.timestamp,
            "Production date cannot be in the future"
        );
        
        // Increment counter to generate new product ID
        _productIdCounter++;
        productId = _productIdCounter;
        
        // Create and store the product
        _products[productId] = Product({
            productId: productId,
            name: name,
            batchId: batchId,
            currentOwner: msg.sender,
            origin: origin,
            productionDate: productionDate,
            status: ProductStatus.Created,
            createdAt: block.timestamp,
            lastUpdatedBlock: block.number
        });
        
        // Emit event for off-chain indexing and UI updates
        emit ProductCreated(
            productId,
            msg.sender,
            name,
            batchId,
            origin,
            block.timestamp
        );
        
        return productId;
    }
    
    // ============================================
    // OWNERSHIP TRANSFER
    // ============================================
    
    /**
     * @dev Transfer product ownership/custody to another address
     * @notice Implements chain of custody tracking. Only current owner can transfer.
     * 
     * @param productId ID of the product to transfer
     * @param newOwner Address of the new owner (must have appropriate role)
     * @param metadata JSON string with transfer details (e.g., '{"location":"warehouse-5","temp":"4C"}')
     * 
     * Requirements:
     * - Product must exist
     * - Caller must be current owner
     * - newOwner must not be zero address
     * - newOwner should have DISTRIBUTOR_ROLE or RETAILER_ROLE (validated)
     * - Contract must not be paused
     * 
     * Effects:
     * - Updates product's currentOwner
     * - Updates lastUpdatedBlock
     * - Emits OwnershipTransferred event with full audit trail
     * 
     * Business Logic:
     * - Typical flow: Producer → Distributor → Retailer
     * - Each transfer is immutably recorded via events
     * - Metadata can include: location, temperature, handling notes, shipment ID
     */
    function transferProduct(
        uint256 productId,
        address newOwner,
        string memory metadata
    ) 
        external 
        override
        productMustExist(productId)
        onlyProductOwner(productId)
        validAddress(newOwner)
        whenNotPaused
        nonReentrant
    {
        // Validate that new owner has an appropriate role in the supply chain
        require(
            hasRole(DISTRIBUTOR_ROLE, newOwner) || 
            hasRole(RETAILER_ROLE, newOwner) ||
            hasRole(PRODUCER_ROLE, newOwner),
            "New owner must have a valid supply chain role"
        );
        
        // Prevent transferring to self
        require(newOwner != msg.sender, "Cannot transfer to yourself");
        
        // Store old owner for event
        address previousOwner = _products[productId].currentOwner;
        
        // Update ownership
        _products[productId].currentOwner = newOwner;
        _products[productId].lastUpdatedBlock = block.number;
        
        // Emit transfer event with complete audit trail
        emit OwnershipTransferred(
            productId,
            previousOwner,
            newOwner,
            block.timestamp,
            metadata
        );
    }
    
    // ============================================
    // STATUS MANAGEMENT
    // ============================================
    
    /**
     * @dev Update the status of a product in its lifecycle
     * @notice Status updates track the product's journey through the supply chain
     * 
     * @param productId ID of the product
     * @param newStatus New status to set (from ProductStatus enum)
     * @param notes Additional context about the status change
     * 
     * Requirements:
     * - Product must exist
     * - Caller must have appropriate role for the status transition
     * - Contract must not be paused
     * 
     * Role-based status permissions:
     * - PRODUCER: Created, Dispatched
     * - DISTRIBUTOR: InTransit, Dispatched
     * - RETAILER: Received, Delivered
     * - REGULATOR: Verified (or use addVerification instead)
     * - Any authorized role: Exception (for recalls/issues)
     * 
     * Effects:
     * - Updates product status
     * - Updates lastUpdatedBlock
     * - Emits StatusUpdated event
     * 
     * Use Cases:
     * - Mark as Dispatched when shipped from producer
     * - Mark as InTransit during transportation
     * - Mark as Received when arriving at destination
     * - Mark as Delivered to final destination
     * - Mark as Exception for damaged/recalled items
     */
    function updateProductStatus(
        uint256 productId,
        ProductStatus newStatus,
        string memory notes
    ) 
        external 
        override
        productMustExist(productId)
        whenNotPaused
        nonReentrant
    {
        // Validate caller has permission for this status update
        _validateStatusUpdatePermission(msg.sender, newStatus);
        
        // Get current status for event
        ProductStatus oldStatus = _products[productId].status;
        
        // Update status
        _products[productId].status = newStatus;
        _products[productId].lastUpdatedBlock = block.number;
        
        // Emit status change event
        emit StatusUpdated(
            productId,
            msg.sender,
            oldStatus,
            newStatus,
            block.timestamp,
            notes
        );
    }
    
    /**
     * @dev Internal function to validate status update permissions
     * @param updater Address attempting to update status
     * @param newStatus Status they want to set
     * 
     * This implements role-based status transition rules
     */
    function _validateStatusUpdatePermission(address updater, ProductStatus newStatus) 
        internal 
        view 
    {
        // Exception status can be set by any authorized role (for recalls/issues)
        if (newStatus == ProductStatus.Exception) {
            require(
                hasRole(PRODUCER_ROLE, updater) ||
                hasRole(DISTRIBUTOR_ROLE, updater) ||
                hasRole(RETAILER_ROLE, updater) ||
                hasRole(REGULATOR_ROLE, updater),
                "Must have a supply chain role to report exceptions"
            );
            return;
        }
        
        // Created and Dispatched: Only producers
        if (newStatus == ProductStatus.Created || newStatus == ProductStatus.Dispatched) {
            require(
                hasRole(PRODUCER_ROLE, updater),
                "Only producers can set Created or Dispatched status"
            );
            return;
        }
        
        // InTransit: Distributors and producers
        if (newStatus == ProductStatus.InTransit) {
            require(
                hasRole(DISTRIBUTOR_ROLE, updater) || hasRole(PRODUCER_ROLE, updater),
                "Only distributors or producers can set InTransit status"
            );
            return;
        }
        
        // Received and Delivered: Retailers and distributors
        if (newStatus == ProductStatus.Received || newStatus == ProductStatus.Delivered) {
            require(
                hasRole(RETAILER_ROLE, updater) || hasRole(DISTRIBUTOR_ROLE, updater),
                "Only retailers or distributors can set Received/Delivered status"
            );
            return;
        }
        
        // Verified: Regulators only (but addVerification is preferred)
        if (newStatus == ProductStatus.Verified) {
            require(
                hasRole(REGULATOR_ROLE, updater),
                "Only regulators can set Verified status"
            );
            return;
        }
    }
    
    // ============================================
    // VERIFICATION & CERTIFICATION
    // ============================================
    
    /**
     * @dev Add a verification/certification record to a product
     * @notice Only regulators/certifiers can add verifications. Used for compliance, quality checks, etc.
     * 
     * @param productId ID of the product to verify
     * @param certificateHash IPFS CID or hash of the certificate document
     * @param notes Verification notes, compliance details, test results summary
     * 
     * Requirements:
     * - Product must exist
     * - Caller must have REGULATOR_ROLE
     * - certificateHash must not be empty
     * - Contract must not be paused
     * 
     * Effects:
     * - Adds Verification struct to product's verification array
     * - Updates product status to Verified
     * - Updates lastUpdatedBlock
     * - Emits ProductVerified event
     * 
     * Use Cases:
     * - Organic certification
     * - Quality inspection results
     * - Customs clearance
     * - Safety compliance checks
     * - Lab test results
     * 
     * Note: Large certificate documents (PDFs, images) should be stored on IPFS,
     *       with only the CID stored on-chain for tamper-evidence
     */
    function addVerification(
        uint256 productId,
        string memory certificateHash,
        string memory notes
    ) 
        external 
        override
        onlyRole(REGULATOR_ROLE)
        productMustExist(productId)
        nonEmptyString(certificateHash)
        whenNotPaused
        nonReentrant
    {
        // Create verification record
        Verification memory verification = Verification({
            verifier: msg.sender,
            timestamp: block.timestamp,
            certificateHash: certificateHash,
            notes: notes
        });
        
        // Add to product's verification array
        _verifications[productId].push(verification);
        
        // Update product status to Verified
        _products[productId].status = ProductStatus.Verified;
        _products[productId].lastUpdatedBlock = block.number;
        
        // Emit verification event
        emit ProductVerified(
            productId,
            msg.sender,
            certificateHash,
            block.timestamp,
            notes
        );
    }
    
    // ============================================
    // VIEW FUNCTIONS (Read-Only)
    // ============================================
    
    /**
     * @dev Get complete product information
     * @param productId ID of the product to query
     * @return Product struct with all product data
     * 
     * Note: This returns current state only. For full history, reconstruct from events off-chain.
     */
    function getProduct(uint256 productId) 
        external 
        view 
        override
        productMustExist(productId)
        returns (Product memory) 
    {
        return _products[productId];
    }
    
    /**
     * @dev Get all verification records for a product
     * @param productId ID of the product
     * @return Array of Verification structs
     * 
     * Use Case: Display all certifications/compliance records to consumers
     */
    function getProductVerifications(uint256 productId) 
        external 
        view 
        override
        productMustExist(productId)
        returns (Verification[] memory) 
    {
        return _verifications[productId];
    }
    
    /**
     * @dev Check if a product exists in the system
     * @param productId ID to check
     * @return bool True if product exists, false otherwise
     * 
     * Use Case: Validate QR code or user input before querying
     */
    function productExists(uint256 productId) 
        external 
        view 
        override
        returns (bool) 
    {
        return _products[productId].productId != 0;
    }
    
    /**
     * @dev Get total number of products registered in the system
     * @return uint256 Total count
     * 
     * Use Case: Analytics, dashboard statistics
     */
    function getTotalProducts() 
        external 
        view 
        override
        returns (uint256) 
    {
        return _productIdCounter;
    }
    
    /**
     * @dev Get current owner of a product
     * @param productId ID of the product
     * @return address Current owner address
     * 
     * Use Case: Quick ownership check before transfer
     */
    function getProductOwner(uint256 productId) 
        external 
        view 
        override
        productMustExist(productId)
        returns (address) 
    {
        return _products[productId].currentOwner;
    }
    
    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    
    /**
     * @dev Pause all state-changing operations
     * @notice Emergency function to halt operations if issues detected
     * 
     * Only admin can pause. When paused:
     * - No product registration
     * - No transfers
     * - No status updates
     * - No verifications
     * - View functions still work
     * 
     * Use Case: Security incident, discovered vulnerability, maintenance
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Resume operations after pause
     * @notice Only admin can unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    /**
     * @dev Get the role identifier for a given role name
     * @param roleName String name of the role ("PRODUCER", "DISTRIBUTOR", etc.)
     * @return bytes32 Role identifier hash
     * 
     * Use Case: Frontend applications to get role identifiers dynamically
     */
    function getRoleIdentifier(string memory roleName) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(roleName, "_ROLE"));
    }
    
    /**
     * @dev Check if an address has any supply chain role
     * @param account Address to check
     * @return bool True if address has at least one supply chain role
     * 
     * Use Case: Quick validation for UI access control
     */
    function hasAnyRole(address account) external view returns (bool) {
        return hasRole(PRODUCER_ROLE, account) ||
               hasRole(DISTRIBUTOR_ROLE, account) ||
               hasRole(RETAILER_ROLE, account) ||
               hasRole(REGULATOR_ROLE, account) ||
               hasRole(DEFAULT_ADMIN_ROLE, account);
    }
}

