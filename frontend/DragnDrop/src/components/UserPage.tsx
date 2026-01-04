// import { Button, H2, H3, Icon} from "@blueprintjs/core"
// import {Card} from "@blueprintjs/core"

// function UserPage() {
//   return (
    
    
//     <div className="flex flex-col p-4 " >
      
//       {/* Header */}
//       <div>
//         <h1 className="border-2 border-amber-500">Placeholder</h1>
//       </div>
      
//       {/* Main Content */}
//       <div className="mt-5 border-2 border-b-cyan-500 flex justify-between" >
        
//         <div className="p-1">
//           {/* Left content */}
//           <div className="flex flex-row items-stretch p-4 gap-6 h-[400px]"> 
//               {/* items-stretch ensures all cards are the same height */}
      
//             <Card 
//               interactive={true} 
//               elevation={4} // Higher elevation for a more "floating" look
//               className="flex flex-col justify-between w-full bg-slate-800 border-none rounded-3xl p-8 transition-all hover:-translate-y-2"
//             >
//               <div>
//                 {/* Blueprint Icon for style */}
                
//                 <H2 className="text-white font-black tracking-tight mb-4">
//                   Your highest exported DAW
//                 </H2>
                
//                 <p className="text-slate-400 text-lg leading-relaxed">
//                   Embark on an epic journey through the soundscapes of DAWker. 
//                   Create, edit, and master your audio with precision.
//                 </p>
//               </div>

//               <Button 
//                 large={true} 
//                 intent="primary" 
//                 rightIcon="arrow-right" 
//                 className="mt-6 self-start rounded-xl"
//               >
//                 Get Started
//               </Button>
//             </Card>
//             <Card 
//               interactive={true} 
//               elevation={4} // Higher elevation for a more "floating" look
//               className="flex flex-col justify-between w-full bg-slate-800 border-none rounded-3xl p-8 transition-all hover:-translate-y-2"
//             >
//               <div>
//                 {/* Blueprint Icon for style */}
                
//                 <H2 className="text-white font-black tracking-tight mb-4">
//                   Number of exported Daws
//                 </H2>
                
//                 <p className="text-slate-400 text-lg leading-relaxed">
//                   Embark on an epic journey through the soundscapes of DAWker. 
//                   Create, edit, and master your audio with precision.
//                 </p>
//               </div>

//               <Button 
//                 large={true} 
//                 intent="primary" 
//                 rightIcon="arrow-right" 
//                 className="mt-6 self-start rounded-xl"
//               >
//                 Get Started
//               </Button>
//             </Card>
            
//           </div>

//           <div className="p-4">
//             <Card 
//               interactive={true} 
//               elevation={4} // Higher elevation for a more "floating" look
//               className="flex flex-col justify-between w-full bg-slate-800 border-none rounded-3xl p-8 transition-all hover:-translate-y-2"
//             >
//               <div>
//                 {/* Blueprint Icon for style */}
                
//                 <H2 className="text-white font-black tracking-tight mb-4">
//                   DAWs
//                 </H2>
                
//                 <p className="text-slate-400 text-lg leading-relaxed">
//                   Embark on an epic journey through the soundscapes of DAWker. 
//                   Create, edit, and master your audio with precision.
//                 </p>
//               </div>

//               <Button 
//                 large={true} 
//                 intent="primary" 
//                 rightIcon="arrow-right" 
//                 className="mt-6 self-start rounded-xl"
//               >
//                 Get Started
//               </Button>
//             </Card>
//           </div>

//           <div className="p-4">
//             <Card 
//               interactive={true} 
//               elevation={4} // Higher elevation for a more "floating" look
//               className="flex flex-col justify-between w-full bg-slate-800 border-none rounded-3xl p-8 transition-all hover:-translate-y-2"
//             >
//               <div>
//                 {/* Blueprint Icon for style */}
                
//                 <H2 className="text-white font-black tracking-tight mb-4">
//                   Recent forums
//                 </H2>
                
//                 <p className="text-slate-400 text-lg leading-relaxed">
//                   Embark on an epic journey through the soundscapes of DAWker. 
//                   Create, edit, and master your audio with precision.
//                 </p>
//               </div>

//               <Button 
//                 large={true} 
//                 intent="primary" 
//                 rightIcon="arrow-right" 
//                 className="mt-6 self-start rounded-xl"
//               >
//                 Get Started
//               </Button>
//             </Card>
//           </div>

//         </div>

//         {/* Right content */}
//         <div className="border-2 border-b-amber-700 p-4">
//           <Card 
//             interactive={true} 
//             elevation={4} // Higher elevation for a more "floating" look
//             className="flex flex-col justify-between w-full bg-slate-800 border-none rounded-3xl p-8 transition-all hover:-translate-y-2"
//           >
//             <div>
//               {/* Blueprint Icon for style */}
              
//               <H2 className="text-white font-black tracking-tight mb-4">
//                 Milestones
//               </H2>
              
//               <p className="text-slate-400 text-lg leading-relaxed">
//                 Embark on an epic journey through the soundscapes of DAWker. 
//                 Create, edit, and master your audio with precision.
//               </p>
//             </div>

//             <Button 
//               large={true} 
//               intent="primary" 
//               rightIcon="arrow-right" 
//               className="mt-6 self-start rounded-xl"
//             >
//               Get Started
//             </Button>
//           </Card>
//         </div>

//       </div>


//       {/* Footer */}
//       <div className="mt-5 border-2 border-b-cyan-500">
//         <p>Footer content</p>
//       </div>
//     </div>
//   );
// }

// export default UserPage;

import { Button, H1, H4, Icon, Card, Tag, Divider, ProgressBar, H2 } from "@blueprintjs/core";
import { userDTO } from "../dtos/types";
import { useEffect, useState } from "react";
import { userAPI } from "../utils/userAPI";

function UserPage() {

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
    const fetchUser = async () => {
      // If inside an 'async' function
      const userDTO: userDTO = await userAPI.getUserById(1);
      userAPI.currentUser = userDTO;
      setUserObject(userDTO);
      console.log(userDTO);
    };
    fetchUser();
  }, [])


  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-400 p-4 lg:p-10 font-sans tracking-tight">
      
      {/* 1. TOP UTILITY RAIL (The System Header) */}
      <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase">System_Active // Session_01</span>
        </div>
        <div className="flex gap-8 items-center">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">Total_Renders</p>
            <p className="text-xl font-mono text-white">1,204</p>
          </div>
          <Button icon="user" minimal large className="bg-white/5 rounded-full" />
        </div>
      </div>

      {/* 2. THE HERO RACK (Highest Exported DAW) */}
      {/* We make this a "Panoramic" strip that feels like a high-end rack unit */}
      <section className="mb-10 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Active_Project_Rack</h3>
          <div className="flex gap-2">
            {/* Visual indicator of where we are */}
            <div className="h-1 w-8 bg-amber-500 rounded-full" />
            <div className="h-1 w-2 bg-zinc-800 rounded-full" />
            <div className="h-1 w-2 bg-zinc-800 rounded-full" />
          </div>
        </div>

        {/* CAROUSEL CONTAINER */}
        <div className="flex flex-row gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
          
          {userObject?.daws.map((daw, i) => { 
            
            
            
            const colorClass = DAW_COLORS[i % DAW_COLORS.length];
            
            return (
            // Randomize the color chosen

            <div 
              key={i} 
              className="snap-center shrink-0 w-[85%] md:w-[600px] relative overflow-hidden bg-zinc-900 bg-gradient-to-br border border-white/10 rounded-2xl p-8 group transition-all hover:border-white/20"
            >
              {/* Decorative background glow based on project color */}
              <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} to-transparent opacity-30 pointer-events-none`} />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <Tag minimal intent="warning" className="text-[9px] uppercase font-bold tracking-tighter">PROJECT_00{i+1}</Tag>
                    <span className="text-[10px] font-mono text-zinc-500">REV_0.4.2</span>
                  </div>
                  
                  <H2 className="text-4xl font-black text-white italic tracking-tighter mb-2 group-hover:text-amber-400 transition-colors">
                    {daw.name}
                  </H2>
                  
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                    <span>EST. 2025</span>
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    {/* <span className={daw.status === 'READY_FOR_MASTER' ? 'text-emerald-500' : 'text-amber-600'}>
                      {daw.status}
                    </span> */}
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-between">
                  <div className="flex gap-1 h-6 items-end">
                      {/* Visual "Mini-Waveform" unique to each card */}
                      {[20, 50, 80, 40, 90, 30].map((h, j) => (
                        <div key={j} className="w-1 bg-white/20 rounded-full" style={{ height: `${h}%` }} />
                      ))}
                  </div>
                  <Button 
                    rightIcon="arrow-right" 
                    intent="primary" 
                    minimal 
                    className="font-bold uppercase tracking-widest text-[10px] hover:translate-x-1 transition-transform"
                  >
                    Launch_Session
                  </Button>
                </div>
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* 3. THE SPLIT CONSOLE (Main Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Project List & Forum Feed (Horizontal Rows) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Recent DAWs as wide, slim strips */}
          <div>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6">Archive_Entries</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 hover:bg-zinc-800/50 border border-white/5 rounded-lg transition-all cursor-pointer group">
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-zinc-700 text-xs">00{i}</span>
                    <span className="text-white font-medium group-hover:text-amber-400">SESSION_LOG_#45{i}</span>
                  </div>
                  <div className="flex gap-12 text-[10px] font-mono text-zinc-500">
                    <span className="hidden md:block">BPM: 128</span>
                    <span className="hidden md:block">BIT: 24</span>
                    <Icon icon="chevron-right" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Forums as a horizontal feed */}
          <div>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-6">Community_Node</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800 p-5 rounded-lg">
                <H4 className="text-zinc-200">WASM Latency Fix</H4>
                <p className="text-xs text-zinc-500 mb-4">Latest reply by @AudioDev • 2m ago</p>
                <Button minimal small text="Read Discussion" rightIcon="arrow-right" />
              </Card>
              <Card className="bg-zinc-900/50 border-zinc-800 p-5 rounded-lg">
                <H4 className="text-zinc-200">NAM Model Sharing</H4>
                <p className="text-xs text-zinc-500 mb-4">Latest reply by @ToneKing • 14h ago</p>
                <Button minimal small text="Read Discussion" rightIcon="arrow-right" />
              </Card>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Progression & Milestones */}
        {/* <div className="lg:col-span-4">
          <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-8 sticky top-10">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-8">Career_Progression</h3>
            
            <div className="space-y-10"> */}
              {/* Milestone Unit */}
              {/* <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-200">ENGINEER_LEVEL</span>
                  <span className="text-amber-500">75%</span>
                </div>
                <ProgressBar intent="warning" value={0.75} stripes={false} className="bg-zinc-800" />
                <p className="text-[10px] text-zinc-600 uppercase">Next: Senior Studio Master</p>
              </div>

              <Divider className="opacity-10" /> */}

              {/* Milestone Achievements */}
              {/* <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <Icon icon="tick-circle" className="text-emerald-500 mt-1" />
                  <div>
                    <p className="text-sm text-zinc-300 font-bold uppercase">First_Render</p>
                    <p className="text-xs text-zinc-600">Successfully exported 24-bit audio.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start opacity-40">
                  <Icon icon="circle" className="text-zinc-700 mt-1" />
                  <div>
                    <p className="text-sm text-zinc-500 font-bold uppercase">Community_Leader</p>
                    <p className="text-xs text-zinc-700">Receive 100 likes on forum posts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

      </div>
    </div>
  );
}

export default UserPage;