import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Portfolio } from './pages/Portfolio';
import { AdminPanel } from './admin/AdminPanel';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <>
      <Toaster position="bottom-right" theme="dark" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
