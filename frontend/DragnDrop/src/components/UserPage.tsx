import { Button, H1, H4, Icon, Card, Tag, Divider, ProgressBar, H2 } from "@blueprintjs/core";
import { userDTO } from "../dtos/types";
import { useEffect, useState } from "react";
import { userAPI } from "../utils/userAPI";
import { useNavigate } from "react-router-dom";

function UserPage() {

  const navigate = useNavigate();
  const [userObject, setUserObject] = useState<userDTO | null>(null);

  const DAW_COLORS = [
    "from-emerald-900/40",
    "from-blue-900/40",
    "from-purple-900/40",
    "from-amber-900/40",
    "from-rose-900/40",
    "from-cyan-900/40",
  ];

  useEffect(() => {
    if(userAPI.currentUser == null){
      navigate("/login")
    }
    const fetchUser = async () => {
      const userDTO: userDTO = await userAPI.getUserById(1);
      userAPI.currentUser = userDTO;
      setUserObject(userDTO);
    };
    fetchUser();
  }, [])

  return (
    <div className="!min-h-screen !bg-[#09090b] !text-zinc-400 !p-4 !lg:p-10 !font-sans !tracking-tight">
      
      {/* 1. TOP UTILITY RAIL */}
      <div className="!flex !items-center !justify-between !mb-12 !border-b !border-white/5 !pb-6">
        <div className="!flex !items-center !gap-4 !group !cursor-crosshair">
          <div className="!h-3 !w-3 !rounded-full !bg-emerald-500 !animate-pulse group-hover:!shadow-[0_0_12px_#10b981]" />
          <span className="!text-xs !font-mono !tracking-[0.3em] !text-zinc-500 !uppercase group-hover:!text-emerald-400 !transition-colors">System_Active // Session_01</span>
        </div>
        <div className="!flex !gap-8 !items-center">
          <div className="!text-right !transition-opacity hover:!opacity-70 !cursor-default">
            <p className="!text-[10px] !uppercase !tracking-widest !text-zinc-600">Total_Renders</p>
            <p className="!text-xl !font-mono !text-white">1,204</p>
          </div>
          <Button icon="user" minimal large className="!bg-white/5 !rounded-full hover:!bg-white/10 hover:!scale-110 !transition-all" />
        </div>
      </div>

      {/* 2. THE HERO RACK */}
      <section className="!mb-10 !space-y-4">
        <div className="!flex !items-center !justify-between !px-2">
          <h3 className="!text-[10px] !font-black !text-zinc-600 !uppercase !tracking-[0.4em]">Active_Project_Rack</h3>
          <div className="!flex !gap-2">
            <div className="!h-1 !w-8 !bg-amber-500 !rounded-full !animate-pulse" />
            <div className="!h-1 !w-2 !bg-zinc-800 !rounded-full" />
            <div className="!h-1 !w-2 !bg-zinc-800 !rounded-full" />
          </div>
        </div>

        <div className="!flex !flex-row !gap-6 !overflow-x-auto !pb-6 !snap-x !snap-mandatory !scrollbar-hide">
          {userObject?.daws.map((daw, i) => { 
            const colorClass = DAW_COLORS[i % DAW_COLORS.length];
            
            return (
            <div 
              key={i} 
              className={`!snap-center !shrink-0 !w-[85%] !md:w-[600px] !relative !overflow-hidden !bg-zinc-900 !bg-gradient-to-br !border !border-white/10 !rounded-2xl !p-8 !group !transition-all hover:!border-amber-500/40 hover:!shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:!translate-y-1 !cursor-pointer`}
            >
              <div className={`!absolute !inset-0 !bg-gradient-to-r ${colorClass} !to-transparent !opacity-30 group-hover:!opacity-50 !transition-opacity !pointer-events-none`} />

              <div className="!relative !z-10 !flex !flex-col !h-full !justify-between">
                <div>
                  <div className="!flex !justify-between !items-start !mb-4">
                    <Tag minimal intent="warning" className="!text-[9px] !uppercase !font-bold !tracking-tighter group-hover:!invert !transition-all">PROJECT_00{i+1}</Tag>
                    <span className="!text-[10px] !font-mono !text-zinc-500">REV_0.4.2</span>
                  </div>
                  
                  <H2 className="!text-4xl !font-black !text-white !italic !tracking-tighter !mb-2 group-hover:!text-amber-400 !transition-colors">
                    {daw.name}
                  </H2>
                  
                  <div className="!flex !items-center !gap-3 !text-[10px] !font-mono !text-zinc-500">
                    <span>EST. 2025</span>
                    <div className="!w-1 !h-1 !rounded-full !bg-zinc-700" />
                    <span className="group-hover:!text-zinc-300">AUTO_SAVE_ENABLED</span>
                  </div>
                </div>

                <div className="!mt-12 !flex !items-center !justify-between">
                  <div className="!flex !gap-1 !h-6 !items-end">
                      {[20, 50, 80, 40, 90, 30].map((h, j) => (
                        <div key={j} className="!w-1 !bg-white/20 !rounded-full !transition-all group-hover:!bg-amber-400 group-hover:!animate-bounce" style={{ height: `${h}%`, animationDelay: `${j * 0.1}s` }} />
                      ))}
                  </div>
                  <Button 
                    rightIcon="arrow-right" 
                    intent="primary" 
                    minimal 
                    className="!font-bold !uppercase !tracking-widest !text-[10px] group-hover:!translate-x-2 !transition-transform !bg-white/5 hover:!bg-amber-500 hover:!text-black"
                  >
                    Launch_Session
                  </Button>
                </div>
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* 3. THE SPLIT CONSOLE */}
      <div className="!grid !grid-cols-1 !lg:grid-cols-12 !gap-10">
        
        <div className="!lg:col-span-8 !space-y-10">
          <div>
            <h3 className="!text-[10px] !font-black !text-zinc-600 !uppercase !tracking-[0.4em] !mb-6">Archive_Entries</h3>
            <div className="!space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="!flex !items-center !justify-between !p-4 !bg-zinc-900/30 hover:!bg-zinc-800/80 !border !border-white/5 hover:!border-white/20 !rounded-lg !transition-all !cursor-pointer !group">
                  <div className="!flex !items-center !gap-6">
                    <span className="!font-mono !text-zinc-700 !text-xs group-hover:!text-amber-500">00{i}</span>
                    <span className="!text-white !font-medium group-hover:!translate-x-1 !transition-transform">SESSION_LOG_#45{i}</span>
                  </div>
                  <div className="!flex !gap-12 !text-[10px] !font-mono !text-zinc-500 items-center">
                    <span className="!hidden !md:block group-hover:!text-zinc-300">BPM: 128</span>
                    <span className="!hidden !md:block group-hover:!text-zinc-300">BIT: 24</span>
                    <Icon icon="chevron-right" className="group-hover:!translate-x-1 !transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="!text-[10px] !font-black !text-zinc-600 !uppercase !tracking-[0.4em] !mb-6">Community_Node</h3>
            <div className="!grid !grid-cols-1 !md:grid-cols-2 !gap-4">
              <Card className="!bg-zinc-900/50 !border-zinc-800 !p-5 !rounded-lg hover:!border-zinc-600 !transition-colors !group !cursor-pointer">
                <H4 className="!text-zinc-200 group-hover:!text-white">WASM Latency Fix</H4>
                <p className="!text-xs !text-zinc-500 !mb-4">Latest reply by @AudioDev • 2m ago</p>
                <Button minimal small text="Read Discussion" className="!bg-white/5 group-hover:!bg-white/10" rightIcon="arrow-right" />
              </Card>
              <Card className="!bg-zinc-900/50 !border-zinc-800 !p-5 !rounded-lg hover:!border-zinc-600 !transition-colors !group !cursor-pointer">
                <H4 className="!text-zinc-200 group-hover:!text-white">NAM Model Sharing</H4>
                <p className="!text-xs !text-zinc-500 !mb-4">Latest reply by @ToneKing • 14h ago</p>
                <Button minimal small text="Read Discussion" className="!bg-white/5 group-hover:!bg-white/10" rightIcon="arrow-right" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;