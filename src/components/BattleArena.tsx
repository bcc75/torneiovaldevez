/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Location, Player, JoustBattleState, JoustPassResult, CombatStrategy, ChallengeMode } from '../types';
import {
  calculateJoustPassage,
  calculatePlayabilityIndex,
  getChallengeModifiers,
  getStrategyStaminaCost,
  getStrategyMatchup
} from '../utils/battleLogic';
import { shopItems } from '../data/shopItems';
import KnightSprite from './KnightSprite';
import guerreiroPortucal from '../../assets/guerreiro-portucal.png';
import guerreiroCastela from '../../assets/guerreiro-castela.png';
import fullHdTorneio from '../../assets/full_hd_torneio.png';
import nivel1Torneio from '../../assets/nivel1_torneio.png';
import nivel2Torneio from '../../assets/nivel2_torneio.png';
import nivel3Torneio from '../../assets/nivel3_torneio.png';
import nivel4Torneio from '../../assets/nivel4_torneio.png';
import nivel5Torneio from '../../assets/nivel5_torneio.png';
import clashSound from '../../assets/clash.mp3';
import cheerSound from '../../assets/cheer.mp3';
import {
  Shield,
  Swords,
  Award,
  Coins,
  Compass,
  Trophy,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Flame,
  Zap,
  Landmark,
  BookOpen
} from 'lucide-react';

interface BattleArenaProps {
  location: Location;
  player: Player;
  volume?: number;
  onBattleFinished: (won: boolean, coinsGained: number, honorGained: number, influenceGained: number) => void;
  onCancel: () => void;
  onVisitShop?: () => void;
}

export default function BattleArena({
  location,
  player,
  volume,
  onBattleFinished,
  onCancel,
  onVisitShop
}: BattleArenaProps) {
  // Game states
  const [phase, setPhase] = useState<'prep' | 'fighting' | 'finished'>('prep');
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>('honrado');
  const [selectedStrategy, setSelectedStrategy] = useState<CombatStrategy>('defesa_firme');

  const [battle, setBattle] = useState<JoustBattleState>({
    location,
    currentRound: 1,
    playerRoundsWon: 0,
    enemyRoundsWon: 0,
    passResults: [],
    status: 'idle'
  });

  const [playerStamina, setPlayerStamina] = useState<number>(player.stamina || 100);
  const [enemyStamina, setEnemyStamina] = useState<number>(location.enemyStamina);

  const [activeCommentary, setActiveCommentary] = useState<string>('');
  const [showPassSummary, setShowPassSummary] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Helper for strategy display names
  const getStrategyName = (strat: CombatStrategy): string => {
    switch (strat) {
      case 'ataque_frontal': return "Ataque Frontal";
      case 'defesa_firme': return "Defesa Firme";
      case 'investida_rapida': return "Investida Rápida";
      case 'mira_precisa': return "Mira Precisa";
      case 'finta_contra_ataque': return "Finta e Contra-Ataque";
      default: return String(strat);
    }
  };

  // Helper for strategy description / modifier notes
  const getStrategyDetails = (strat: CombatStrategy): string => {
    switch (strat) {
      case 'ataque_frontal': return "+25% Ataque, -10% Defesa, -5% Velocidade (Consome 20 de Energia). Vence Investida Rápida.";
      case 'defesa_firme': return "+30% Defesa, -10% Ataque, -10% Velocidade (Recupera +15 de Energia!). Vence Ataque Frontal.";
      case 'investida_rapida': return "+30% Velocidade, +10% Ataque, -15% Precisão (Consome 18 de Energia). Vence Mira Precisa.";
      case 'mira_precisa': return "+35% Precisão, -10% Velocidade, -5% Defesa (Consome 15 de Energia). Vence Defesa Firme.";
      case 'finta_contra_ataque': return "+5% Atq, +10% Def, +10% Vel (Consome 22 de Energia). Vence Ataque Frontal, Fraco contra Mira Precisa.";
      default: return "";
    }
  };

  // Calculate current Playability Index for selected option
  const playability = calculatePlayabilityIndex(player, location, selectedStrategy, challengeMode);

  // Challenge mode rewards multipliers
  const modifiers = getChallengeModifiers(challengeMode);
  const adjustedCoins = Math.round(location.rewardCoins * modifiers.rewardCoins);
  const adjustedHonor = Math.round(location.rewardHonor * modifiers.rewardHonor);
  const adjustedInfluence = Math.round(location.influence * modifiers.rewardCoins); // scale influence with coins modifier

  // Player's equipped gear text helpers
  const currentWeapon = shopItems.find(i => i.id === player.weapon)?.name || "Lança de Treino";
  const currentArmor = shopItems.find(i => i.id === player.armor)?.name || "Cota Leve";
  const currentMount = shopItems.find(i => i.id === player.mount)?.name || "Cavalo de Campo";

  // Triggered when entering combat phase
  const handleStartJoustLoop = () => {
    setPhase('fighting');
    setPlayerStamina(player.stamina || 100);
    setEnemyStamina(location.enemyStamina);
    setBattle({
      location,
      currentRound: 1,
      playerRoundsWon: 0,
      enemyRoundsWon: 0,
      passResults: [],
      status: 'idle'
    });
    setActiveCommentary('Escolhei vossa estratégia de liça e ordenai a carga ao vosso escudeiro!');
  };

  // Triggered when launching an individual passage
  const handleStartPass = () => {
    if (battle.status !== 'idle' && battle.status !== 'showingResult') return;

    // Trigger Gallop Animations
    setBattle(prev => ({ ...prev, status: 'charging' }));
    setShowPassSummary(false);
    setActiveCommentary('Os ginetes arrancam sob os gritos do público, as lanças apontadas...');

    // Determine enemy strategy intelligently (Track patterns to counter the player!)
    let enemyStrategy: CombatStrategy = location.preferredStrategy;
    
    // If we have previous rounds, enemy AI gets smart and has a 50% chance to counter the player's last strategy!
    const lastResult = battle.passResults[battle.passResults.length - 1];
    if (lastResult) {
      const lastPlayerStrategy = lastResult.playerStrategy;
      const randVal = Math.random();
      
      if (randVal < 0.50) {
        // AI Counter choice: Find strategies that are a "disadvantage" for the player (meaning a win for enemy strategy)
        const counterStrategies: CombatStrategy[] = [];
        const allStrats: CombatStrategy[] = ['ataque_frontal', 'defesa_firme', 'investida_rapida', 'mira_precisa', 'finta_contra_ataque'];
        
        allStrats.forEach(s => {
          if (getStrategyMatchup(lastPlayerStrategy, s) === 'disadvantage') {
            counterStrategies.push(s);
          }
        });
        
        if (counterStrategies.length > 0) {
          enemyStrategy = counterStrategies[Math.floor(Math.random() * counterStrategies.length)];
        } else {
          enemyStrategy = location.preferredStrategy;
        }
      } else if (randVal < 0.80) {
        enemyStrategy = location.preferredStrategy;
      } else {
        const allStrats: CombatStrategy[] = ['ataque_frontal', 'defesa_firme', 'investida_rapida', 'mira_precisa', 'finta_contra_ataque'];
        enemyStrategy = allStrats[Math.floor(Math.random() * allStrats.length)];
      }
    } else {
      // First round: 75% preferredStrategy, 25% random
      if (Math.random() > 0.75) {
        const allStrats: CombatStrategy[] = ['ataque_frontal', 'defesa_firme', 'investida_rapida', 'mira_precisa', 'finta_contra_ataque'];
        enemyStrategy = allStrats[Math.floor(Math.random() * allStrats.length)];
      }
    }

    // Wait 1.4 seconds for contact
    setTimeout(() => {
      setBattle(prev => ({ ...prev, status: 'impact' }));
      setShakeScreen(true);
      setShowFlash(true);
      setActiveCommentary('CHOQUE DE LANÇAS!');

      // Play clash.mp3
      const clashAudio = new Audio(clashSound);
      clashAudio.volume = volume !== undefined ? volume : 0.25;
      clashAudio.play().catch(err => {
        console.log("Could not play clash sound:", err);
      });

      setTimeout(() => setShowFlash(false), 200);
      setTimeout(() => setShakeScreen(false), 500);

      // Wait 1.2s in impact before showing passage calculation
      setTimeout(() => {
        const previousResult = battle.passResults[battle.passResults.length - 1];
        const isPlayerDesequilibrado = previousResult 
          ? (previousResult.outcome === 'defeat' && previousResult.enemyScore >= previousResult.playerScore + 12)
          : false;
        const isEnemyDesequilibrado = previousResult 
          ? (previousResult.outcome === 'victory' && previousResult.playerScore >= previousResult.enemyScore + 12)
          : false;

        const result = calculateJoustPassage(
          battle.currentRound,
          player,
          location,
          selectedStrategy,
          enemyStrategy,
          challengeMode,
          playerStamina,
          enemyStamina,
          isPlayerDesequilibrado,
          isEnemyDesequilibrado
        );

        // Deduct stamina and store new state
        setPlayerStamina(result.playerStaminaAfter);
        setEnemyStamina(result.enemyStaminaAfter);

        let pWon = battle.playerRoundsWon;
        let eWon = battle.enemyRoundsWon;
        if (result.outcome === 'victory') pWon++;
        if (result.outcome === 'defeat') eWon++;

        setBattle(prev => ({
          ...prev,
          status: 'showingResult',
          playerRoundsWon: pWon,
          enemyRoundsWon: eWon,
          passResults: [...prev.passResults, result]
        }));
        setActiveCommentary(result.commentary);
        setShowPassSummary(true);
      }, 1200);

    }, 1400);
  };

  // Move to next passage or finalize combat
  const handleNextStep = () => {
    if (battle.currentRound < 3) {
      setBattle(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        status: 'idle'
      }));
      setShowPassSummary(false);
      setActiveCommentary('Os escudeiros reparam os arreios e entregam uma nova lança de madeira.');
    } else {
      setPhase('finished');
      setBattle(prev => ({ ...prev, status: 'finished' }));
      setShowPassSummary(false);
      
      // Play victory sound if player won
      if (isPlayerWinner) {
        const cheerAudio = new Audio(cheerSound);
        cheerAudio.volume = volume !== undefined ? volume : 0.25;
        cheerAudio.play().catch(err => {
          console.log("Could not play cheer sound:", err);
        });
      }
    }
  };

  const totalPlayerScore = battle.passResults.reduce((acc, curr) => acc + curr.playerScore, 0);
  const totalEnemyScore = battle.passResults.reduce((acc, curr) => acc + curr.enemyScore, 0);
  const isPlayerWinner = totalPlayerScore >= totalEnemyScore;

  // Final exit callback back to campaign map
  const handleFinishCampaignAction = () => {
    onBattleFinished(
      isPlayerWinner,
      isPlayerWinner ? adjustedCoins : 15,
      isPlayerWinner ? adjustedHonor : 0,
      isPlayerWinner ? adjustedInfluence : 0
    );
  };

  // Helper for rendering difficulty stars
  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < count ? 'text-amber-500 font-bold' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Render 1: PREPARATION SCREEN
  if (phase === 'prep') {
    return (
      <div id="joust-preparation-screen" className="h-full w-full overflow-hidden flex flex-col justify-between bg-medieval-panel text-medieval-text rounded-2xl border-2 border-medieval-border p-3 md:p-4 shadow-2xl relative">
        {/* Metal corner highlights */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-medieval-gold/40 border border-medieval-border" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-medieval-gold/40 border border-medieval-border" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-medieval-gold/40 border border-medieval-border" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-medieval-gold/40 border border-medieval-border" />

        {/* Simplified Header */}
        <div className="pb-3 mb-3 text-center shrink-0">
          <h2 className="text-xl md:text-2xl font-serif font-black text-medieval-gold-light">
            Preparação da Justa de {location.name}
          </h2>
        </div>

        {/* Info Grid - 3 columns, equal height */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Left Column: Challenger & Location */}
          <div className="bg-medieval-dark/50 p-4 rounded-xl border border-medieval-border/60 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-medieval-gold uppercase mb-3 border-b border-medieval-border/30 pb-1">Desafiante e Local</h3>
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-11 h-11 rounded-lg bg-[#2a1a0a] border border-medieval-gold flex items-center justify-center overflow-hidden shrink-0 relative shadow-md">
                  <img
                    src={guerreiroCastela}
                    alt={location.enemyName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="font-serif font-black text-sm text-medieval-text leading-none">{location.enemyName}</h4>
                  <span className="text-[11px] text-medieval-text/50 italic leading-tight block mt-1">{location.enemyTitle}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-serif text-medieval-text/90">
                <div className="flex justify-between bg-medieval-panel p-1.5 rounded border border-medieval-border/30">
                  <span className="text-medieval-gold">Nível do Inimigo:</span>
                  <span className="font-mono font-bold text-medieval-gold-light">Nível {location.enemyLevel}</span>
                </div>
                <div className="flex justify-between bg-medieval-panel p-1.5 rounded border border-medieval-border/30">
                  <span className="text-medieval-gold">Dificuldade da Liça:</span>
                  <span>{renderStars(location.difficulty)}</span>
                </div>
                <div className="flex justify-between bg-medieval-panel p-1.5 rounded border border-medieval-border/30">
                  <span className="text-medieval-gold">Estratégia Preferida:</span>
                  <span className="font-bold text-red-400">{getStrategyName(location.preferredStrategy)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-medieval-border/20 text-[11px] text-medieval-text/70 italic font-serif leading-relaxed">
              "{location.description}"
            </div>
          </div>

          {/* Center Column: Challenge level and compact equipment */}
          <div className="bg-medieval-dark/50 p-4 rounded-xl border border-medieval-border/60 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-medieval-gold uppercase mb-2 border-b border-medieval-border/30 pb-1">Nível de Desafio</h3>
              <div className="flex flex-col gap-1.5">
                {/* Prudente */}
                <button
                  onClick={() => setChallengeMode('prudente')}
                  className={`w-full text-left p-1.5 px-2.5 rounded border transition-all cursor-pointer ${
                    challengeMode === 'prudente'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : 'bg-medieval-panel border-medieval-border/30 text-medieval-text/70 hover:bg-medieval-panel/80'
                  }`}
                >
                  <div className="flex justify-between items-center font-serif text-xs font-bold">
                    <span>🛡️ MODO PRUDENTE</span>
                    <span className="font-mono text-[9px]">Poder: 85%</span>
                  </div>
                  <span className="text-[9px] opacity-75 font-serif block leading-none mt-0.5">Recompensas e Honra reduzidas em -25%. Menor risco de cair.</span>
                </button>

                {/* Honrado */}
                <button
                  onClick={() => setChallengeMode('honrado')}
                  className={`w-full text-left p-1.5 px-2.5 rounded border transition-all cursor-pointer ${
                    challengeMode === 'honrado'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                      : 'bg-medieval-panel border-medieval-border/30 text-medieval-text/70 hover:bg-medieval-panel/80'
                  }`}
                >
                  <div className="flex justify-between items-center font-serif text-xs font-bold">
                    <span>⚔️ MODO HONRADO</span>
                    <span className="font-mono text-[9px]">Poder: 100%</span>
                  </div>
                  <span className="text-[9px] opacity-75 font-serif block leading-none mt-0.5">Condições normais de liça. Recompensas plenas de glória.</span>
                </button>

                {/* Glorioso */}
                <button
                  onClick={() => setChallengeMode('glorioso')}
                  className={`w-full text-left p-1.5 px-2.5 rounded border transition-all cursor-pointer ${
                    challengeMode === 'glorioso'
                      ? 'bg-red-950/40 border-red-500 text-red-300'
                      : 'bg-medieval-panel border-medieval-border/30 text-medieval-text/70 hover:bg-medieval-panel/80'
                  }`}
                >
                  <div className="flex justify-between items-center font-serif text-xs font-bold">
                    <span>🔥 MODO GLORIOSO</span>
                    <span className="font-mono text-[9px]">Poder: 125%</span>
                  </div>
                  <span className="text-[9px] opacity-75 font-serif block leading-none mt-0.5">Oponente formidável. Bónus de +40% Ouro e +50% Honra!</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-medieval-border/20 mt-3">
              <h3 className="text-xs font-bold tracking-wider text-medieval-gold uppercase mb-2">Equipamento de Liga</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-medieval-panel p-1.5 rounded border border-medieval-border/30 flex flex-col items-center justify-center">
                  <span className="text-sm mb-0.5" title="Arma">⚔️</span>
                  <span className="text-[9px] text-medieval-gold font-bold leading-tight block truncate w-full" title={currentWeapon}>{currentWeapon}</span>
                </div>
                <div className="bg-medieval-panel p-1.5 rounded border border-medieval-border/30 flex flex-col items-center justify-center">
                  <span className="text-sm mb-0.5" title="Armadura">🛡️</span>
                  <span className="text-[9px] text-emerald-400 font-bold leading-tight block truncate w-full" title={currentArmor}>{currentArmor}</span>
                </div>
                <div className="bg-medieval-panel p-1.5 rounded border border-medieval-border/30 flex flex-col items-center justify-center">
                  <span className="text-sm mb-0.5" title="Montada">🐎</span>
                  <span className="text-[9px] text-sky-400 font-bold leading-tight block truncate w-full" title={currentMount}>{currentMount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Playability prognosis - Circle 58% highlighted as primary */}
          <div className="bg-medieval-dark/50 p-4 rounded-xl border border-medieval-border/60 flex flex-col justify-between h-full text-center relative overflow-hidden">
            <div className="absolute top-1 right-1 opacity-5 text-7xl select-none">⚖</div>
            <div>
              <h3 className="text-xs font-bold tracking-wider text-medieval-gold uppercase mb-2 border-b border-medieval-border/30 pb-1">Índice de Jogabilidade</h3>
              
              <div className="bg-medieval-panel/40 p-2.5 rounded-lg border border-medieval-border/30 flex flex-col items-center justify-center">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                  playability.riskLevel === 'Baixo' ? 'text-emerald-400' :
                  playability.riskLevel === 'Médio' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {playability.label}
                </span>

                {/* Circular Victory Gauge - Highly Highlighted! */}
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-[3px] border-medieval-gold flex flex-col items-center justify-center bg-medieval-dark/95 shadow-[0_0_15px_rgba(194,157,68,0.25)] ring-4 ring-medieval-gold/10">
                    <span className="text-3xl font-mono font-black text-medieval-gold-light leading-none">{playability.percentage}%</span>
                    <span className="text-[8px] uppercase tracking-widest text-medieval-text/50 font-mono mt-0.5">Vitória</span>
                  </div>
                </div>

                <div className="flex gap-1.5 items-center text-xs justify-center mt-2">
                  <span className="text-medieval-text/60">Risco:</span>
                  <span className={`font-black font-serif px-2 py-0.5 rounded-full text-[9px] ${
                    playability.riskLevel === 'Baixo' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    playability.riskLevel === 'Médio' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {playability.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-medieval-text/85 leading-relaxed font-serif italic mt-2.5 p-1.5 bg-medieval-panel/65 rounded border border-medieval-border/20">
              "{playability.description}"
            </p>
          </div>
        </div>

        {/* Base potential Rewards */}
        <div className="bg-medieval-panel/90 border border-medieval-border/50 p-2 rounded-xl mb-3.5 flex items-center justify-around text-xs flex-wrap gap-2.5 shrink-0">
          <div className="text-center font-serif text-medieval-text/80 font-bold">
            Recompensas Estimadas:
          </div>
          <div className="flex items-center gap-1 bg-medieval-dark/80 px-2 py-1 rounded border border-medieval-border/30">
            <Coins className="w-3.5 h-3.5 text-medieval-gold" />
            <span className="font-mono font-bold text-medieval-gold">+{adjustedCoins} Moedas</span>
          </div>
          <div className="flex items-center gap-1 bg-medieval-dark/80 px-2 py-1 rounded border border-medieval-border/30">
            <Award className="w-3.5 h-3.5 text-medieval-gold-light" />
            <span className="font-serif font-bold text-medieval-gold-light">+{adjustedHonor} Honra</span>
          </div>
          <div className="flex items-center gap-1 bg-medieval-dark/80 px-2 py-1 rounded border border-medieval-border/30">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-serif font-bold text-sky-300">+{adjustedInfluence} Influência</span>
          </div>
        </div>

        {/* Action button bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 shrink-0">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-serif text-xs font-bold text-medieval-gold bg-medieval-dark hover:bg-medieval-dark/80 border border-medieval-border cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Regressar ao Mapa
          </button>

          {onVisitShop ? (
            <button
              onClick={onVisitShop}
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-serif text-xs font-bold text-sky-400 bg-medieval-dark hover:bg-medieval-dark/80 border border-sky-900/40 cursor-pointer transition-all hover:border-sky-500/50"
            >
              🏪 Visitar Arsenal Real
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleStartJoustLoop}
            className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-serif text-sm font-black text-medieval-bg bg-medieval-gold hover:bg-medieval-gold-light border-2 border-medieval-border cursor-pointer shadow-xl hover:shadow-medieval-gold/20 transition-all animate-pulse"
          >
            <Swords className="w-4 h-4" />
            Iniciar Justa!
          </button>
        </div>
      </div>
    );
  }

  // Determine winning and losing faction of the last pass result
  const lastResult = battle.passResults[battle.passResults.length - 1];
  const playerFaction = player.faction || 'portucalense';

  // Render 2: FIGHTING AND COMBAT ARENA
  return (
    <div
      id="battle-arena-stage"
      className={`h-full w-full bg-medieval-bg text-medieval-text rounded-3xl border-4 border-medieval-border p-3 relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        shakeScreen ? 'translate-x-1 translate-y-1 scale-[1.01] ring-4 ring-red-500/40' : ''
      }`}
    >
      {/* Impact overlay flash */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-40 flex items-center justify-center opacity-90 transition-opacity duration-150">
          <div className="text-medieval-gold font-serif text-5xl font-black italic tracking-widest animate-ping">CHOQUE DE LANÇAS!</div>
        </div>
      )}

      {/* Scoreboard / Health Panels / Navigation */}
      {battle.status === 'finished' ? null : showPassSummary ? (
        /* Minimalist top bar showing only knight names after a fight to maximize screen space */
        <div className="flex justify-between items-center bg-black/75 backdrop-blur-md py-2.5 px-6 rounded-xl border border-medieval-border/40 mb-2 relative z-10 shrink-0 animate-fade-in shadow-2xl">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              player.faction === 'leao' ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
            }`} />
            <span className="font-serif font-black text-medieval-gold text-xs md:text-sm tracking-wider uppercase">{player.name}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-medieval-gold font-black text-sm italic tracking-widest px-4 leading-none">VS</span>
            <span className="text-[8px] font-mono text-medieval-text/40 tracking-wider mt-0.5 uppercase">Passagem {battle.currentRound} Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-medieval-gold text-xs md:text-sm tracking-wider uppercase">{location.enemyName}</span>
            <div className={`w-2.5 h-2.5 rounded-full ${
              player.faction === 'leao' ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
            }`} />
          </div>
        </div>
      ) : (
        <>
          {/* Arena Navigation */}
          <div className="flex justify-between items-center border-b border-medieval-border/30 pb-2 mb-2 relative z-10 shrink-0 bg-black/40 backdrop-blur-sm p-2 rounded-xl">
            <button
              onClick={() => setPhase('prep')}
              disabled={battle.status !== 'idle' && battle.status !== 'showingResult' && battle.status !== 'finished'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-serif bg-medieval-dark hover:bg-medieval-dark/80 text-medieval-gold border border-medieval-border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Mudar Nível / Preparar
            </button>

            <div className="text-center">
              <span className="text-[9px] font-mono tracking-wider text-medieval-gold uppercase font-semibold">Torneio Real de 1141 · Modo {challengeMode === 'glorioso' ? 'Glorioso 🔥' : challengeMode === 'prudente' ? 'Prudente 🛡' : 'Honrado ⚔'}</span>
              <h2 className="text-lg font-serif font-bold text-medieval-gold leading-none">Liça de {location.name}</h2>
            </div>

            <div className="flex items-center gap-1 bg-medieval-dark px-2.5 py-0.5 rounded-full border border-medieval-border text-xs text-medieval-gold">
              <Swords className="w-3.5 h-3.5 text-medieval-gold" />
              <span className="font-serif">Passagem {battle.currentRound} de 3</span>
            </div>
          </div>

          {/* Scoreboard / Health Panel with Stamina Bars */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center bg-medieval-panel/85 backdrop-blur-sm p-3 rounded-xl border border-medieval-border/50 mb-2 relative z-10 max-w-none text-center font-serif text-xs shrink-0">
            {/* Player Name, Score and Stamina */}
            <div className="md:col-span-2 text-left md:pl-2">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner ${
                  player.faction === 'leao' ? 'bg-amber-950/80 border-amber-400' : 'bg-sky-950/80 border-sky-400'
                }`}>
                  <img
                    src={player.faction === 'leao' ? guerreiroCastela : guerreiroPortucal}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-medieval-gold truncate text-sm leading-none mb-1">{player.name}</h4>
                  <span className="text-[10px] text-medieval-text/50 font-mono">
                    {player.faction === 'leao' ? 'Reino de Leão' : 'Condado Portucalense'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-medieval-border/20">
                <div className="flex gap-1.5 items-center">
                  <span className="text-[9px] text-medieval-text/40 uppercase tracking-widest font-mono mr-1">Rondas:</span>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border border-medieval-gold/50 ${
                        i < battle.playerRoundsWon ? 'bg-medieval-gold shadow-[0_0_8px_#c29d44]' : 'bg-medieval-dark'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-medieval-gold uppercase tracking-wider">Pontos:</span>
                  <span className="font-mono text-sm font-black text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]">
                    {totalPlayerScore} <span className="text-[9px] font-normal text-medieval-text/50 lowercase">pts</span>
                  </span>
                </div>
              </div>
              {/* Stamina bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-medieval-text/70 mb-0.5">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-orange-400" /> Energia</span>
                  <span>{playerStamina} / {player.stamina || 100}</span>
                </div>
                <div className="w-full bg-medieval-dark h-2 rounded-full border border-medieval-border/50 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      playerStamina < 25 ? 'bg-red-500 animate-pulse' : playerStamina < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(playerStamina / (player.stamina || 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="md:col-span-1 flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-medieval-border/30 py-2 md:py-0 md:px-2">
              <span className="text-medieval-gold font-black text-xl italic tracking-wider leading-none">VS</span>
              {battle.passResults.length > 0 ? (
                <div className="mt-1 flex flex-col gap-0.5 font-mono text-[9px] text-medieval-text/60 bg-black/45 px-1.5 py-0.5 rounded border border-medieval-border/10">
                  {battle.passResults.map((res, idx) => {
                    const diff = res.playerScore - res.enemyScore;
                    const diffText = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : `Empate`;
                    const diffColor = diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-amber-400';
                    return (
                      <div key={idx} className="flex flex-col items-center leading-none border-b border-medieval-border/10 last:border-b-0 py-0.5">
                        <span className="font-black text-[9px] text-medieval-gold-light">P{idx + 1}: {res.playerScore} - {res.enemyScore}</span>
                        <span className={`text-[8px] font-extrabold ${diffColor}`}>{diffText}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-[10px] text-medieval-text/40 font-mono mt-0.5">Torneio</span>
              )}
            </div>

            {/* Enemy Name, Score and Stamina */}
            <div className="md:col-span-2 text-right md:pr-2">
              <div className="flex items-center gap-3 mb-2 justify-end">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-medieval-gold truncate text-sm leading-none mb-1">{location.enemyName}</h4>
                  <span className="text-[10px] text-medieval-text/50 font-mono">
                    {player.faction === 'leao' ? 'Condado Portucalense' : 'Reino de Leão'} (Nível {location.enemyLevel})
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner ${
                  player.faction === 'leao' ? 'bg-sky-950/80 border-sky-400' : 'bg-amber-950/80 border-amber-400'
                }`}>
                  <img
                    src={player.faction === 'leao' ? guerreiroPortucal : guerreiroCastela}
                    alt={location.enemyName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-medieval-border/20 flex-row-reverse">
                <div className="flex gap-1.5 items-center justify-end">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full border border-medieval-gold/50 ${
                        i < battle.enemyRoundsWon ? 'bg-medieval-gold shadow-[0_0_8px_#c29d44]' : 'bg-medieval-dark'
                      }`}
                    />
                  ))}
                  <span className="text-[9px] text-medieval-text/40 uppercase tracking-widest font-mono ml-1">Rondas:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-black text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.4)]">
                    {totalEnemyScore} <span className="text-[9px] font-normal text-medieval-text/50 lowercase">pts</span>
                  </span>
                  <span className="text-[10px] font-bold text-medieval-gold uppercase tracking-wider">Pontos:</span>
                </div>
              </div>
              {/* Stamina bar */}
              <div className="mt-3 text-right">
                <div className="flex justify-between items-center text-[10px] font-mono text-medieval-text/70 mb-0.5">
                  <span>{enemyStamina} / {location.enemyStamina}</span>
                  <span className="flex items-center gap-1">Energia <Zap className="w-3 h-3 text-orange-400" /></span>
                </div>
                <div className="w-full bg-medieval-dark h-2 rounded-full border border-medieval-border/50 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ml-auto ${
                      enemyStamina < 25 ? 'bg-red-500' : enemyStamina < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(enemyStamina / location.enemyStamina) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Jousting Arena Field */}
      {battle.status !== 'finished' ? (
        <div
          className={`arena relative w-full overflow-hidden rounded-2xl border-2 border-medieval-border shadow-2xl select-none mx-auto joust-arena ${
            Number(location.difficulty) === 1 ? 'arena-level1' :
            Number(location.difficulty) === 2 ? 'arena-level2' :
            Number(location.difficulty) === 3 ? 'arena-level3' :
            Number(location.difficulty) === 4 ? 'arena-level4' :
            Number(location.difficulty) === 5 ? 'arena-level5' : ''
          }`}
        >
          {/* Responsive Background Images for Art Direction using CSS Container Queries */}
          <div className="absolute inset-0 joust-bg-container pointer-events-none">
            {Number(location.difficulty) === 1 ? (
              <img
                src={nivel1Torneio}
                alt="Campo de Combate Nível 1"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
            ) : Number(location.difficulty) === 2 ? (
              <img
                src={nivel2Torneio}
                alt="Campo de Combate Nível 2"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
            ) : Number(location.difficulty) === 3 ? (
              <img
                src={nivel3Torneio}
                alt="Campo de Combate Nível 3"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
            ) : Number(location.difficulty) === 4 ? (
              <img
                src={nivel4Torneio}
                alt="Campo de Combate Nível 4"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
            ) : Number(location.difficulty) === 5 ? (
              <img
                src={nivel5Torneio}
                alt="Campo de Combate Nível 5"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
            ) : (
              <img
                src={fullHdTorneio}
                alt="Campo de Combate"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
              />
            )}
          </div>

          {/* Subtle vignette/shading overlay so characters pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />

          {/* Impact/Charging flash triggers */}
          <div className="absolute left-1/2 bottom-[35%] transform -translate-x-1/2 flex flex-col items-center pointer-events-none z-30">
            {battle.status === 'charging' && (
              <div className="animate-ping bg-medieval-gold/25 w-16 h-16 rounded-full border-2 border-medieval-gold/40 flex items-center justify-center">
                <Swords className="w-8 h-8 text-medieval-gold/70" />
              </div>
            )}
            {battle.status === 'impact' && (
              <div className="animate-scale-up bg-medieval-gold w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_#c29d44] ring-8 ring-medieval-gold/40">
                <Sparkles className="w-10 h-10 text-medieval-bg" />
              </div>
            )}
          </div>

          {/* Player/Enemy Knight (Left Side - Player, advances Right) */}
          <div
            id="knight-left-container"
            className="knight-left z-20 transition-all duration-300"
            style={{
              height: '55%',
              aspectRatio: '1 / 1',
            }}
          >
            <KnightSprite
              side="player"
              isCharging={battle.status === 'charging'}
              isImpact={battle.status === 'impact'}
              isVictory={battle.status === 'showingResult' && lastResult?.outcome === 'victory'}
              isDefeat={battle.status === 'showingResult' && lastResult?.outcome === 'defeat'}
              faction={playerFaction}
            />
          </div>

          {/* Player/Enemy Knight (Right Side - Enemy, advances Left) */}
          <div
            id="knight-right-container"
            className="knight-right z-20 transition-all duration-300"
            style={{
              height: '55%',
              aspectRatio: '1 / 1',
            }}
          >
            <KnightSprite
              side="enemy"
              isCharging={battle.status === 'charging'}
              isImpact={battle.status === 'impact'}
              isVictory={battle.status === 'showingResult' && lastResult?.outcome === 'defeat'}
              isDefeat={battle.status === 'showingResult' && lastResult?.outcome === 'victory'}
              faction={playerFaction === 'portucalense' ? 'leao' : 'portucalense'}
            />
          </div>
        </div>
      ) : (
        /* Final results screen - styled with scroll wrap for full-screen safety */
        <div id="battle-final-summary" className="flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-medieval-panel/95 rounded-2xl border-2 border-medieval-border p-4 md:p-6 max-w-xl w-full mx-auto relative z-10 text-center font-serif shadow-xl flex flex-col justify-between">
          {isPlayerWinner ? (
            <div className="space-y-3 animate-scale-up">
              <div className="w-20 h-20 mx-auto rounded-full bg-medieval-dark border-4 border-emerald-600/60 flex items-center justify-center text-medieval-gold shadow-[0_0_25px_rgba(16,185,129,0.35)] relative overflow-visible p-1">
                {/* Custom Wreath/Crown of Laurel branches (Coroa de ramos de louro) */}
                <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left Laurel Branch Stem & Leaves */}
                  <path d="M 50,85 C 32,85 18,70 18,50 C 18,30 32,15 48,15" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 23,73 C 16,72 14,66 19,62 C 22,64 24,69 23,73 Z" fill="#047857" />
                  <path d="M 17,62 C 10,60 8,54 14,50 C 17,52 18,57 17,62 Z" fill="#059669" />
                  <path d="M 15,48 C 8,45 8,39 14,35 C 17,37 18,42 15,48 Z" fill="#10b981" />
                  <path d="M 19,35 C 13,31 14,25 20,22 C 22,24 22,30 19,35 Z" fill="#059669" />
                  <path d="M 26,24 C 21,19 23,13 29,12 C 30,14 29,20 26,24 Z" fill="#10b981" />
                  <path d="M 36,17 C 32,12 35,6 40,7 C 41,9 39,14 36,17 Z" fill="#34d399" />
                  <path d="M 47,15 C 45,10 49,4 53,6 C 53,8 50,13 47,15 Z" fill="#6ee7b7" />

                  {/* Right Laurel Branch Stem & Leaves */}
                  <path d="M 50,85 C 68,85 82,70 82,50 C 82,30 68,15 52,15" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 77,73 C 84,72 86,66 81,62 C 78,64 76,69 77,73 Z" fill="#047857" />
                  <path d="M 83,62 C 90,60 92,54 86,50 C 83,52 82,57 83,62 Z" fill="#059669" />
                  <path d="M 85,48 C 92,45 92,39 86,35 C 83,37 82,42 85,48 Z" fill="#10b981" />
                  <path d="M 81,35 C 87,31 86,25 80,22 C 78,24 78,30 81,35 Z" fill="#059669" />
                  <path d="M 74,24 C 79,19 77,13 71,12 C 70,14 71,20 74,24 Z" fill="#10b981" />
                  <path d="M 64,17 C 68,12 65,6 60,7 C 59,9 61,14 64,17 Z" fill="#34d399" />
                  <path d="M 53,15 C 55,10 51,4 47,6 C 47,8 50,13 53,15 Z" fill="#6ee7b7" />

                  {/* Golden Ribbon Bow at the bottom of the Laurel Wreath */}
                  <path d="M 44,82 C 39,85 33,93 36,96 C 39,98 45,92 47,87" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 56,82 C 61,85 67,93 64,96 C 61,98 55,92 53,87" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="50" cy="85" r="3.5" fill="#b45309" />
                  <circle cx="50" cy="85" r="1.5" fill="#fbbf24" />

                  {/* Elegant Golden Crown inside the Laurel Wreath */}
                  <g transform="translate(50, 48)">
                    <path d="M -8,5 L -10,-5 L -4,-1 L 0,-8 L 4,-1 L 10,-5 L 8,5 Z" fill="#be9034" opacity="0.9" />
                    <circle cx="0" cy="6" r="1.5" fill="#fbbf24" />
                  </g>
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-medieval-gold leading-tight">
                Honra aos valentes! O dia de hoje pertence a <span className="text-medieval-gold-light block mt-1">{player.name}</span>
              </h3>
              <p className="text-xs text-medieval-text/90 leading-relaxed max-w-md mx-auto">
                Vossa glória correrá de boca em boca pelas tabernas! Derrubastes <span className="text-medieval-gold font-bold">{location.enemyName}</span> nas liças nobres de <span className="text-medieval-gold-light font-bold">{location.name}</span>.
              </p>

              <div className="bg-medieval-dark text-medieval-text p-3 rounded-xl border border-medieval-border text-left relative overflow-hidden my-3 max-w-md mx-auto">
                <div className="absolute top-1 right-2 opacity-5 text-3xl">📜</div>
                <h5 className="font-bold text-[10px] text-medieval-gold uppercase tracking-wide">Nova Crónica Escrita no Vosso Tomo</h5>
                <h4 className="font-black text-sm mt-0.5 leading-none text-medieval-gold-light">{location.name === 'Arcos de Valdevez' || location.name === 'Veigas da Matança' ? 'A Vitória Decisiva do Reino' : `Memória de ${location.name}`}</h4>
                <p className="text-[10px] text-medieval-text/75 mt-1.5 italic font-serif">"Uma página de audácia militar medieval adicionada ao vosso tomo da memória!"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-medieval-dark border-4 border-red-500 flex items-center justify-center text-red-400">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-red-400">RETIRADA HONROSA</h3>
              <p className="text-xs text-medieval-text/90 leading-relaxed max-w-md mx-auto">
                O vosso braço arqueou sob o impacto. O oponente <span className="text-medieval-gold font-bold">{location.enemyName}</span> provou possuir uma sela mais sólida hoje. Vossos batedores ajudaram-vos a reorganizar as forças.
              </p>
              <div className="bg-medieval-dark p-3 rounded-xl border border-medieval-border text-[10px] text-medieval-gold flex items-start gap-2 max-w-md mx-auto text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-medieval-gold" />
                <p className="leading-relaxed text-medieval-text/85">
                  <strong className="text-medieval-gold">Conselho do Abade:</strong> Visitai a <strong>Loja do Arsenal</strong> para adquirir lanças de freixo, arneses de placas robustos e garanhões lusitanos mais rápidos! Ou investis pontos de treino no vosso painel.
                </p>
              </div>
            </div>
          )}

          {/* Final Scoreboard with Point Differences and Epic Sensation */}
          <div className="bg-black/60 border border-medieval-border/40 rounded-xl p-3 max-w-md mx-auto my-3 font-mono">
            <div className="text-[10px] uppercase tracking-widest text-medieval-gold mb-1 font-serif font-bold">Placar Final das Justas</div>
            <div className="flex justify-between items-center px-4 py-2">
              <div className="text-left">
                <span className="text-xs text-sky-400 font-serif font-bold block truncate max-w-[120px]">{player.name}</span>
                <span className="text-2xl font-black text-sky-300">{totalPlayerScore} <span className="text-[10px] font-normal text-medieval-text/50 lowercase">pts</span></span>
              </div>
              <div className="text-center font-serif text-xs px-2 border-x border-medieval-border/20 text-medieval-text/40">
                <div className="font-bold text-medieval-gold">{battle.playerRoundsWon} - {battle.enemyRoundsWon}</div>
                <div className="text-[9px]">Rondas</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-red-400 font-serif font-bold block truncate max-w-[120px]">{location.enemyName}</span>
                <span className="text-2xl font-black text-red-400">{totalEnemyScore} <span className="text-[10px] font-normal text-medieval-text/50 lowercase">pts</span></span>
              </div>
            </div>
            {/* Dynamic epic description based on score difference */}
            <div className="text-xs font-serif italic text-medieval-gold-light mt-2 border-t border-medieval-border/15 pt-2 px-1 leading-relaxed text-center">
              {(() => {
                const diff = Math.abs(totalPlayerScore - totalEnemyScore);
                if (totalPlayerScore > totalEnemyScore) {
                  if (diff <= 5) return `⚔️ Uma vitória pela margem mínima! Triunfastes por apenas ${diff} pontos numa disputa de tirar o fôlego!`;
                  if (diff <= 15) return `🛡️ Uma vitória suada! Com perícia e bravura, impusestes o vosso ritmo por ${diff} pontos de diferença.`;
                  return `🔥 Vitória esmagadora! Destroçastes por completo a sela adversária, vencendo por uns impressionantes ${diff} pontos!`;
                } else if (totalPlayerScore < totalEnemyScore) {
                  if (diff <= 5) return `💔 Uma derrota dolorosa! Estivestes a meros ${diff} pontos de vencer esta justa fantástica.`;
                  if (diff <= 15) return `🐎 O oponente impôs-se com firmeza, batendo-vos por ${diff} pontos. Precisais de melhor tática e treino.`;
                  return `💀 Uma derrota pesada nas mãos de ${location.enemyName} por uma diferença de ${diff} pontos. Visitai o Arsenal!`;
                } else {
                  return `🤝 Um empate perfeito de ${totalPlayerScore} pontos! Ambos os ginetes partilharam a glória do choque de lanças.`;
                }
              })()}
            </div>
          </div>

          {/* Detailed results with exact values */}
          <div className="border-t border-medieval-border/40 pt-3 mt-3 shrink-0">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-medieval-gold mb-2">Recompensas da Liça ({challengeMode.toUpperCase()})</h4>
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-[11px]">
              <div className="bg-medieval-dark p-2 rounded-xl border border-medieval-border flex flex-col items-center">
                <Coins className="w-4 h-4 text-medieval-gold mb-0.5" />
                <span className="text-medieval-text/50">Moedas</span>
                <span className={`font-mono font-bold text-xs mt-0.5 ${isPlayerWinner ? 'text-medieval-gold' : 'text-medieval-text/80'}`}>
                  {isPlayerWinner ? `+${adjustedCoins}` : '+15 (Piedade)'}
                </span>
              </div>
              <div className="bg-medieval-dark p-2 rounded-xl border border-medieval-border flex flex-col items-center">
                <Award className="w-4 h-4 text-medieval-gold-light mb-0.5" />
                <span className="text-medieval-text/50">Honra</span>
                <span className={`font-bold text-xs mt-0.5 ${isPlayerWinner ? 'text-medieval-gold-light' : 'text-medieval-text/40'}`}>
                  {isPlayerWinner ? `+${adjustedHonor}` : '0'}
                </span>
              </div>
              <div className="bg-medieval-dark p-2 rounded-xl border border-medieval-border flex flex-col items-center">
                <Compass className="w-4 h-4 text-sky-400 mb-0.5" />
                <span className="text-medieval-text/50">Influência</span>
                <span className={`font-bold text-xs mt-0.5 ${isPlayerWinner ? 'text-sky-300' : 'text-medieval-text/40'}`}>
                  {isPlayerWinner ? `+${adjustedInfluence}` : '0'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinishCampaignAction}
            className="w-full max-w-sm mt-4 py-2.5 px-4 rounded-xl font-serif text-sm font-black text-medieval-bg bg-medieval-gold hover:bg-medieval-gold-light border-2 border-medieval-border cursor-pointer shadow-lg active:scale-98 transition-all shrink-0 mx-auto"
          >
            Regressar ao Mapa de Valdevez
          </button>
        </div>
      )}

      {/* Narrative commentary and Round Results controls block */}
      {battle.status !== 'finished' && (
        showPassSummary ? (
          /* Side-by-side layout to optimize vertical space and keep the combat area visible */
          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto relative z-10 shrink-0 items-stretch">
            {/* Left Box: Commentary/Narrative */}
            <div className="bg-black/85 backdrop-blur-sm rounded-xl border border-medieval-border/50 p-3 flex flex-col justify-center text-center shadow-xl animate-fade-in">
              <span className="text-[9px] font-mono tracking-widest text-medieval-gold uppercase font-bold block mb-1.5 border-b border-medieval-border/20 pb-0.5">Comentário do Arauto</span>
              <p className="text-xs font-serif italic text-medieval-text/90 leading-relaxed my-auto">
                {activeCommentary || 'Os cavalos estão perfilados na liça. O soar das trombetas medievais aproxima-se.'}
              </p>
            </div>

            {/* Right Box: Detailed Passage Result */}
            <div className="bg-medieval-panel/90 backdrop-blur-sm border-2 border-medieval-border rounded-xl p-3 flex flex-col items-center justify-between shadow-2xl animate-scale-up">
              <div className="w-full text-center">
                <span className="text-[9px] font-mono tracking-widest text-medieval-gold uppercase font-bold block mb-1">Relatório do Arauto Real</span>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-serif border-b border-medieval-border/30 pb-1.5 mb-1.5 text-left bg-black/40 p-2 rounded">
                  <div>
                    <h5 className="text-sky-300 font-bold border-b border-sky-950/40 pb-0.5 mb-1 truncate">{player.name}</h5>
                    <p>Estratégia: <span className="text-medieval-gold font-bold">{getStrategyName(battle.passResults[battle.passResults.length - 1]?.playerStrategy)}</span></p>
                    <p>Rolagem: <span className="font-mono">+{battle.passResults[battle.passResults.length - 1]?.playerRoll}</span></p>
                    <p>Pontuação: <span className="text-sky-300 font-bold font-mono">{battle.passResults[battle.passResults.length - 1]?.playerScore}</span></p>
                  </div>
                  <div className="border-l border-medieval-border/20 pl-3">
                    <h5 className="text-red-400 font-bold border-b border-red-950/40 pb-0.5 mb-1 truncate">{location.enemyName}</h5>
                    <p>Estratégia: <span className="text-medieval-gold font-bold">{getStrategyName(battle.passResults[battle.passResults.length - 1]?.enemyStrategy)}</span></p>
                    <p>Rolagem: <span className="font-mono">+{battle.passResults[battle.passResults.length - 1]?.enemyRoll}</span></p>
                    <p>Pontuação: <span className="text-red-400 font-bold font-mono">{battle.passResults[battle.passResults.length - 1]?.enemyScore}</span></p>
                  </div>
                </div>

                {/* Matchup advantage icon / explanation */}
                <div className="flex items-center justify-center gap-1 text-[9px] md:text-[10px] font-serif font-bold text-center mt-0.5 mb-1.5">
                  {battle.passResults[battle.passResults.length - 1]?.advantage === 'advantage' && (
                    <span className="text-emerald-400">⚔ Vossa tática provou vantagem contra a manobra rival! (+15% bónus)</span>
                  )}
                  {battle.passResults[battle.passResults.length - 1]?.advantage === 'disadvantage' && (
                    <span className="text-red-400">🛡 Oponente leu vossa tática e obteve vantagem! (-10% penalidade)</span>
                  )}
                  {battle.passResults[battle.passResults.length - 1]?.advantage === 'neutral' && (
                    <span className="text-medieval-text/50">✦ Ambas as táticas equilibraram-se estrategicamente.</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mb-2 text-[10px] font-mono w-full justify-center bg-black/40 p-1.5 rounded">
                <div className="flex flex-col items-center">
                  <span className="text-sky-400 truncate max-w-[80px]" title={player.name}>{player.name}</span>
                  <span className="text-base font-bold text-sky-300">{battle.passResults[battle.passResults.length - 1]?.playerScore}</span>
                </div>
                <div className="border-r border-medieval-border/50 h-6 self-center" />
                <div className="flex flex-col items-center">
                  <span className="text-medieval-gold">Inimigo</span>
                  <span className="text-base font-bold text-medieval-gold">{battle.passResults[battle.passResults.length - 1]?.enemyScore}</span>
                </div>
                <div className="border-r border-medieval-border/50 h-6 self-center" />
                <div className="flex flex-col items-center">
                  <span className="text-medieval-text/40">Arauto</span>
                  <span className={`text-[9px] font-bold uppercase py-0.5 px-1.5 rounded mt-0.5 ${
                    battle.passResults[battle.passResults.length - 1]?.outcome === 'victory'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : battle.passResults[battle.passResults.length - 1]?.outcome === 'defeat'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {battle.passResults[battle.passResults.length - 1]?.outcome === 'victory' ? 'Ganho' : battle.passResults[battle.passResults.length - 1]?.outcome === 'defeat' ? 'Perdido' : 'Empate'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-lg font-serif text-xs font-bold text-medieval-bg bg-medieval-gold hover:bg-medieval-gold-light border border-medieval-border cursor-pointer shadow-md"
              >
                {battle.currentRound < 3 ? 'Avançar para Próxima Lança' : 'Ir para Resultados Finais'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : battle.status === 'idle' ? (
          /* Side-by-side layout during idle/strategy selection to keep the combat area fully visible! */
          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-4xl mx-auto relative z-10 shrink-0 items-stretch">
            {/* Left Box: Estratégia da Passagem selection panel */}
            <div className="bg-black/85 backdrop-blur-sm border border-medieval-border/50 rounded-xl p-3 flex flex-col justify-between shadow-xl animate-fade-in text-center font-serif">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-medieval-gold uppercase font-bold block mb-1.5 border-b border-medieval-border/20 pb-0.5">Estratégia da Passagem</span>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {(['defesa_firme', 'mira_precisa', 'investida_rapida', 'ataque_frontal', 'finta_contra_ataque'] as CombatStrategy[]).map(s => {
                    const cost = getStrategyStaminaCost(s);
                    const isDisabled = playerStamina < cost;
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedStrategy(s)}
                        disabled={isDisabled}
                        className={`px-1 py-1 md:py-1.5 rounded text-[10px] font-serif font-bold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          selectedStrategy === s
                            ? 'bg-medieval-gold text-medieval-bg border-medieval-border shadow-md'
                            : 'bg-medieval-dark/95 text-medieval-text/85 border-medieval-border/20 hover:bg-medieval-dark'
                        }`}
                      >
                        <div className="truncate leading-tight mb-0.5">{getStrategyName(s)}</div>
                        <div className="text-[8px] font-mono opacity-70 font-normal">-{cost} Enrg</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-medieval-text/90 italic leading-relaxed pt-1.5 text-center border-t border-medieval-border/15">
                <span className="text-medieval-gold font-bold">{getStrategyName(selectedStrategy)}:</span> {getStrategyDetails(selectedStrategy)}
              </p>
            </div>

            {/* Right Box: Commentary & Action Button */}
            <div className="bg-medieval-panel/90 backdrop-blur-sm border-2 border-medieval-border rounded-xl p-3 flex flex-col justify-between items-center shadow-2xl animate-fade-in text-center">
              <div className="w-full">
                <span className="text-[9px] font-mono tracking-widest text-medieval-gold uppercase font-bold block mb-1.5 border-b border-medieval-border/20 pb-0.5">Relato do Escudeiro</span>
                <p className="text-xs font-serif italic text-medieval-text/90 leading-tight mb-3 py-1">
                  {activeCommentary || 'Os cavalos estão perfilados na liça. O soar das trombetas medievais aproxima-se.'}
                </p>
              </div>

              <button
                onClick={handleStartPass}
                disabled={battle.status === 'charging' || battle.status === 'impact'}
                className="w-full max-w-xs flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-serif text-xs font-black text-medieval-bg bg-medieval-gold hover:bg-medieval-gold-light border-2 border-medieval-border cursor-pointer shadow-[0_0_10px_rgba(194,157,68,0.3)] active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-auto"
              >
                <Swords className="w-4 h-4" />
                {battle.currentRound === 1 ? 'Iniciar Torneio (1ª Justa)' : `Iniciar Passagem ${battle.currentRound}`}
              </button>
            </div>
          </div>
        ) : (
          /* Normal display before round result (during pre-pass or charging) */
          <>
            {/* Narrative commentary box */}
            <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-medieval-border/50 p-2 min-h-[48px] flex items-center justify-center text-center relative z-10 max-w-2xl w-full mx-auto shadow-inner shrink-0 mt-2">
              <p className="text-xs font-serif italic text-medieval-text/90 leading-tight">
                {activeCommentary || 'Os cavalos estão perfilados na liça. O soar das trombetas medievais aproxima-se.'}
              </p>
            </div>
          </>
        )
      )}
    </div>
  );
}
