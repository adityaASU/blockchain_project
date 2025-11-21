const { getContract, waitForTransaction, parseEvents, provider } = require('../config/blockchain');
const { ethers } = require('ethers');

/**
 * Product Service
 * Business logic for interacting with the SupplyChainProvenance contract
 */

class ProductService {
  /**
   * Register a new product
   * @param {object} productData - Product information
   * @returns {Promise<object>} Result with productId and transaction hash
   */
  async registerProduct(productData) {
    const { name, batchId, origin, productionDate } = productData;
    
    const contract = getContract('producer');
    
    try {
      console.log('Registering product:', { name, batchId, origin, productionDate });
      
      // Execute the transaction
      const tx = await contract.registerProduct(
        name,
        batchId,
        origin,
        productionDate
      );
      
      console.log('Product registration transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction mined in block:', receipt.blockNumber);
      console.log('Receipt logs count:', receipt.logs.length);
      
      // Parse the ProductCreated event from logs
      let productId = null;
      
      // Method 1: Parse logs directly from receipt
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsedLog && parsedLog.name === 'ProductCreated') {
            productId = parsedLog.args.productId.toString();
            console.log('Found ProductCreated event with ID:', productId);
            break;
          }
        } catch (e) {
          // Not a log from our contract, skip
          continue;
        }
      }
      
      // If parsing logs failed, get the product ID from contract
      if (!productId) {
        console.log('Event not found in logs, getting total products count');
        const totalProducts = await contract.getTotalProducts();
        productId = totalProducts.toString();
        console.log('Product ID from counter:', productId);
      }
      
      return {
        success: true,
        productId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error registering product:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Transfer product ownership
   * @param {string} productId - Product ID
   * @param {string} toAddress - Recipient address
   * @param {string} role - Current owner role
   * @param {string} metadata - Transfer metadata (optional)
   * @returns {Promise<object>} Transaction result
   */
  async transferProduct(productId, toAddress, role, metadata = '') {
    const contract = getContract(role);
    
    try {
      const tx = await contract.transferProduct(productId, toAddress, metadata);
      console.log('Transfer transaction sent:', tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error transferring product:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Update product status
   * @param {string} productId - Product ID
   * @param {number} status - Status code
   * @param {string} note - Status note
   * @param {string} role - Role performing update
   * @returns {Promise<object>} Transaction result
   */
  async updateStatus(productId, status, note, role) {
    const contract = getContract(role);
    
    try {
      const tx = await contract.updateProductStatus(productId, status, note);
      console.log('Status update transaction sent:', tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error updating status:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Add verification to product
   * @param {string} productId - Product ID
   * @param {string} certificationHash - Certification hash (IPFS CID)
   * @param {string} note - Verification note
   * @returns {Promise<object>} Transaction result
   */
  async verifyProduct(productId, certificationHash, note) {
    const contract = getContract('regulator');
    
    try {
      const tx = await contract.addVerification(productId, certificationHash, note);
      console.log('Verification transaction sent:', tx.hash);
      
      const receipt = await waitForTransaction(tx.hash);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error adding verification:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Get product details
   * @param {string} productId - Product ID
   * @returns {Promise<object>} Product information
   */
  async getProduct(productId) {
    const contract = getContract('readonly');
    
    try {
      const product = await contract.getProduct(productId);
      
      return {
        id: productId,
        name: product.name,
        batchId: product.batchId,
        origin: product.origin,
        currentOwner: product.currentOwner,
        productionDate: product.productionDate.toString(),
        status: Number(product.status),  // Convert BigInt to Number
        createdAt: product.createdAt.toString(),
        lastUpdatedBlock: product.lastUpdatedBlock.toString(),
      };
    } catch (error) {
      console.error('Error getting product:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Get product history (events)
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} Product history timeline
   */
  async getProductHistory(productId) {
    const contract = getContract('readonly');
    
    try {
      // Get all events for this product
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = 0; // In production, you'd want to optimize this
      
      // Query different event types
      const [createdEvents, transferEvents, statusEvents, verifiedEvents] = await Promise.all([
        contract.queryFilter(contract.filters.ProductCreated(productId), fromBlock, currentBlock),
        contract.queryFilter(contract.filters.OwnershipTransferred(productId), fromBlock, currentBlock),
        contract.queryFilter(contract.filters.StatusUpdated(productId), fromBlock, currentBlock),
        contract.queryFilter(contract.filters.ProductVerified(productId), fromBlock, currentBlock),
      ]);
      
      // Combine and sort events by block number and log index
      const allEvents = [
        ...createdEvents.map(e => ({ type: 'created', ...e })),
        ...transferEvents.map(e => ({ type: 'transfer', ...e })),
        ...statusEvents.map(e => ({ type: 'status', ...e })),
        ...verifiedEvents.map(e => ({ type: 'verified', ...e })),
      ].sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) {
          return a.blockNumber - b.blockNumber;
        }
        return a.logIndex - b.logIndex;
      });
      
      // Format events for frontend
      const timeline = await Promise.all(
        allEvents.map(async (event) => {
          const block = await provider.getBlock(event.blockNumber);
          return this._formatEvent(event, block);
        })
      );
      
      return timeline;
    } catch (error) {
      console.error('Error getting product history:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Get products by owner
   * @param {string} ownerAddress - Owner address
   * @returns {Promise<Array>} List of products
   */
  async getProductsByOwner(ownerAddress) {
    const contract = getContract('readonly');
    
    try {
      // Get total products
      const totalProducts = await contract.getTotalProducts();
      const total = Number(totalProducts);
      
      if (total === 0) {
        console.log('No products registered yet');
        return [];
      }
      
      console.log(`Total products: ${total}, filtering for owner: ${ownerAddress}`);
      
      // Get products by checking each ID
      const products = [];
      for (let i = 1; i <= total; i++) {
        try {
          const product = await this.getProduct(i.toString());
          if (product.currentOwner.toLowerCase() === ownerAddress.toLowerCase()) {
            products.push(product);
            console.log(`Found product ${i} for owner`);
          }
        } catch (err) {
          console.log(`Could not read product ${i}:`, err.message);
          // Continue to next product
        }
      }
      
      console.log(`Found ${products.length} products for owner`);
      return products;
    } catch (error) {
      console.error('Error getting products by owner:', error.message);
      // Return empty array instead of throwing to prevent dashboard crash
      return [];
    }
  }

  /**
   * Get product verifications
   * @param {string} productId - Product ID
   * @returns {Promise<Array>} List of verifications
   */
  async getVerifications(productId) {
    const contract = getContract('readonly');
    
    try {
      const verifications = await contract.getProductVerifications(productId);
      
      return verifications.map(v => ({
        verifier: v.verifier,
        timestamp: v.timestamp.toString(),
        certificationHash: v.certificationHash,
        notes: v.notes,
      }));
    } catch (error) {
      console.error('Error getting verifications:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Format event for timeline display
   * @private
   */
  _formatEvent(event, block) {
    const baseEvent = {
      blockNumber: event.blockNumber,
      txHash: event.transactionHash,
      timestamp: block.timestamp,
      date: new Date(block.timestamp * 1000).toISOString(),
    };
    
    switch (event.type) {
      case 'created':
        return {
          ...baseEvent,
          type: 'Product Created',
          description: `Product registered: ${event.args.name}`,
          details: {
            name: event.args.name,
            batchId: event.args.batchId,
            origin: event.args.origin,
            producer: event.args.producer,
          },
        };
      
      case 'transfer':
        return {
          ...baseEvent,
          type: 'Ownership Transferred',
          description: `Product transferred to new owner`,
          details: {
            from: event.args.from,
            to: event.args.to,
          },
        };
      
      case 'status':
        return {
          ...baseEvent,
          type: 'Status Updated',
          description: `Status changed to: ${this._getStatusName(event.args.status)}`,
          details: {
            status: event.args.status,
            statusName: this._getStatusName(event.args.status),
            note: event.args.note,
            updatedBy: event.args.updatedBy,
          },
        };
      
      case 'verified':
        return {
          ...baseEvent,
          type: 'Product Verified',
          description: `Product verified by regulator`,
          details: {
            verifier: event.args.verifier,
            certificationHash: event.args.certificationHash,
            notes: event.args.notes,
          },
        };
      
      default:
        return baseEvent;
    }
  }

  /**
   * Get human-readable status name
   * @private
   */
  _getStatusName(status) {
    const statusNames = {
      0: 'Created',
      1: 'Dispatched',
      2: 'InTransit',
      3: 'Received',
      4: 'Delivered',
      5: 'Verified',
      6: 'Exception',
    };
    return statusNames[status] || 'Unknown';
  }

  /**
   * Handle and format blockchain errors
   * @private
   */
  _handleError(error) {
    if (error.reason) {
      return new Error(error.reason);
    }
    if (error.message) {
      // Try to extract revert reason from error message
      const match = error.message.match(/reverted with reason string '(.+?)'/);
      if (match) {
        return new Error(match[1]);
      }
      return new Error(error.message);
    }
    return new Error('Unknown blockchain error');
  }
}

module.exports = new ProductService();

