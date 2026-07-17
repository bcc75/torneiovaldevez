/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player } from '../types';
import { INITIAL_PLAYER } from '../utils/storage';
import { Shield, Swords, Compass, Play, BookOpen, AlertCircle, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

import guerreiroPortucal from '../../assets/guerreiro-portucal.png';
import guerreiroValdevez from '../../assets/guerreiro_valdevez.png';

interface StartScreenProps {
  hasSavedGame: boolean;
  onStartNewGame: (name: string) => void;
  onContinueGame: (updatedName?: string) => void;
  isPlaying: boolean;
  onToggleMusic: () => void;
  currentPlayerName?: string;
}

export default function StartScreen({
  hasSavedGame,
  onStartNewGame,
  onContinueGame,
  isPlaying,
  onToggleMusic,
  currentPlayerName
}: StartScreenProps) {
  const [name, setName] = useState(currentPlayerName || '');
  const [error, setError] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignError, setNewCampaignError] = useState('');

  useEffect(() => {
    if (currentPlayerName) {
      setName(currentPlayerName);
    }
  }, [currentPlayerName]);

  const handleStart = () => {
    if (hasSavedGame) {
      setNewCampaignName('');
      setNewCampaignError('');
      setShowConfirmReset(true);
    } else {
      const trimmed = name.trim();
      if (!trimmed) {
        setError('Por favor, introduzi o nome do vosso cavaleiro.');
        return;
      }
      if (trimmed.length > 28) {
        setError('O nome do vosso cavaleiro é demasiado comprido (máx. 28 caracteres).');
        return;
      }
      setError('');
      onStartNewGame(trimmed);
    }
  };

  const handleContinue = () => {
    if (hasSavedGame && currentPlayerName) {
      setError('');
      onContinueGame(currentPlayerName);
    } else {
      const trimmed = name.trim();
      if (!trimmed) {
        setError('Por favor, introduzi o nome do vosso cavaleiro.');
        return;
      }
      if (trimmed.length > 28) {
        setError('O nome do vosso cavaleiro é demasiado comprido (máx. 28 caracteres).');
        return;
      }
      setError('');
      onContinueGame(trimmed);
    }
  };

  return (
    <div id="start-screen-container" className="h-screen max-h-screen w-screen bg-medieval-bg text-medieval-text flex items-center justify-center p-3 md:p-6 relative overflow-hidden">
      {/* Decorative full screen border */}
      <div className="absolute inset-3 md:inset-5 border-2 border-medieval-border/40 pointer-events-none rounded-2xl" />
      
      {/* Main Medieval Box */}
      <div className="relative max-w-4xl w-full bg-medieval-panel text-medieval-text rounded-2xl border-4 border-medieval-border p-5 md:p-8 shadow-2xl overflow-hidden medieval-border flex flex-col justify-between max-h-[92vh]">
        
        {/* Calligraphic Corner Corner pieces */}
        <div className="absolute top-2 left-2 text-xl opacity-30 select-none text-medieval-gold">❧</div>
        <div className="absolute top-2 right-2 text-xl opacity-30 select-none text-medieval-gold">❧</div>
        <div className="absolute bottom-2 left-2 text-xl opacity-30 select-none text-medieval-gold">❧</div>
        <div className="absolute bottom-2 right-2 text-xl opacity-30 select-none text-medieval-gold">❧</div>

        {/* Floating Sound Toggle Button */}
        <button
          onClick={onToggleMusic}
          className="absolute top-3 right-8 z-50 p-1.5 rounded-lg bg-medieval-dark/80 border border-medieval-border/50 text-medieval-gold hover:text-medieval-gold-light hover:border-medieval-gold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1 text-[10px] uppercase font-mono font-bold tracking-wider"
          title={isPlaying ? "Silenciar Música" : "Tocar Música"}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Som Ativo</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Música Suave</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1 min-h-0">
          
          {/* Left Column: Crest, Title, Prologue (md:col-span-6) */}
          <div className="md:col-span-6 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-medieval-border/30 pb-4 md:pb-0 md:pr-6 h-full justify-center">
            <div className="w-24 h-24 flex items-center justify-center relative mb-3">
              <img
                src={guerreiroValdevez}
                alt="Símbolo do Torneio"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(196,166,97,0.35)]"
              />
              <span className="absolute -bottom-1.5 bg-medieval-gold text-medieval-bg text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-medieval-border shadow-md">
                1141
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-black text-medieval-gold tracking-tight mt-1 mb-1 leading-none drop-shadow-sm">
              TORNEIO DE VALDEVEZ
            </h1>
            
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-medieval-border to-transparent my-1" />
            
            <p className="text-[10px] md:text-xs text-medieval-text/70 font-serif italic tracking-wide uppercase font-semibold">
              Honra, Terra e Memória
            </p>

            {/* Historical Prologue */}
            <div className="mt-4 p-3 rounded-xl border border-medieval-border bg-medieval-dark text-justify font-serif text-[11px] md:text-xs leading-relaxed text-medieval-text/95 relative shadow-inner">
              <span className="absolute -top-3 left-4 bg-medieval-panel px-2 text-medieval-gold font-bold text-[9px] font-serif">Prólogo Histórico</span>
              <p>
                "Na primavera de 1141, os exércitos de Afonso Henriques e Afonso VII de Leão e Castela, seu primo, encontram–se no Vale do Vez, protagonizando um dos momentos mais importantes e fundadores da História de Portugal.
                Para evitar a carnificina dos exércitos de infantaria, os nobres acordaram uma justa: o Recontro de Valdevez, um torneio onde os melhores cavaleiros medem aço e honra para decidir o destino do território."
              </p>
            </div>
          </div>

          {/* Right Column: Setup, Factions, Actions (md:col-span-6) */}
          <div className="md:col-span-6 flex flex-col justify-center h-full space-y-4">
            
            {/* Knight Info Display (Resume mode) OR Input Form (New-user mode) */}
            {hasSavedGame && currentPlayerName ? (
              <div className="w-full p-4 rounded-xl border-2 border-medieval-border bg-medieval-dark/80 text-center relative shadow-inner">
                <span className="absolute -top-3 left-4 bg-medieval-panel px-2 text-medieval-gold font-bold text-[9px] font-serif uppercase tracking-wider">
                  Cavaleiro Ativo
                </span>
                <div className="text-medieval-gold font-serif font-black text-xl tracking-wide uppercase drop-shadow-sm">
                  {currentPlayerName}
                </div>
                <p className="text-[10px] text-medieval-text/60 font-serif italic mt-1 uppercase tracking-widest">
                  Pronto para continuar o vosso Torneio
                </p>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label htmlFor="knight-name-input" className="text-xs md:text-sm font-serif font-bold text-medieval-gold uppercase tracking-wider whitespace-nowrap shrink-0">
                    Nome do Vosso Cavaleiro:
                  </label>
                  <div className="relative flex-1 w-full">
                    <input
                      id="knight-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (e.target.value.trim()) setError('');
                      }}
                      placeholder="Ex: D. Lourenço de Giela"
                      className="w-full px-3 py-2 rounded-lg border-2 border-medieval-border bg-medieval-dark text-medieval-text placeholder-medieval-text/35 font-serif font-semibold text-sm focus:outline-none focus:border-medieval-gold focus:ring-1 focus:ring-medieval-gold transition-all shadow-inner"
                    />
                  </div>
                </div>
                
                {error && (
                  <p className="text-red-400 text-[10px] mt-1 font-serif font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" /> {error}
                  </p>
                )}
              </div>
            )}

            {/* Faction Presentation (No Choice) */}
            <div className="w-full pt-2 border-t border-medieval-border/20">
              <span className="text-[10px] font-serif tracking-wider text-medieval-gold uppercase font-bold block mb-2 text-center">Vossa Aliança:</span>
              <div className="max-w-sm mx-auto p-3 rounded-xl border-2 bg-sky-950/40 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)] flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 bg-sky-900/60 border-sky-300 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner">
                  <img
                    src={guerreiroPortucal}
                    alt="Guerreiro Portucalense (D. Afonso Henriques)"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-left">
                  <span className="text-sky-400 font-serif font-black text-sm block leading-tight">Condado Portucalense</span>
                  <span className="text-[9px] text-sky-300/80 font-mono block mt-0.5">Lidere as hostes de D. Afonso Henriques</span>
                  <span className="inline-block mt-1.5 text-[8px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.2 rounded font-mono font-black uppercase tracking-wider">
                    Guerreiro Azul
                  </span>
                </div>
              </div>
            </div>

            {/* Call-to-actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto">
              {hasSavedGame && (
                <button
                  onClick={handleContinue}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-serif text-sm font-black text-medieval-bg bg-medieval-gold-light hover:bg-medieval-gold border-2 border-medieval-border cursor-pointer shadow-lg active:scale-98 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  Continuar Torneio
                </button>
              )}
              
              <button
                onClick={handleStart}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-serif text-sm font-black border-2 cursor-pointer shadow-lg active:scale-98 transition-all ${
                  hasSavedGame 
                    ? 'bg-medieval-panel text-medieval-gold border-medieval-border hover:bg-medieval-dark' 
                    : 'bg-medieval-gold text-medieval-bg border-medieval-border hover:bg-medieval-gold-light'
                }`}
              >
                <Play className="w-4 h-4 animate-pulse" />
                {hasSavedGame ? 'Nova Campanha' : 'Marchar para a Vila'}
              </button>
            </div>

          </div>
        </div>

        {/* Project Credit Info Footer */}
        <div className="mt-4 border-t border-medieval-border/20 pt-3 w-full text-center text-[9px] text-medieval-text/40 font-mono tracking-wider uppercase shrink-0">
          <span>
            © Torneio de Valdevez |{' '}
            <a
              href="https://bruno.infogenial.pt/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-medieval-gold hover:underline transition-colors duration-200"
            >
              Bruno Cerqueira (infogenial)
            </a>
            , 2026
          </span>
        </div>
      </div>

      {/* Medieval Reset Confirmation Overlay Modal */}
      {showConfirmReset && (
        <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-medieval-panel border-4 border-[#7A1E1E] text-medieval-text rounded-xl p-6 shadow-2xl relative medieval-border text-center">
            <div className="w-16 h-16 rounded-full bg-[#7A1E1E]/20 border-2 border-[#7A1E1E] flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8 text-[#7A1E1E] animate-bounce" />
            </div>
            <h3 className="text-lg font-serif font-bold text-red-400 uppercase tracking-wide">⚠️ Iniciar Nova Campanha</h3>
            
            <p className="mt-2 text-xs font-serif leading-relaxed text-medieval-text/90">
              Já possuís uma campanha em curso. Se iniciardes uma nova jornada, todo o vosso progresso atual será perdido para sempre nas brumas do tempo.
            </p>
            
            <div className="mt-4 border-t border-medieval-border/20 pt-4 text-left">
              <label htmlFor="new-knight-name-input" className="text-xs font-serif font-bold text-medieval-gold uppercase tracking-wider block mb-2">
                Nome do Vosso Novo Cavaleiro:
              </label>
              <input
                id="new-knight-name-input"
                type="text"
                value={newCampaignName}
                onChange={(e) => {
                  setNewCampaignName(e.target.value);
                  if (e.target.value.trim()) setNewCampaignError('');
                }}
                placeholder="Ex: D. Lourenço de Giela"
                className="w-full px-3 py-2 rounded-lg border-2 border-medieval-border bg-medieval-dark text-medieval-text placeholder-medieval-text/35 font-serif font-semibold text-sm focus:outline-none focus:border-medieval-gold focus:ring-1 focus:ring-medieval-gold transition-all shadow-inner"
              />
              {newCampaignError && (
                <p className="text-red-400 text-[10px] mt-1 font-serif font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" /> {newCampaignError}
                </p>
              )}
            </div>

            <p className="mt-4 text-[11px] font-serif italic text-red-400 font-bold">
              Desejais realmente apagar a campanha anterior e recomeçar?
            </p>
            
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const trimmed = newCampaignName.trim();
                  if (!trimmed) {
                    setNewCampaignError('Por favor, introduzi o nome do vosso novo cavaleiro.');
                    return;
                  }
                  if (trimmed.length > 28) {
                    setNewCampaignError('O nome do vosso cavaleiro é demasiado comprido (máx. 28 caracteres).');
                    return;
                  }
                  setNewCampaignError('');
                  setShowConfirmReset(false);
                  onStartNewGame(trimmed);
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#7A1E1E] hover:bg-red-800 text-[#e4e1d3] font-serif font-black text-xs border border-medieval-border/50 cursor-pointer transition-all active:scale-95"
              >
                Apagar e Começar
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  setNewCampaignName('');
                  setNewCampaignError('');
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-medieval-dark hover:bg-medieval-dark/80 text-medieval-gold font-serif font-bold text-xs border border-medieval-border cursor-pointer transition-all active:scale-95"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
