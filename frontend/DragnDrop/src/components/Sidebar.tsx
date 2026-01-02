import { Outlet } from "react-router-dom";


const Sidebar = () => {
// Inside Sidebar.tsx
return (
  <div className="h-screen w-64 flex-none bg-slate-950 border-r border-slate-800 p-4">
    <h1 className="text-white font-bold text-xl">Better?</h1>
    <nav className="mt-8 text-slate-400">
      {/* Your links will go here */}
      <p>Navigation Item 1</p>
      <p>Navigation Item 2</p>
    </nav>
  </div>
);
};

export default Sidebar;