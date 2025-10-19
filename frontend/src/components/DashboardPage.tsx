"use client";

import { useState, useEffect } from 'react';
import ProjectModal from './ProjectModal';
import OriginalityChecker from './OriginalityChecker';
import DashboardLoading from './DashboardLoading';

interface Project {
  id: number;
  title: string;
  synopsis: string | null;
  owner_id: number | null;
  status: 'pending' | 'approved' | 'rejected';
}
type Role = 'student' | 'teacher';

const API_URL = 'http://127.0.0.1:8000';

export default function DashboardPage({ role, token, onLogout }: { role: Role, token: string | null, onLogout: () => void }) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [mentoredProjects, setMentoredProjects] = useState<Project[]>([]);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [role]);

  const getAuthHeader = () => token ? { 'Authorization': `Bearer ${token}` } : {};

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const allProjectsResponse = await fetch(`${API_URL}/projects`, { headers: getAuthHeader() });
        if (!allProjectsResponse.ok) { if (allProjectsResponse.status === 401) onLogout(); throw new Error('Failed to fetch university projects.'); }
        setAllProjects(await allProjectsResponse.json());

        if (role === 'student') {
            const myProjectsResponse = await fetch(`${API_URL}/projects/my-projects`, { headers: getAuthHeader() });
            if (!myProjectsResponse.ok) throw new Error('Failed to fetch your projects.');
            setMyProjects(await myProjectsResponse.json());
        }
        
        if (role === 'teacher') {
            const mentoredResponse = await fetch(`${API_URL}/projects/mentored`, { headers: getAuthHeader() });
            if (!mentoredResponse.ok) throw new Error('Failed to fetch mentored projects.');
            setMentoredProjects(await mentoredResponse.json());

            const pendingResponse = await fetch(`${API_URL}/projects/pending`, { headers: getAuthHeader() });
            if (!pendingResponse.ok) throw new Error('Failed to fetch pending projects.');
            setPendingProjects(await pendingResponse.json());
        }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (projectData: { title: string; synopsis: string | null; mentor_email?: string }) => {
    const isUpdating = !!selectedProject;
    const method = isUpdating ? 'PUT' : 'POST';
    const url = isUpdating ? `${API_URL}/projects/${selectedProject.id}` : `${API_URL}/projects`;
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify(projectData) });
      if (response.status === 401) { alert("Authentication error."); onLogout(); return; }
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.detail || 'Failed to save project.'); }
      await fetchAllData();
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error while saving.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure?')) {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE', headers: getAuthHeader() });
        if (response.status === 401) { alert("Authentication error."); onLogout(); return; }
        if (response.status !== 204) { throw new Error('Failed to delete project.'); }
        await fetchAllData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error while deleting.');
      }
    }
  };

  const handleApprovalAction = async (id: number, action: 'approve' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this project?`)) return;
    try {
        const response = await fetch(`${API_URL}/projects/${id}/${action}`, { method: 'PUT', headers: getAuthHeader() });
        if (response.status === 401) { alert("Authentication error."); onLogout(); return; }
        if (!response.ok) { throw new Error(`Failed to ${action} project.`); }
        await fetchAllData();
    } catch (err) {
        alert(err instanceof Error ? err.message : `Error while ${action}ing.`);
    }
  };
  
  const commonHeader = (
    <header className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
            <h1 className="text-4xl font-bold text-white">Project Dashboard</h1>
            <p className="text-gray-400">Logged in as: <span className="font-semibold capitalize text-cyan-400">{role}</span></p>
        </div>
        <button onClick={onLogout} className="ml-4 bg-gray-700/50 backdrop-blur-sm border border-white/20 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600/50 transition-colors">Logout</button>
    </header>
  );

  const renderContent = () => {
    if (error) return <p className="relative z-10 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>;

    if (role === 'teacher') {
      return (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
            <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-slate-900/50 p-6 rounded-lg border border-yellow-500/30 flex flex-col flex-1 min-h-0">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-yellow-500/30 pb-3 flex-shrink-0">Pending Approvals</h2>
                    <div className="space-y-4 overflow-y-auto flex-grow custom-scrollbar pr-2">
                        {pendingProjects.length > 0 ? pendingProjects.map(p => (
                            <div key={p.id} className="bg-slate-800/60 p-4 rounded-md">
                                <h3 className="font-semibold text-yellow-300">{p.title}</h3>
                                <div className="mt-2 flex gap-2">
                                    <button onClick={() => handleApprovalAction(p.id, 'approve')} className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-full">Approve</button>
                                    <button onClick={() => handleApprovalAction(p.id, 'reject')} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full">Reject</button>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 italic">No projects are pending approval.</p>}
                    </div>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-lg border border-purple-400/30 flex flex-col flex-1 min-h-0">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-purple-400/30 pb-3 flex-shrink-0">My Mentored Projects</h2>
                    <div className="space-y-4 overflow-y-auto flex-grow custom-scrollbar pr-2">
                        {mentoredProjects.length > 0 ? mentoredProjects.map(p => (
                            <div key={p.id} className="bg-slate-800/60 p-4 rounded-md">
                                <h3 className="font-semibold text-purple-300">{p.title}</h3>
                            </div>
                        )) : <p className="text-gray-500 italic">No approved projects assigned to you yet.</p>}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-8 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-white">All Approved Projects</h2>
                  <button onClick={() => { setSelectedProject(null); setIsModalOpen(true); }} className="relative inline-flex items-center justify-center p-0.5 text-sm font-medium text-gray-300 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500">
                    <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">Add Project</span>
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 overflow-y-auto flex-grow custom-scrollbar pr-2">
                    {allProjects.map(p => <ProjectCard key={p.id} project={p} canEdit={true} role={role} onEditClick={() => {setSelectedProject(p); setIsModalOpen(true);}} onDeleteClick={() => handleDelete(p.id)} />)}
                </div>
            </div>
        </div>
      );
    }

    if (role === 'student') {
        return (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
                <div className="lg:col-span-4 bg-slate-900/50 p-6 rounded-lg border border-purple-400/20 flex flex-col">
                    <OriginalityChecker token={token} />
                </div>
                <div className="lg:col-span-8 flex flex-col">
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-2xl font-bold text-white">My Registered Projects</h2>
                            <button onClick={() => { setSelectedProject(null); setIsModalOpen(true); }} className="relative inline-flex items-center justify-center p-0.5 text-sm font-medium text-gray-300 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500">
                                <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">Register New Project</span>
                            </button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 overflow-y-auto flex-grow custom-scrollbar pr-2 mb-8">
                             {myProjects.length > 0 ? myProjects.map(p => <ProjectCard key={p.id} project={p} canEdit={p.status === 'pending'} role={role} onEditClick={() => {setSelectedProject(p); setIsModalOpen(true);}} onDeleteClick={() => handleDelete(p.id)} />) : <p className="text-gray-500 italic col-span-2">You have not registered any projects yet.</p>}
                        </div>
                    </div>
                     <div className="flex-1 flex flex-col min-h-0">
                        <h2 className="text-2xl font-bold text-white mb-4 flex-shrink-0">Approved University Projects (Read-Only)</h2>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 overflow-y-auto flex-grow custom-scrollbar pr-2">
                            {allProjects.map(p => <ProjectCard key={p.id} project={p} canEdit={false} role={role} />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="animated-bg min-h-screen font-sans text-gray-300 relative">
        <main className="container mx-auto p-8 relative z-10">
            {commonHeader}
            {isLoading ? <DashboardLoading /> : renderContent()}
        </main>
        {isModalOpen && (
            <ProjectModal role={role} project={selectedProject} onClose={() => { setIsModalOpen(false); setSelectedProject(null); }} onSave={handleSave} />
        )}
    </div>
  );
}

const ProjectCard = ({ project, canEdit, role, onEditClick, onDeleteClick }: { project: Project, canEdit: boolean, role: Role, onEditClick?: () => void, onDeleteClick?: () => void }) => {
    const getStatusBadge = () => {
        if (role !== 'student') return null;
        switch (project.status) {
            case 'pending': return <span className="text-xs font-bold px-2 py-1 rounded-full text-yellow-300 bg-yellow-900/50">Pending</span>;
            case 'approved': return <span className="text-xs font-bold px-2 py-1 rounded-full text-green-300 bg-green-900/50">Approved</span>;
            case 'rejected': return <span className="text-xs font-bold px-2 py-1 rounded-full text-red-300 bg-red-900/50">Rejected</span>;
            default: return null;
        }
    };
    const borderColor = project.status === 'pending' ? 'border-yellow-500/50' : project.status === 'rejected' ? 'border-red-500/50' : 'border-cyan-400/20';

    return (
      <div className={`group relative bg-slate-900/70 backdrop-blur-sm rounded-lg overflow-hidden border ${borderColor} transition-all duration-300`}>
          <div className="p-6 flex flex-col justify-between h-full">
              <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300 pr-4">{project.title}</h2>
                    {getStatusBadge()}
                  </div>
                  <p className="text-gray-400 text-sm h-24 overflow-y-auto custom-scrollbar">{project.synopsis || 'No synopsis provided.'}</p>
              </div>
              {canEdit && (
                  <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-cyan-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={onEditClick} className="text-sm font-medium text-cyan-400 hover:text-cyan-300">Edit</button>
                      <button onClick={onDeleteClick} className="text-sm font-medium text-red-500 hover:text-red-400">Delete</button>
                  </div>
              )}
          </div>
      </div>
    );
}
