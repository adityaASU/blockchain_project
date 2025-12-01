import React, { useState, useEffect } from 'react';
import {
  getProductsByOwner,
  getWalletByRole,
  transferProduct,
  updateProductStatus,
  getWallets,
} from '../services/api';

const DistributorDashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [products, setProducts] = useState([]);
  const [allWallets, setAllWallets] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const [walletData, walletsData] = await Promise.all([
        getWalletByRole('distributor'),
        getWallets(),
      ]);
      
      setWalletAddress(walletData.address);
      setAllWallets(walletsData);
      
      const productsData = await getProductsByOwner(walletData.address);
      setProducts(productsData.products || []);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (productId) => {
    if (!transferTo) {
      setError('Please select a recipient');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await transferProduct(productId, transferTo, 'distributor');
      setSuccess('Product transferred successfully! Refreshing...');
      setSelectedProduct(null);
      setTransferTo('');
      // Immediate refresh
      await loadData();
    } catch (err) {
      setError('Transfer failed: ' + err.message);
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
      await updateProductStatus(productId, parseInt(newStatus), statusNote, 'distributor');
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
        <h2>Distributor Dashboard</h2>
        <p>Manage product transportation and transfers</p>
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
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <div className="stat-card-value">{products.length}</div>
          <div className="stat-card-label">Products in Inventory</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {products.filter(p => p.status === 2 || p.status === 3).length}
          </div>
          <div className="stat-card-label">In Transit</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {products.filter(p => p.status >= 4).length}
          </div>
          <div className="stat-card-label">Delivered</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Your Inventory</h3>
        </div>

        {loading && !products.length ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p>No products in inventory</p>
            <p style={{ fontSize: '14px' }}>Products will appear here when transferred to you</p>
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
                      <span className={`badge badge-${product.status <= 2 ? 'warning' : product.status <= 4 ? 'info' : 'success'}`}>
                        {['Created', 'Dispatched', 'InTransit', 'Received', 'Delivered', 'Verified', 'Exception'][product.status] || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : { ...product, action: 'transfer' })}
                        >
                          📤 Transfer
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : { ...product, action: 'status' })}
                        >
                          📝 Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProduct && selectedProduct.action === 'transfer' && (
        <div className="section fade-in">
          <div className="section-header">
            <h3>Transfer Product: {selectedProduct.name}</h3>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedProduct(null)}
            >
              ✕ Cancel
            </button>
          </div>

          <div className="input-group">
            <label>Transfer To</label>
            <select
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              required
            >
              <option value="">Select recipient...</option>
              <option value={allWallets.retailer?.address}>
                Retailer ({allWallets.retailer?.address.slice(0, 6)}...{allWallets.retailer?.address.slice(-4)})
              </option>
              <option value={allWallets.distributor?.address}>
                Another Distributor ({allWallets.distributor?.address.slice(0, 6)}...{allWallets.distributor?.address.slice(-4)})
              </option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => handleTransfer(selectedProduct.id)}
            disabled={loading || !transferTo}
          >
            {loading ? '⏳ Transferring...' : '✓ Confirm Transfer'}
          </button>
        </div>
      )}

      {selectedProduct && selectedProduct.action === 'status' && (
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
              <option value="1">Dispatched</option>
              <option value="2">In Transit</option>
              <option value="3">Received</option>
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

export default DistributorDashboard;

