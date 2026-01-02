import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dawker_user');
      if (raw) setUserName(JSON.parse(raw).name || null);
    } catch (err) {}
    const handler = (e: any) => setUserName(e.detail?.name || null);
    const handlerLogout = () => setUserName(null);
    window.addEventListener('dawker:login', handler as EventListener);
    window.addEventListener('dawker:logout', handlerLogout as EventListener);
    return () => {
      window.removeEventListener('dawker:login', handler as EventListener);
      window.removeEventListener('dawker:logout', handlerLogout as EventListener);
    };
  }, []);

  function logout() {
    try { localStorage.removeItem('dawker_user'); } catch (err) {}
    window.dispatchEvent(new CustomEvent('dawker:logout'));
    navigate('/');
  }

  return (
    <div className="h-screen w-64 flex-none bg-slate-950 border-r border-slate-800 p-4">
      <h1 className="text-white font-bold text-xl">Better?</h1>
      <div className="mt-2 text-slate-300">{userName ? `Logged in as ${userName}` : 'Not logged in'}</div>
      <nav className="mt-8 text-slate-400 space-y-2">
        <p className="cursor-pointer" onClick={() => navigate('/search')}>Search</p>
        <p className="cursor-pointer" onClick={() => navigate('/userpage')}>User Page</p>
      </nav>
      <div className="mt-auto pt-6">
        <button onClick={logout} className="px-3 py-2 rounded bg-red-600 text-white text-sm">Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;