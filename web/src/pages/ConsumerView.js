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
        <h2>Consumer Product Verification</h2>
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
            background: product.status === 5 ? '#059669' : '#f59e0b',
            color: 'white',
            textAlign: 'center',
            borderColor: product.status === 5 ? '#047857' : '#d97706',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {product.status === 5 ? (
                <svg style={{ display: 'inline-block' }} width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg style={{ display: 'inline-block' }} width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
              {product.status === 5 ? 'Verified Authentic' : 'Pending Verification'}
            </h3>
            <p style={{ opacity: 0.9, fontSize: '15px' }}>
              {product.status === 5
                ? 'This product has been certified by authorized regulators'
                : 'This product is awaiting official verification'}
            </p>
          </div>

          {/* Product Information */}
          <div className="section fade-in">
            <h3 style={{ marginBottom: '24px', color: '#f1f5f9' }}>Product Information</h3>
            <div className="grid grid-2">
              <div style={{
                padding: '16px',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  PRODUCT NAME
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  {product.name}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  BATCH ID
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  {product.batchId}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  ORIGIN
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  {product.origin}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  PRODUCTION DATE
                </p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  {new Date(parseInt(product.productionDate) * 1000).toLocaleDateString()}
                </p>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  CURRENT STATUS
                </p>
                <span className={`badge badge-${product.status <= 2 ? 'warning' : product.status <= 5 ? 'success' : 'info'}`}>
                  {['Created', 'Dispatched', 'InTransit', 'Received', 'Delivered', 'Verified', 'Exception'][product.status] || 'Unknown'}
                </span>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.05em' }}>
                  PRODUCT ID
                </p>
                <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8' }}>
                  {product.id}
                </p>
              </div>
            </div>
          </div>

          {/* Verifications */}
          {verifications.length > 0 && (
            <div className="section fade-in">
              <h3 style={{ marginBottom: '16px', color: '#f1f5f9' }}>
                Official Certifications
              </h3>
              {verifications.map((verification, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#34d399' }}>
                      ✓ Certified by Regulator
                    </span>
                    <span style={{ fontSize: '12px', color: '#6ee7b7' }}>
                      {new Date(parseInt(verification.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#a7f3d0', marginBottom: '8px' }}>
                    {verification.notes}
                  </p>
                  {verification.certificationHash && (
                    <p style={{ fontSize: '12px', color: '#6ee7b7', fontFamily: 'monospace' }}>
                      Certificate: {verification.certificationHash}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Supply Chain Journey */}
          <div className="section fade-in">
            <h3 style={{ marginBottom: '24px', color: '#f1f5f9' }}>
              Supply Chain Journey
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
                      background: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: '600' }}>
                          {event.type}
                        </h4>
                        <span style={{
                          fontSize: '12px',
                          color: 'white',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                        }}>
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '12px' }}>
                        {event.description}
                      </p>

                      <p style={{ fontSize: '12px', color: '#64748b' }}>
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
            background: 'rgba(59, 130, 246, 0.1)',
            borderLeft: '4px solid #3b82f6',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ 
                fontSize: '32px', 
                color: '#60a5fa',
                filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))',
              }}>
                <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h4 style={{ marginBottom: '8px', color: '#f1f5f9', fontWeight: '600' }}>
                  Blockchain-Verified Authenticity
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
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

