/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Location, Player } from '../types';
import { Shield, Coins, Award, Compass, Landmark, ArrowRight, Lock, BookOpen } from 'lucide-react';

interface LocationPanelProps {
  location: Location | null;
  player: Player;
  onChallenge: (loc: Location) => void;
  onClose: () => void;
}

export default function LocationPanel({
  location,
  player,
  onChallenge,
  onClose
}: LocationPanelProps) {
  if (!location) return null;

  const isConquered = player.conqueredLocations.includes(location.id);
  const isLevelLocked = location.requiredLevel ? player.level < location.requiredLevel : false;

  // Rating stars helper
  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-base font-bold ${
              i < count ? 'text-amber-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : 'text-gray-400 opacity-30'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div id="location-panel-drawer" className="bg-medieval-panel text-medieval-text rounded-2xl border-4 border-medieval-border p-4 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden medieval-border">
      {/* Decorative metal rivets in corners */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-gold/40 border border-medieval-border" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-gold/40 border border-medieval-border" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-gold/40 border border-medieval-border" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-gold/40 border border-medieval-border" />

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
        {/* Header with Title and Close button */}
        <div className="flex justify-between items-start border-b border-medieval-border/50 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-medieval-gold uppercase font-bold">Localidade de Valdevez</span>
            <h3 className="text-2xl font-serif font-bold text-medieval-gold leading-tight">{location.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-medieval-gold hover:text-white bg-medieval-dark hover:bg-medieval-dark/80 p-1.5 rounded-lg border border-medieval-border transition-all font-sans text-xs font-bold cursor-pointer"
          >
            Fechar ×
          </button>
        </div>

        {/* State Badge */}
        <div className="mb-4">
          {isConquered ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
              ✓ Território Conquistado
            </span>
          ) : isLevelLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold bg-red-950/40 text-red-400 border border-red-800/60 animate-pulse">
              <Lock className="w-3.5 h-3.5" /> Requer Nível {location.requiredLevel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold bg-medieval-gold/15 text-medieval-gold border border-medieval-border">
              ⚔ Desafio Aberto
            </span>
          )}
        </div>

        {/* Short description */}
        <p className="text-sm text-medieval-text/90 leading-relaxed font-serif italic mb-4 p-3 bg-medieval-dark/50 rounded-lg border border-medieval-border/50">
          "{location.description}"
        </p>

        {/* Difficulty, Monument & History info */}
        <div className="space-y-3.5 text-xs text-medieval-text/90">
          <div className="flex items-center justify-between bg-medieval-dark/50 p-2 rounded border border-medieval-border">
            <span className="font-serif text-medieval-gold font-semibold">Dificuldade da Liça:</span>
            {renderStars(location.difficulty)}
          </div>

          <div className="flex items-start gap-2.5">
            <Landmark className="w-5 h-5 text-medieval-gold-light shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-medieval-gold leading-none mb-1">Monumento de Destaque</h4>
              <p className="text-medieval-text/80 text-xs">{location.monument}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <BookOpen className="w-5 h-5 text-medieval-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-medieval-gold leading-none mb-1">Nota Histórica (1141)</h4>
              <p className="text-medieval-text/80 leading-relaxed text-[11px]">{location.historicalNote}</p>
            </div>
          </div>
        </div>

        {/* Adversary Profile Box */}
        <div className="mt-5 p-3.5 rounded-xl border border-medieval-border bg-medieval-dark/30">
          <span className="text-[9px] font-mono tracking-wider text-medieval-gold uppercase font-semibold block mb-1">Cavaleiro Adversário</span>
          <div className="flex items-center gap-3">
            {/* Crest Avatar */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-medieval-gold to-medieval-gold-light border border-medieval-border flex items-center justify-center text-medieval-bg font-serif text-lg font-bold shadow-sm">
              {location.enemyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-serif text-sm font-black text-medieval-text leading-none">{location.enemyName}</h4>
              <span className="text-xs text-medieval-text/60 italic">{location.enemyTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards and Challenge Action Footer */}
      <div className="mt-6 border-t border-medieval-border/50 pt-4">
        <h4 className="font-serif text-xs font-bold text-medieval-gold mb-2">Recompensas da Conquista:</h4>
        <div className="grid grid-cols-3 gap-2 text-xs mb-4">
          <div className="flex items-center gap-1.5 bg-medieval-dark/80 p-2 rounded border border-medieval-border justify-center">
            <Coins className="w-4 h-4 text-medieval-gold" />
            <span className="font-mono font-bold text-medieval-gold">+{location.rewardCoins}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-medieval-dark/80 p-2 rounded border border-medieval-border justify-center">
            <Award className="w-4 h-4 text-medieval-gold-light" />
            <span className="font-serif font-bold text-medieval-gold-light">+{location.rewardHonor} Honra</span>
          </div>
          <div className="flex items-center gap-1.5 bg-medieval-dark/80 p-2 rounded border border-medieval-border justify-center">
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="font-serif font-bold text-sky-300">+{location.influence} Infl.</span>
          </div>
        </div>

        {isLevelLocked ? (
          <div className="w-full text-center text-red-400 font-serif font-bold bg-red-950/40 border border-red-800/60 p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5">
            <Lock className="w-4 h-4 shrink-0" />
            Bloqueado: Requer Nível {location.requiredLevel} (Estais no Nível {player.level})
          </div>
        ) : (
          <button
            onClick={() => onChallenge(location)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-serif text-base font-black text-medieval-bg bg-medieval-gold hover:bg-medieval-gold-light border-2 border-medieval-border cursor-pointer shadow-lg active:scale-98 transition-all"
          >
            <Shield className="w-5 h-5 animate-pulse" />
            {isConquered ? "Repetir Justa de Honra" : "Desafiar para Justa!"}
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}
