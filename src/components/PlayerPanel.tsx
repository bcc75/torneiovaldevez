/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, ShopItem } from '../types';
import { shopItems } from '../data/shopItems';
import { Shield, Award, Coins, Compass, Swords, Heart, Activity, Check, Trash2, ArrowRight } from 'lucide-react';

interface PlayerPanelProps {
  player: Player;
  onEquipChange: (updatedPlayer: Player) => void;
  onResetGame: () => void;
}

export default function PlayerPanel({
  player,
  onEquipChange,
  onResetGame
}: PlayerPanelProps) {

  // Current equipped items objects
  const equippedWeapon = shopItems.find(i => i.id === player.weapon);
  const equippedArmor = shopItems.find(i => i.id === player.armor);
  const equippedMount = shopItems.find(i => i.id === player.mount);

  // Compute stat breakdowns
  let weaponBonus = equippedWeapon ? equippedWeapon.bonusValue : 0;
  let armorBonus = equippedArmor ? equippedArmor.bonusValue : 0;
  let mountBonus = equippedMount ? equippedMount.bonusValue : 0;

  // Compute training bonuses
  let trainingAttack = 0;
  let trainingDefense = 0;
  let trainingSpeed = 0;

  player.purchasedItems.forEach(itemId => {
    const item = shopItems.find(i => i.id === itemId);
    if (item && item.category === 'training') {
      if (item.bonusType === 'attack') trainingAttack += item.bonusValue;
      if (item.bonusType === 'defense') trainingDefense += item.bonusValue;
      if (item.bonusType === 'speed') trainingSpeed += item.bonusValue;
    }
  });

  const totalAttack = player.attack + weaponBonus + trainingAttack;
  const totalDefense = player.defense + armorBonus + trainingDefense;
  const totalSpeed = player.speed + mountBonus + trainingSpeed;
  const totalPrecision = player.precision || 5;
  const totalStamina = player.stamina || 100;

  const handleSpendPoint = (attribute: 'attack' | 'defense' | 'speed' | 'precision' | 'stamina') => {
    if ((player.statPoints || 0) <= 0) return;
    const updated = { ...player };
    updated.statPoints = (updated.statPoints || 0) - 1;
    if (attribute === 'attack') updated.attack = (updated.attack || 5) + 1;
    if (attribute === 'defense') updated.defense = (updated.defense || 5) + 1;
    if (attribute === 'speed') updated.speed = (updated.speed || 6) + 1;
    if (attribute === 'precision') updated.precision = (updated.precision || 5) + 1;
    if (attribute === 'stamina') updated.stamina = (updated.stamina || 100) + 10;
    onEquipChange(updated);
  };

  // Win rate calc
  const totalFights = player.victories + player.defeats;
  const winRate = totalFights > 0 ? Math.round((player.victories / totalFights) * 100) : 0;

  // Get owned items of certain categories
  const ownedWeapons = shopItems.filter(i => i.category === 'weapon' && player.purchasedItems.includes(i.id));
  const ownedArmors = shopItems.filter(i => i.category === 'armor' && player.purchasedItems.includes(i.id));
  const ownedMounts = shopItems.filter(i => i.category === 'mount' && player.purchasedItems.includes(i.id));

  const handleEquip = (itemId: string, category: 'weapon' | 'armor' | 'mount') => {
    const updatedPlayer = { ...player };
    if (category === 'weapon') updatedPlayer.weapon = itemId;
    if (category === 'armor') updatedPlayer.armor = itemId;
    if (category === 'mount') updatedPlayer.mount = itemId;
    onEquipChange(updatedPlayer);
  };

  return (
    <div id="player-panel-container" className="h-full w-full bg-medieval-panel text-medieval-text rounded-2xl border-4 border-medieval-border p-4 shadow-2xl relative flex flex-col overflow-hidden medieval-border">
      {/* Corner Rivets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />

      {/* Header */}
      <div className="border-b border-medieval-border/50 pb-3 mb-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shrink-0">
        <div className="w-16 h-16 rounded-xl bg-sky-950/80 border-2 border-medieval-gold flex items-center justify-center overflow-hidden shrink-0 relative shadow-md">
          <img
            src="https://lh3.googleusercontent.com/d/1n9vtT_gDUH1IZcAw0eq7VJnMCC3FNExd"
            alt={player.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div>
          <span className="text-[10px] font-mono tracking-wider text-medieval-gold uppercase font-bold">Carta de Linhagem do Cavaleiro</span>
          <h2 className="text-2xl font-serif font-bold text-medieval-gold-light leading-none mt-0.5">{player.name}</h2>
          <span className="inline-block bg-medieval-dark text-medieval-gold text-[10px] font-serif font-bold px-2 py-0.5 rounded-full mt-1.5 border border-medieval-border/60">
            Cavaleiro de Nível {player.level} · Campanha de 1141
          </span>
        </div>
      </div>

      {/* Scrollable contents section */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
        {/* Grid of Attributes and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Attributes Details */}
        <div className="bg-medieval-dark/50 p-4 rounded-xl border border-medieval-border/60">
          <h3 className="font-serif font-bold text-base text-medieval-gold mb-4 flex items-center gap-1.5 border-b border-medieval-border/40 pb-1.5">
            <Heart className="w-5 h-5 text-red-500" />
            Atributos de Combate
          </h3>

          {/* Level Up points indicator */}
          {(player.statPoints || 0) > 0 && (
            <div className="mb-4 p-3 rounded-lg border-2 border-medieval-gold bg-medieval-gold/15 animate-pulse text-center">
              <h4 className="font-serif font-black text-medieval-gold text-xs tracking-wide">
                ★ PONTOS DE TREINO DISPONÍVEIS ★
              </h4>
              <p className="text-[11px] text-medieval-text/90 mt-1">
                Tendes <strong className="text-medieval-gold font-bold">{player.statPoints}</strong> ponto(s) de honra para distribuir! Aperfeiçoai vosso cavaleiro.
              </p>
            </div>
          )}

          <div className="space-y-4 text-xs font-serif">
            {/* Attack */}
            <div className="bg-medieval-panel p-2.5 rounded border border-medieval-border/60 shadow-2xs">
              <div className="flex justify-between items-center text-sm font-bold text-medieval-text">
                <span className="flex items-center gap-1.5 text-medieval-gold">
                  <Swords className="w-4 h-4 text-red-400" />
                  Ataque Total
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-400">{totalAttack}</span>
                  {(player.statPoints || 0) > 0 && (
                    <button
                      onClick={() => handleSpendPoint('attack')}
                      className="px-2 py-0.5 rounded bg-medieval-gold text-medieval-bg text-[10px] font-sans font-bold hover:bg-medieval-gold-light active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Treinar +1
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-medieval-text/50 mt-1 pl-6 leading-tight">
                Ataque Base ({player.attack}) + Arma ({weaponBonus}) + Treino ({trainingAttack})
              </p>
            </div>

            {/* Defense */}
            <div className="bg-medieval-panel p-2.5 rounded border border-medieval-border/60 shadow-2xs">
              <div className="flex justify-between items-center text-sm font-bold text-medieval-text">
                <span className="flex items-center gap-1.5 text-medieval-gold">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Defesa Total
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-400">{totalDefense}</span>
                  {(player.statPoints || 0) > 0 && (
                    <button
                      onClick={() => handleSpendPoint('defense')}
                      className="px-2 py-0.5 rounded bg-medieval-gold text-medieval-bg text-[10px] font-sans font-bold hover:bg-medieval-gold-light active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Treinar +1
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-medieval-text/50 mt-1 pl-6 leading-tight">
                Defesa Base ({player.defense}) + Armadura ({armorBonus}) + Treino ({trainingDefense})
              </p>
            </div>

            {/* Speed */}
            <div className="bg-medieval-panel p-2.5 rounded border border-medieval-border/60 shadow-2xs">
              <div className="flex justify-between items-center text-sm font-bold text-medieval-text">
                <span className="flex items-center gap-1.5 text-medieval-gold">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Velocidade Total
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-sky-400">{totalSpeed}</span>
                  {(player.statPoints || 0) > 0 && (
                    <button
                      onClick={() => handleSpendPoint('speed')}
                      className="px-2 py-0.5 rounded bg-medieval-gold text-medieval-bg text-[10px] font-sans font-bold hover:bg-medieval-gold-light active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Treinar +1
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-medieval-text/50 mt-1 pl-6 leading-tight">
                Velocidade Base ({player.speed}) + Montada ({mountBonus}) + Treino ({trainingSpeed})
              </p>
            </div>

            {/* Precision */}
            <div className="bg-medieval-panel p-2.5 rounded border border-medieval-border/60 shadow-2xs">
              <div className="flex justify-between items-center text-sm font-bold text-medieval-text">
                <span className="flex items-center gap-1.5 text-medieval-gold">
                  <Award className="w-4 h-4 text-amber-400" />
                  Precisão
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-amber-400">{totalPrecision}</span>
                  {(player.statPoints || 0) > 0 && (
                    <button
                      onClick={() => handleSpendPoint('precision')}
                      className="px-2 py-0.5 rounded bg-medieval-gold text-medieval-bg text-[10px] font-sans font-bold hover:bg-medieval-gold-light active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Treinar +1
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-medieval-text/50 mt-1 pl-6 leading-tight">
                Determina o bónus de mira e acerto crítico em combate base ({player.precision || 5})
              </p>
            </div>

            {/* Stamina / Resistance */}
            <div className="bg-medieval-panel p-2.5 rounded border border-medieval-border/60 shadow-2xs">
              <div className="flex justify-between items-center text-sm font-bold text-medieval-text">
                <span className="flex items-center gap-1.5 text-medieval-gold">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Resistência (Energia Máx)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-400">{totalStamina}</span>
                  {(player.statPoints || 0) > 0 && (
                    <button
                      onClick={() => handleSpendPoint('stamina')}
                      className="px-2 py-0.5 rounded bg-medieval-gold text-medieval-bg text-[10px] font-sans font-bold hover:bg-medieval-gold-light active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Treinar +10
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-medieval-text/50 mt-1 pl-6 leading-tight">
                Energia inicial para manobras de combate base ({player.stamina || 100})
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: statistics & records */}
        <div className="bg-medieval-dark/50 p-4 rounded-xl border border-medieval-border/60">
          <h3 className="font-serif font-bold text-base text-medieval-gold mb-4 flex items-center gap-1.5 border-b border-medieval-border/40 pb-1.5">
            <Award className="w-5 h-5 text-medieval-gold" />
            Estatísticas do Torneio
          </h3>

          <div className="grid grid-cols-2 gap-4 text-center font-serif text-medieval-text">
            <div className="bg-medieval-panel p-3 rounded border border-medieval-border/60">
              <span className="text-[10px] uppercase font-mono tracking-wider text-medieval-gold/60">Confrontos</span>
              <span className="block text-2xl font-bold mt-1 text-medieval-text">{totalFights}</span>
            </div>
            <div className="bg-medieval-panel p-3 rounded border border-medieval-border/60">
              <span className="text-[10px] uppercase font-mono tracking-wider text-medieval-gold/60">Vitórias</span>
              <span className="block text-2xl font-bold text-emerald-400 mt-1">{player.victories}</span>
            </div>
            <div className="bg-medieval-panel p-3 rounded border border-medieval-border/60">
              <span className="text-[10px] uppercase font-mono tracking-wider text-medieval-gold/60">Derrotas</span>
              <span className="block text-2xl font-bold text-red-400 mt-1">{player.defeats}</span>
            </div>
            <div className="bg-medieval-panel p-3 rounded border border-medieval-border/60">
              <span className="text-[10px] uppercase font-mono tracking-wider text-medieval-gold/60">Taxa de Glória</span>
              <span className="block text-2xl font-bold text-medieval-gold mt-1">{winRate}%</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-medieval-border/40 bg-medieval-panel/50 flex items-center justify-between text-xs font-serif">
            <span className="font-semibold text-medieval-text/80">Territórios Livres em Valdevez:</span>
            <span className="font-mono font-bold text-base text-medieval-gold bg-medieval-dark border border-medieval-border/60 px-2 py-0.5 rounded">
              {player.conqueredLocations.length} / 20
            </span>
          </div>
        </div>
      </div>

      {/* Armory Section: Equip changing */}
      <div className="bg-medieval-dark/30 p-4 rounded-xl border border-medieval-border/40 mb-8 font-serif">
        <h3 className="font-serif font-bold text-base text-medieval-gold mb-4 border-b border-medieval-border/40 pb-1.5 flex items-center gap-1.5">
          <Swords className="w-5 h-5 text-medieval-gold" />
          Armaria do Vosso Clã (Mudar Equipamento Adquirido)
        </h3>

        <div className="space-y-4 text-xs">
          {/* Weapons armory */}
          <div>
            <h4 className="font-bold text-medieval-gold/80 mb-2">Lanças Disponíveis:</h4>
            <div className="flex flex-wrap gap-2">
              {ownedWeapons.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleEquip(item.id, 'weapon')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    player.weapon === item.id
                      ? 'bg-medieval-gold text-medieval-bg border-medieval-border shadow-sm'
                      : 'bg-medieval-panel text-medieval-text/80 border-medieval-border/40 hover:bg-medieval-panel/80'
                  }`}
                >
                  {player.weapon === item.id && <Check className="w-3.5 h-3.5 text-medieval-bg" />}
                  {item.name} (+{item.bonusValue} Atq)
                </button>
              ))}
            </div>
          </div>

          {/* Armors armory */}
          <div>
            <h4 className="font-bold text-medieval-gold/80 mb-2">Armaduras Disponíveis:</h4>
            <div className="flex flex-wrap gap-2">
              {ownedArmors.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleEquip(item.id, 'armor')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    player.armor === item.id
                      ? 'bg-medieval-gold text-medieval-bg border-medieval-border shadow-sm'
                      : 'bg-medieval-panel text-medieval-text/80 border-medieval-border/40 hover:bg-medieval-panel/80'
                  }`}
                >
                  {player.armor === item.id && <Check className="w-3.5 h-3.5 text-medieval-bg" />}
                  {item.name} (+{item.bonusValue} Def)
                </button>
              ))}
            </div>
          </div>

          {/* Mounts armory */}
          <div>
            <h4 className="font-bold text-medieval-gold/80 mb-2">Montadas Disponíveis:</h4>
            <div className="flex flex-wrap gap-2">
              {ownedMounts.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleEquip(item.id, 'mount')}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    player.mount === item.id
                      ? 'bg-medieval-gold text-medieval-bg border-medieval-border shadow-sm'
                      : 'bg-medieval-panel text-medieval-text/80 border-medieval-border/40 hover:bg-medieval-panel/80'
                  }`}
                >
                  {player.mount === item.id && <Check className="w-3.5 h-3.5 text-medieval-bg" />}
                  {item.name} (+{item.bonusValue} Vel)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dangerous/Reset Area at the very bottom */}
      <div className="border-t border-medieval-border/40 pt-5 flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h4 className="font-serif font-bold text-xs text-red-400 leading-none">Reiniciar Linhagem do Cavaleiro</h4>
          <p className="text-[11px] text-medieval-text/50 font-serif mt-1">
            Isso limpará as vossas conquistas locais, moedas, armaria e cartas do códice de forma irreversível.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Tendes a certeza absoluta de que quereis apagar a vossa linhagem de cavaleiro e recomeçar do zero? Todos os territórios voltarão a ser livres.")) {
              onResetGame();
            }
          }}
          className="flex items-center gap-1 px-3 py-2 text-xs font-serif font-bold text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 rounded-lg cursor-pointer transition-all shrink-0 active:scale-98"
        >
          <Trash2 className="w-4 h-4" />
          Apagar Progresso Guardado
        </button>
      </div>
      </div>
    </div>
  );
}
