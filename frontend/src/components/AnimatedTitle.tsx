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
