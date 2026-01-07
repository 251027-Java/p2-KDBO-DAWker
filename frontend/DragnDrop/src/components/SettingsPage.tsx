import { Button, H4, Icon, InputGroup, Divider } from "@blueprintjs/core";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../utils/userAPI";

function SettingsPage() {

  const navigate = useNavigate();

  useEffect(() => {
    if(userAPI.currentUser == null){
      navigate("/login")
    }

  }, [])

  return (
    <div className="!min-h-screen !bg-[#09090b] !text-zinc-400 !p-6 !lg:p-12">
      
      {/* HEADER: Minimal System Title */}
      <header className="!mb-12 !max-w-4xl !mx-auto !border-b !border-white/5 !pb-6">
        <h1 className="!text-2xl !font-black !text-white !italic !tracking-tighter !uppercase">User_Auth_Settings</h1>
        <p className="!text-[10px] !font-mono !text-zinc-600 !mt-1 !uppercase !tracking-[0.3em]">Access_Level: Root_User</p>
      </header>

      <main className="!max-w-4xl !mx-auto !space-y-6">
        
        {/* 1. USERNAME MODULE */}
        <section className="!bg-zinc-900/30 !border !border-white/5 !rounded-xl !p-6 !flex !flex-col !md:flex-row !md:items-center !justify-between !gap-6">
          <div className="!space-y-1">
            <h4 className="!text-white !font-bold !text-sm !uppercase !tracking-tight">Public_Alias</h4>
            <p className="!text-xs !text-zinc-500">How you appear in forums and project credits.</p>
          </div>
          <div className="!flex !gap-2 !w-full !md:w-auto">
            <InputGroup placeholder="Current_Username" className="!bg-zinc-950" />
            <Button intent="primary" minimal className="!font-bold !border !bg-white/5 !border-white/10 !uppercase !text-[10px]">Update</Button>
          </div>
        </section>

        {/* 2. EMAIL MODULE */}
        <section className="!bg-zinc-900/30 !border !border-white/5 !rounded-xl !p-6 !flex !flex-col !md:flex-row !md:items-center !justify-between !gap-6">
          <div className="!space-y-1">
            <h4 className="!text-white !font-bold !text-sm !uppercase !tracking-tight">Email_Endpoint</h4>
            <p className="!text-xs !text-zinc-500">Primary contact for project notifications.</p>
          </div>
          <div className="!flex !gap-2 !w-full !md:w-auto">
            <InputGroup placeholder="user@dawker.io" className="!bg-zinc-950" />
            <Button intent="primary" minimal className="!font-bold !border !bg-white/5 !border-white/10 !uppercase !text-[10px]">Update</Button>
          </div>
        </section>

        <div className="!py-6">
           <Divider className="!opacity-5" />
        </div>

        {/* 4. DANGER ZONE (Delete Account) */}
        <section className="!bg-red-950/10 !border !border-red-900/20 !rounded-xl !p-8 !flex !flex-col !md:flex-row !md:items-center !justify-between !gap-6">
          <div>
            <h4 className="!text-red-400 !font-bold !text-sm !uppercase !tracking-tight">Purge_Account</h4>
            <p className="!text-xs !text-red-900/60 !max-w-sm">
              Permanently delete all DAW project files and forum history. This action cannot be undone.
            </p>
          </div>
          <Button intent="danger" large className="!rounded-none !font-bold !uppercase !tracking-widest !text-[10px] !px-8 !border !bg-white/5 !border-red-500/30">
            Destroy_Data
          </Button>
        </section>

      </main>
    </div>
  );
}

export default SettingsPage;