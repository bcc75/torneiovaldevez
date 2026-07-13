/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Player, ShopItem } from '../types';
import { shopItems } from '../data/shopItems';
import { Shield, Coins, Award, Swords, Compass, Sparkles, Check, ChevronRight } from 'lucide-react';

interface ShopProps {
  player: Player;
  onPurchase: (updatedPlayer: Player) => void;
}

export default function Shop({ player, onPurchase }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'weapon' | 'armor' | 'mount' | 'training'>('all');

  // Filter items based on selected category
  const filteredItems = activeCategory === 'all'
    ? shopItems.filter(item => item.cost > 0) // don't show starting free items in the shop shelf
    : shopItems.filter(item => item.category === activeCategory && item.cost > 0);

  const handleBuyItem = (item: ShopItem) => {
    if (player.coins < item.cost) return;

    const updatedPurchased = [...player.purchasedItems, item.id];
    let newCoins = player.coins - item.cost;
    
    // Core attributes modifiers
    let newAttack = player.attack;
    let newDefense = player.defense;
    let newSpeed = player.speed;

    let newWeapon = player.weapon;
    let newArmor = player.armor;
    let newMount = player.mount;

    // Apply immediate bonus or set equipped gear
    if (item.category === 'weapon') {
      newWeapon = item.id;
    } else if (item.category === 'armor') {
      newArmor = item.id;
    } else if (item.category === 'mount') {
      newMount = item.id;
    } else if (item.category === 'training') {
      // Training is consumable / permanent increase
      if (item.bonusType === 'attack') newAttack += item.bonusValue;
      if (item.bonusType === 'defense') newDefense += item.bonusValue;
      if (item.bonusType === 'speed') newSpeed += item.bonusValue;
    }

    const updatedPlayer: Player = {
      ...player,
      coins: newCoins,
      purchasedItems: updatedPurchased,
      weapon: newWeapon,
      armor: newArmor,
      mount: newMount,
      attack: newAttack,
      defense: newDefense,
      speed: newSpeed
    };

    onPurchase(updatedPlayer);
  };

  const handleEquipItem = (item: ShopItem) => {
    let newWeapon = player.weapon;
    let newArmor = player.armor;
    let newMount = player.mount;

    if (item.category === 'weapon') newWeapon = item.id;
    if (item.category === 'armor') newArmor = item.id;
    if (item.category === 'mount') newMount = item.id;

    const updatedPlayer: Player = {
      ...player,
      weapon: newWeapon,
      armor: newArmor,
      mount: newMount
    };

    onPurchase(updatedPlayer);
  };

  const isPurchased = (itemId: string) => player.purchasedItems.includes(itemId);
  
  const isEquipped = (itemId: string) => {
    return player.weapon === itemId || player.armor === itemId || player.mount === itemId;
  };

  const categories = [
    { id: 'all', label: 'Todo o Arsenal' },
    { id: 'weapon', label: 'Armas (Lanças)' },
    { id: 'armor', label: 'Armaduras' },
    { id: 'mount', label: 'Montadas' },
    { id: 'training', label: 'Treino Militar' }
  ];

  return (
    <div id="shop-container" className="h-full w-full bg-medieval-panel text-medieval-text rounded-2xl border-4 border-medieval-border p-4 shadow-2xl relative flex flex-col overflow-hidden medieval-border">
      {/* Wood Texture/Accent Header */}
      <div className="border-b border-medieval-border/50 pb-3 mb-4 shrink-0">
        <span className="text-[10px] font-mono tracking-wider text-medieval-gold uppercase font-bold">Mercado Real de Valdevez</span>
        <h2 className="text-2xl font-serif font-bold text-medieval-gold leading-none mt-1">Arsenal & Liça de Treino</h2>
        <p className="text-xs text-medieval-text/80 font-serif italic mt-1">
          "Armai vosso cavaleiro com o melhor aço das margens do Vez e aprimorai vossa sela."
        </p>
      </div>

      {/* Categories Horizontal Navigation */}
      <div className="flex flex-wrap gap-1.5 mb-4 shrink-0">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold border transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-medieval-gold text-medieval-bg border-medieval-border shadow-sm font-black'
                : 'bg-medieval-dark text-medieval-text/75 border-medieval-border hover:bg-medieval-dark/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scrollable Shelf Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
        {/* Shelf Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const owned = isPurchased(item.id);
            const equipped = isEquipped(item.id);
            const canAfford = player.coins >= item.cost;

            let bonusLabel = "";
            let bonusIcon = <Swords className="w-4 h-4 text-red-400" />;
            if (item.bonusType === 'attack') {
              bonusLabel = `+${item.bonusValue} Ataque`;
              bonusIcon = <Swords className="w-4 h-4 text-red-400" />;
            } else if (item.bonusType === 'defense') {
              bonusLabel = `+${item.bonusValue} Defesa`;
              bonusIcon = <Shield className="w-4 h-4 text-emerald-400" />;
            } else if (item.bonusType === 'speed') {
              bonusLabel = `+${item.bonusValue} Velocidade`;
              bonusIcon = <Compass className="w-4 h-4 text-sky-400" />;
            }

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border bg-medieval-dark/40 hover:bg-medieval-dark/60 transition-all flex flex-col justify-between shadow-sm relative ${
                  equipped
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                    : owned
                    ? 'border-medieval-border/50'
                    : 'border-medieval-border/30'
                }`}
              >
                {/* Equipped Stamp */}
                {equipped && (
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-serif font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
                    <Check className="w-3 h-3" /> Equipado
                  </span>
                )}

                {/* Owned but not equipped tag */}
                {owned && !equipped && item.category !== 'training' && (
                  <span className="absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-serif bg-sky-950/40 text-sky-400 border border-sky-800/60">
                    Adquirido
                  </span>
                )}

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-medieval-gold/60">
                    {item.category === 'weapon' ? 'Lança de Justa' : item.category === 'armor' ? 'Armadura' : item.category === 'mount' ? 'Cavalo de Guerra' : 'Treino Permanente'}
                  </span>
                  <h4 className="font-serif font-bold text-base text-medieval-gold-light leading-tight mt-0.5">{item.name}</h4>
                  <p className="text-xs text-medieval-text/80 leading-relaxed mt-1.5 font-serif">{item.description}</p>
                </div>

                <div className="mt-4 border-t border-medieval-border/40 pt-3.5 flex items-center justify-between">
                  {/* Stats Bonus Badge */}
                  <div className="flex items-center gap-1 bg-medieval-dark px-2 py-1 rounded border border-medieval-border/55 text-xs font-serif font-bold text-medieval-text/90">
                    {bonusIcon}
                    <span>{bonusLabel}</span>
                  </div>

                  {/* Purchase Button / Equip Button */}
                  {equipped ? (
                    <span className="text-xs text-emerald-400 font-serif font-bold">Em Uso</span>
                  ) : owned && item.category !== 'training' ? (
                    <button
                      onClick={() => handleEquipItem(item)}
                      className="flex items-center gap-1 text-xs font-serif font-bold text-sky-300 bg-sky-950/40 hover:bg-sky-950/60 px-2.5 py-1.5 rounded-lg border border-sky-800/60 cursor-pointer transition-all"
                    >
                      Equipar
                    </button>
                  ) : item.category === 'training' ? (
                    /* Training can be bought multiple times */
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif font-bold border cursor-pointer transition-all ${
                        canAfford
                          ? 'bg-medieval-gold text-medieval-bg border-medieval-border hover:bg-medieval-gold-light shadow-xs font-black'
                          : 'bg-medieval-dark/40 text-medieval-text/30 border-medieval-border/50 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 shrink-0" />
                      Treinar ({item.cost})
                    </button>
                  ) : (
                    /* Weapon/Armor/Mount purchase button */
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif font-bold border cursor-pointer transition-all ${
                        canAfford
                          ? 'bg-medieval-gold text-medieval-bg border-medieval-border hover:bg-medieval-gold-light shadow-md font-black'
                          : 'bg-medieval-dark/40 text-medieval-text/30 border-medieval-border/50 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 shrink-0" />
                      Comprar ({item.cost})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Starting items list / current inventory summary at bottom */}
        <div className="bg-medieval-dark/30 p-4 rounded-xl border border-medieval-border/50">
          <h4 className="font-serif font-bold text-sm text-medieval-gold mb-3">Atributos Atuais do Cavaleiro:</h4>
          <div className="grid grid-cols-3 gap-4 text-xs text-medieval-text/90">
            <div className="flex flex-col">
              <span className="text-medieval-gold font-medium">Ataque Base:</span>
              <span className="text-sm font-serif font-black text-medieval-text">{player.attack} <span className="text-medieval-text/40 font-normal text-[10px]">(Lança: +{shopItems.find(i => i.id === player.weapon)?.bonusValue || 0})</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-medieval-gold font-medium">Defesa Base:</span>
              <span className="text-sm font-serif font-black text-medieval-text">{player.defense} <span className="text-medieval-text/40 font-normal text-[10px]">(Cota: +{shopItems.find(i => i.id === player.armor)?.bonusValue || 0})</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-medieval-gold font-medium">Velocidade Base:</span>
              <span className="text-sm font-serif font-black text-medieval-text">{player.speed} <span className="text-medieval-text/40 font-normal text-[10px]">(Cavalo: +{shopItems.find(i => i.id === player.mount)?.bonusValue || 0})</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
