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
