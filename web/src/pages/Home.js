import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { healthCheck } from '../services/api';

const Home = () => {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthCheck();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('disconnected');
    }
  };

  const roles = [
    {
      name: 'Producer',
      icon: '🏭',
      description: 'Register new products and manage production',
      link: '/producer',
      color: '#667eea',
    },
    {
      name: 'Distributor',
      icon: '🚚',
      description: 'Manage product transportation and transfers',
      link: '/distributor',
      color: '#764ba2',
    },
    {
      name: 'Retailer',
      icon: '🏪',
      description: 'Receive products and manage inventory',
      link: '/retailer',
      color: '#f093fb',
    },
    {
      name: 'Regulator',
      icon: '✓',
      description: 'Verify products and issue certifications',
      link: '/regulator',
      color: '#4facfe',
    },
    {
      name: 'Consumer',
      icon: '👤',
      description: 'View product history and verify authenticity',
      link: '/consumer',
      color: '#43e97b',
    },
  ];

  return (
    <div className="page container">
      <div className="page-header">
        <h2>Welcome to Supply Chain Provenance System</h2>
        <p>
          A blockchain-based solution for transparent and tamper-evident product tracking
        </p>
        
        <div style={{ marginTop: '16px' }}>
          <span className={`badge ${apiStatus === 'connected' ? 'badge-success' : apiStatus === 'disconnected' ? 'badge-danger' : 'badge-warning'}`}>
            {apiStatus === 'connected' ? '● Connected to Blockchain' : 
             apiStatus === 'disconnected' ? '● Disconnected' : 
             '● Checking...'}
          </span>
        </div>
      </div>

      <div className="section">
        <h3 style={{ marginBottom: '24px', color: '#2d3748' }}>Select Your Role</h3>
        <div className="grid grid-3">
          {roles.map((role) => (
            <Link
              key={role.name}
              to={role.link}
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                className="card"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid transparent',
                  height: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = role.color;
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  {role.icon}
                </div>
                <h4
                  style={{
                    fontSize: '20px',
                    marginBottom: '8px',
                    color: role.color,
                    textAlign: 'center',
                  }}
                >
                  {role.name}
                </h4>
                <p
                  style={{
                    color: '#718096',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  {role.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="section">
        <h3 style={{ marginBottom: '16px', color: '#2d3748' }}>Key Features</h3>
        <div className="grid grid-2">
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🔒</div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#2d3748' }}>
                Immutable Records
              </h4>
              <p style={{ color: '#718096', fontSize: '14px' }}>
                All product data is stored on the blockchain, ensuring tamper-proof history
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>👥</div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#2d3748' }}>
                Role-Based Access
              </h4>
              <p style={{ color: '#718096', fontSize: '14px' }}>
                Each participant has specific permissions based on their role in the supply chain
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>📍</div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#2d3748' }}>
                Complete Traceability
              </h4>
              <p style={{ color: '#718096', fontSize: '14px' }}>
                Track every product from origin to consumer with full transparency
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>✅</div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#2d3748' }}>
                Verified Authenticity
              </h4>
              <p style={{ color: '#718096', fontSize: '14px' }}>
                Regulators can certify products, giving consumers confidence in authenticity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h3 style={{ marginBottom: '16px', color: 'white' }}>How It Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              1
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: 'white' }}>Producer Registers Product</h4>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                Manufacturers register products with batch details, origin, and production date
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              2
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: 'white' }}>Supply Chain Transfers</h4>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                Products move through distributors and retailers, with each transfer recorded
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              3
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: 'white' }}>Regulator Verification</h4>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                Authorities verify and certify products meet quality and safety standards
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>
              4
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: 'white' }}>Consumer Verification</h4>
              <p style={{ opacity: 0.9, fontSize: '14px' }}>
                End users can view complete product history and verify authenticity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

