import { useNavigate, useLocation } from "react-router-dom";
import { Icon, Divider } from "@blueprintjs/core";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/userpage", icon: "home" },
    { label: "Search_Node", path: "/search", icon: "search" },
    { label: "Community", path: "/forums", icon: "chat" },
  ];

  return (
    <div className="!h-screen !w-78 !flex-none !bg-[#08080a] !border-r !border-white/5 !flex !flex-col !shadow-2xl">
      
      {/* BRANDING */}
      <div className="!p-8 !pb-10">
        <div className="!flex !items-center !gap-3">
          <div className="!w-full !h-8 !bg-amber-500 !rounded !flex !items-center !justify-center">
            <Icon icon="pulse" className="!text-black" size={18} />
          </div>
          <h1 className="!text-white !font-black !italic !tracking-tighter">DAWKER</h1>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="!flex-1 !px-4 !space-y-2">
        <p className="!text-[10px] !font-black !text-zinc-500 !uppercase !tracking-[0.3em] !mb-4 !ml-4">Main_Menu</p>
        
        {navItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              !flex !items-center !gap-4 !px-4 !py-3 !rounded-xl !cursor-pointer !transition-all !group
              ${isActive(item.path) 
                ? '!bg-white/5 !text-white !border-l-2 !border-amber-500' 
                : '!text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}
            `}
          >
            {/* ICON: Now using zinc-100 for high visibility */}
            <Icon 
              icon={item.icon as any} 
              size={18} 
              className={`
                !transition-colors !duration-200
                ${isActive(item.path) 
                  ? '!text-amber-400 !drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                  : '!text-zinc-100 !opacity-80 group-hover:opacity-100'}
              `} 
            />
            <span className="!text-[11px] !font-bold !uppercase !tracking-widest">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="!p-4 !mt-auto">
        <Divider className="!opacity-10 !mb-4" />
        <div
          onClick={() => navigate('/settings')}
          className={`
            !flex !items-center !gap-4 !px-4 !py-3 !rounded-xl !cursor-pointer !transition-all !group
            ${isActive('/settings') 
              ? '!bg-white/10 !text-white' 
              : '!text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}
          `}
        >
          <Icon 
            icon="cog" 
            size={18} 
            className={isActive('/settings') ? '!text-amber-400' : '!text-zinc-100 !opacity-80 group-hover:opacity-100'} 
          />
          <span className="!text-[11px] !font-bold !uppercase !tracking-widest">Settings_Config</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;