import React, { useState, useEffect } from 'react';
import { registerProduct, getProductsByOwner, getWalletByRole, transferProduct, updateProductStatus, getWallets } from '../services/api';
import QRCode from 'react-qr-code';

const ProducerDashboard = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [products, setProducts] = useState([]);
  const [allWallets, setAllWallets] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    batchId: '',
    origin: '',
    productionDate: '',
  });

  useEffect(() => {
    loadWalletAndProducts();
  }, []);

  const loadWalletAndProducts = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const [walletData, walletsData] = await Promise.all([
        getWalletByRole('producer'),
        getWallets()
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Convert date to timestamp
      const timestamp = new Date(formData.productionDate).getTime() / 1000;
      
      const result = await registerProduct({
        name: formData.name,
        batchId: formData.batchId,
        origin: formData.origin,
        productionDate: Math.floor(timestamp),
      });

      setSuccess(`Product registered successfully! ID: ${result.productId}`);
      setFormData({
        name: '',
        batchId: '',
        origin: '',
        productionDate: '',
      });
      setShowForm(false);
      
      // Immediate reload
      await loadWalletAndProducts();
    } catch (err) {
      setError('Failed to register product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      await transferProduct(productId, transferTo, 'producer');
      setSuccess('Product transferred successfully! Refreshing...');
      setShowTransferForm(false);
      setSelectedProduct(null);
      setTransferTo('');
      // Immediate refresh without setTimeout
      await loadWalletAndProducts();
    } catch (err) {
      setError('Transfer failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (productId, status, note) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProductStatus(productId, status, note, 'producer');
      setSuccess('Status updated successfully! Refreshing...');
      // Immediate refresh
      await loadWalletAndProducts();
    } catch (err) {
      setError('Status update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Producer Dashboard</h2>
        <p>Register new products and manage your inventory</p>
        {walletAddress && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-info">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={loadWalletAndProducts}
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
          <div className="stat-card-label">Total Products</div>
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

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {products.filter(p => p.status >= 2).length}
          </div>
          <div className="stat-card-label">Products Shipped</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Register New Product</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancel' : '+ New Product'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="fade-in">
            <div className="grid grid-2">
              <div className="input-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Organic Coffee Beans"
                />
              </div>

              <div className="input-group">
                <label>Batch ID *</label>
                <input
                  type="text"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., BATCH-2024-001"
                />
              </div>

              <div className="input-group">
                <label>Origin *</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Colombia, South America"
                />
              </div>

              <div className="input-group">
                <label>Production Date *</label>
                <input
                  type="date"
                  name="productionDate"
                  value={formData.productionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Registering...' : '✓ Register Product'}
            </button>
          </form>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Your Products</h3>
        </div>

        {loading && !products.length ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p>No products registered yet</p>
            <p style={{ fontSize: '14px' }}>Click "New Product" to register your first product</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Batch ID</th>
                  <th>Origin</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <code style={{ fontSize: '12px' }}>
                        {product.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td>{product.name}</td>
                    <td>{product.batchId}</td>
                    <td>{product.origin}</td>
                    <td>
                      <span className={`badge badge-${product.status <= 1 ? 'info' : product.status <= 2 ? 'warning' : 'success'}`}>
                        {['Created', 'Dispatched', 'InTransit', 'Received', 'Delivered', 'Verified', 'Exception'][product.status] || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.status === 5 ? 'badge-success' : 'badge-warning'}`}>
                        {product.status === 5 ? '✓ Yes' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          onClick={() => setSelectedProductId(product.id === selectedProductId ? null : product.id)}
                        >
                          {product.id === selectedProductId ? '✕' : '🔍'} QR
                        </button>
                        {product.status === 0 && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => handleUpdateStatus(product.id, 1, 'Product dispatched from production facility')}
                            disabled={loading}
                          >
                            📤 Dispatch
                          </button>
                        )}
                        {product.status === 1 && (
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowTransferForm(true);
                            }}
                          >
                            🚚 Transfer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProductId && (
        <div className="section fade-in">
          <div className="section-header">
            <h3>QR Code for Product</h3>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedProductId(null)}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
              <QRCode
                value={`${window.location.origin}/consumer?id=${selectedProductId}`}
                size={200}
              />
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#718096' }}>
                Product ID: {selectedProductId.slice(0, 16)}...
              </p>
            </div>
          </div>
        </div>
      )}

      {showTransferForm && selectedProduct && (
        <div className="section fade-in">
          <div className="section-header">
            <h3>Transfer Product: {selectedProduct.name}</h3>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowTransferForm(false);
                setSelectedProduct(null);
                setTransferTo('');
              }}
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
              <option value={allWallets.distributor?.address}>
                🚚 Distributor ({allWallets.distributor?.address?.slice(0, 6)}...{allWallets.distributor?.address?.slice(-4)})
              </option>
              <option value={allWallets.retailer?.address}>
                🏪 Retailer ({allWallets.retailer?.address?.slice(0, 6)}...{allWallets.retailer?.address?.slice(-4)})
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
    </div>
  );
};

export default ProducerDashboard;

