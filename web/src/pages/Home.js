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
      icon: (
        <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
        </svg>
      ),
      description: 'Register new products and manage production',
      link: '/producer',
      color: '#2563eb',
    },
    {
      name: 'Distributor',
      icon: (
        <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
        </svg>
      ),
      description: 'Manage product transportation and transfers',
      link: '/distributor',
      color: '#7c3aed',
    },
    {
      name: 'Retailer',
      icon: (
        <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
        </svg>
      ),
      description: 'Receive products and manage inventory',
      link: '/retailer',
      color: '#db2777',
    },
    {
      name: 'Regulator',
      icon: (
        <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
      ),
      description: 'Verify products and issue certifications',
      link: '/regulator',
      color: '#059669',
    },
    {
      name: 'Consumer',
      icon: (
        <svg width="40" height="40" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      ),
      description: 'View product history and verify authenticity',
      link: '/consumer',
      color: '#0891b2',
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
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = role.color;
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${role.color}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                }}
              >
                <div
                  style={{
                    marginBottom: '20px',
                    textAlign: 'center',
                    color: role.color,
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
                    color: '#94a3b8',
                    fontSize: '14px',
                    textAlign: 'center',
                    lineHeight: '1.6',
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
        <h3 style={{ marginBottom: '24px', color: '#f1f5f9', fontSize: '20px', fontWeight: '700' }}>Key Features</h3>
        <div className="grid grid-2">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '24px', color: '#2563eb', flexShrink: 0 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>
                Immutable Records
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                All product data is stored on the blockchain, ensuring tamper-proof history
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '24px', color: '#2563eb', flexShrink: 0 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>
                Role-Based Access
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                Each participant has specific permissions based on their role in the supply chain
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '24px', color: '#2563eb', flexShrink: 0 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>
                Complete Traceability
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                Track every product from origin to consumer with full transparency
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '24px', color: '#2563eb', flexShrink: 0 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>
                Verified Authenticity
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                Regulators can certify products, giving consumers confidence in authenticity
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: 'white' 
      }}>
        <h3 style={{ marginBottom: '24px', color: '#f1f5f9', fontSize: '20px', fontWeight: '700' }}>How It Works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            }}>
              1
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>Producer Registers Product</h4>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                Manufacturers register products with batch details, origin, and production date
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
            }}>
              2
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>Supply Chain Transfers</h4>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                Products move through distributors and retailers, with each transfer recorded
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #ec4899, #f59e0b)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
            }}>
              3
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>Regulator Verification</h4>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                Authorities verify and certify products meet quality and safety standards
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #10b981)', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
            }}>
              4
            </div>
            <div>
              <h4 style={{ marginBottom: '4px', color: '#f1f5f9', fontWeight: '600' }}>Consumer Verification</h4>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
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

