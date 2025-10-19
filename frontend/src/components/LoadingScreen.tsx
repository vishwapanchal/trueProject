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
