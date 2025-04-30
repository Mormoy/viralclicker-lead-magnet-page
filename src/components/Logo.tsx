
import React from 'react';

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`font-bold text-2xl md:text-3xl ${className}`}>
      <span className="text-viralOrange">Viral</span>
      <span className="text-white">Clicker</span>
    </div>
  );
};

export default Logo;
