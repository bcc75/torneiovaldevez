/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Player, HistoryCard } from '../types';
import { historyCards } from '../data/cards';
import { locations } from '../data/locations';
import { Lock, BookOpen, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

interface CardsViewProps {
  player: Player;
}

export default function CardsView({ player }: CardsViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const isCardUnlocked = (card: HistoryCard) => {
    return player.conqueredLocations.includes(card.locationId);
  };

  const getCardLocationName = (locationId: string) => {
    const loc = locations.find(l => l.id === locationId);
    return loc ? loc.name : 'Terras Desconhecidas';
  };

  // Filter cards
  const filteredCards = historyCards.filter(card => {
    const unlocked = isCardUnlocked(card);
    if (activeFilter === 'unlocked') return unlocked;
    if (activeFilter === 'locked') return !unlocked;
    return true; // 'all'
  });

  const totalUnlocked = historyCards.filter(isCardUnlocked).length;

  return (
    <div id="cards-view-container" className="h-full w-full bg-medieval-panel text-medieval-text rounded-2xl border-4 border-medieval-border p-4 shadow-2xl relative flex flex-col overflow-hidden medieval-border">
      {/* Decorative metal corner rivets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />

      {/* Header */}
      <div className="border-b border-medieval-border/50 pb-3 mb-4 flex flex-wrap justify-between items-end gap-4 shrink-0">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-medieval-gold uppercase font-bold">Arquivo de Memórias de Valdevez</span>
          <h2 className="text-2xl font-serif font-bold text-medieval-gold leading-none mt-1">Cartas da Memória</h2>
          <p className="text-xs text-medieval-text/80 font-serif italic mt-1 max-w-xl">
            "Ao conquistar localidades e provar vosso valor, desvendareis registos antigos e crónicas medievais sobre o recontro de 1141."
          </p>
        </div>

        {/* Stats and filters combined */}
        <div className="bg-medieval-dark text-medieval-text px-3 py-1.5 rounded-xl border border-medieval-border text-center font-mono text-xs shadow-md shrink-0">
          <span className="text-medieval-gold uppercase font-bold tracking-wider text-[9px] block">Códice Desbloqueado</span>
          <span className="text-lg font-bold font-serif text-medieval-gold-light">{totalUnlocked} / {historyCards.length}</span>
        </div>
      </div>

      {/* Interactive Filters Tab Bar */}
      <div className="flex gap-1.5 mb-4 shrink-0">
        {[
          { id: 'all', label: 'Tudo' },
          { id: 'unlocked', label: 'Desbloqueadas' },
          { id: 'locked', label: 'Bloqueadas' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-bold border transition-all cursor-pointer ${
              activeFilter === filter.id
                ? 'bg-medieval-gold text-medieval-bg border-medieval-border shadow-sm font-black'
                : 'bg-medieval-dark text-medieval-text/75 border-medieval-border hover:bg-medieval-dark/80'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Scrollable grid section */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
        {/* Bento-style Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map(card => {
            const unlocked = isCardUnlocked(card);
            const locationName = getCardLocationName(card.locationId);

            return (
              <div
                key={card.id}
                className={`p-4 rounded-xl border-2 transition-all relative flex flex-col justify-between ${
                  unlocked
                    ? 'bg-medieval-dark/50 border-medieval-border/50 hover:scale-[1.01] hover:shadow-md hover:border-medieval-gold/50 text-medieval-text'
                    : 'bg-medieval-dark/10 border-medieval-border/20 opacity-40 filter select-none text-medieval-text/60'
                }`}
              >
                {/* Type Badge */}
                <div className="flex justify-between items-center mb-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wide border ${
                    unlocked
                      ? 'bg-medieval-dark text-medieval-gold border-medieval-border/60 font-bold'
                      : 'bg-medieval-dark/40 text-medieval-text/40 border-medieval-border/20'
                  }`}>
                    {card.type}
                  </span>

                  {unlocked ? (
                    <span className="flex items-center gap-1 text-[9px] font-serif text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> {locationName}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-serif text-medieval-text/50 font-medium">
                      <Lock className="w-3 h-3 text-medieval-gold/40" /> Requer {locationName}
                    </span>
                  )}
                </div>

                {/* Main Text Content */}
                {unlocked ? (
                  <div className="space-y-1.5 mt-0.5">
                    <h4 className="font-serif font-bold text-base text-medieval-gold-light leading-tight flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-medieval-gold shrink-0" />
                      {card.title}
                    </h4>
                    <p className="text-xs text-medieval-text/90 leading-relaxed font-serif text-justify pt-0.5 pl-2 border-l-2 border-medieval-gold/30">
                      {card.text}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 mt-0.5 flex flex-col justify-center items-center py-4 text-center">
                    <Lock className="w-6 h-6 text-medieval-gold/40" />
                    <h4 className="font-serif font-bold text-sm text-medieval-text/60 leading-none mt-1">Segredo da Memória</h4>
                    <p className="text-[11px] text-medieval-text/50 leading-relaxed max-w-[200px] font-serif">
                      Conquistai a localidade de <strong className="text-medieval-gold/80 font-bold">{locationName}</strong> nas liças para ler esta página.
                    </p>
                  </div>
                )}

                {/* Card Footer Decorator */}
                {unlocked && (
                  <div className="mt-3 border-t border-medieval-border/40 pt-1.5 flex justify-between items-center text-[8px] text-medieval-gold/60 font-mono tracking-wider uppercase">
                    <span>Valdevez, AD 1141</span>
                    <span>Registum Codicis</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty Fallback State */}
        {filteredCards.length === 0 && (
          <div className="text-center py-8 bg-medieval-dark/30 rounded-xl border border-dashed border-medieval-border/55">
            <HelpCircle className="w-10 h-10 text-medieval-gold/40 mx-auto" />
            <h4 className="font-serif font-bold text-sm text-medieval-text/60 mt-2">Nenhuma Carta Encontrada</h4>
            <p className="text-xs text-medieval-text/40 mt-1 max-w-[280px] mx-auto font-serif">
              Não existem cartas correspondentes a este filtro no vosso códice no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
