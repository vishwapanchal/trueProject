"use client";

import { useState, FormEvent } from 'react';

interface Project {
  id: number;
  title: string;
  synopsis: string | null;
}

interface ProjectModalProps {
  project: Project | null;
  role: 'student' | 'teacher';
  onClose: () => void;
  onSave: (data: { title: string, synopsis: string | null, mentor_email?: string }) => void;
}

export default function ProjectModal({ project, role, onClose, onSave }: ProjectModalProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [synopsis, setSynopsis] = useState(project?.synopsis || '');
  const [mentorEmail, setMentorEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { alert("Title is required."); return; }
    
    const projectData: { title: string, synopsis: string | null, mentor_email?: string } = { title, synopsis };

    if (role === 'student' && !project) {
        if (!mentorEmail.trim()) { alert("Mentor's email is required."); return; }
        projectData.mentor_email = mentorEmail;
    }

    onSave(projectData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{project ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700 mb-1">Synopsis</label>
            <textarea id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          {role === 'student' && !project && (
            <div className="mb-6">
                <label htmlFor="mentorEmail" className="block text-sm font-medium text-gray-700 mb-1">Mentor's Email</label>
                <input id="mentorEmail" type="email" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" placeholder="teacher@example.com" required />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
