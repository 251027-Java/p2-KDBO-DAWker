"use client";

import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/userAPI';
import { useNavigate } from 'react-router-dom';
import { DawDTO } from '../dtos/types';
import { dawAPI } from '../utils/dawAPI';
import { Button, Card, Classes, Divider, Drawer, Elevation, Icon, Position, Tag } from '@blueprintjs/core';

export default function Search() {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>('');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [daws, setDaws] = useState<DawDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDaw, setSelectedDaw] = useState<DawDTO | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (userAPI.currentUser == null) {
      navigate("/login");
    }

    const loadData = async () => {
      try {
        const data = await dawAPI.getAllDaws();
        setDaws(data);
      } catch (error) {
        console.error("Failed to fetch forums:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleOpenSidebar = (daw: DawDTO) => {
    setSelectedDaw(daw);
    setIsDrawerOpen(true);
  };

  return (
    <div className="!min-h-screen !bg-zinc-950 !text-white !p-6">
      {/* SEARCH HEADER */}
      <div className="sticky !top-0 !z-[100] !bg-zinc-950 !border-b !border-white/10 !p-6 !mb-8 !shadow-2xl">
        <div className="!max-w-4xl !mx-auto !flex !gap-4 !items-center">
          <div className="!relative !flex-1">
            <Icon icon="search" className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rigs, effects, projects..."
              className="!w-full !pl-12 !pr-4 !py-3 !rounded-xl !bg-zinc-900 !border !border-white/10 !text-white !placeholder-zinc-500 !outline-none !focus:ring-2 !focus:ring-emerald-500/50 !transition-all"
            />
          </div>
          <label className="!flex !items-center !gap-2 !cursor-pointer !group">
            <input 
              type="checkbox" 
              checked={onlyMine} 
              onChange={(e) => setOnlyMine(e.target.checked)} 
              className="!rounded !border-zinc-700 !bg-zinc-800 !text-emerald-500 !focus:ring-emerald-500/20" 
            />
            <span className="!text-sm !text-zinc-400 group-hover:!text-zinc-200 !transition-colors">My_Library</span>
          </label>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className="!max-w-4xl !mx-auto !flex !flex-col !gap-4">
        {daws.map((daw) => (
          <Card 
            key={daw.dawId} 
            interactive={true} 
            elevation={Elevation.ZERO}
            onClick={() => handleOpenSidebar(daw)}
            /* THE SINK EFFECT: Moves down on hover */
            className="!bg-zinc-900/40 !p-0 !overflow-hidden !border !border-white/10 hover:!border-emerald-500/40 hover:!translate-y-1 hover:!bg-zinc-900/60 !transition-all !duration-300 !group"
          >
            <div className="!flex !flex-row !h-full !items-stretch">
              {/* Left Stripe */}
              <div className="!w-1 !bg-emerald-500/20 group-hover:!bg-emerald-500 !transition-colors" />

              {/* Main Content Area */}
              <div className="!flex-1 !p-6">
                <div className="!flex !justify-between !items-start !mb-3">
                  <div className="!space-y-1">
                    <h3 className="!text-zinc-100 !font-bold !text-xl !m-0 !leading-none group-hover:!text-white">
                      {daw.name}
                    </h3>
                    <p className="!text-zinc-600 !text-[10px] !font-mono !uppercase !tracking-widest">
                      INSTANCE_ID: {daw.dawId.slice(0, 8)}
                    </p>
                  </div>
                  <Tag minimal className="!bg-emerald-500/10 !text-emerald-400 !border !border-emerald-500/20 !px-3">
                    {daw.exportCount} EXPORTS
                  </Tag>
                </div>

                <p className="!text-zinc-400 !text-sm !line-clamp-2 !mb-6 !italic !font-serif">
                  {daw.description || "No system description found."}
                </p>

                {/* Metadata Rail */}
                <div className="!flex !items-center !gap-8 !pt-4 !border-t !border-white/5">
                  <div className="!flex !flex-col">
                    <span className="!text-[9px] !text-zinc-600 !uppercase !font-black !tracking-widest">Initialization</span>
                    <span className="!text-xs !text-zinc-400 !font-mono">
                      {new Date(daw.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="!flex !flex-col">
                    <span className="!text-[9px] !text-zinc-600 !uppercase !font-black !tracking-widest">Components</span>
                    <span className="!text-xs !text-zinc-400 !font-mono">
                      {daw.listOfConfigs.length.toString().padStart(2, '0')} ACTIVE_UNITS
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="!w-14 !flex !items-center !justify-center !bg-white/[0.02] !border-l !border-white/5 group-hover:!bg-emerald-500/5">
                <Icon icon="chevron-right" className="!text-zinc-700 group-hover:!text-emerald-500 !transition-colors" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* DRAWER (Functionality Intact, Themes Overridden) */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedDaw ? `PROJECT_LOG // ${selectedDaw.name}` : "Metadata"}
        position={Position.RIGHT}
        portalClassName='!z-[2000]'
        size="700px"
        className="!bg-zinc-950 !text-zinc-100 !border-l !border-emerald-500/30 shadow-2xl !z-[2000]"
      >
        <div className={`${Classes.DRAWER_BODY} !p-0`}>
          {selectedDaw && (
            <div className="!p-8 !space-y-8">
              <section>
                <h4 className="!text-[10px] !uppercase !tracking-[0.3em] !text-emerald-500 !mb-4 !font-black">01_System_Brief</h4>
                <p className="!text-base !text-zinc-300 !leading-relaxed !bg-white/5 !p-4 !rounded-lg !border !border-white/5">
                  {selectedDaw.description || "Metadata field returned empty."}
                </p>
              </section>

              <Divider className="!border-white/10" />

              <section>
                <h4 className="!text-[10px] !uppercase !tracking-[0.3em] !text-emerald-500 !mb-6 !font-black">02_Signal_Chain</h4>
                <div className="!space-y-4">
                  {selectedDaw.listOfConfigs.map((config) => (
                    <div key={config.id} className="!bg-zinc-900 !p-4 !rounded-xl !border !border-white/5 hover:!border-emerald-500/20 !transition-colors">
                      <div className="!flex !items-center !justify-between !mb-3">
                        <span className="!text-sm !font-bold !text-zinc-100 !tracking-tight">{config.name}</span>
                        <Tag minimal className="!text-[10px] !bg-emerald-500/10 !text-emerald-500">{config.components.length} NODES</Tag>
                      </div>
                      <div className="!flex !gap-2 !flex-wrap">
                        {config.components.map((comp, idx) => (
                          <span key={idx} className="!text-[10px] !font-mono !text-zinc-500 !bg-black !px-2 !py-1 !rounded !border !border-white/5">
                            {comp.type.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
        
        <div className={`${Classes.DRAWER_FOOTER} !bg-zinc-900/50 !p-6 !border-t !border-white/5`}>
          <Button 
            fill 
            intent="success" 
            large
            text="INITIALIZE WORKSPACE" 
            icon="document-open"
            className="!py-7 !font-black !tracking-[0.2em] !rounded-xl !bg-emerald-600 hover:!bg-emerald-500 !transition-colors"
          />
        </div>
      </Drawer>
    </div>
  );
}