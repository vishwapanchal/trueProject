"use client";

import { useState, useEffect, useRef } from "react";

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
      if (animationFrameId.current) {
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
      {/* Center pivot */}
      <div className="w-2 h-2 bg-white rounded-full absolute z-20"></div>

      {/* Hands container */}
      <div className="w-full h-full relative">

        {/* Hour hand */}
        <div
          style={{ transform: `rotate(${hourDegrees}deg)` }}
          className="w-[35%] h-[3px] bg-slate-300 absolute top-1/2 left-[15%] origin-right rounded-full z-10"
        ></div>

        {/* Minute hand */}
        <div
          style={{ transform: `rotate(${minuteDegrees}deg)` }}
          className="w-[45%] h-[2px] bg-slate-100 absolute top-1/2 left-[5%] origin-right rounded-full z-10"
        ></div>

        {/* Second hand */}
        <div
          style={{ transform: `rotate(${secondDegrees}deg)` }}
          className="w-[50%] h-[1px] bg-red-500 absolute top-1/2 left-0 origin-right rounded-full z-20"
        ></div>
      </div>
    </div>
  );
}
