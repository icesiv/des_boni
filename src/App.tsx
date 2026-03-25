import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Portfolio } from './pages/Portfolio';
import { AdminPanel } from './admin/AdminPanel';
import { AdminLogin, AUTH_TOKEN_KEY } from './admin/AdminLogin';
import './App.css';

function AdminGuard() {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem(AUTH_TOKEN_KEY));
  if (!token) return <AdminLogin onLogin={setToken} />;
  return <AdminPanel authToken={token} onLogout={() => { sessionStorage.removeItem(AUTH_TOKEN_KEY); setToken(null); }} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<AdminGuard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
