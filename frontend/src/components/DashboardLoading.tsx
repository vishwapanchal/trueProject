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
