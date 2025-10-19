"use client";

import { useState, useEffect } from 'react';

export default function AnalogClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secondDegrees = (seconds / 60) * 360 + 90;
    const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6 + 90;
    const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30 + 90;

    return (
        <div className="w-36 h-36 rounded-full bg-slate-800/50 backdrop-blur-md shadow-lg border border-white/20 flex items-center justify-center relative">
            <div className="w-2 h-2 bg-white rounded-full absolute z-10"></div>
            <div className="w-full h-full relative">
                {/* Hour Hand */}
                <div style={{ transform: `rotate(${hourDegrees}deg)` }} className="w-1/2 h-1 bg-slate-300 absolute top-1/2 left-0 origin-right rounded-full transition-transform duration-300 ease-elastic">
                    <div className="w-1/3 h-full bg-slate-300"></div>
                </div>
                {/* Minute Hand */}
                <div style={{ transform: `rotate(${minuteDegrees}deg)` }} className="w-1/2 h-0.5 bg-slate-100 absolute top-1/2 left-0 origin-right rounded-full transition-transform duration-300 ease-elastic">
                     <div className="w-1/4 h-full bg-slate-800"></div>
                </div>
                {/* Second Hand */}
                <div style={{ transform: `rotate(${secondDegrees}deg)` }} className="w-1/2 h-0.5 bg-red-500 absolute top-1/2 left-0 origin-right rounded-full transition-transform duration-200">
                    <div className="w-1/5 h-full bg-slate-800"></div>
                </div>
            </div>
        </div>
    );
}
