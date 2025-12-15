import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HotelDetail from './pages/HotelDetail';
import HotelManagement from './pages/HotelManagement';
import Navigation from './components/Navigation';
import ToastContainer, { ToastMessage } from './components/ToastContainer';
import './App.css';

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === 'error' ? 5000 : 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Router>
      <Navigation />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/hotels" element={<HotelManagement showToast={showToast} />} />
          <Route path="/hotels/:id" element={<HotelDetail showToast={showToast} />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Router>
  );
}

export default App;
