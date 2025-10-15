"use client";

import { useState, useEffect, FormEvent } from 'react';

// --- Type Definitions ---
interface Project {
  id: number;
  title: string;
  synopsis: string | null;
}
type Role = 'student' | 'teacher';

const API_URL = 'http://127.0.0.1:8000';

// --- Main Application Component ---
// This component manages the overall authentication state.
export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // This effect runs once when the app loads to check for a saved token.
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      setRole('teacher'); // Assume a stored token always belongs to a teacher
    }
  }, []);

  // Function passed to the login page to update the app's state upon successful login.
  const handleLogin = (newToken: string) => {
    localStorage.setItem('authToken', newToken); // Save token for future visits
    setToken(newToken);
    setRole('teacher');
  };

  // Function to log the user out and clear the state.
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setRole(null);
  };
  
  // If no role is set, show the authentication page.
  if (!role) {
    return <AuthPage onLogin={handleLogin} onEnterAsStudent={() => setRole('student')} />;
  }

  // If a role is set, show the main project dashboard.
  return <ProjectDashboard role={role} token={token} onLogout={handleLogout} />;
}


// --- New Animated Authentication Page Component ---
function AuthPage({ onLogin, onEnterAsStudent }: { onLogin: (token: string) => void, onEnterAsStudent: () => void }) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };
  
  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://scontent.fblr1-5.fna.fbcdn.net/v/t39.30808-6/490023287_1070278868455840_4155820231768688415_n.jpg?stp=cp6_dst-jpg_s960x960_tt6&_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=N4hOXKwWKsIQ7kNvwFNpZbv&_nc_oc=AdlNa17S0iNq1qExM4sE1tHUcF8wUaPWYlJsnmWwCTmUZ_sP09oI_fPo-0rBYjMnhnsMgjuuZfI8UFM20dMPAdmx&_nc_zt=23&_nc_ht=scontent.fblr1-5.fna&_nc_gid=WTxy0CsL0OfxrqrGAXSxxA&oh=00_AfdXbkWdG7Am6zMmPA2PGHFJ8wQGHvVLcSojQNpj5L7oNQ&oe=68F5D718')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      
      <div className="relative z-10 text-center mb-8">
          <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyawIRbc2YMupSsJT8UqUJmMJD4M4kWJ5CGg&s" 
              alt="Project Logo" 
              className="mx-auto h-24 w-24 rounded-full shadow-lg border-2 border-white/50"
          />
          <h1 className="mt-6 text-3xl font-bold text-white">Welcome to trueProject</h1>
      </div>

      {/* Main animated container */}
      <div className="relative z-10 w-full max-w-4xl h-[550px] bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Form Container */}
        <div className={`absolute top-0 h-full w-1/2 p-8 flex flex-col justify-center transition-all duration-700 ease-in-out ${isLoginMode ? 'left-0' : 'left-1/2'}`}>
          <AuthForm isLogin={isLoginMode} onLogin={onLogin} />
        </div>

        {/* Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isLoginMode ? '' : '-translate-x-full'}`}>
          <div className={`relative bg-gradient-to-r from-blue-600 to-purple-600 h-full w-[200%] transition-transform duration-700 ease-in-out ${isLoginMode ? 'translate-x-0' : 'translate-x-1/2'}`}>
            
            {/* Left Overlay Panel (for Register) */}
            <div className="absolute top-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-white transform -translate-x-full">
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="mt-4">Already have a teacher account? Log in to manage projects.</p>
              <button onClick={toggleMode} className="mt-6 bg-transparent border-2 border-white rounded-full py-2 px-8 uppercase font-semibold hover:bg-white/10 transition-colors">Login</button>
            </div>

            {/* Right Overlay Panel (for Login) */}
            <div className="absolute top-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-white transform translate-x-0">
               <h1 className="text-3xl font-bold">New Here?</h1>
              <p className="mt-4">Join us and start your journey. Register a new teacher account.</p>
              <button onClick={toggleMode} className="mt-6 bg-transparent border-2 border-white rounded-full py-2 px-8 uppercase font-semibold hover:bg-white/10 transition-colors">Register</button>
            </div>

          </div>
        </div>
      </div>
       <button onClick={onEnterAsStudent} className="relative z-10 mt-8 w-full max-w-sm bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Continue as Student</button>
      <footer className="absolute z-10 bottom-4 text-center text-sm text-white/70">
          <p>&copy; 2025 all rights reserved</p>
          <p>Designed and developed by Vishwa Panchal and Yashwanth MU</p>
      </footer>
    </div>
  );
}

// --- Reusable Form Component for Login and Register ---
function AuthForm({ isLogin, onLogin }: { isLogin: boolean, onLogin: (token: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const endpoint = isLogin ? '/login' : '/register';
        const body = isLogin 
            ? new URLSearchParams({ username: email, password })
            : JSON.stringify({ email, password });
        const headers = isLogin 
            ? { 'Content-Type': 'application/x-www-form-urlencoded' }
            : { 'Content-Type': 'application/json' };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: body,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'An error occurred.');

            if (isLogin) {
                onLogin(data.access_token);
            } else {
                setMessage('Registration successful! Please log in.');
                // Here you might want to automatically switch to login or just show the message
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full text-white">
            <h2 className="text-3xl font-bold text-center mb-6">
                {isLogin ? 'Teacher Login' : 'Create Account'}
            </h2>
            
            {error && <p className="bg-red-500/50 text-white p-3 rounded-md mb-4 text-center">{error}</p>}
            {message && <p className="bg-green-500/50 text-white p-3 rounded-md mb-4 text-center">{message}</p>}
            
            <div className="mb-4">
                <label className="block text-gray-200 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="mb-6">
                <label className="block text-gray-200 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors" disabled={loading}>
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
        </form>
    );
}

// --- Project Dashboard Component ---
// This component displays the projects and handles CRUD operations.
function ProjectDashboard({ role, token, onLogout }: { role: Role, token: string | null, onLogout: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fetch projects and trigger entry animation
  useEffect(() => {
    fetchProjects();
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper to create the Authorization header for protected API calls.
  const getAuthHeader = () => token ? { 'Authorization': `Bearer ${token}` } : {};

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects. Is the backend running?');
      setProjects(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (projectData: { title: string; synopsis: string | null }) => {
    const isUpdating = !!selectedProject;
    const method = isUpdating ? 'PUT' : 'POST';
    const url = isUpdating ? `${API_URL}/projects/${selectedProject.id}` : `${API_URL}/projects`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(projectData),
      });

      if (response.status === 401) {
          alert("Authentication error. Your session may have expired. Please log in again.");
          onLogout();
          return;
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to save the project.');
      }
      
      await fetchProjects();
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while saving.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`, { 
            method: 'DELETE', 
            headers: getAuthHeader() 
        });

        if (response.status === 401) {
          alert("Authentication error. Your session may have expired. Please log in again.");
          onLogout();
          return;
        }
        if (response.status !== 204) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Failed to delete the project.');
        }

        await fetchProjects();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'An error occurred while deleting.');
      }
    }
  };
  
  return (
    <div className="bg-[#0a192f] min-h-screen font-sans text-gray-300">
      <main className="container mx-auto p-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <div>
                <h1 className="text-4xl font-bold text-white">Project Dashboard</h1>
                <p className="text-gray-400">Logged in as: <span className="font-semibold capitalize text-cyan-400">{role}</span></p>
            </div>
            <div className="flex items-center">
                {role === 'teacher' && (
                  <button onClick={() => { setSelectedProject(null); setIsModalOpen(true); }} className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-300 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-800">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">
                      Add Project
                    </span>
                  </button>
                )}
                <button onClick={onLogout} className="ml-4 bg-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">Logout</button>
            </div>
        </header>

        {isLoading && <p className="text-center text-cyan-400">Loading projects...</p>}
        {error && <p className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}

        {!isLoading && !error && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
                <div 
                    key={project.id} 
                    className={`group relative bg-slate-900/70 backdrop-blur-sm rounded-lg overflow-hidden border border-cyan-400/20 transition-all duration-500 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                >
                    <div className="absolute top-0 left-[-100%] h-full w-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transition-all duration-700 group-hover:left-[100%]"></div>
                    
                    <div className="p-6 flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">{project.title}</h2>
                            <p className="text-gray-400 text-sm h-24 overflow-y-auto">{project.synopsis || 'No synopsis provided.'}</p>
                        </div>
                        {role === 'teacher' && (
                            <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-cyan-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => { setSelectedProject(project); setIsModalOpen(true); }} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Edit</button>
                                <button onClick={() => handleDelete(project.id)} className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Delete</button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            </div>
        )}
      </main>

      {isModalOpen && role === 'teacher' && (
        <ProjectModal
          project={selectedProject}
          onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// --- Project Modal Component ---
// This component is the pop-up form for creating/editing projects.
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{project ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div className="mb-6">
            <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700 mb-1">Synopsis</label>
            <textarea id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
          </div>
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

