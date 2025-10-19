"use client";

import { useState, FormEvent } from 'react';

const API_URL = 'http://127.0.0.1:8000';

interface SimilarProject {
    id: number;
    title: string;
    similarity_score: number;
}

interface CheckResult {
    is_original: boolean;
    message: string;
    similar_projects: SimilarProject[];
}

export default function OriginalityChecker({ token }: { token: string | null }) {
    const [title, setTitle] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError('');

        try {
            const response = await fetch(`${API_URL}/projects/check-originality`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, synopsis }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to check project originality.");
            }
            setResult(await response.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score > 0.8) return 'text-red-400';
        if (score > 0.6) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-purple-400/30 pb-3 flex-shrink-0">Project Originality Checker</h2>
            <form onSubmit={handleSubmit} className="flex-shrink-0">
                <div className="mb-4">
                    <label htmlFor="check-title" className="block text-sm font-medium text-gray-300 mb-1">Project Title</label>
                    <input id="check-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm bg-slate-800 text-white focus:ring-purple-500 focus:border-purple-500" required />
                </div>
                <div className="mb-6">
                    <label htmlFor="check-synopsis" className="block text-sm font-medium text-gray-300 mb-1">Synopsis</label>
                    <textarea id="check-synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={5} className="w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm bg-slate-800 text-white focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors" disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : 'Check Originality'}
                </button>
            </form>

            <div className="mt-6 flex-grow overflow-y-auto custom-scrollbar pr-2">
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                
                {result && (
                    <div className="mt-2">
                        <h3 className={`text-lg font-semibold text-center ${result.is_original ? 'text-green-400' : 'text-red-400'}`}>
                            {result.message}
                        </h3>
                        {result.similar_projects.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <h4 className="font-bold text-white">Most Similar Projects:</h4>
                                {result.similar_projects.map(p => (
                                    <div key={p.id} className="bg-slate-800/60 p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-300">{p.title}</p>
                                            <p className={`font-bold text-lg ${getScoreColor(p.similarity_score)}`}>
                                                {(p.similarity_score * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
