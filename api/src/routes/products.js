const express = require('express');
const { body, param, validationResult } = require('express-validator');
const productService = require('../services/productService');
const { getWallet } = require('../config/blockchain');

const router = express.Router();

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/products
 * Register a new product
 */
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Product name is required'),
    body('batchId').notEmpty().trim().withMessage('Batch ID is required'),
    body('origin').notEmpty().trim().withMessage('Origin is required'),
    body('productionDate').isInt({ min: 0 }).withMessage('Production date must be a valid timestamp'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await productService.registerProduct(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error in POST /api/products:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/products/:id/transfer
 * Transfer product ownership
 */
router.post(
  '/:id/transfer',
  [
    param('id').notEmpty().withMessage('Product ID is required'),
    body('toAddress').isEthereumAddress().withMessage('Valid Ethereum address required'),
    body('role').isIn(['producer', 'distributor', 'retailer']).withMessage('Valid role required'),
    body('metadata').optional().trim(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { toAddress, role, metadata = '' } = req.body;
      
      const result = await productService.transferProduct(id, toAddress, role, metadata);
      res.json(result);
    } catch (error) {
      console.error(`Error in POST /api/products/${req.params.id}/transfer:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/products/:id/status
 * Update product status
 */
router.post(
  '/:id/status',
  [
    param('id').notEmpty().withMessage('Product ID is required'),
    body('status').isInt({ min: 0, max: 6 }).withMessage('Valid status code required (0-6)'),
    body('note').notEmpty().trim().withMessage('Status note is required'),
    body('role').isIn(['producer', 'distributor', 'retailer']).withMessage('Valid role required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, note, role } = req.body;
      
      const result = await productService.updateStatus(id, status, note, role);
      res.json(result);
    } catch (error) {
      console.error(`Error in POST /api/products/${req.params.id}/status:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/products/:id/verify
 * Add verification to product
 */
router.post(
  '/:id/verify',
  [
    param('id').notEmpty().withMessage('Product ID is required'),
    body('certificationHash').notEmpty().trim().withMessage('Certification hash is required'),
    body('note').notEmpty().trim().withMessage('Verification note is required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { certificationHash, note } = req.body;
      
      const result = await productService.verifyProduct(id, certificationHash, note);
      res.json(result);
    } catch (error) {
      console.error(`Error in POST /api/products/${req.params.id}/verify:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/products/:id
 * Get product details
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Product ID is required')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productService.getProduct(id);
      res.json(product);
    } catch (error) {
      console.error(`Error in GET /api/products/${req.params.id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/products/:id/history
 * Get product history timeline
 */
router.get(
  '/:id/history',
  [param('id').notEmpty().withMessage('Product ID is required')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const history = await productService.getProductHistory(id);
      res.json({ productId: id, timeline: history });
    } catch (error) {
      console.error(`Error in GET /api/products/${req.params.id}/history:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/products/:id/verifications
 * Get product verifications
 */
router.get(
  '/:id/verifications',
  [param('id').notEmpty().withMessage('Product ID is required')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const verifications = await productService.getVerifications(id);
      res.json({ productId: id, verifications });
    } catch (error) {
      console.error(`Error in GET /api/products/${req.params.id}/verifications:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/products/owner/:address
 * Get products by owner
 */
router.get(
  '/owner/:address',
  [param('address').isEthereumAddress().withMessage('Valid Ethereum address required')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { address } = req.params;
      const products = await productService.getProductsByOwner(address);
      res.json({ owner: address, products });
    } catch (error) {
      console.error(`Error in GET /api/products/owner/${req.params.address}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;

