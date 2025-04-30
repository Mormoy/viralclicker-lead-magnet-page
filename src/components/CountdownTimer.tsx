
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="bg-viralOrange text-white py-3 px-4 text-center">
      <div className="container max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-center gap-2">
        <p className="text-lg font-bold mr-2">¡OFERTA ESPECIAL! Esta promoción termina en:</p>
        <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
          <Clock className="mr-2 h-5 w-5" />
          <div className="flex items-center text-xl md:text-2xl font-bold">
            <span>{formatTime(timeRemaining.hours)}</span>
            <span className="mx-1">:</span>
            <span>{formatTime(timeRemaining.minutes)}</span>
            <span className="mx-1">:</span>
            <span>{formatTime(timeRemaining.seconds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
