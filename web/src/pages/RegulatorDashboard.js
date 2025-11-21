import React, { useState } from 'react';
import { verifyProduct, getProduct, getProductHistory } from '../services/api';

const RegulatorDashboard = () => {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  
  const [verifyData, setVerifyData] = useState({
    certificationHash: '',
    note: '',
  });

  const handleSearch = async () => {
    if (!productId.trim()) {
      setError('Please enter a product ID');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    setProduct(null);
    setHistory([]);

    try {
      const [productData, historyData] = await Promise.all([
        getProduct(productId),
        getProductHistory(productId),
      ]);
      
      setProduct(productData);
      setHistory(historyData.timeline || []);
    } catch (err) {
      setError('Failed to load product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyData.certificationHash || !verifyData.note) {
      setError('Please provide certification hash and note');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await verifyProduct(productId, verifyData.certificationHash, verifyData.note);
      setSuccess('Product verified successfully!');
      setShowVerifyForm(false);
      setVerifyData({ certificationHash: '', note: '' });
      
      // Reload product data
      setTimeout(() => handleSearch(), 2000);
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h2>✓ Regulator Dashboard</h2>
        <p>Verify products and issue certifications</p>
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

      <div className="section">
        <h3 style={{ marginBottom: '16px' }}>Search Product</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter Product ID..."
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? '⏳ Searching...' : '🔍 Search'}
          </button>
        </div>
      </div>

      {product && (
        <>
          <div className="section fade-in">
            <div className="section-header">
              <h3>Product Details</h3>
              {product.status !== 5 && (
                <button
                  className="btn btn-success"
                  onClick={() => setShowVerifyForm(!showVerifyForm)}
                >
                  {showVerifyForm ? '✕ Cancel' : '✓ Verify Product'}
                </button>
              )}
            </div>

            <div className="grid grid-2">
              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>
                  Product Name
                </p>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  {product.name}
                </p>
              </div>

              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>
                  Batch ID
                </p>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  {product.batchId}
                </p>
              </div>

              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>
                  Origin
                </p>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  {product.origin}
                </p>
              </div>

              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>
                  Current Owner
                </p>
                <p style={{ fontSize: '14px', fontFamily: 'monospace', marginBottom: '16px' }}>
                  {product.currentOwner.slice(0, 10)}...{product.currentOwner.slice(-8)}
                </p>
              </div>

              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>
                  Status
                </p>
                <span className={`badge badge-${product.status <= 2 ? 'warning' : product.status <= 5 ? 'success' : 'info'}`}>
                  {['Created', 'Dispatched', 'InTransit', 'Received', 'Delivered', 'Verified', 'Exception'][product.status] || 'Unknown'}
                </span>
              </div>

              <div>
                <p style={{ color: '#718096', fontSize: '14px', marginBottom: '4px' }}>
                  Verification Status
                </p>
                <span className={`badge ${product.status === 5 ? 'badge-success' : 'badge-warning'}`}>
                  {product.status === 5 ? '✓ Verified' : '⏳ Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {showVerifyForm && product.status !== 5 && (
            <div className="section fade-in">
              <h3 style={{ marginBottom: '16px' }}>Add Verification</h3>
              
              <div className="input-group">
                <label>Certification Hash / IPFS CID</label>
                <input
                  type="text"
                  value={verifyData.certificationHash}
                  onChange={(e) => setVerifyData({ ...verifyData, certificationHash: e.target.value })}
                  placeholder="e.g., QmX... or certificate hash"
                  required
                />
              </div>

              <div className="input-group">
                <label>Verification Notes</label>
                <textarea
                  value={verifyData.note}
                  onChange={(e) => setVerifyData({ ...verifyData, note: e.target.value })}
                  placeholder="Enter verification details, test results, compliance information..."
                  rows="4"
                  required
                />
              </div>

              <button
                className="btn btn-success"
                onClick={handleVerify}
                disabled={loading || !verifyData.certificationHash || !verifyData.note}
              >
                {loading ? '⏳ Verifying...' : '✓ Certify Product'}
              </button>
            </div>
          )}

          <div className="section fade-in">
            <h3 style={{ marginBottom: '16px' }}>Product History Timeline</h3>
            
            {history.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                No history available
              </p>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  background: '#e2e8f0',
                }}></div>

                {/* Timeline events */}
                {history.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      paddingLeft: '60px',
                      paddingBottom: '32px',
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '4px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'white',
                      border: '3px solid #667eea',
                    }}></div>

                    {/* Event card */}
                    <div style={{
                      background: '#f7fafc',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', color: '#2d3748' }}>
                          {event.type}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#718096' }}>
                          {new Date(event.date).toLocaleString()}
                        </span>
                      </div>
                      
                      <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '8px' }}>
                        {event.description}
                      </p>

                      {event.details && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: 'white',
                          borderRadius: '6px',
                          fontSize: '13px',
                        }}>
                          {Object.entries(event.details).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: '6px' }}>
                              <span style={{ color: '#718096', marginRight: '8px' }}>
                                {key}:
                              </span>
                              <span style={{ color: '#2d3748' }}>
                                {typeof value === 'string' && value.startsWith('0x') 
                                  ? `${value.slice(0, 10)}...${value.slice(-8)}`
                                  : value?.toString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#a0aec0' }}>
                        Block #{event.blockNumber} • Tx: {event.txHash.slice(0, 10)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RegulatorDashboard;

