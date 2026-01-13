import React, { useState, useEffect } from 'react';

const LiveSaleTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 12,
    seconds: 54,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          // Reset timer for demo
          return { minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white py-4 text-center">
      <p className="text-lg font-medium">
        <span className="text-gray-800">Live Sale : </span>
        <span className="text-green-500 font-bold">
          {timeLeft.minutes}min {timeLeft.seconds.toString().padStart(2, '0')}sec
        </span>
      </p>
    </div>
  );
};

export default LiveSaleTimer;
