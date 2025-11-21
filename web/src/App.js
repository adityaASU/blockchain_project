import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import components
import Home from './pages/Home';
import ProducerDashboard from './pages/ProducerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import RegulatorDashboard from './pages/RegulatorDashboard';
import ConsumerView from './pages/ConsumerView';

function App() {
  const [currentRole, setCurrentRole] = useState('consumer');

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container header-content">
            <Link to="/" className="logo">
              <h1>🔗 Supply Chain Provenance</h1>
            </Link>
            
            <nav className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/producer" className="nav-link">Producer</Link>
              <Link to="/distributor" className="nav-link">Distributor</Link>
              <Link to="/retailer" className="nav-link">Retailer</Link>
              <Link to="/regulator" className="nav-link">Regulator</Link>
              <Link to="/consumer" className="nav-link">Consumer</Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/producer" element={<ProducerDashboard />} />
            <Route path="/distributor" element={<DistributorDashboard />} />
            <Route path="/retailer" element={<RetailerDashboard />} />
            <Route path="/regulator" element={<RegulatorDashboard />} />
            <Route path="/consumer" element={<ConsumerView />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>© 2024 Blockchain Supply Chain Provenance System</p>
            <p className="footer-tech">Built with Ethereum, Solidity, React & Express</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

