"use client"; // This directive marks the component as a Client Component in Next.js

import { useState, useEffect, FormEvent } from 'react';

// Define the structure (TypeScript interface) for a Project object
interface Project {
  id: number;
  title: string;
  synopsis: string | null;
}

// Main component for our application
export default function HomePage() {
  // State variables to manage the list of projects, modal visibility, and loading/error states
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The base URL for your running FastAPI backend
  const API_URL = 'http://127.0.0.1:8000';

  // --- Data Fetching and CRUD Operations ---

  // useEffect hook to fetch projects when the component first loads
  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to fetch all projects from the API
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/projects/`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects. Is the backend server running?');
      }
      const data: Project[] = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle both creating a new project and updating an existing one
  const handleCreateOrUpdate = async (projectData: { title: string; synopsis: string | null }) => {
    const method = selectedProject ? 'PUT' : 'POST';
    const url = selectedProject ? `${API_URL}/projects/${selectedProject.id}` : `${API_URL}/projects/`;
    
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error('Failed to save the project.');
      
      await fetchProjects(); // Refresh the project list
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save.');
    }
  };

  // Function to delete a project
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete the project.');
        await fetchProjects(); // Refresh the project list
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete.');
      }
    }
  };

  // --- UI Helper Functions ---

  // Opens the modal for creating (project=null) or editing (project=object)
  const openModal = (project: Project | null) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Closes the modal and resets the selected project
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // --- Render Logic ---

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-100"><p className="text-xl">Loading projects...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen bg-red-100"><p className="text-xl text-red-600">Error: {error}</p></div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Project Dashboard</h1>
          <button
            onClick={() => openModal(null)}
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Add New Project
          </button>
        </header>

        {/* Grid for displaying project cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h2>
                <p className="text-gray-600 text-sm">{project.synopsis || 'No synopsis provided.'}</p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => openModal(project)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(project.id)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Conditionally render the modal */}
      {isModalOpen && (
        <ProjectModal
          project={selectedProject}
          onClose={closeModal}
          onSave={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}

// A separate component for the modal form to keep the code clean
function ProjectModal({ project, onClose, onSave }: { project: Project | null, onClose: () => void, onSave: (data: { title: string, synopsis: string | null }) => void }) {
  const [title, setTitle] = useState(project?.title || '');
  const [synopsis, setSynopsis] = useState(project?.synopsis || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        alert("Title is required.");
        return;
    }
    onSave({ title, synopsis });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{project ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700 mb-1">Synopsis</label>
            <textarea
              id="synopsis"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}