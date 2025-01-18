import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BillDetails from './pages/BillDetails';
import PaymentHistory from './pages/PaymentHistory';
import BillEstimator from './pages/BillEstimator';
import Layout from './components/Layout';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/bill/:id" element={<BillDetails />} />
          <Route path="/history" element={<PaymentHistory />} />
          <Route path="/estimator" element={<BillEstimator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;