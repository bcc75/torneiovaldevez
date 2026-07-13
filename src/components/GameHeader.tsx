/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../types';
import { Map, Swords, BookOpen, User, Coins, Award, Compass, Shield, Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface GameHeaderProps {
  player: Player;
  activeTab: 'map' | 'shop' | 'cards' | 'panel' | 'about';
  onTabChange: (tab: 'map' | 'shop' | 'cards' | 'panel' | 'about') => void;
  totalLocations: number;
  isPlaying: boolean;
  onToggleMusic: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onGoToStartScreen?: () => void;
}

export default function GameHeader({
  player,
  activeTab,
  onTabChange,
  totalLocations,
  isPlaying,
  onToggleMusic,
  volume,
  onVolumeChange,
  onGoToStartScreen
}: GameHeaderProps) {
  const conqueredCount = player.conqueredLocations.length;
  const progressPercent = Math.round((conqueredCount / totalLocations) * 100);

  return (
    <header id="game-header-bar" className="bg-[#121815] border-b-2 border-medieval-border text-[#e4e1d3] py-2 px-4 shadow-2xl z-30 select-none shrink-0">
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Logo and Knight Quick Info */}
        <button
          onClick={onGoToStartScreen}
          className="flex items-center gap-3 text-left hover:brightness-110 active:scale-98 transition-all cursor-pointer focus:outline-none group relative border border-transparent hover:border-medieval-gold/30 rounded-xl p-1 -m-1"
          title="Voltar ao Ecrã Inicial (Mudar Nome / Recomeçar)"
        >
          <div className="w-10 h-10 bg-sky-950/80 border border-medieval-gold flex items-center justify-center rounded-lg shrink-0 shadow-md overflow-hidden relative group-hover:border-medieval-gold-light transition-colors">
            <img
              src="https://lh3.googleusercontent.com/d/1n9vtT_gDUH1IZcAw0eq7VJnMCC3FNExd"
              alt="Vosso Cavaleiro"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-[9px] font-bold text-medieval-gold text-center leading-none">Voltar</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base md:text-lg font-serif font-black text-medieval-gold tracking-widest uppercase leading-none group-hover:text-medieval-gold-light transition-colors">
                TORNEIO DE VALDEVEZ
              </h1>
              <span className="bg-medieval-gold text-medieval-bg text-[8px] font-mono font-black uppercase tracking-wider px-1 py-0.2 rounded border border-medieval-border/30">
                1141
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
              <span className="text-medieval-text/90 font-serif font-bold truncate max-w-[150px]">{player.name || "Sem Nome"}</span>
              <span className="text-medieval-border font-mono opacity-50">|</span>
              <span className="text-medieval-gold-light font-bold font-serif uppercase tracking-widest text-[9px] flex items-center gap-1">
                Nível {player.level}
                <span className="text-[8px] text-medieval-text/40 lowercase font-normal italic font-serif opacity-0 group-hover:opacity-100 transition-opacity">(clique para ecrã inicial)</span>
              </span>
            </div>
          </div>
        </button>

        {/* Right Section: Stats and Music Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-1.5 text-[10px] sm:text-xs shrink-0 flex-1 sm:flex-none">
            {/* Coins */}
            <div className="bg-medieval-dark/70 border border-medieval-border/50 rounded-lg px-2 py-1 flex items-center gap-1.5 text-medieval-text">
              <Coins className="w-3.5 h-3.5 text-medieval-gold shrink-0" />
              <div className="leading-tight">
                <span className="text-[8px] uppercase font-mono tracking-wider text-medieval-text/40 block">Moedas</span>
                <span className="font-mono font-bold text-xs text-medieval-gold">{player.coins}</span>
              </div>
            </div>

            {/* Honor */}
            <div className="bg-medieval-dark/70 border border-medieval-border/50 rounded-lg px-2 py-1 flex items-center gap-1.5 text-medieval-text">
              <Award className="w-3.5 h-3.5 text-medieval-gold-light shrink-0" />
              <div className="leading-tight">
                <span className="text-[8px] uppercase font-mono tracking-wider text-medieval-text/40 block">Honra</span>
                <span className="font-serif font-bold text-xs text-medieval-gold-light">{player.honor}</span>
              </div>
            </div>

            {/* Influence */}
            <div className="bg-medieval-dark/70 border border-medieval-border/50 rounded-lg px-2 py-1 flex items-center gap-1.5 text-medieval-text">
              <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="leading-tight">
                <span className="text-[8px] uppercase font-mono tracking-wider text-medieval-text/40 block">Influência</span>
                <span className="font-serif font-bold text-xs text-sky-300">{player.influence}</span>
              </div>
            </div>

            {/* Conquered percentage */}
            <div className="bg-medieval-dark/70 border border-medieval-border/50 rounded-lg px-2 py-1 flex items-center gap-1.5 text-medieval-text">
              <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <div className="leading-tight w-full min-w-[70px]">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[8px] uppercase font-mono tracking-wider text-medieval-text/40">Domínio</span>
                  <span className="text-[8px] font-mono text-red-400 font-bold">{conqueredCount}/{totalLocations}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="flex-1 bg-medieval-dark h-1 rounded-full overflow-hidden border border-medieval-border/30">
                    <div style={{ width: `${progressPercent}%` }} className="bg-red-500 h-full rounded-full" />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-medieval-text/70">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Music Smooth Control */}
          <div className="bg-medieval-dark/75 border border-medieval-border/40 rounded-lg px-2.5 py-1 flex items-center gap-2 text-medieval-text shrink-0 sm:self-stretch justify-between sm:justify-start">
            <button
              onClick={onToggleMusic}
              className="p-1 rounded bg-medieval-panel text-medieval-gold hover:text-medieval-gold-light border border-medieval-border/30 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
              title={isPlaying ? "Silenciar Música" : "Tocar Música Suave"}
            >
              {isPlaying ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 opacity-60" />}
            </button>
            <div className="flex flex-col">
              <span className="text-[7px] uppercase font-mono tracking-wider text-medieval-text/40 leading-none">Música Suave</span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.02"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-14 h-1 accent-medieval-gold bg-medieval-dark rounded-lg cursor-pointer mt-1"
                title={`Volume: ${Math.round(volume * 200)}%`}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Primary Tab Navigation */}
      <div className="w-full mt-1.5 pt-1 border-t border-medieval-border/35 flex overflow-x-auto gap-1.5 scrollbar-none font-serif text-xs">
        {[
          { id: 'map', label: 'Terras de Valdevez', icon: <Map className="w-3.5 h-3.5" /> },
          { id: 'shop', label: 'Arsenal Real', icon: <Swords className="w-3.5 h-3.5" /> },
          { id: 'cards', label: 'Cartas da Memória', icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'panel', label: 'Painel do Cavaleiro', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'about', label: 'Sobre o Jogo', icon: <HelpCircle className="w-3.5 h-3.5" /> }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              id={`nav-tab-${tab.id}`}
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-bold border-b-2 transition-all cursor-pointer text-xs whitespace-nowrap ${
                active
                  ? 'bg-medieval-panel text-medieval-gold border-medieval-gold shadow-md -mb-2 pt-2 translate-y-[2px] border-b-2 border-b-medieval-gold'
                  : 'text-medieval-text/60 hover:text-medieval-gold border-transparent hover:bg-medieval-dark/40'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
