import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API Service for interacting with backend
 */

// Product operations
export const registerProduct = async (productData) => {
  const response = await api.post('/api/products', productData);
  return response.data;
};

export const transferProduct = async (productId, toAddress, role) => {
  const response = await api.post(`/api/products/${productId}/transfer`, {
    toAddress,
    role,
  });
  return response.data;
};

export const updateProductStatus = async (productId, status, note, role) => {
  const response = await api.post(`/api/products/${productId}/status`, {
    status,
    note,
    role,
  });
  return response.data;
};

export const verifyProduct = async (productId, certificationHash, note) => {
  const response = await api.post(`/api/products/${productId}/verify`, {
    certificationHash,
    note,
  });
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/api/products/${productId}`);
  return response.data;
};

export const getProductHistory = async (productId) => {
  const response = await api.get(`/api/products/${productId}/history`);
  return response.data;
};

export const getProductVerifications = async (productId) => {
  const response = await api.get(`/api/products/${productId}/verifications`);
  return response.data;
};

export const getProductsByOwner = async (ownerAddress) => {
  const response = await api.get(`/api/products/owner/${ownerAddress}`);
  return response.data;
};

// Wallet operations
export const getWallets = async () => {
  const response = await api.get('/api/wallets');
  return response.data;
};

export const getWalletByRole = async (role) => {
  const response = await api.get(`/api/wallets/${role}`);
  return response.data;
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Status codes (matching the smart contract enum)
export const STATUS_CODES = {
  0: 'Created',
  1: 'Dispatched',
  2: 'InTransit',
  3: 'Received',
  4: 'Delivered',
  5: 'Verified',
  6: 'Exception',
};

export const getStatusName = (code) => {
  return STATUS_CODES[code] || 'Unknown';
};

export const getStatusBadgeClass = (code) => {
  const classes = {
    0: 'badge-info',      // Created
    1: 'badge-warning',   // Dispatched
    2: 'badge-warning',   // InTransit
    3: 'badge-success',   // Received
    4: 'badge-success',   // Delivered
    5: 'badge-success',   // Verified
    6: 'badge-danger',    // Exception
  };
  return classes[code] || 'badge-info';
};

export default api;

