import React from 'react';

interface PrepLogoProps {
  size?: number;
  showImage?: boolean;
  className?: string;
}

export function PrepLogo({ size = 36, showImage = false, className = '' }: PrepLogoProps) {
  if (showImage) {
    return (
      <div 
        className={`prep-logo-img-wrapper ${className}`} 
        style={{ width: size, height: size, borderRadius: Math.max(6, size * 0.22), overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img 
          src="/prep-ai-logo.jpg" 
          alt="Prep AI Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`prep-logo-mark ${className}`}
      style={{ 
        width: size, 
        height: size, 
        borderRadius: Math.max(8, size * 0.25),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(28, 14, 48, 0.95), rgba(12, 8, 24, 0.98))',
        border: '1px solid rgba(220, 140, 255, 0.35)',
        boxShadow: '0 0 16px rgba(180, 72, 237, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Aurora glow background in the icon badge */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 60% 40%, rgba(225, 120, 255, 0.35), rgba(140, 60, 240, 0.2) 50%, transparent 80%)',
          pointerEvents: 'none'
        }} 
      />
      <svg 
        width={Math.round(size * 0.72)} 
        height={Math.round(size * 0.72)} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <linearGradient id="prepAiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f3d5ff" />
            <stop offset="75%" stopColor="#d879ef" />
            <stop offset="100%" stopColor="#b548ed" />
          </linearGradient>
          <filter id="prepGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Stylized Prep AI 'PA' monogram */}
        <path
          d="M 18 20 L 52 20 C 72 20 84 32 84 48 C 84 62 72 74 54 74 L 46 74 L 40 82 L 18 82 L 46 38 L 56 54 C 64 54 70 48 70 42 C 70 34 62 28 50 28 L 32 28 L 22 42 L 32 42 L 54 82 L 78 82 L 56 46 L 46 38 Z"
          fill="url(#prepAiGrad)"
          filter="url(#prepGlow)"
        />
        <path
          d="M 22 22 L 50 22 C 68 22 80 32 80 46 C 80 58 70 68 54 68 L 47 68 L 38 80 L 22 80 L 46 42 L 54 54 C 62 54 68 48 68 42 C 68 34 60 28 48 28 L 30 28 L 18 46 L 28 46 L 48 80 L 74 80 L 54 48 Z"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
