// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISupplyChain
 * @dev Interface for the Supply Chain Provenance System
 * @notice This interface defines the core functionality for tracking products through the supply chain
 * 
 * The interface supports:
 * - Product registration and lifecycle management
 * - Role-based access control for supply chain participants
 * - Ownership transfers with complete audit trail
 * - Status updates and verifications
 * - Event-driven architecture for off-chain monitoring
 */
interface ISupplyChain {
    
    // ============================================
    // ENUMS AND STRUCTS
    // ============================================
    
    /**
     * @dev Enum representing the lifecycle status of a product
     * @notice Status transitions should follow logical supply chain flow
     * 
     * Flow: Created → Dispatched → InTransit → Received → Delivered → Verified
     * Exception can occur at any stage for issues/recalls
     */
    enum ProductStatus {
        Created,      // Product registered by producer
        Dispatched,   // Product shipped from producer
        InTransit,    // Product in transit between parties
        Received,     // Product received by next party in chain
        Delivered,    // Product delivered to final destination
        Verified,     // Product verified by regulator/certifier
        Exception     // Exception occurred (damage, recall, etc.)
    }
    
    /**
     * @dev Core product data structure stored on-chain
     * @notice Designed to minimize storage costs while maintaining essential data
     * 
     * Large documents (certificates, images) should be stored on IPFS
     * with their CID/hash stored in event metadata or separate mapping
     */
    struct Product {
        uint256 productId;           // Unique identifier for the product
        string name;                 // Product name/description
        string batchId;              // Batch/lot identifier for grouping
        address currentOwner;        // Current custody holder
        string origin;               // Geographic origin (country/region)
        uint256 productionDate;      // Unix timestamp of production
        ProductStatus status;        // Current status in supply chain
        uint256 createdAt;          // Unix timestamp of registration
        uint256 lastUpdatedBlock;   // Block number of last update (for history reconstruction)
    }
    
    /**
     * @dev Structure for verification records added by regulators
     */
    struct Verification {
        address verifier;           // Address of the verifying authority
        uint256 timestamp;          // When verification was added
        string certificateHash;     // IPFS CID or hash of certificate document
        string notes;               // Additional verification notes
    }
    
    // ============================================
    // EVENTS
    // ============================================
    
    /**
     * @dev Emitted when a new product is registered in the system
     * @param productId Unique identifier assigned to the product
     * @param producer Address of the producer who registered the product
     * @param name Name/description of the product
     * @param batchId Batch identifier
     * @param origin Geographic origin
     * @param timestamp Block timestamp of registration
     */
    event ProductCreated(
        uint256 indexed productId,
        address indexed producer,
        string name,
        string batchId,
        string origin,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when product ownership is transferred
     * @param productId ID of the product being transferred
     * @param from Previous owner address
     * @param to New owner address
     * @param timestamp Block timestamp of transfer
     * @param metadata Additional transfer metadata (location, conditions, etc.)
     */
    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        uint256 timestamp,
        string metadata
    );
    
    /**
     * @dev Emitted when product status is updated
     * @param productId ID of the product
     * @param updatedBy Address that performed the update
     * @param oldStatus Previous status
     * @param newStatus New status
     * @param timestamp Block timestamp of update
     * @param notes Additional notes about the status change
     */
    event StatusUpdated(
        uint256 indexed productId,
        address indexed updatedBy,
        ProductStatus oldStatus,
        ProductStatus newStatus,
        uint256 timestamp,
        string notes
    );
    
    /**
     * @dev Emitted when a regulator adds verification to a product
     * @param productId ID of the verified product
     * @param verifier Address of the verifying authority
     * @param certificateHash IPFS CID or hash of verification document
     * @param timestamp Block timestamp of verification
     * @param notes Verification notes
     */
    event ProductVerified(
        uint256 indexed productId,
        address indexed verifier,
        string certificateHash,
        uint256 timestamp,
        string notes
    );
    
    /**
     * @dev Emitted when a role is granted to an address
     * @param role Role identifier (hash)
     * @param account Address receiving the role
     * @param sender Address that granted the role
     */
    event RoleGrantedToParticipant(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );
    
    // ============================================
    // CORE FUNCTIONS
    // ============================================
    
    /**
     * @dev Register a new product in the supply chain
     * @notice Only addresses with PRODUCER_ROLE can call this function
     * 
     * @param name Product name/description
     * @param batchId Batch or lot identifier
     * @param origin Geographic origin (e.g., "Colombia", "Vietnam")
     * @param productionDate Unix timestamp of production date
     * @return productId Unique identifier assigned to the new product
     * 
     * Requirements:
     * - Caller must have PRODUCER_ROLE
     * - name must not be empty
     * - productionDate must not be in the future
     * 
     * Emits: ProductCreated event
     */
    function registerProduct(
        string memory name,
        string memory batchId,
        string memory origin,
        uint256 productionDate
    ) external returns (uint256 productId);
    
    /**
     * @dev Transfer product ownership to another address
     * @notice Only current owner can transfer custody
     * 
     * @param productId ID of the product to transfer
     * @param newOwner Address of the new owner
     * @param metadata Optional JSON string with transfer details (location, conditions, etc.)
     * 
     * Requirements:
     * - Caller must be the current owner
     * - newOwner must not be zero address
     * - Product must exist
     * - newOwner should have appropriate role (DISTRIBUTOR/RETAILER)
     * 
     * Emits: OwnershipTransferred event
     */
    function transferProduct(
        uint256 productId,
        address newOwner,
        string memory metadata
    ) external;
    
    /**
     * @dev Update the status of a product
     * @notice Role-based permissions apply (e.g., only retailers can mark as Delivered)
     * 
     * @param productId ID of the product
     * @param newStatus New status to set
     * @param notes Additional notes about the status change
     * 
     * Requirements:
     * - Caller must have appropriate role for the status transition
     * - Product must exist
     * - Status transition must be logical (validated in implementation)
     * 
     * Emits: StatusUpdated event
     */
    function updateProductStatus(
        uint256 productId,
        ProductStatus newStatus,
        string memory notes
    ) external;
    
    /**
     * @dev Add verification/certification to a product
     * @notice Only addresses with REGULATOR_ROLE can call this function
     * 
     * @param productId ID of the product to verify
     * @param certificateHash IPFS CID or hash of the certificate document
     * @param notes Verification notes and details
     * 
     * Requirements:
     * - Caller must have REGULATOR_ROLE
     * - Product must exist
     * - certificateHash must not be empty
     * 
     * Emits: ProductVerified event
     */
    function addVerification(
        uint256 productId,
        string memory certificateHash,
        string memory notes
    ) external;
    
    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    
    /**
     * @dev Get product details by ID
     * @param productId ID of the product to query
     * @return Product struct containing all product data
     */
    function getProduct(uint256 productId) external view returns (Product memory);
    
    /**
     * @dev Get all verifications for a product
     * @param productId ID of the product
     * @return Array of Verification structs
     */
    function getProductVerifications(uint256 productId) external view returns (Verification[] memory);
    
    /**
     * @dev Check if a product exists
     * @param productId ID to check
     * @return bool True if product exists, false otherwise
     */
    function productExists(uint256 productId) external view returns (bool);
    
    /**
     * @dev Get total number of products registered
     * @return uint256 Total product count
     */
    function getTotalProducts() external view returns (uint256);
    
    /**
     * @dev Get current owner of a product
     * @param productId ID of the product
     * @return address Current owner address
     */
    function getProductOwner(uint256 productId) external view returns (address);
}

