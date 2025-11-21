const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Blockchain Configuration
 * Manages connection to blockchain and contract instances
 */

// Load contract ABI
const contractArtifact = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../../artifacts/contracts/SupplyChainProvenance.sol/SupplyChainProvenance.json'),
    'utf8'
  )
);

const CONTRACT_ABI = contractArtifact.abi;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';

// Create provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Create wallets for different roles (backend-mediated transactions)
const wallets = {
  producer: new ethers.Wallet(process.env.PRODUCER_PRIVATE_KEY, provider),
  distributor: new ethers.Wallet(process.env.DISTRIBUTOR_PRIVATE_KEY, provider),
  retailer: new ethers.Wallet(process.env.RETAILER_PRIVATE_KEY, provider),
  regulator: new ethers.Wallet(process.env.REGULATOR_PRIVATE_KEY, provider),
};

// Create contract instances for each role
const contracts = {
  producer: new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallets.producer),
  distributor: new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallets.distributor),
  retailer: new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallets.retailer),
  regulator: new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallets.regulator),
  readonly: new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider),
};

/**
 * Get contract instance for a specific role
 * @param {string} role - Role name (producer, distributor, retailer, regulator, readonly)
 * @returns {ethers.Contract} Contract instance
 */
function getContract(role = 'readonly') {
  if (!contracts[role]) {
    throw new Error(`Invalid role: ${role}`);
  }
  return contracts[role];
}

/**
 * Get wallet for a specific role
 * @param {string} role - Role name
 * @returns {ethers.Wallet} Wallet instance
 */
function getWallet(role) {
  if (!wallets[role]) {
    throw new Error(`Invalid role: ${role}`);
  }
  return wallets[role];
}

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<object>} Transaction receipt
 */
async function waitForTransaction(txHash, confirmations = 1) {
  const receipt = await provider.waitForTransaction(txHash, confirmations);
  return receipt;
}

/**
 * Get current block number
 * @returns {Promise<number>} Block number
 */
async function getCurrentBlock() {
  return await provider.getBlockNumber();
}

/**
 * Parse events from transaction receipt
 * @param {object} receipt - Transaction receipt
 * @param {string} eventName - Event name to parse
 * @returns {Array} Parsed events
 */
function parseEvents(receipt, eventName) {
  const contract = getContract('readonly');
  const events = [];
  
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === eventName) {
        events.push(parsed.args);
      }
    } catch (e) {
      // Not our event, skip
      continue;
    }
  }
  
  return events;
}

module.exports = {
  provider,
  getContract,
  getWallet,
  waitForTransaction,
  getCurrentBlock,
  parseEvents,
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
};

