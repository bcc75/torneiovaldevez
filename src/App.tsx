/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Player, Location } from './types';
import { loadGame, saveGame, resetGame, INITIAL_PLAYER } from './utils/storage';
import { locations } from './data/locations';

import StartScreen from './components/StartScreen';
import GameHeader from './components/GameHeader';
import MapView from './components/MapView';
import LocationPanel from './components/LocationPanel';
import BattleArena from './components/BattleArena';
import Shop from './components/Shop';
import CardsView from './components/CardsView';
import PlayerPanel from './components/PlayerPanel';
import VictoryScreen from './components/VictoryScreen';
import AboutView from './components/AboutView';

import geralMusic from '../assets/geral.mp3';
import combateMusic from '../assets/musica-combates.mp3';

export default function App() {
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [gameState, setGameState] = useState<'start' | 'play' | 'victory'>('start');
  const [activeTab, setActiveTab] = useState<'map' | 'shop' | 'cards' | 'panel' | 'about'>('map');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [fightingLocation, setFightingLocation] = useState<Location | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Dynamic locations based on chosen player faction (makes final boss/texts appropriate)
  const dynamicLocations = useMemo(() => {
    return locations.map(loc => {
      if (loc.id === 'veigas_matanca') {
        if (player.faction === 'leao') {
          return {
            ...loc,
            description: "O célebre lugar das Veigas da Matança, onde decorreu o combate decisivo contra as forças do Infante D. Afonso Henriques.",
            enemyName: "D. Afonso Henriques",
            enemyTitle: "Comandante do Condado Portucalense",
            historicalNote: "Foi nas Veigas da Matança que se decidiu a autonomia territorial num combate épico de justa entre as hostes de Portugal e Leão."
          };
        } else {
          return {
            ...loc,
            description: "O célebre lugar das Veigas da Matança, onde decorreu o combate decisivo contra as forças do próprio rei D. Afonso VII.",
            enemyName: "Rei D. Afonso VII",
            enemyTitle: "O Imperador de Leão e Castela",
            historicalNote: "Foi nas Veigas da Matança que se decidiu a autonomia nacional num combate épico contra as hostes imperiais do rei Afonso VII."
          };
        }
      }
      return loc;
    });
  }, [player.faction]);

  // Background music audio instances setup
  const [geralAudio] = useState(() => {
    const el = new Audio(geralMusic);
    el.loop = true;
    el.volume = 0; // Starts silent for smooth fade-in
    return el;
  });
  const [combateAudio] = useState(() => {
    const el = new Audio(combateMusic);
    el.loop = true;
    el.volume = 0; // Starts silent for smooth fade-in
    return el;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.20); // Default comfortable volume (20%)

  // Check if saved game exists on mount
  useEffect(() => {
    const saved = localStorage.getItem('torneio_valdevez_save');
    if (saved) {
      setHasSavedGame(true);
      setPlayer(loadGame());
    }
  }, []);

  // Sync game states when player changes
  const handlePlayerUpdate = (updatedPlayer: Player) => {
    setPlayer(updatedPlayer);
    saveGame(updatedPlayer);
    setHasSavedGame(true);
  };

  // Synchronize audio elements with isPlaying and volume state (with smooth fading and crossfade)
  useEffect(() => {
    let intervalId: any;

    const inCombat = fightingLocation !== null;
    const targetGeralVol = isPlaying && !inCombat ? volume : 0;
    const targetCombateVol = isPlaying && inCombat ? volume : 0;

    // Trigger play safely if target volume > 0 and audio is paused
    if (targetGeralVol > 0 && geralAudio.paused) {
      geralAudio.play().catch((err) => {
        console.log("Geral audio play blocked:", err);
      });
    }
    if (targetCombateVol > 0 && combateAudio.paused) {
      combateAudio.play().catch((err) => {
        console.log("Combate audio play blocked:", err);
      });
    }

    intervalId = setInterval(() => {
      let geralDone = false;
      let combateDone = false;

      // Adjust geralAudio volume
      if (geralAudio.volume < targetGeralVol) {
        geralAudio.volume = Math.min(targetGeralVol, parseFloat((geralAudio.volume + 0.02).toFixed(3)));
      } else if (geralAudio.volume > targetGeralVol) {
        geralAudio.volume = Math.max(targetGeralVol, parseFloat((geralAudio.volume - 0.02).toFixed(3)));
      } else {
        geralDone = true;
        if (targetGeralVol === 0 && !geralAudio.paused) {
          geralAudio.pause();
        }
      }

      // Adjust combateAudio volume
      if (combateAudio.volume < targetCombateVol) {
        combateAudio.volume = Math.min(targetCombateVol, parseFloat((combateAudio.volume + 0.02).toFixed(3)));
      } else if (combateAudio.volume > targetCombateVol) {
        combateAudio.volume = Math.max(targetCombateVol, parseFloat((combateAudio.volume - 0.02).toFixed(3)));
      } else {
        combateDone = true;
        if (targetCombateVol === 0 && !combateAudio.paused) {
          combateAudio.pause();
        }
      }

      if (geralDone && combateDone) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, volume, fightingLocation, geralAudio, combateAudio]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      geralAudio.pause();
      combateAudio.pause();
    };
  }, [geralAudio, combateAudio]);

  // Try playing again on first user interaction if music is set to play but blocked
  useEffect(() => {
    const handleFirstClick = () => {
      const inCombat = fightingLocation !== null;
      if (isPlaying) {
        if (!inCombat && geralAudio.paused) {
          geralAudio.play().catch(() => {});
        } else if (inCombat && combateAudio.paused) {
          combateAudio.play().catch(() => {});
        }
      }
    };
    window.addEventListener('click', handleFirstClick);
    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, [isPlaying, fightingLocation, geralAudio, combateAudio]);

  // Start new game
  const handleStartNewGame = (knightName: string) => {
    const freshPlayer: Player = {
      ...INITIAL_PLAYER,
      name: knightName,
      faction: 'portucalense'
    };
    handlePlayerUpdate(freshPlayer);
    setGameState('play');
    setActiveTab('map');
    setSelectedLocation(null);
    setSelectedCampaign(null);
    setFightingLocation(null);
    setIsPlaying(true); // Auto-start medieval music
  };

  // Continue existing game
  const handleContinueGame = (updatedName?: string) => {
    const savedPlayer = loadGame();
    if (updatedName && updatedName.trim()) {
      savedPlayer.name = updatedName.trim();
    }
    setPlayer(savedPlayer);
    saveGame(savedPlayer);
    setHasSavedGame(true);
    
    // If they already conquered all, let them go to victory screen or stay on play
    if (savedPlayer.conqueredLocations.length >= 20) {
      setGameState('victory');
    } else {
      setGameState('play');
      setActiveTab('map');
    }
    setSelectedLocation(null);
    setSelectedCampaign(null);
    setFightingLocation(null);
    setIsPlaying(true); // Auto-start medieval music
  };

  // Reset entire game
  const handleResetGame = () => {
    resetGame();
    setPlayer(INITIAL_PLAYER);
    setGameState('start');
    setHasSavedGame(false);
    setSelectedLocation(null);
    setSelectedCampaign(null);
    setFightingLocation(null);
    setIsPlaying(false); // Silence music on reset
  };

  // Active Battle trigger
  const handleChallenge = (location: Location) => {
    setFightingLocation(location);
  };

  // Battle over resolution
  const handleBattleFinished = (
    won: boolean,
    coinsGained: number,
    honorGained: number,
    influenceGained: number
  ) => {
    if (!fightingLocation) return;

    const newCoins = player.coins + coinsGained;
    const newHonor = player.honor + honorGained;
    const newInfluence = player.influence + influenceGained;
    const newVictories = player.victories + (won ? 1 : 0);
    const newDefeats = player.defeats + (won ? 0 : 1);

    // Calculate dynamic level up based on total cumulative honor earned
    const currentCumulativeHonor = player.cumulativeHonor !== undefined ? player.cumulativeHonor : player.honor;
    const newCumulativeHonor = currentCumulativeHonor + honorGained;
    const potentialNewLevel = Math.max(player.level, Math.floor(newCumulativeHonor / 20) + 1);
    const levelUpOccurred = potentialNewLevel > player.level;
    
    // Stat points on level-up
    let newStatPoints = player.statPoints || 0;

    if (levelUpOccurred) {
      const levelDiff = potentialNewLevel - player.level;
      newStatPoints += levelDiff;
    }

    // Unlocked locations/cards
    const newConquered = [...player.conqueredLocations];
    const newCards = [...player.unlockedCards];

    if (won && !newConquered.includes(fightingLocation.id)) {
      newConquered.push(fightingLocation.id);
      newCards.push(fightingLocation.id); // unlock associated historic card
    }

    const updatedPlayer: Player = {
      ...player,
      coins: newCoins,
      honor: newHonor,
      influence: newInfluence,
      level: potentialNewLevel,
      cumulativeHonor: newCumulativeHonor,
      statPoints: newStatPoints,
      conqueredLocations: newConquered,
      unlockedCards: newCards,
      victories: newVictories,
      defeats: newDefeats
    };

    handlePlayerUpdate(updatedPlayer);
    setFightingLocation(null);
    setSelectedLocation(null);

    // Check campaign win condition (conquering all 20 locations)
    if (newConquered.length >= 20) {
      setGameState('victory');
    }
  };

  // Render start screen
  if (gameState === 'start') {
    return (
      <StartScreen
        hasSavedGame={hasSavedGame}
        onStartNewGame={handleStartNewGame}
        onContinueGame={handleContinueGame}
        isPlaying={isPlaying}
        onToggleMusic={() => setIsPlaying(!isPlaying)}
        currentPlayerName={player.name}
      />
    );
  }

  // Render Campaign Victory screen
  if (gameState === 'victory') {
    return (
      <VictoryScreen
        player={player}
        onExplore={() => {
          setGameState('play');
          setActiveTab('map');
        }}
        onRestart={handleResetGame}
      />
    );
  }

  return (
    <div className="h-screen max-h-screen min-h-screen w-screen overflow-hidden bg-[#101814] text-gray-100 flex flex-col font-serif text-[13px] md:text-sm">
      {/* Game navigation and stats panel */}
      <GameHeader
        player={player}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedLocation(null); // Clear selected location when switching tabs
        }}
        totalLocations={dynamicLocations.length}
        isPlaying={isPlaying}
        onToggleMusic={() => setIsPlaying(!isPlaying)}
        volume={volume}
        onVolumeChange={(v) => setVolume(v)}
        onGoToStartScreen={() => setGameState('start')}
      />

      {/* Main Screen Layout */}
      <main className="flex-1 min-h-0 w-full px-4 py-2 overflow-hidden flex flex-col">
        
        {/* If there's an active battle arena, render in full stage overlay */}
        {fightingLocation ? (
          <div id="active-battle-stage-wrapper" className="w-full h-full overflow-hidden flex flex-col">
            <BattleArena
              location={fightingLocation}
              player={player}
              onBattleFinished={handleBattleFinished}
              onCancel={() => setFightingLocation(null)}
              onVisitShop={() => {
                setFightingLocation(null);
                setActiveTab('shop');
              }}
            />
          </div>
        ) : (
          /* Normal game tab views */
          <div id="game-tab-view-wrapper" className="w-full h-full min-h-0 overflow-hidden">
            
            {/* MAP TAB */}
            {activeTab === 'map' && (
              selectedCampaign === null ? (
                <div className="h-full min-h-0 overflow-hidden">
                  <MapView
                    locations={dynamicLocations}
                    player={player}
                    selectedLocation={selectedLocation}
                    onSelectLocation={(loc) => setSelectedLocation(loc)}
                    selectedCampaign={selectedCampaign}
                    onSelectCampaign={setSelectedCampaign}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0 overflow-hidden">
                  {/* Map Graphic (2 cols on large) */}
                  <div className="lg:col-span-2 h-full min-h-0 overflow-hidden">
                    <MapView
                      locations={dynamicLocations}
                      player={player}
                      selectedLocation={selectedLocation}
                      onSelectLocation={(loc) => setSelectedLocation(loc)}
                      selectedCampaign={selectedCampaign}
                      onSelectCampaign={setSelectedCampaign}
                    />
                  </div>

                  {/* Location Sidebar Details (1 col on large) */}
                  <div className="lg:col-span-1 h-full min-h-0 overflow-hidden">
                    {selectedLocation ? (
                      <LocationPanel
                        location={selectedLocation}
                        player={player}
                        onChallenge={handleChallenge}
                        onClose={() => setSelectedLocation(null)}
                      />
                    ) : (
                      /* Elegant placeholder when no location is chosen */
                      <div className="bg-[#FAF3DC]/90 text-amber-950 rounded-2xl border-4 border-[#7A4B24]/40 p-6 shadow-xl flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
                        <div className="w-12 h-12 rounded-full border-4 border-dashed border-amber-900/20 flex items-center justify-center text-amber-900/30 text-2xl font-bold mb-3 select-none">
                          ❈
                        </div>
                        <h3 className="font-serif font-black text-lg text-amber-900 leading-tight">Explorai as Terras</h3>
                        <p className="text-xs text-amber-950/70 max-w-xs mt-2 leading-relaxed">
                          "Selecione uma das freguesias no caminho para contemplar os seus monumentos, registos históricos e desafiar o cavaleiro local para um combate honroso."
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* SHOP TAB */}
            {activeTab === 'shop' && (
              <div className="h-full min-h-0 overflow-hidden">
                <Shop
                  player={player}
                  onPurchase={handlePlayerUpdate}
                />
              </div>
            )}

            {/* CARDS TAB */}
            {activeTab === 'cards' && (
              <div className="h-full min-h-0 overflow-hidden">
                <CardsView player={player} />
              </div>
            )}

            {/* CHARACTER PANEL TAB */}
            {activeTab === 'panel' && (
              <div className="h-full min-h-0 overflow-hidden">
                <PlayerPanel
                  player={player}
                  onEquipChange={handlePlayerUpdate}
                  onResetGame={handleResetGame}
                />
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="h-full min-h-0 overflow-hidden">
                <AboutView />
              </div>
            )}

          </div>
        )}
      </main>

      {/* Mini copyright / reference info at bottom of gameplay */}
      <footer className="bg-[#101814] py-1 text-center text-[9px] text-gray-500 font-mono tracking-wider uppercase border-t border-[#17492F]/10 shrink-0">
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
      </footer>
    </div>
  );
}
