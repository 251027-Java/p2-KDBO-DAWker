"use client"; // 1. Must add this at the very top

import React, { useState, ChangeEvent, useEffect } from 'react';
import { dawAPI } from '../utils/dawAPI';
import { DawDTO } from '../dtos/types';

export default function Search() { // 2. Remove 'async'
  const [query, setQuery] = useState<string>('');
  const [allProjects, setAllProjects] = useState<DawDTO[]>([]); // 3. State for raw data
  const [loading, setLoading] = useState(true);

  // 4. Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dawAPI.getAllDaws();
        setAllProjects(data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 5. Filter the data locally based on the query
  const results = allProjects.filter((project) => {
    const q = query.toLowerCase();
    const projectMatch = project.name.toLowerCase().includes(q);

    // Use Optional Chaining (?.) to prevent crashes if arrays are missing
    const configMatch = project.listOfConfigs?.some(cfg =>
      cfg.name.toLowerCase().includes(q)
    );

    const componentMatch = project.listOfConfigs?.some(cfg =>
      // Verify if it is .components or .componentChain based on your Entity!
      cfg.components?.some(c => c.name.toLowerCase().includes(q))
    );

    return projectMatch || configMatch || componentMatch;
  });

  if (loading) return <div className="p-10 text-white">Loading Rigs...</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Search Bar */}
      <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rigs, effects, projects"
          className="w-full px-4 py-3 rounded-full bg-zinc-800 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Results Rendering ... same as your previous code */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
         {results.map(project => (
           <div key={project.dawId} className="p-4 bg-zinc-800 rounded-xl">
              {project.name}
           </div>
         ))}
      </div>
    </div>
  );
}