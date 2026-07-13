/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../types';
import { Trophy, Award, Coins, Compass, BookOpen, RotateCcw, Eye } from 'lucide-react';

interface VictoryScreenProps {
  player: Player;
  onExplore: () => void;
  onRestart: () => void;
}

export default function VictoryScreen({
  player,
  onExplore,
  onRestart
}: VictoryScreenProps) {
  // Win rate calc
  const totalFights = player.victories + player.defeats;
  const winRate = totalFights > 0 ? Math.round((player.victories / totalFights) * 100) : 0;

  return (
    <div id="victory-screen-container" className="min-h-screen bg-medieval-bg flex items-center justify-center p-4 md:p-8">
      {/* Decorative fullscreen border */}
      <div className="absolute inset-4 md:inset-6 border border-medieval-border/40 pointer-events-none rounded-2xl" />

      {/* Main Parchment Box */}
      <div className="relative max-w-2xl w-full bg-medieval-panel text-medieval-text rounded-3xl border-4 border-medieval-border p-6 md:p-10 shadow-2xl overflow-hidden my-4 text-center medieval-border">
        
        {/* Confetti-like ambient decoration */}
        <div className="absolute top-2 left-2 text-xl text-medieval-gold/30 select-none">❈</div>
        <div className="absolute top-2 right-2 text-xl text-medieval-gold/30 select-none">❈</div>
        <div className="absolute bottom-2 left-2 text-xl text-medieval-gold/30 select-none">❈</div>
        <div className="absolute bottom-2 right-2 text-xl text-medieval-gold/30 select-none">❈</div>

        {/* Golden Trophy Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-medieval-dark border-4 border-medieval-gold flex items-center justify-center text-medieval-gold shadow-[0_0_30px_rgba(194,157,68,0.4)] mb-6 animate-pulse">
          <Trophy className="w-12 h-12" />
        </div>

        <span className="text-xs font-mono tracking-[0.25em] text-medieval-gold uppercase font-bold">
          Campanha Triunfal Concluída
        </span>
        
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-medieval-gold-light leading-tight tracking-tight mt-1 mb-4">
          SENHOR DAS TERRAS DE VALDEVEZ
        </h1>

        <p className="text-sm md:text-base font-serif italic text-medieval-text/90 leading-relaxed max-w-lg mx-auto">
          "A vossa lança correu pelas margens do Vez, pelos caminhos de pedra e pelas terras altas. Derrotastes os maiores campeões e hasteastes o estandarte real em cada reduto. O vosso nome, <strong className="text-medieval-gold font-bold">{player.name}</strong>, ficará guardado na memória e na identidade eterna de Valdevez."
        </p>

        {/* Stats Grid */}
        <div className="my-8 border-t border-b border-medieval-border/40 py-6 max-w-md mx-auto">
          <h4 className="text-xs font-mono uppercase tracking-widest text-medieval-gold-light mb-4 font-bold">Resumo da Vossa Linhagem</h4>
          
          <div className="grid grid-cols-3 gap-3 text-xs font-serif">
            <div className="bg-medieval-dark/50 p-3 rounded-xl border border-medieval-border/60 flex flex-col items-center">
              <Compass className="w-5 h-5 text-medieval-gold mb-1" />
              <span className="text-medieval-gold/80 text-[10px] uppercase font-mono">Conquistas</span>
              <span className="text-base font-bold text-medieval-text mt-0.5">20 / 20</span>
            </div>

            <div className="bg-medieval-dark/50 p-3 rounded-xl border border-medieval-border/60 flex flex-col items-center">
              <Award className="w-5 h-5 text-medieval-gold mb-1" />
              <span className="text-medieval-gold/80 text-[10px] uppercase font-mono">Glória</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5">{winRate}%</span>
              <span className="text-[9px] text-medieval-text/50 font-mono mt-0.5">{player.victories} Vitórias</span>
            </div>

            <div className="bg-medieval-dark/50 p-3 rounded-xl border border-medieval-border/60 flex flex-col items-center">
              <BookOpen className="w-5 h-5 text-red-400 mb-1" />
              <span className="text-medieval-gold/80 text-[10px] uppercase font-mono">Códice</span>
              <span className="text-base font-bold text-medieval-text mt-0.5">20 / 20</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 text-xs font-serif">
            <div className="bg-medieval-dark/50 p-2.5 rounded-xl border border-medieval-border/60 flex items-center justify-between px-4">
              <span className="text-medieval-gold/80 font-semibold">Honra Acumulada:</span>
              <span className="font-bold text-medieval-gold-light">{player.honor}</span>
            </div>
            <div className="bg-medieval-dark/50 p-2.5 rounded-xl border border-medieval-border/60 flex items-center justify-between px-4">
              <span className="text-medieval-gold/80 font-semibold">Moedas no Cofre:</span>
              <span className="font-mono font-bold text-medieval-gold-light">{player.coins}</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <button
            onClick={onExplore}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-serif text-sm font-bold text-white bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 border border-emerald-600/50 cursor-pointer shadow-md active:scale-98 transition-all"
          >
            <Eye className="w-4 h-4" />
            Continuar a Explorar
          </button>
          
          <button
            onClick={() => {
              if (window.confirm("Tendes a certeza de que quereis apagar este magnífico progresso e reiniciar a vossa campanha medieval de 1141?")) {
                onRestart();
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-serif text-sm font-bold text-medieval-gold bg-medieval-dark border border-medieval-border/80 hover:bg-medieval-panel cursor-pointer shadow-md active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar Campanha
          </button>
        </div>

        {/* Historical Epilogue */}
        <p className="mt-8 text-[11px] font-serif text-medieval-text/50 italic leading-normal">
          "O Tratado de Zamora seria assinado três anos depois, em 1143, ratificando a independência de Portugal graças aos heróis das margens do Vez."
        </p>
      </div>
    </div>
  );
}
