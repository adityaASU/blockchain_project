import React, { useState, useEffect } from 'react';
import {
  getProductsByOwner,
  getWalletByRole,
  updateProductStatus,
} from '../services/api';

const RetailerDashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const walletData = await getWalletByRole('retailer');
      setWalletAddress(walletData.address);
      
      const productsData = await getProductsByOwner(walletData.address);
      setProducts(productsData.products || []);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (productId) => {
    if (!newStatus || !statusNote) {
      setError('Please provide status and note');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProductStatus(productId, parseInt(newStatus), statusNote, 'retailer');
      setSuccess('Status updated successfully!');
      setSelectedProduct(null);
      setNewStatus('');
      setStatusNote('');
      setTimeout(() => loadData(), 2000);
    } catch (err) {
      setError('Status update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h2>🏪 Retailer Dashboard</h2>
        <p>Manage received products and inventory</p>
        {walletAddress && (
          <div style={{ marginTop: '12px' }}>
            <span className="badge badge-info">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: '#e6f7ff' }}>
              📦
            </div>
          </div>
          <div className="stat-card-value">{products.length}</div>
          <div className="stat-card-label">Products in Store</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: '#fff7ed' }}>
              ⏳
            </div>
          </div>
          <div className="stat-card-value">
            {products.filter(p => p.status === 4).length}
          </div>
          <div className="stat-card-label">Recently Received</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: '#f0fdf4' }}>
              ✓
            </div>
          </div>
          <div className="stat-card-value">
            {products.filter(p => p.status === 5).length}
          </div>
          <div className="stat-card-label">Verified Products</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Store Inventory</h3>
          <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {loading && !products.length ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p>No products in store</p>
            <p style={{ fontSize: '14px' }}>Products will appear here when delivered to your store</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Batch ID</th>
                  <th>Origin</th>
                  <th>Current Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.batchId}</td>
                    <td>{product.origin}</td>
                    <td>
                      <span className={`badge badge-${product.status <= 3 ? 'warning' : product.status <= 5 ? 'success' : 'info'}`}>
                        {['Created', 'Dispatched', 'InTransit', 'Received', 'Delivered', 'Verified', 'Exception'][product.status] || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.status === 5 ? 'badge-success' : 'badge-warning'}`}>
                        {product.status === 5 ? '✓ Yes' : '⏳ No'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                        onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                      >
                        📝 Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="section fade-in">
          <div className="section-header">
            <h3>Update Status: {selectedProduct.name}</h3>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedProduct(null)}
            >
              ✕ Cancel
            </button>
          </div>

          <div className="input-group">
            <label>New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              <option value="">Select status...</option>
              <option value="4">Received at Store</option>
              <option value="5">Delivered to Customer</option>
            </select>
          </div>

          <div className="input-group">
            <label>Status Note</label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Add details about this status update..."
              rows="3"
              required
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleStatusUpdate(selectedProduct.id)}
            disabled={loading || !newStatus || !statusNote}
          >
            {loading ? '⏳ Updating...' : '✓ Update Status'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;

