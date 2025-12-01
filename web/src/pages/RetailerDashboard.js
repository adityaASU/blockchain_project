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
      setError(''); // Clear previous errors
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
      setSuccess('Status updated successfully! Refreshing...');
      setSelectedProduct(null);
      setNewStatus('');
      setStatusNote('');
      // Immediate refresh
      await loadData();
    } catch (err) {
      setError('Status update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Retailer Dashboard</h2>
        <p>Manage received products and inventory</p>
        {walletAddress && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={loadData}
              disabled={loading}
            >
              Refresh
            </button>
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
          <div className="stat-card-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="stat-card-value">{products.length}</div>
          <div className="stat-card-label">Products in Store</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {products.filter(p => p.status === 3 || p.status === 4).length}
          </div>
          <div className="stat-card-label">Recently Received</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
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
              <option value="3">Received at Store</option>
              <option value="4">Delivered to Customer</option>
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

