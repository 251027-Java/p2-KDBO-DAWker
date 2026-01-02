"use client";

import React, { useEffect, useState } from 'react';

type Rating = { userId: string | number; rating: number; comment?: string };
type LocalProject = {
  id: number;
  dawId: number;
  userId: string | number;
  name: string;
  description: string;
  listOfConfigs: { name: string; componentChain: { name: string }[] }[];
  ratings?: Rating[];
};

const projects: LocalProject[] = [
  {
    id: 1,
    dawId: 2183908290381,
    userId: 'omar',
    name: 'Lo-Fi Beat',
    description: 'Warm tape saturation and crunchy drums',
    listOfConfigs: [{ name: 'Default', componentChain: [{ name: 'Chorus' }, { name: 'Delay' }] }],
    ratings: [{ userId: 'omar', rating: 5, comment: 'Great vibe' }, { userId: 'alice', rating: 4, comment: 'Nice textures' }]
  },
  {
    id: 2,
    dawId: 2183908290382,
    userId: 'alice',
    name: 'Ambient Pad',
    description: 'Evolving pad with long reverb tails',
    listOfConfigs: [{ name: 'Pad-Long', componentChain: [{ name: 'Reverb' }, { name: 'Phaser' }] }],
    ratings: [{ userId: 'bob', rating: 3, comment: 'Good, needs work' }]
  },
  {
    id: 3,
    dawId: 2183908290383,
    userId: 'bob',
    name: 'Crunch Rhythm',
    description: 'Aggressive overdriven rhythm with gated delay',
    listOfConfigs: [{ name: 'Crunch', componentChain: [{ name: 'Overdrive' }, { name: 'Delay' }] }],
    ratings: []
  }
];

export default function Search() {
  const [query, setQuery] = useState<string>('');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dawker_user');
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch (err) {
      // ignore
    }

    const handler = (e: any) => setCurrentUser(e.detail);
    window.addEventListener('dawker:login', handler as EventListener);
    return () => window.removeEventListener('dawker:login', handler as EventListener);
  }, []);

  const results = projects.filter((project) => {
    const q = query.toLowerCase();
    const projectMatch = project.name.toLowerCase().includes(q) || project.description.toLowerCase().includes(q);
    const configMatch = project.listOfConfigs.some(cfg => cfg.name.toLowerCase().includes(q));
    const componentMatch = project.listOfConfigs.some(cfg => cfg.componentChain.some(c => c.name.toLowerCase().includes(q)));
    return projectMatch || configMatch || componentMatch;
  });

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rigs, effects, projects"
            className="w-full px-4 py-3 rounded-full bg-zinc-800 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <label className="flex items-center gap-2 ml-3 text-sm text-zinc-300">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="rounded" />
            My DAWs
          </label>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {results
          .filter(p => !onlyMine || (currentUser && String(p.userId) === String(currentUser.name || currentUser.email?.split?.('@')?.[0] || currentUser.email)))
          .map(project => (
            <div key={project.id} className="p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <div className="text-sm text-zinc-400 mt-1">by User {project.userId}</div>
              <div className="mt-2 text-sm text-yellow-300">
                {project.ratings && project.ratings.length > 0 ? (
                  <>
                    Avg: {(project.ratings.reduce((a, b) => a + b.rating, 0) / project.ratings.length).toFixed(1)} • {project.ratings.length} ratings
                  </>
                ) : 'No ratings yet'}
              </div>
              {currentUser && (
                <div className="mt-1 text-xs text-zinc-400">Your rating: {(() => {
                  const unr = project.ratings?.find(r => String(r.userId) === String(currentUser.email?.split?.('@')?.[0] || currentUser.name));
                  return unr ? `${unr.rating} — ${unr.comment}` : 'none';
                })()}</div>
              )}

              <div className="mt-3 space-y-2">
                {project.listOfConfigs.map(cfg => (
                  <div key={cfg.name}>
                    <div className="text-sm font-medium text-indigo-400">{cfg.name}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {cfg.componentChain.map(c => (
                        <span key={c.name} className="text-xs bg-zinc-700 px-2 py-1 rounded-full">{c.name}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {query && results.length === 0 && (
          <div className="text-center text-zinc-500 pt-10">No results found for "{query}"</div>
        )}
      </div>
    </div>
  );
}