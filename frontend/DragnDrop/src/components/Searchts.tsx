"use client";

import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/userAPI';
import { useNavigate } from 'react-router-dom';
import { DawDTO, RatingsPageDTO } from '../dtos/types';
import { dawAPI } from '../utils/dawAPI';
import { Button, Card, Classes, Divider, Drawer, Elevation, Icon, Position, Tag } from '@blueprintjs/core';
import { ratingsAPI } from '../utils/ratingsAPI';

export default function Search() {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>('');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [daws, setDaws] = useState<DawDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDaw, setSelectedDaw] = useState<DawDTO | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ratingsPage, setRatingsPage] = useState<RatingsPageDTO | null>(null)
  const [isReplying, setIsReplying] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5); 
  
  
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

    const loadPageData = async () => {

      if(!selectedDaw?.dawId) return
      
      // Ensure we are parsing a valid number string
      const numericId = selectedDaw.dawId;
      
      try{

        console.log("is it getting to this place here?")
        console.log(numericId)
        const data = await ratingsAPI.getRatingsPageByDawId(numericId)
        setRatingsPage(data)
        console.log(data);
      } catch(error){
        console.log("New error: " + error )
      }

    }
    loadPageData(); 
    setIsDrawerOpen(true);
  };

  const handleCommentSubmit = async () => {
    if (!selectedDaw) return;

    // Ensure we are parsing a valid number string
    const numericId = selectedDaw.dawId;

    const commentDto = {
      dawId: numericId,
      rating: newRating,
      userId: userAPI.currentUser?.id || 0,
      username: userAPI.currentUser?.username || "Anonymous",
      comment: newComment,
      createdAt: new Date().toISOString()
    };

    console.log(commentDto)

    try {
      const updatedPage = await ratingsAPI.createRatingsPage(commentDto);
      
      // Update local state to show the new comment and new average immediately
      setRatingsPage(updatedPage);

      console.log("If all is working: this is the updatedPage that we have: ")
      console.log(updatedPage);
      
      // Reset form
      setIsReplying(false);
      setNewComment("");
      setNewRating(5);
    } catch (error) {
      console.error("Failed to post rating:", error);
    }
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

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedDaw ? `PROJECT_LOG // ${selectedDaw.name}` : "Metadata"}
        position={Position.RIGHT}
        portalClassName="!z-[2000]"
        size="700px"
        className="!bg-zinc-950 !text-zinc-100 !border-l !border-emerald-500/30 shadow-2xl !z-[2000]"
      >
        {/* 1. LAYOUT WRAPPER: Forces the Drawer interior to fill the 100% height */}
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* 2. SCROLLABLE BODY: This grows to fill space and scrolls when content overflows */}
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            <div className={`${Classes.DRAWER_BODY} !p-0`}>
              {selectedDaw && (
                <div className="!p-8 !space-y-8">
                  {/* 01_SYSTEM_BRIEF */}
                  <section>
                    <h4 className="!text-[10px] !uppercase !tracking-[0.3em] !text-emerald-500 !mb-4 !font-black">
                      01_System_Brief
                    </h4>
                    <p className="!text-base !text-zinc-300 !leading-relaxed !bg-white/5 !p-4 !rounded-lg !border !border-white/5">
                      {selectedDaw.description || "Metadata field returned empty."}
                    </p>
                  </section>

                  <Divider className="!border-white/10" />

                  {/* 02_SIGNAL_CHAIN */}
                  <section>
                    <h4 className="!text-[10px] !uppercase !tracking-[0.3em] !text-emerald-500 !mb-6 !font-black">
                      02_Signal_Chain
                    </h4>
                    <div className="!space-y-4">
                      {selectedDaw.listOfConfigs.map((config) => (
                        <div key={config.id} className="!bg-zinc-900 !p-4 !rounded-xl !border !border-white/5 hover:!border-emerald-500/20 !transition-colors">
                          <div className="!flex !items-center !justify-between !mb-3">
                            <span className="!text-sm !font-bold !text-zinc-100 !tracking-tight">{config.name}</span>
                            <Tag minimal className="!text-[10px] !bg-emerald-500/10 !text-emerald-500">
                              {config.components.length} NODES
                            </Tag>
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

                  <Divider className="!border-white/10" />

                  {/* 03_USER_FEEDBACK */}
                  <section className="!pb-12">
                    <div className="!flex !items-center !justify-between !mb-6">
                      <h4 className="!text-[10px] !uppercase !tracking-[0.3em] !text-emerald-500 !font-black">
                        03_User_Feedback
                      </h4>
                      
                      {!isReplying && (
                        <Button 
                          minimal 
                          icon="plus" 
                          text="ADD_LOG" 
                          onClick={() => setIsReplying(true)}
                          className="!text-emerald-400 !font-black !text-[10px] !tracking-widest"
                        />
                      )}

                      {ratingsPage && (
                        <div className="!text-right">
                          <div className="!text-[9px] !text-zinc-500 !uppercase !tracking-widest !mb-1">Project_Score</div>
                          <div className="!text-2xl !font-black !text-white !leading-none">
                            {ratingsPage.rating.toFixed(1)} 
                            <span className="!text-emerald-500 !text-sm !ml-1">/ 5.0</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RATING INPUT BOX */}
                    {isReplying && (
                      <div className="!bg-zinc-900 !border !border-emerald-500/30 !rounded-2xl !p-6 !mb-8 !space-y-4 !animate-in !fade-in !slide-in-from-top-2">
                        <div className="!flex !justify-between !items-center">
                          <span className="!text-[10px] !font-black !text-zinc-500 !uppercase">Signal_Quality</span>
                          <div className="!flex !gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                onClick={() => setNewRating(num)}
                                className={`!w-8 !h-8 !rounded !border !transition-all ${
                                  newRating >= num 
                                  ? "!bg-emerald-500 !border-emerald-400 !text-black" 
                                  : "!bg-zinc-950 !border-white/10 !text-zinc-600"
                                } !font-bold !text-xs`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          autoFocus
                          className="!w-full !bg-zinc-950 !border !border-white/10 !rounded-xl !p-4 !text-sm !text-zinc-300 !outline-none focus:!border-emerald-500/50 !transition-colors !min-h-[80px]"
                          placeholder="Enter telemetry notes..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />

                        <div className="!flex !justify-end !gap-3">
                          <Button 
                            minimal 
                            text="ABORT" 
                            onClick={() => { setIsReplying(false); setNewComment(""); }} 
                            className="!text-zinc-500 !font-bold !text-[10px]" 
                          />
                          <Button 
                            intent="success" 
                            text="COMMIT_LOG" 
                            onClick={handleCommentSubmit} 
                            disabled={!newComment.trim()}
                            className="!rounded-lg !px-6 !font-black !text-[10px]" 
                          />
                        </div>
                      </div>
                    )}

                    {/* EMPTY STATE OR LIST */}
                    {(!ratingsPage || !ratingsPage.comments || ratingsPage.comments.length === 0) ? (
                      !isReplying && (
                        <div className="!bg-zinc-900/30 !border-2 !border-dashed !border-white/5 !rounded-3xl !p-12 !flex !flex-col !items-center !text-center">
                          <div className="!text-zinc-600 !mb-4 !text-[10px] !uppercase !tracking-widest">No_Logs_Found</div>
                          <Button 
                              intent="success" 
                              outlined 
                              className="!font-black !tracking-widest !text-[10px] !rounded-lg"
                              text="BE THE FIRST TO COMMENT"
                              onClick={() => setIsReplying(true)} 
                            />
                        </div>
                      )
                    ) : (
                      <div className="!space-y-4">
                        {ratingsPage.comments?.map((entry, idx) => (
                          <div 
                            key={idx} 
                            className="!bg-zinc-900 !border !border-white/5 !p-5 !rounded-2xl !transition-all hover:!bg-zinc-800/50"
                          >
                            <div className="!flex !justify-between !items-start !mb-4">
                              <div className="!flex !items-center !gap-3">
                                <div className="!w-8 !h-8 !bg-emerald-500/10 !border !border-emerald-500/20 !rounded-lg !flex !items-center !justify-center !text-emerald-500 !font-bold !text-xs">
                                  {entry.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="!text-sm !font-black !text-zinc-200 !tracking-tight">@{entry.username}</div>
                                  <div className="!text-[9px] !text-zinc-500 !font-mono">UID_{entry.userId}</div>
                                </div>
                              </div>
                              <div className="!bg-black !px-3 !py-1 !rounded-md !border !border-emerald-500/30 !text-emerald-500 !font-black !text-xs">
                                {entry.rating.toFixed(1)}
                              </div>
                            </div>
                            <p className="!text-zinc-400 !text-sm italic">"{entry.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* 3. FIXED FOOTER: Always remains visible at the bottom */}
          <div className={`${Classes.DRAWER_FOOTER} !bg-zinc-950 !p-6 !border-t !border-emerald-500/20 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]`}>
            <Button 
              fill 
              intent="success" 
              large
              text="INITIALIZE WORKSPACE" 
              icon="document-open"
              className="!py-7 !font-black !tracking-[0.2em] !rounded-xl !bg-emerald-600 hover:!bg-emerald-500 !transition-all"
            />
          </div>
        </div>
      </Drawer>
          
    </div>
  );
}