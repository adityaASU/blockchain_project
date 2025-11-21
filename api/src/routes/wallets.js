const express = require('express');
const { getWallet } = require('../config/blockchain');

const router = express.Router();

/**
 * GET /api/wallets
 * Get wallet addresses for different roles (for demo purposes)
 */
router.get('/', async (req, res) => {
  try {
    const roles = ['producer', 'distributor', 'retailer', 'regulator'];
    const wallets = {};
    
    for (const role of roles) {
      const wallet = getWallet(role);
      wallets[role] = {
        address: wallet.address,
        role: role,
      };
    }
    
    res.json(wallets);
  } catch (error) {
    console.error('Error getting wallets:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallets/:role
 * Get wallet address for a specific role
 */
router.get('/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const wallet = getWallet(role);
    
    res.json({
      address: wallet.address,
      role: role,
    });
  } catch (error) {
    console.error(`Error getting wallet for role ${req.params.role}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

