/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Location, Player } from '../types';
import { MapPin, Lock, CheckCircle2, ShieldAlert, ArrowLeft, Shield, Swords, Star, Trophy, Map, Trees, Mountain, HelpCircle } from 'lucide-react';
import fundoCampanhas from '../../assets/fundo_campanhas.png';

interface MapViewProps {
  locations: Location[];
  player: Player;
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  selectedCampaign: number | null;
  onSelectCampaign: (lvl: number | null) => void;
}

const CAMPAIGNS = [
  {
    id: 1,
    name: 'A Jornada Começa',
    icon: '🛡️',
    difficulty: 1,
    description: 'Começai a vossa jornada vigiando as encostas e as pequenas freguesias junto ao rio, onde as guarnições castelhanas testam as nossas defesas.',
    colorClass: 'border-sky-500/30 hover:border-sky-500/80 shadow-sky-950/20',
    accentColor: 'text-sky-400',
    bgColor: 'bg-sky-950/30',
    badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    label: 'Fronteira Norte',
    watermark: 'A JORNADA COMEÇA'
  },
  {
    id: 2,
    name: 'Os Guardiões do Vez',
    icon: '⚔️',
    difficulty: 2,
    description: 'As pontes estrategicamente colocadas ao longo do Rio Vez são palco de combates rápidos e exigem destreza redobrada dos nossos cavaleiros.',
    colorClass: 'border-red-500/30 hover:border-red-500/80 shadow-red-950/20',
    accentColor: 'text-red-400',
    bgColor: 'bg-red-950/30',
    badgeColor: 'bg-red-500/10 text-red-300 border-red-500/20',
    label: 'Margens do Vez',
    watermark: 'GUARDIÕES DO VEZ'
  },
  {
    id: 3,
    name: 'As Honras de Valdevez',
    icon: '🏰',
    difficulty: 3,
    description: 'Adentrai nas honras tradicionais do vale, onde solares de granito e montes escarpados formam os baluartes da nossa nobreza portucalense.',
    colorClass: 'border-amber-500/30 hover:border-amber-500/80 shadow-amber-950/20',
    accentColor: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    label: 'Coração das Honras',
    watermark: 'HONRAS DE VALDEVEZ'
  },
  {
    id: 4,
    name: 'Os Senhores do Vale',
    icon: '👑',
    difficulty: 4,
    description: 'Enfrentai a alta fidalguia do vale do Lima e os temidos senhores feudais que dominam as ricas terras de pastagens e florestas densas.',
    colorClass: 'border-purple-500/30 hover:border-purple-500/80 shadow-purple-950/20',
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-950/30',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    label: 'Senhores da Terra',
    watermark: 'VALE DO COUÇO'
  },
  {
    id: 5,
    name: 'O Recontro de Valdevez',
    icon: '🦅',
    difficulty: 5,
    description: 'A hora decisiva chegou! No campo histórico do Recontro, defrontai os mais formidáveis cavaleiros de Castela e o próprio Imperador D. Afonso VII.',
    colorClass: 'border-emerald-500/30 hover:border-emerald-500/80 shadow-emerald-950/20',
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/30',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    label: 'Recontro Decisivo',
    watermark: 'CAMPO DO RECONTRO'
  }
];

export default function MapView({
  locations,
  player,
  selectedLocation,
  onSelectLocation,
  selectedCampaign,
  onSelectCampaign
}: MapViewProps) {

  // Helper to check if a campaign is unlocked
  const isCampaignUnlocked = (campaignDifficulty: number) => {
    if (campaignDifficulty === 1) return true;
    
    // Unlocked if player's level >= campaignDifficulty OR if previous campaign is completely conquered
    const prevCampaignLocs = locations.filter(loc => loc.difficulty === campaignDifficulty - 1);
    const prevConqueredCount = prevCampaignLocs.filter(loc => player.conqueredLocations.includes(loc.id)).length;
    
    return player.level >= campaignDifficulty || prevConqueredCount === prevCampaignLocs.length;
  };

  // Get locations for the currently selected campaign sorted by x coordinate (left-to-right path)
  const campaignLocations = selectedCampaign 
    ? locations.filter(loc => loc.difficulty === selectedCampaign).sort((a, b) => a.x - b.x)
    : [];

  // Helper to check if a location is unlocked in sequential path
  const isLocUnlocked = (loc: Location, index: number) => {
    if (index === 0) return true; // First node is always unlocked
    const prevLoc = campaignLocations[index - 1];
    return player.conqueredLocations.includes(prevLoc.id);
  };

  const isLocConquered = (loc: Location) => {
    return player.conqueredLocations.includes(loc.id);
  };

  // Helper to get custom heraldic details for parishes
  const getParishCrest = (id: string) => {
    switch (id) {
      // Level I
      case 'sabadim':
        return { gradient: 'from-blue-700 to-sky-950', symbol: '🛡️', border: 'border-blue-400 text-blue-300' };
      case 'miranda':
        return { gradient: 'from-amber-600 to-amber-950', symbol: '🌾', border: 'border-amber-400 text-amber-300' };
      case 'prozelo':
        return { gradient: 'from-emerald-700 to-emerald-950', symbol: '🌊', border: 'border-emerald-400 text-emerald-300' };
      case 'paco':
        return { gradient: 'from-purple-700 to-indigo-950', symbol: '🏰', border: 'border-purple-400 text-purple-300' };
      // Level II
      case 'guilhadeses':
        return { gradient: 'from-red-700 to-rose-950', symbol: '⚔️', border: 'border-red-400 text-red-300' };
      case 'jolda':
        return { gradient: 'from-teal-700 to-cyan-950', symbol: '🐟', border: 'border-teal-400 text-teal-300' };
      case 'tavora':
        return { gradient: 'from-amber-700 to-orange-950', symbol: '🍇', border: 'border-amber-500 text-amber-300' };
      case 'rio_frio':
        return { gradient: 'from-blue-800 to-indigo-950', symbol: '❄️', border: 'border-blue-300 text-blue-200' };
      // Level III
      case 'azere':
        return { gradient: 'from-yellow-600 to-yellow-950', symbol: '☀️', border: 'border-yellow-400 text-yellow-200' };
      case 'grade':
        return { gradient: 'from-stone-700 to-stone-900', symbol: '🧱', border: 'border-stone-400 text-stone-300' };
      case 'gondoriz':
        return { gradient: 'from-emerald-800 to-teal-950', symbol: '🌳', border: 'border-emerald-500 text-emerald-200' };
      case 'cabana_maior':
        return { gradient: 'from-amber-800 to-amber-950', symbol: '🛖', border: 'border-amber-600 text-amber-300' };
      // Level IV
      case 'couto':
        return { gradient: 'from-amber-600 to-amber-950', symbol: '🌾', border: 'border-amber-400 text-amber-200' };
      case 'ermelo':
        return { gradient: 'from-orange-700 to-red-950', symbol: '⛪', border: 'border-orange-400 text-orange-300' };
      case 'sistelo':
        return { gradient: 'from-emerald-600 to-green-950', symbol: '⛰️', border: 'border-emerald-400 text-emerald-300' };
      case 'soajo':
        return { gradient: 'from-amber-900 to-yellow-950', symbol: '🐗', border: 'border-amber-500 text-amber-300' };
      // Level V
      case 'vale':
        return { gradient: 'from-amber-800 to-stone-900', symbol: '🏡', border: 'border-amber-500 text-amber-300' };
      case 'giela':
        return { gradient: 'from-red-800 to-rose-950', symbol: '🏯', border: 'border-red-500 text-red-300' };
      case 'valdevez':
        return { gradient: 'from-indigo-700 to-blue-950', symbol: '🌉', border: 'border-indigo-400 text-indigo-300' };
      case 'veigas_matanca':
        return { gradient: 'from-yellow-500 to-red-800', symbol: '👑', border: 'border-yellow-400 text-yellow-200' };
      default:
        return { gradient: 'from-medieval-dark to-black', symbol: '⚜️', border: 'border-medieval-gold text-medieval-gold' };
    }
  };

  // Helper to generate coordinates in the 1000x750 SVG space
  const getSvgCoords = (loc: Location) => ({
    x: loc.x * 10,
    y: loc.y * 7.5
  });

  // Helper to compute a smooth horizontal S-curve connecting paths
  const getBezierPath = (locA: Location, locB: Location) => {
    const pA = getSvgCoords(locA);
    const pB = getSvgCoords(locB);
    const midX = (pA.x + pB.x) / 2;
    return `M ${pA.x},${pA.y} C ${midX},${pA.y} ${midX},${pB.y} ${pB.x},${pB.y}`;
  };

  // Get midpoints to draw bridge / forest / trail markers
  const getPathMiddle = (locA: Location, locB: Location) => {
    const pA = getSvgCoords(locA);
    const pB = getSvgCoords(locB);
    return {
      x: (pA.x + pB.x) / 2,
      y: (pA.y + pB.y) / 2
    };
  };

  // Helper to get decorative path elements based on level and index
  const getPathDecoration = (level: number, index: number) => {
    const decorations = [
      // Level I
      [
        { name: 'Trilho Antigo', icon: '🌲' },
        { name: 'Ponte Romana', icon: '🌉' },
        { name: 'Rio Vez', icon: '🌊' }
      ],
      // Level II
      [
        { name: 'Passagem dos Batedores', icon: '🏹' },
        { name: 'Trilho de Pedra', icon: '⛰️' },
        { name: 'Bosque Profundo', icon: '🌲' }
      ],
      // Level III
      [
        { name: 'Desfiladeiro Seco', icon: '🧱' },
        { name: 'Ponte Militar', icon: '🌉' },
        { name: 'Caminho de Terra', icon: '🐎' }
      ],
      // Level IV
      [
        { name: 'Vale da Neblina', icon: '☁️' },
        { name: 'Trilho Monástico', icon: '⛪' },
        { name: 'Montanhas do Soajo', icon: '⛰️' }
      ],
      // Level V
      [
        { name: 'Passo do Inverno', icon: '🦅' },
        { name: 'Ponte do Paço', icon: '🌉' },
        { name: 'Porta da Vila', icon: '🏰' }
      ]
    ];
    return decorations[level - 1]?.[index] || { name: 'Trilho Real', icon: '🐎' };
  };

  // RENDERING CAMPAIGN SELECTION SCREEN
  if (selectedCampaign === null) {
    return (
      <div 
        id="campaign-selection-wrapper" 
        className="w-full flex flex-col p-4 bg-[#101814] text-gray-100 min-h-0 h-full overflow-y-auto rounded-2xl border-4 border-medieval-border medieval-border bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(16, 24, 20, 0.85), rgba(16, 24, 20, 0.85)), url(${fundoCampanhas})` }}
      >
        {/* Parchment background header block */}
        <div className="text-center py-6 mb-6 rounded-xl bg-[#FAF3DC]/95 text-amber-950 border-4 border-[#7A4B24]/40 relative overflow-hidden shadow-md">
          {/* Decorative heraldic flourishes */}
          <div className="absolute top-2 left-6 text-amber-900/30 text-4xl select-none font-serif">⚜</div>
          <div className="absolute top-2 right-6 text-amber-900/30 text-4xl select-none font-serif">⚜</div>
          <div className="absolute bottom-2 left-6 text-amber-900/30 text-4xl select-none font-serif">⚜</div>
          <div className="absolute bottom-2 right-6 text-amber-900/30 text-4xl select-none font-serif">⚜</div>

          <h1 className="font-serif font-black text-2xl md:text-3xl tracking-tight text-amber-900 drop-shadow-xs uppercase">
            Campanhas do Torneio
          </h1>
          <p className="text-xs md:text-sm max-w-2xl mx-auto px-4 mt-2 font-serif leading-relaxed italic text-amber-950/80">
            "Escolhei o vosso teatro de guerra militar. Cavalgai pelas freguesias de Valdevez para acumular ouro, honra perante o Infante D. Afonso Henriques e selar o vosso nome na história de Portugal."
          </p>
        </div>

        {/* Five campaigns listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CAMPAIGNS.map((camp) => {
            const unlocked = isCampaignUnlocked(camp.difficulty);
            
            // Calculate progress statistics
            const campParishes = locations.filter(loc => loc.difficulty === camp.difficulty);
            const conqueredInCamp = campParishes.filter(loc => player.conqueredLocations.includes(loc.id)).length;
            const progressPct = Math.round((conqueredInCamp / campParishes.length) * 100);
            const isCompleted = progressPct === 100;

            return (
              <div
                id={`campaign-card-${camp.id}`}
                key={camp.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 bg-[#14201a] shadow-lg transition-all duration-300 group ${
                  unlocked 
                    ? `${camp.colorClass} cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl` 
                    : 'border-stone-800 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => unlocked && onSelectCampaign(camp.id)}
              >
                {/* Lock Overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-[#0c120f]/90 rounded-2xl flex flex-col items-center justify-center p-4 text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-500 mb-2 shadow-inner">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-serif font-bold text-stone-400">Teatro Bloqueado</span>
                    <span className="text-[10px] text-stone-500 mt-1 font-mono tracking-wider">
                      Requer Nível {camp.difficulty} ou pacificar campanha anterior
                    </span>
                  </div>
                )}

                {/* Card Top Information */}
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono ${camp.badgeColor}`}>
                      Nível {camp.difficulty}
                    </span>
                    {isCompleted ? (
                      <span className="text-xs font-serif font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        ✓ Pacificado
                      </span>
                    ) : (
                      <div className="flex text-medieval-gold">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < camp.difficulty ? 'fill-medieval-gold' : 'text-stone-700'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-gray-100 group-hover:text-medieval-gold transition-colors leading-tight flex items-center gap-2">
                    <span className="text-xl leading-none">{camp.icon}</span>
                    <span>{camp.name}</span>
                  </h3>
                  
                  <p className="text-[11px] text-gray-400 mt-2 font-serif leading-relaxed line-clamp-4">
                    {camp.description}
                  </p>
                </div>

                {/* Card Bottom / Progress Info */}
                <div className="mt-5 pt-3 border-t border-emerald-950/40">
                  <div className="flex justify-between items-center text-[10px] font-serif mb-1 text-gray-400">
                    <span>{campParishes.length} Freguesias</span>
                    <span className="font-bold text-medieval-gold">{progressPct}% Concluído</span>
                  </div>
                  
                  {/* Medieval custom styled progress bar */}
                  <div className="w-full h-2 bg-stone-900 border border-emerald-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-medieval-gold shadow-[0_0_6px_rgba(194,157,68,0.5)]'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button 
                      className={`w-full py-1.5 rounded-lg text-[11px] font-serif font-black tracking-wide border transition-all ${
                        unlocked 
                          ? 'bg-medieval-panel hover:bg-medieval-gold hover:text-medieval-dark text-medieval-gold border-medieval-border/50' 
                          : 'bg-stone-950 text-stone-600 border-stone-800'
                      }`}
                      disabled={!unlocked}
                    >
                      {isCompleted ? 'Revisitar Campanha' : 'Iniciar Campanha'}
                    </button>
                  </div>
                </div>

                {/* Hand-drawn watermark embellishment inside cards */}
                <div className="absolute right-2 bottom-12 text-[50px] opacity-[0.02] pointer-events-none select-none font-serif text-medieval-gold leading-none">
                  ⚔
                </div>
              </div>
            );
          })}
        </div>

        {/* Help tip at footer */}
        <div className="mt-6 p-3 bg-medieval-panel/40 rounded-xl border border-medieval-border/20 flex items-center gap-3 text-xs text-medieval-text/80 max-w-xl mx-auto text-center font-serif">
          <HelpCircle className="w-5 h-5 text-medieval-gold shrink-0 mx-auto md:mx-0" />
          <p className="leading-relaxed">
            As campanhas estão ordenadas por dificuldade crescente. Conquistai as freguesias de cada nível para desbloquear o acesso imediato aos territórios nobres mais protegidos do concelho!
          </p>
        </div>
      </div>
    );
  }

  // DEFINING ACTIVE LEVEL DATA
  const activeCamp = CAMPAIGNS.find(c => c.id === selectedCampaign)!;
  const conqueredCount = campaignLocations.filter(isLocConquered).length;
  const campProgressPct = Math.round((conqueredCount / campaignLocations.length) * 100);

  // RENDERING INDEPENDENT CAMPAIGN MAP
  return (
    <div id="campaign-map-view-container" className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-2xl border-4 border-medieval-border bg-medieval-dark shadow-2xl medieval-border font-serif">
      {/* Animated Travel Lines Styling */}
      <style>{`
        @keyframes path-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-medieval-path {
          stroke-dasharray: 8 6;
          animation: path-dash 2s linear infinite;
        }
        @keyframes banner-wave {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-medieval-flag {
          animation: banner-wave 3s ease-in-out infinite;
        }
      `}</style>

      {/* Map Header Controls */}
      <div className="bg-[#FAF3DC]/95 text-amber-950 p-3 px-5 border-b-4 border-[#7A4B24]/40 flex justify-between items-center z-20 shadow-md">
        <button
          id="back-to-campaigns-btn"
          onClick={() => {
            onSelectCampaign(null);
            onSelectLocation(campaignLocations[0]); // fallback to avoid stale selections
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-900 text-[#FAF3DC] rounded-lg text-xs font-semibold border-2 border-amber-950 hover:bg-amber-800 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Campanhas</span>
        </button>

        <div className="text-center">
          <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-900/70 leading-none">
            Campanha Ativa • Nível {activeCamp.difficulty}
          </div>
          <h2 className="font-black text-sm md:text-base text-amber-900 leading-none mt-1">
            {activeCamp.icon} {activeCamp.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-[9px] text-amber-900/60 font-bold leading-none">Pacificação</div>
            <div className="text-xs font-black text-amber-900 leading-none mt-0.5">{conqueredCount} / 4 Freguesias</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-amber-900 flex items-center justify-center bg-amber-950 text-[#FAF3DC] text-xs font-bold font-mono">
            {campProgressPct}%
          </div>
        </div>
      </div>

      {/* The Map Arena Aspect Aspect Ratio Container */}
      <div className="relative flex-1 w-full h-full max-h-full aspect-[4/3] mx-auto overflow-hidden select-none">
        
        {/* Styled Parchment Map Canvas */}
        <div 
          id="map-svg-parchment" 
          className="w-full h-full relative bg-medieval-dark overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `linear-gradient(rgba(10, 13, 17, 0.75), rgba(10, 13, 17, 0.75)), url(${fundoCampanhas})` }}
        >
          {/* Outer elegant borders inside the parchment */}
          <div className="absolute inset-4 border-2 border-dashed border-medieval-border/40 pointer-events-none rounded-lg" />
          
          {/* Vintage watermarks */}
          <div className="absolute top-6 right-8 text-right opacity-30 select-none z-0">
            <h4 className="text-xs font-black tracking-widest text-medieval-gold uppercase font-serif">
              {activeCamp.watermark}
            </h4>
            <p className="text-[9px] italic text-medieval-text/50 leading-none mt-0.5">Torneio de Valdevez • Anno Domini 1141</p>
          </div>

          {/* Canvas SVG drawing pathways, rivers, landscapes */}
          <svg viewBox="0 0 1000 750" className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Hand-drawn mountain symbols & forests decor in empty zones */}
            <g fill="none" stroke="#3d3428" strokeWidth="2" opacity="0.45">
              {/* Mountain cluster 1 */}
              <path d="M 80,180 L 105,130 L 130,180 Z M 105,170 L 130,120 L 155,170 Z" />
              <text x="90" y="105" fill="#5c4f3c" fontSize="10" className="font-serif italic font-bold">Serra Altiva</text>
              
              {/* Mountain cluster 2 */}
              <path d="M 860,190 L 885,150 L 910,190 Z" />
              <path d="M 890,190 L 915,140 L 940,190 Z" />

              {/* Little pine/oak forests representation */}
              <g fill="#1a2618" opacity="0.3" stroke="none">
                <circle cx="280" cy="110" r="14" />
                <circle cx="300" cy="120" r="11" />
                <circle cx="265" cy="125" r="9" />
                
                <circle cx="780" cy="540" r="16" />
                <circle cx="800" cy="550" r="12" />
                <circle cx="765" cy="560" r="10" />
              </g>
              <text x="250" y="145" fill="#22361f" fontSize="10" className="font-serif italic font-bold opacity-30">Mata Real</text>
            </g>

            {/* Compass Rose layout */}
            <g transform="translate(110, 110) scale(0.75)" opacity="0.7">
              <circle cx="0" cy="0" r="28" fill="none" stroke="#5c4f3c" strokeWidth="1.5" />
              <path d="M 0,-35 L 0,35 M -35,0 L 35,0 M -22,-22 L 22,22 M -22,22 L 22,-22" stroke="#5c4f3c" strokeWidth="1" />
              <polygon points="0,-40 4,-8 -4,-8" fill="#c29d44" />
              <text x="-4" y="-43" fill="#c29d44" fontSize="11" className="font-semibold">N</text>
            </g>

            {/* DRAWING PATH LINES & BRIDGES */}
            {campaignLocations.map((loc, i) => {
              if (i === campaignLocations.length - 1) return null;
              
              const nextLoc = campaignLocations[i + 1];
              const pathBezier = getBezierPath(loc, nextLoc);
              const pathMid = getPathMiddle(loc, nextLoc);
              const decoration = getPathDecoration(selectedCampaign, i);
              
              // Compute state of the path
              // The path segment is conquered/illuminated if the starting location has been conquered
              const startingNodeConquered = isLocConquered(loc);
              const pathUnlocked = isLocUnlocked(nextLoc, i + 1);

              let pathStroke = "#5c4938"; // Standard parchment dark brown path
              let pathWidth = "3.5";
              let dashClass = "";
              let strokeDash = "6, 8";

              if (startingNodeConquered) {
                // Illuminated - sparkling shiny path (emerald/gold)
                pathStroke = "#10b981"; // Radiant Emerald
                pathWidth = "5";
                dashClass = "animate-medieval-path";
                strokeDash = "8, 6";
              } else if (pathUnlocked) {
                // Unlocked but not yet traversed (dotted golden)
                pathStroke = "#d97706"; // Ochre Gold
                pathWidth = "4";
                strokeDash = "4, 6";
              } else {
                // Dark/Locked path
                pathStroke = "#3a2d21";
                pathWidth = "2.5";
                strokeDash = "8, 12";
              }

              return (
                <g key={`path-${loc.id}-${nextLoc.id}`}>
                  {/* Behind Shadow Glow layer for active path */}
                  {startingNodeConquered && (
                    <path
                      d={pathBezier}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="10"
                      strokeLinecap="round"
                      opacity="0.25"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Route Line */}
                  <path
                    d={pathBezier}
                    fill="none"
                    stroke={pathStroke}
                    strokeWidth={pathWidth}
                    strokeDasharray={strokeDash}
                    strokeLinecap="round"
                    className={dashClass}
                    opacity="0.85"
                  />

                  {/* Medieval Route Landmarks (Bridges, Trails, Forests labels) */}
                  {pathUnlocked && (
                    <g transform={`translate(${pathMid.x}, ${pathMid.y - 14})`}>
                      {/* Interactive visual symbol */}
                      <rect 
                        x="-14" 
                        y="-12" 
                        width="28" 
                        height="24" 
                        rx="4" 
                        fill="#FAF3DC" 
                        stroke="#7A4B24" 
                        strokeWidth="1.5" 
                        className="shadow-sm opacity-95" 
                      />
                      <text x="0" y="4" fontSize="13" textAnchor="middle" className="select-none">
                        {decoration.icon}
                      </text>
                      
                      {/* Miniature Text Label (only on larger hover ideally, but let's show inline) */}
                      <text 
                        x="0" 
                        y="23" 
                        fill="#5c4f3c" 
                        fontSize="8" 
                        textAnchor="middle" 
                        className="font-bold select-none whitespace-nowrap bg-medieval-dark px-1"
                      >
                        {decoration.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* HOTSPOTS OVERLAY LAYER */}
          {campaignLocations.map((loc, i) => {
            const unlocked = isLocUnlocked(loc, i);
            const conquered = isLocConquered(loc);
            const selected = selectedLocation?.id === loc.id;
            const crest = getParishCrest(loc.id);

            // Compute pin/crest status layout
            let borderClass = crest.border;
            let bgClass = crest.gradient;
            let iconElement = <span className="text-sm">{crest.symbol}</span>;
            let badgeText = `Dificuldade ${'★'.repeat(loc.difficulty)}`;
            let badgeClass = "text-medieval-gold border-medieval-border bg-medieval-panel";
            let pinPulse = "";

            if (!unlocked) {
              bgClass = "from-stone-900 to-stone-950 grayscale";
              borderClass = "border-stone-700 opacity-60";
              iconElement = <Lock className="w-3.5 h-3.5 text-stone-500" />;
              badgeText = "Território Bloqueado";
              badgeClass = "text-stone-500 border-stone-800 bg-stone-950/60";
            } else if (conquered) {
              borderClass = "border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
              badgeText = "Reino Conquistado";
              badgeClass = "text-emerald-400 border-emerald-500 bg-emerald-950/80 font-bold";
            } else if (selected) {
              borderClass = "border-red-400 ring-4 ring-red-500/50 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.7)]";
              pinPulse = "animate-pulse";
              badgeText = "Desafio Ativo";
              badgeClass = "text-red-400 border-red-500 bg-red-950/80 font-black";
            } else {
              // Unconquered but available
              pinPulse = "animate-bounce duration-1000";
              badgeText = "Disponível para Desafio";
              badgeClass = "text-amber-300 border-amber-500 bg-amber-950/80 font-bold animate-pulse";
            }

            return (
              <button
                id={`hotspot-${loc.id}`}
                key={loc.id}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                disabled={!unlocked && false} // Allow selecting locked to show details in panel
                onClick={() => onSelectLocation(loc)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center group cursor-pointer z-10 transition-all duration-300 hover:scale-105"
              >
                {/* Node Container containing heraldic crest shield */}
                <div className="relative">
                  {/* HOISTED FLAG ANIMATION ON CONQUEST */}
                  {conquered && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20 animate-medieval-flag">
                      <div className="w-0.5 h-6 bg-amber-800" /> {/* Flag Pole */}
                      {/* Flying flag banner */}
                      <div className="absolute top-0 left-0.5 w-7 h-4 bg-emerald-600 border border-emerald-400 rounded-r shadow-md flex items-center justify-center overflow-hidden">
                        {/* Golden heraldic cross on flag */}
                        <div className="w-full h-full relative flex items-center justify-center">
                          <div className="absolute w-full h-0.5 bg-medieval-gold" />
                          <div className="absolute h-full w-0.5 bg-medieval-gold" />
                          <span className="text-[6px] text-white font-black drop-shadow-xs scale-75 z-10">LUSA</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WAX SEAL OF CONQUEST AT THE BOTTOM RIGHT */}
                  {conquered && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-700 border-2 border-red-500 flex items-center justify-center shadow-lg text-[8px] text-white font-black z-25 transform rotate-12">
                      ✠
                    </div>
                  )}

                  {/* Heraldic Shield Crest Pin */}
                  <div className={`flex items-center justify-center w-10 h-11 bg-gradient-to-b rounded-b-xl rounded-t-sm border-2 transition-all duration-300 ${bgClass} ${borderClass} ${pinPulse} shadow-md`}>
                    {iconElement}
                  </div>
                </div>

                {/* Styled Hover & Active Label */}
                <div className={`ml-3 px-3 py-1 rounded-lg text-xs font-serif border flex flex-col items-start shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-105 group-hover:z-30 transition-all ${
                  selected 
                    ? 'opacity-100 scale-110 border-red-500 bg-red-950 text-white font-bold ring-2 ring-red-500/25 z-20 shadow-lg' 
                    : 'bg-[#FAF3DC]/95 border-[#7A4B24]/40 text-amber-950'
                }`}>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-amber-950 text-[11px] leading-tight tracking-wide uppercase">
                      {loc.name}
                    </span>
                    {conquered && <span className="text-[10px]">👑</span>}
                  </div>
                  
                  <span className={`text-[8px] px-1 mt-0.5 rounded-sm border leading-none font-mono ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campaign Map Legend Footer */}
      <div className="bg-medieval-panel border-t border-medieval-border p-3 px-6 flex flex-wrap justify-between items-center gap-4 text-xs z-10">
        <div className="flex gap-4 text-medieval-text/80 font-serif">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-4 rounded-b-md bg-gradient-to-b from-emerald-600 to-emerald-950 border border-emerald-400" />
            <span>Conquistada (Bandeira Hasteada)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-4 rounded-b-md bg-gradient-to-b from-amber-600 to-amber-950 border border-amber-400" />
            <span>Disponível para Torneio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-4 rounded-b-md bg-stone-900 to-stone-950 border border-stone-700" />
            <span>Território Bloqueado</span>
          </div>
        </div>
        <div className="text-medieval-gold font-mono text-[10px] tracking-wider uppercase">
          {conqueredCount} / 4 Freguesias Pacificadas nesta Campanha
        </div>
      </div>
    </div>
  );
}
