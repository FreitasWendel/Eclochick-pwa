// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Config from './pages/Config';

function App() {
  return (
    <BrowserRouter>
      {/* Configuração visual dos Toasts */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: { primary: '#2D8133', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="config" element={<Config />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;