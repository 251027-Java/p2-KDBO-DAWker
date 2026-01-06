
// src/components/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {

  return (
    <div className="flex h-screen w-full bg-zinc-900">
      {/* 1. Sidebar: Placed once, stays forever */}
      <Sidebar />

      {/* 2. The Outlet: This IS your page content */}
      <div className="flex-1 overflow-auto ">
        <Outlet /> 
      </div>
    </div>
  );
};

export default Layout;