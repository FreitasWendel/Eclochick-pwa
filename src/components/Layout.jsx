// src/components/Layout.jsx
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Bell, Home,Activity, Settings } from 'lucide-react';


export default function Layout() {
  const location = useLocation();

  // Mapeia a rota atual para mudar o título no Header
  const getTitle = () => {
    if (location.pathname === '/history') return 'Histórico de Incubação';
    if (location.pathname === '/config') return 'Configurações';
    return 'Eclochick';
  };

  return (
    <div className="flex flex-col h-screen bg-eclo-bg">
      {/* HEADER VERDE */}
      <header className="bg-eclo-green text-white p-6 pt-10 rounded-b-3xl flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        {location.pathname === '/' && <Bell size={24} />}
      </header>

      {/* CONTEÚDO DA PÁGINA (Muda conforme a rota) */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* MENU INFERIOR */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 shadow-lg">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-eclo-green' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-eclo-green' : 'text-gray-500'}`}
        >
          <Activity size={24} />
          <span className="text-xs mt-1">Histórico</span>
        </NavLink>

        <NavLink 
          to="/config" 
          className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-eclo-green' : 'text-gray-500'}`}
        >
          <Settings size={24} />
          <span className="text-xs mt-1">Config</span>
        </NavLink>
      </nav>
    </div>
  );
}