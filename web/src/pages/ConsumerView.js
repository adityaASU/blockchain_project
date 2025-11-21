import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProduct, getProductHistory, getProductVerifications } from '../services/api';

const ConsumerView = () => {
  const [searchParams] = useSearchParams();
  const [productId, setProductId] = useState(searchParams.get('id') || '');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('id')) {
      handleSearch();
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!productId.trim()) {
      setError('Please enter a product ID');
      return;
    }

    setError('');
    setLoading(true);
    setProduct(null);
    setHistory([]);
    setVerifications([]);

    try {
      const [productData, historyData, verificationsData] = await Promise.all([
        getProduct(productId),
        getProductHistory(productId),
        getProductVerifications(productId),
      ]);
      
      setProduct(productData);
      setHistory(historyData.timeline || []);
      setVerifications(verificationsData.verifications || []);
    } catch (err) {
      setError('Product not found or invalid ID: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h2>👤 Consumer Product Verification</h2>
        <p>Verify product authenticity and view complete supply chain history</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="section">
        <h3 style={{ marginBottom: '16px' }}>Enter Product ID or Scan QR Code</h3>
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
            {loading ? '⏳ Searching...' : '🔍 Verify Product'}
          </button>
        </div>
      </div>

      {product && (
        <>
          {/* Verification Badge */}
          <div className={`section fade-in`} style={{
            background: product.status === 5
              ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: 'white',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {product.status === 5 ? '✓' : '⏳'}
            </div>
            <h3 style={{ color: 'white', marginBottom: '8px' }}>
              {product.status === 5 ? 'Verified Authentic' : 'Pending Verification'}
            </h3>
            <p style={{ opacity: 0.9 }}>
              {product.status === 5
                ? 'This product has been certified by authorized regulators'
                : 'This product is awaiting official verification'}
            </p>
          </div>

          {/* Product Information */}
          <div className="section fade-in">
            <h3 style={{ marginBottom: '24px' }}>Product Information</h3>
            <div className="grid grid-2">
              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>
                  PRODUCT NAME
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                  {product.name}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>
                  BATCH ID
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                  {product.batchId}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>
                  ORIGIN
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                  {product.origin}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>
                  PRODUCTION DATE
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
                  {new Date(parseInt(product.productionDate) * 1000).toLocaleDateString()}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>
                  CURRENT STATUS
                </p>
                <span className={`badge badge-${product.status <= 2 ? 'warning' : product.status <= 5 ? 'success' : 'info'}`}>
                  {['Created', 'Dispatched', 'InTransit', 'Received', 'Delivered', 'Verified', 'Exception'][product.status] || 'Unknown'}
                </span>
              </div>

              <div style={{
                padding: '16px',
                background: '#f7fafc',
                borderRadius: '8px',
              }}>
                <p style={{ color: '#718096', fontSize: '12px', marginBottom: '6px' }}>
                  PRODUCT ID
                </p>
                <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#4a5568' }}>
                  {product.id}
                </p>
              </div>
            </div>
          </div>

          {/* Verifications */}
          {verifications.length > 0 && (
            <div className="section fade-in">
              <h3 style={{ marginBottom: '16px' }}>
                🎖️ Official Certifications
              </h3>
              {verifications.map((verification, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: '#f0fdf4',
                    border: '2px solid #86efac',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>
                      ✓ Certified by Regulator
                    </span>
                    <span style={{ fontSize: '12px', color: '#16a34a' }}>
                      {new Date(parseInt(verification.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#15803d', marginBottom: '8px' }}>
                    {verification.notes}
                  </p>
                  {verification.certificationHash && (
                    <p style={{ fontSize: '12px', color: '#65a30d', fontFamily: 'monospace' }}>
                      Certificate: {verification.certificationHash}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Supply Chain Journey */}
          <div className="section fade-in">
            <h3 style={{ marginBottom: '24px' }}>
              🗺️ Supply Chain Journey
            </h3>
            
            {history.length === 0 ? (
              <p style={{ color: '#718096', textAlign: 'center', padding: '20px' }}>
                No history available
              </p>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '30px',
                  top: '0',
                  bottom: '0',
                  width: '3px',
                  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                }}></div>

                {/* Timeline events */}
                {history.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'relative',
                      paddingLeft: '80px',
                      paddingBottom: '40px',
                    }}
                  >
                    {/* Timeline icon */}
                    <div style={{
                      position: 'absolute',
                      left: '16px',
                      top: '8px',
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    }}>
                      {history.length - index}
                    </div>

                    {/* Event card */}
                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '18px', color: '#2d3748', fontWeight: '600' }}>
                          {event.type}
                        </h4>
                        <span style={{
                          fontSize: '12px',
                          color: 'white',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          padding: '4px 12px',
                          borderRadius: '12px',
                        }}>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '12px' }}>
                        {event.description}
                      </p>

                      <p style={{ fontSize: '12px', color: '#a0aec0' }}>
                        {new Date(event.date).toLocaleTimeString()} • 
                        Block #{event.blockNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blockchain Guarantee */}
          <div className="section" style={{
            background: '#f7fafc',
            borderLeft: '4px solid #667eea',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '32px' }}>🔒</div>
              <div>
                <h4 style={{ marginBottom: '8px', color: '#2d3748' }}>
                  Blockchain-Verified Authenticity
                </h4>
                <p style={{ color: '#718096', fontSize: '14px', lineHeight: '1.6' }}>
                  This product's entire history is recorded on the blockchain, making it impossible 
                  to tamper with or counterfeit. Every transaction, transfer, and verification is 
                  permanently stored and publicly verifiable. You can trust that this information 
                  is authentic and has not been altered.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!product && !loading && (
        <div className="empty-state">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <p>Enter a product ID to verify its authenticity</p>
          <p style={{ fontSize: '14px' }}>
            You can scan a QR code or enter the product ID manually
          </p>
        </div>
      )}
    </div>
  );
};

export default ConsumerView;

