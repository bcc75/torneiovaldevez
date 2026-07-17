/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import guerreiroPortucal from '../../assets/guerreiro-portucal.png';
import guerreiroCastela from '../../assets/guerreiro-castela.png';

interface KnightSpriteProps {
  side: 'player' | 'enemy';
  isCharging: boolean;
  isImpact: boolean;
  isVictory: boolean;
  isDefeat: boolean;
  faction: 'portucalense' | 'leao';
}

export default function KnightSprite({
  side,
  isCharging,
  isImpact,
  isVictory,
  isDefeat,
  faction
}: KnightSpriteProps) {
  const [imageError, setImageError] = useState(false);

  // Check if this specific knight should be styled as Portucalense or Leão
  const isPortucalense = faction === 'portucalense';

  // Fallback to spritesheet or SVG if the image fails to load
  const gifSrc = isPortucalense ? guerreiroPortucal : guerreiroCastela;

  // Determine if the image needs to be flipped horizontally.
  // - guerreiro-portucal.png naturally faces RIGHT.
  // - guerreiro-castela.png naturally faces LEFT.
  // Both face towards the center natively, so they do not need to be flipped.
  const shouldFlip = false;

  // CSS Animation classes
  let animationClass = "transition-all duration-1000 ease-in-out ";
  if (isCharging) {
    animationClass += side === 'player'
      ? 'translate-x-[135%] scale-105'
      : '-translate-x-[135%] scale-105';
  } else if (isImpact) {
    animationClass += side === 'player'
      ? 'translate-x-[145%] scale-110 rotate-3'
      : '-translate-x-[145%] scale-110 -rotate-3';
  } else if (isVictory) {
    animationClass += 'translate-y-[-5%] scale-105 duration-300 animate-bounce';
  } else if (isDefeat) {
    animationClass += side === 'player'
      ? 'rotate-[-75deg] translate-y-[15%] -translate-x-[10%] opacity-40 grayscale brightness-50 contrast-75 duration-700'
      : 'rotate-[75deg] translate-y-[15%] translate-x-[10%] opacity-40 grayscale brightness-50 contrast-75 duration-700';
  } else {
    animationClass += 'translate-x-0 translate-y-0 scale-100';
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-end w-full h-full ${animationClass}`}
      style={{
        transformOrigin: 'center bottom',
      }}
    >
      {/* Oval Shadow under the horse for realistic contact */}
      <div
        id={`knight-shadow-${side}`}
        className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 w-[55%] h-[8px] bg-black/45 rounded-full filter blur-[1.5px] pointer-events-none z-0"
      />

      {!imageError ? (
        <img
          id={`knight-img-${side}`}
          src={gifSrc}
          alt={isPortucalense ? 'Guerreiro Portucalense' : 'Guerreiro do Reino de Leão'}
          referrerPolicy="no-referrer"
          className="h-full w-auto filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] relative z-10"
          style={{
            height: '100%',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            transform: shouldFlip ? 'scaleX(-1)' : 'none',
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        /* Vector fallback - stylized medieval shield, horse & knight in motion */
        <div 
          id={`knight-fallback-${side}`}
          className={`relative w-full h-full flex items-center justify-center rounded-2xl border-2 p-2 bg-gradient-to-b ${
            isPortucalense
              ? 'from-sky-950/90 to-slate-900/95 border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'from-amber-950/90 to-slate-900/95 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          }`}
        >
          {/* Animated background lines */}
          {isCharging && (
            <div className={`absolute top-1/2 w-8 h-1 bg-white/20 rounded-full animate-ping ${
              side === 'player' ? 'right-full' : 'left-full'
            }`} />
          )}

          {/* SVG representation of the knight */}
          <svg
            viewBox="0 0 100 100"
            className={`w-[85%] h-[85%] ${side === 'enemy' ? 'scale-x-[-1]' : ''}`}
          >
            {/* Horse Body */}
            <path
              d="M 15,55 C 20,40 35,38 45,45 C 55,50 65,48 72,55 C 75,58 75,65 65,68 C 55,70 30,70 20,68 C 12,66 10,60 15,55 Z"
              fill={isPortucalense ? '#708090' : '#8B7355'} // Slate vs Brown horse
            />
            {/* Horse Legs */}
            <path d="M 22,65 L 18,80" stroke={isPortucalense ? '#506070' : '#6B5335'} strokeWidth="4" strokeLinecap="round" className={isCharging ? 'animate-pulse' : ''} />
            <path d="M 32,65 L 30,78" stroke={isPortucalense ? '#506070' : '#6B5335'} strokeWidth="4" strokeLinecap="round" className={isCharging ? 'animate-pulse' : ''} />
            <path d="M 52,65 L 56,80" stroke={isPortucalense ? '#405060' : '#5B4325'} strokeWidth="4" strokeLinecap="round" className={isCharging ? 'animate-pulse' : ''} />
            <path d="M 62,65 L 68,78" stroke={isPortucalense ? '#405060' : '#5B4325'} strokeWidth="4" strokeLinecap="round" className={isCharging ? 'animate-pulse' : ''} />

            {/* Horse Head */}
            <path
              d="M 68,52 L 78,42 C 82,38 88,42 85,48 L 78,56 Z"
              fill={isPortucalense ? '#708090' : '#8B7355'}
            />
            <path d="M 80,43 L 84,33" stroke={isPortucalense ? '#506070' : '#6B5335'} strokeWidth="3" strokeLinecap="round" /> {/* Ear */}

            {/* Knight Armor (Silver) */}
            {/* Torso */}
            <path d="M 36,25 C 42,22 48,25 48,35 C 48,45 42,50 36,45 C 30,40 30,28 36,25 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
            
            {/* Helmet */}
            <circle cx="42" cy="18" r="8" fill="#9CA3AF" stroke="#4B5563" strokeWidth="1.5" />
            {/* Visor slit */}
            <path d="M 40,17 L 46,17" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 41,14 Q 45,8 48,12" stroke={isPortucalense ? '#3b82f6' : '#eab308'} strokeWidth="2" fill="none" /> {/* Plume */}

            {/* Shield */}
            <path
              d="M 28,32 C 38,32 44,38 42,50 C 40,58 35,62 28,62 C 21,62 16,58 14,50 C 12,38 18,32 28,32 Z"
              fill={isPortucalense ? '#1d4ed8' : '#ca8a04'} // Royal blue vs Dark golden
              stroke="#F3F4F6"
              strokeWidth="2"
            />
            {/* Shield Emblem (Cross) */}
            <path d="M 28,36 L 28,58 M 18,47 L 38,47" stroke="#F1E2B8" strokeWidth="2.5" strokeLinecap="round" />

            {/* Lance */}
            <path
              d="M 5,28 L 95,28"
              stroke="#D97706" // Wooden shaft
              strokeWidth="3.5"
              strokeLinecap="round"
              className={`transition-all duration-500 ${isCharging ? 'rotate-1' : '-rotate-6'}`}
            />
            {/* Lance Tip */}
            <path
              d="M 94,25 L 99,28 L 94,31 Z"
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth="1"
              className={`transition-all duration-500 ${isCharging ? 'rotate-1' : '-rotate-6'}`}
            />
          </svg>

          {/* Subtitle label indicating fallback in elegant styling */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 border border-white/10 whitespace-nowrap">
            {isPortucalense ? 'Condado Portucalense' : 'Reino de Leão'}
          </div>
        </div>
      )}
    </div>
  );
}
