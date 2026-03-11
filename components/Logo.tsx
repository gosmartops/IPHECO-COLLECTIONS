
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", showText = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 85" className="h-full w-auto">
        {/* Dotted Gold Circle */}
        <circle 
          cx="50" 
          cy="42" 
          r="40" 
          fill="none" 
          stroke="#B38728" 
          strokeWidth="0.5" 
          strokeDasharray="2,2"
        />
        
        {/* Stylized Monogram */}
        <g stroke="#B38728" strokeWidth="1.5" fill="none">
          {/* Central Vertical Bar */}
          <line x1="50" y1="22" x2="50" y2="67" />
          {/* Top and Bottom Horizontal Bars */}
          <line x1="42" y1="22" x2="58" y2="22" />
          <line x1="42" y1="67" x2="58" y2="67" />
          
          {/* Right Curve (P-like) */}
          <path d="M50 30 C65 30, 65 45, 50 45" />
          
          {/* Left Curve (S/C-like) */}
          <path d="M50 45 C35 45, 35 60, 50 60" />
        </g>
      </svg>
      {showText && (
        <div className="flex flex-col items-center -mt-2">
          <span className="text-white text-[11px] tracking-[0.4em] font-luxury uppercase font-bold">
            IPHECO
          </span>
          <span className="text-[#B38728] text-[7px] tracking-[0.2em] uppercase font-bold mt-0.5">
            Smart Collections
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
