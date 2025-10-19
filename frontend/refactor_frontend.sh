#!/bin/bash

# --- Automated Frontend Refactoring Script (v30.2 - Reposition Widgets) ---

echo "Starting frontend refactor to reposition widgets..."

# 1. Ensure directory structure is correct
mkdir -p src/components

# 2. Recreate module files
rm -f src/app/page.tsx src/components/AuthPage.tsx src/components/DashboardPage.tsx src/components/ProjectModal.tsx src/components/OriginalityChecker.tsx src/components/LoadingScreen.tsx src/components/AnimatedTitle.tsx src/components/DashboardLoading.tsx src/components/AnalogClock.tsx src/components/WeatherWidget.tsx tailwind.config.ts
touch src/app/page.tsx src/components/AuthPage.tsx src/components/DashboardPage.tsx src/components/ProjectModal.tsx src/components/OriginalityChecker.tsx src/components/LoadingScreen.tsx src/components/AnimatedTitle.tsx src/components/DashboardLoading.tsx src/components/AnalogClock.tsx src/components/WeatherWidget.tsx tailwind.config.ts

echo "Populating new component files..."

# --- tailwind.config.ts ---
cat > tailwind.config.ts << 'EOL'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'stalinist': ['"Stalinist One"', 'sans-serif'],
        'rock-salt': ['"Rock Salt"', 'cursive'],
      },
      animation: {
        'gradient-text': 'gradient-text 5s ease infinite',
        'bounce-slow': 'bounce-slow 4s infinite',
      },
      keyframes: {
        'gradient-text': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(5%)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
EOL

# --- src/app/page.tsx ---
cat > src/app/page.tsx << 'EOL'
"use client";

import { useState, useEffect } from 'react';
import AuthPage from '@/components/AuthPage';
import DashboardPage from '@/components/DashboardPage';
import LoadingScreen from '@/components/LoadingScreen';

type Role = 'student' | 'teacher';

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('authRole') as Role;
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
    setIsAuthReady(true);
  }, []);

  const handleLogin = (newToken: string, newRole: Role) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authRole', newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    setToken(null);
    setRole(null);
  };
  
  if (isLoading) {
    return <LoadingScreen onAnimationComplete={() => setIsLoading(false)} />;
  }

  if (!isAuthReady) {
    return <div className="bg-slate-900 min-h-screen"></div>;
  }

  if (!role) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <DashboardPage role={role} token={token} onLogout={handleLogout} />;
}
EOL

# --- src/components/AnimatedTitle.tsx ---
cat > src/components/AnimatedTitle.tsx << 'EOL'
"use client";

import { useState, useEffect } from 'react';

const AnimatedTitle = () => {
    const [displayText, setDisplayText] = useState('');
    const targetText = "trueProject";
    const scrambleChars = "01#?*&<>";

    useEffect(() => {
        let currentText = ' '.repeat(targetText.length).split('');
        let intervalIds: NodeJS.Timeout[] = [];

        targetText.split('').forEach((char, index) => {
            let iteration = 0;
            const scrambleInterval = setInterval(() => {
                iteration++;
                if (iteration > (index + 1) * 2) {
                    clearInterval(scrambleInterval);
                    currentText[index] = targetText[index];
                    setDisplayText(currentText.join(''));
                } else {
                    currentText[index] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    setDisplayText(currentText.join(''));
                }
            }, 75);
            intervalIds.push(scrambleInterval);
        });

        return () => intervalIds.forEach(clearInterval);
    }, []);

    const isComplete = displayText === targetText;

    return (
        <h1 className={`mt-4 text-5xl transition-all duration-500 ${isComplete ? 'font-rock-salt' : 'font-mono'}`}>
            {isComplete ? (
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent animate-gradient-text motion-safe:animate-bounce-slow">
                    {displayText}
                </span>
            ) : (
                <span className="text-slate-300">{displayText}</span>
            )}
        </h1>
    );
};

export default AnimatedTitle;
EOL

# --- src/components/WeatherWidget.tsx ---
cat > src/components/WeatherWidget.tsx << 'EOL'
"use client";

import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

const API_URL = 'http://127.0.0.1:8000';

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(`${API_URL}/weather`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || "Weather service is unavailable.");
                }
                const data = await response.json();
                setWeather({
                    temp: Math.round(data.temp),
                    description: data.description,
                    icon: data.icon,
                    city: data.city,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            }
        };

        fetchWeather();
    }, []);

    return (
        <div className="w-48 h-24 rounded-2xl bg-slate-800/50 backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center p-4 text-white">
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            {!weather && !error && <p className="text-xs">Loading weather...</p>}
            {weather && (
                <div className="flex items-center gap-4">
                    <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} className="w-12 h-12" />
                    <div className="text-left">
                        <p className="text-3xl font-bold">{weather.temp}°C</p>
                        <p className="text-xs capitalize">{weather.city}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
EOL

# --- src/components/AnalogClock.tsx ---
cat > src/components/AnalogClock.tsx << 'EOL'
"use client";

import { useState, useEffect, useRef } from 'react';

export default function AnalogClock() {
    const [time, setTime] = useState(new Date());
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const updateClock = () => {
            setTime(new Date());
            animationFrameId.current = requestAnimationFrame(updateClock);
        };
        animationFrameId.current = requestAnimationFrame(updateClock);
        return () => {
            if(animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    const seconds = time.getSeconds() + time.getMilliseconds() / 1000;
    const minutes = time.getMinutes() + seconds / 60;
    const hours = time.getHours() + minutes / 60;

    const secondDegrees = (seconds / 60) * 360 + 90;
    const minuteDegrees = (minutes / 60) * 360 + 90;
    const hourDegrees = (hours / 12) * 360 + 90;

    return (
        <div className="w-36 h-36 rounded-full bg-slate-800/50 backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center relative">
            <div className="w-2 h-2 bg-white rounded-full absolute z-10"></div>
            <div className="w-full h-full relative">
                <div style={{ transform: `rotate(${hourDegrees}deg)` }} className="w-1/2 h-1 bg-slate-300 absolute top-1/2 left-0 origin-right rounded-full">
                    <div className="w-1/3 h-full bg-slate-300"></div>
                </div>
                <div style={{ transform: `rotate(${minuteDegrees}deg)` }} className="w-1/2 h-0.5 bg-slate-100 absolute top-1/2 left-0 origin-right rounded-full">
                     <div className="w-1/4 h-full bg-transparent"></div>
                </div>
                <div style={{ transform: `rotate(${secondDegrees}deg)` }} className="w-1/2 h-0.5 bg-red-500 absolute top-1/2 left-0 origin-right rounded-full">
                    <div className="w-1/5 h-full bg-transparent"></div>
                </div>
            </div>
        </div>
    );
}
EOL

# --- src/components/AuthPage.tsx (Updated with final widget positions) ---
cat > src/components/AuthPage.tsx << 'EOL'
"use client";

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import AnimatedTitle from './AnimatedTitle';
import AnalogClock from './AnalogClock';
import WeatherWidget from './WeatherWidget';

type AuthMode = 'login' | 'student-register' | 'teacher-register' | null;
type Role = 'student' | 'teacher';

const API_URL = 'http://127.0.0.1:8000';

const UserIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const StudentIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-6-3h12" /></svg>;
const TeacherIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V5.25A2.25 2.25 0 0 0 18 3H6A2.25 2.25 0 0 0 3.75 5.25v12.75A2.25 2.25 0 0 0 6 20.25Z" /></svg>;

const portals = [
    { mode: 'teacher-register', title: 'Teacher', description: 'Guide the next generation.', icon: TeacherIcon, color: 'purple' },
    { mode: 'login', title: 'Login', description: 'Return to your world.', icon: UserIcon, color: 'blue' },
    { mode: 'student-register', title: 'Student', description: 'Step into your learning journey.', icon: StudentIcon, color: 'green' }
];

export default function AuthPage({ onLogin }: { onLogin: (token: string, role: Role) => void }) {
    const [flippedPortal, setFlippedPortal] = useState<AuthMode>(null);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center text-white overflow-hidden animated-bg"
        >
            <div className="absolute top-8 left-8 z-20">
                <AnalogClock />
            </div>
            <div className="absolute top-8 right-8 z-20">
                <WeatherWidget />
            </div>

            <div className="relative z-10 text-center mb-16">
                <img 
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyawIRbc2YMupSsJT8UqUJmMJD4M4kWJ5CGg&s" 
                    alt="Project Logo" 
                    className="mx-auto h-20 w-20 rounded-full shadow-lg border-2 border-white/50"
                />
                <AnimatedTitle />
                <p className="mt-2 text-sm text-slate-300 font-stalinist">Because originality deserves a fair chance (for once).</p>
            </div>
            
            <div className="relative z-10 grid md:grid-cols-3 gap-8 w-full max-w-6xl h-[400px]" style={{ perspective: 1200 }}>
                {portals.map((portal) => (
                    <PortalCard
                        key={portal.mode}
                        portal={portal}
                        isFlipped={flippedPortal === portal.mode}
                        onFlip={() => setFlippedPortal(portal.mode)}
                        onLogin={onLogin}
                        onBack={() => setFlippedPortal(null)}
                    />
                ))}
            </div>

            <footer className="absolute z-10 bottom-4 text-center text-sm text-white/50">
                <p>&copy; 2025 all rights reserved</p>
                <p>Designed and developed by Vishwa Panchal and Yashwanth MU</p>
            </footer>
        </motion.div>
    );
}

const PortalCard = ({ portal, isFlipped, onFlip, onLogin, onBack }: { portal: typeof portals[0], isFlipped: boolean, onFlip: () => void, onLogin: (token: string, role: Role) => void, onBack: () => void }) => {
    const colorClasses = {
        blue: 'border-blue-500/50 hover:border-blue-500 shadow-blue-500/10',
        green: 'border-green-500/50 hover:border-green-500 shadow-green-500/10',
        purple: 'border-purple-500/50 hover:border-purple-500 shadow-purple-500/10',
    };

    return (
        <div className="relative w-full h-full" style={{ perspective: 1000 }}>
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
            >
                <motion.div
                    onClick={onFlip}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    className={`absolute w-full h-full rounded-2xl bg-slate-800/50 backdrop-blur-md shadow-lg border p-8 flex flex-col justify-center items-center text-white transition-colors duration-300 ${colorClasses[portal.color]} cursor-pointer`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <portal.icon className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold">{portal.title}</h2>
                    <p className="mt-2 text-slate-300 text-center">{portal.description}</p>
                </motion.div>
                <motion.div
                    className={`absolute w-full h-full rounded-2xl bg-slate-800/80 backdrop-blur-xl shadow-2xl border p-8 flex flex-col justify-center items-center ${colorClasses[portal.color]}`}
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                    <AuthForm mode={portal.mode as AuthMode} onLogin={onLogin} onBack={onBack} />
                </motion.div>
            </motion.div>
        </div>
    );
};

const AuthForm = ({ mode, onLogin, onBack }: { mode: AuthMode, onLogin: (token: string, role: Role) => void, onBack: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const isLogin = mode === 'login';
    const role = mode === 'student-register' ? 'student' : 'teacher';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); setLoading(true); setError(''); setMessage('');
        
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const body = isLogin ? new URLSearchParams({ username: email, password }) : JSON.stringify({ email, password, role });
        const headers = isLogin ? { 'Content-Type': 'application/x-www-form-urlencoded' } : { 'Content-Type': 'application/json' };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers, body });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'An error occurred.');

            if (isLogin) {
                onLogin(data.access_token, data.role);
            } else {
                setMessage('Registration successful! Please log in.');
                setTimeout(() => onBack(), 2000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto text-white">
            <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? 'Sign In' : `Register as ${role === 'teacher' ? 'Teacher' : 'Student'}`}</h2>
            {error && <p className="bg-red-500/30 text-red-100 p-3 rounded-md mb-4 text-center">{error}</p>}
            {message && <p className="bg-green-500/30 text-green-100 p-3 rounded-md mb-4 text-center">{message}</p>}
            
            <div className="mb-4">
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-slate-700/50 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="mb-6">
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-white/20 rounded-lg bg-slate-700/50 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={onBack} className="w-full sm:w-1/3 bg-gray-500/50 text-white py-3 rounded-lg font-semibold hover:bg-gray-500/80 transition-colors">Back</button>
                <button type="submit" className="w-full sm:flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
            </div>
        </form>
    );
};
EOL

# --- src/components/DashboardPage.tsx ---
cat > src/components/DashboardPage.tsx << 'EOL'
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
EOL

# --- src/components/ProjectModal.tsx ---
cat > src/components/ProjectModal.tsx << 'EOL'
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
EOL

# --- src/components/OriginalityChecker.tsx ---
cat > src/components/OriginalityChecker.tsx << 'EOL'
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
EOL

# --- NEW: src/components/LoadingScreen.tsx ---
cat > src/components/LoadingScreen.tsx << 'EOL'
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingLines = [
    { text: "Booting trueProject System v1.0...", type: 'info' },
    { text: "Reticulating splines... (whatever that means)", type: 'info' },
    { text: "Connecting to backend services... please hold", type: 'info' },
    { text: "[INFO] FastAPI server detected. It's probably fine.", type: 'info' },
    { text: "Sacrificing a rubber chicken to the server gods...", type: 'info' },
    { text: "[SUCCESS] PostgreSQL connection verified. The data is *probably* safe.", type: 'success' },
    { text: "Loading frontend... making it look pretty", type: 'info' },
    { text: "[SUCCESS] Next.js client-side router initialized. We know where we're going now.", type: 'success' },
    { text: "[WARN] Found 1,337 'TODO' comments. Ignoring them for now.", type: 'warn' },
    { text: "Initializing AI/ML services... waking up the expensive part", type: 'info' },
    { text: "[INFO] Connecting to OpenAI... if they answer", type: 'info' },
    { text: "[SUCCESS] Vector similarity module loaded. Now we can judge you.", type: 'success' },
    { text: "[WARN] Docker not detected. We're winging it.", type: 'warn' },
    { text: "[INFO] AWS SDK not configured. Who needs the cloud anyway?", type: 'info' },
    { text: "All systems operational... surprisingly.", type: 'final' },
    { text: "Launching application... good luck.", type: 'final' },
];

const BlinkingCursor = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block w-2 h-5 bg-green-400 ml-2"
    />
);

export default function LoadingScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
    const [lines, setLines] = useState<{ text: string, type: string }[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let delay = 100;
        loadingLines.forEach((line, index) => {
            setTimeout(() => {
                setLines(prev => [...prev, line]);
                if (index === loadingLines.length - 1) {
                    setTimeout(() => {
                        setIsComplete(true);
                        setTimeout(onAnimationComplete, 500);
                    }, 800);
                }
            }, delay);
            delay += Math.random() * 150 + 50;
        });
    }, [onAnimationComplete]);

    const getLineColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'warn': return 'text-yellow-400';
            case 'final': return 'text-cyan-400 font-bold';
            default: return 'text-slate-300';
        }
    };

    return (
        <AnimatePresence>
            {!isComplete && (
                 <motion.div
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="min-h-screen w-full bg-black font-mono p-6 overflow-hidden flex flex-col"
                >
                    <div className="h-full w-full overflow-y-auto custom-scrollbar">
                        {lines.map((line, index) => (
                            <p key={index} className={`whitespace-pre-wrap ${getLineColor(line.type)}`}>
                                {`>`} {line.text}
                            </p>
                        ))}
                        <div className="flex items-center">
                            <p className="text-slate-300">{`>`}</p>
                            <BlinkingCursor />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
EOL

# --- NEW: src/components/DashboardLoading.tsx ---
cat > src/components/DashboardLoading.tsx << 'EOL'
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const loadingMessages = [
    "Waking up the database hamsters...",
    "Counting projects (hope we don't lose any)...",
    "Checking your permissions (don't try anything funny)...",
    "Applying futuristic UI shaders...",
    "Reticulating project splines...",
    "Almost there... maybe."
];

const CoffeeCup = () => (
    <motion.div 
        className="w-24 h-24 text-cyan-400"
        animate={{
            rotate: [0, -5, 5, -5, 0],
            x: [0, 2, -2, 2, 0],
        }}
        transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse'
        }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
    </motion.div>
);


export default function DashboardLoading() {
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % loadingMessages.length;
            setMessage(loadingMessages[index]);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <CoffeeCup />
            <motion.p
                key={message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-cyan-400 font-mono"
            >
                {message}
            </motion.p>
        </div>
    );
}
EOL

# Add global styles for custom scrollbars and animated background
if ! grep -q ".animated-bg" src/app/globals.css; then
  echo "Adding animated background styles to globals.css"
  cat >> src/app/globals.css << 'EOL'

.animated-bg {
  background: linear-gradient(300deg, #0f172a, #3b0764, #0f172a);
  background-size: 180% 180%;
  animation: animated-gradient 18s ease infinite;
}

@keyframes animated-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(139, 92, 246, 0.4);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(139, 92, 246, 0.6);
}
EOL
fi

echo "✅ Frontend refactor for Portal UI is complete!"
echo "You can now run 'npm run dev' from the 'frontend' directory's root."

