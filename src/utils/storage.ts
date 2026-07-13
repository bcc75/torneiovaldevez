/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../types';

const STORAGE_KEY = 'torneio_valdevez_save';

export const INITIAL_PLAYER: Player = {
  name: "D. Bruno de Quyntas",
  level: 1,
  xp: 0,
  coins: 80,
  honor: 0,
  influence: 0,
  attack: 5,
  defense: 5,
  speed: 6,
  precision: 5,
  stamina: 100,
  statPoints: 0,
  weapon: "lança_simples",
  armor: "cota_leve",
  mount: "cavalo_campo",
  purchasedItems: ["lança_simples", "cota_leve", "cavalo_campo"],
  conqueredLocations: [],
  unlockedCards: [],
  victories: 0,
  defeats: 0
};

export function saveGame(player: Player): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  } catch (error) {
    console.error("Erro ao guardar progresso no localStorage:", error);
  }
}

export function loadGame(): Player {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure any newly added fields are backward compatible
      return { ...INITIAL_PLAYER, ...parsed };
    }
  } catch (error) {
    console.error("Erro ao carregar progresso do localStorage:", error);
  }
  return INITIAL_PLAYER;
}

export function resetGame(): Player {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar progresso do localStorage:", error);
  }
  return INITIAL_PLAYER;
}
