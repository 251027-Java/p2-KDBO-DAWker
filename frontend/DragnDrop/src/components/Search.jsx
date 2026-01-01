import { useState} from 'react';

export default function Search() {
    const [query, setQuery] = useState('');

    const results = projects.filter(project => {
        const q = query.toLowerCase();
        const projectMatch = project.name.toLowerCase().includes(q) || project.description.toLowerCase().includes(q); 
        const configMatch = project.listOfConfigs.some(cfg =>
            cfg.name.toLowerCase().includes(q)
        );

        const componentMatch = project.listOfConfigs.some(cfg =>
            cfg.componentChain.some(c =>
                c.name.toLowerCase().includes(q)

            )
        );

        return projectMatch || configMatch || componentMatch;
    });

    return (
        <div className = "min-h-screen bg-zinc-900">
            {/* Search Bar */}
            <div className = "sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4">
                <input 
                    value = {query}
                    onChange = {e => setQuery(e.target.value)}
                    placeholder = "Search rigs, effects, projects"
                    className = "w-full px-4 py-3 rounded-full bg-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Search Results */}
            <div className = "max-w-2xl mx-auto px-4 py-6 space-y-4">
                {results.map(project => (
                    <div
                        key = {project.id}
                        className = "p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition"
                        >
                            <h3 className = "text-lg font-semibold">
                                {project.name}
                            </h3>

                            <div className = "text-sm text-zinc-400 mt-1">
                                by User {project.userId}
                            </div>
                            <div className = "mt-3 space-y-2">
                                {project.listOfConfigs.map(cfg => (
                                    <div key = {cfg.name}>
                                        <div className = "text-sm font-medium text-indigo-400">
                                            {cfg.name}
                                        </div>

                                        <div className = "flex flex-wrap gap-2 mt-1">
                                            {cfg.componentChain.map(c => (
                                                <span
                                                    key = {c.name}
                                                    className = "text-xs bg-zinc-700 px-2 py-1 rounded-full"
                                                >
                                                    {c.name}
                                                    </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                ))}
            {query && results.length === 0 && (
                <div className = "text-center text-zinc-500 pt-10">
                    No results found for "{query}"
                </div>
            )}
            </div>
        </div>
    );   
}