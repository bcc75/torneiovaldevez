/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CombatStrategy = 'ataque_frontal' | 'defesa_firme' | 'investida_rapida' | 'mira_precisa' | 'finta_contra_ataque';
export type ChallengeMode = 'prudente' | 'honrado' | 'glorioso';

export interface Player {
  name: string;
  level: number;
  xp: number;
  coins: number;
  honor: number;
  influence: number;
  attack: number;
  defense: number;
  speed: number;
  precision: number; // New: Knight precision (determines critical hit / accuracy)
  stamina: number;   // New: Knight max stamina (default 100)
  statPoints: number; // New: Unspent stat points to distribute on level up
  weapon: string; // ID of current weapon
  armor: string;  // ID of current armor
  mount: string;  // ID of current mount
  purchasedItems: string[]; // IDs of purchased items
  conqueredLocations: string[]; // IDs of conquered locations
  unlockedCards: string[]; // IDs of unlocked cards
  victories: number;
  defeats: number;
}

export interface Location {
  id: string;
  name: string;
  x: number; // percentage from left
  y: number; // percentage from top
  difficulty: number; // 1 to 5
  rewardCoins: number;
  rewardHonor: number;
  influence: number;
  description: string;
  enemyName: string;
  enemyTitle: string;
  monument: string;
  historicalNote: string;
  requiredLevel?: number;

  // New adversary stats:
  enemyLevel: number;
  enemyAttack: number;
  enemyDefense: number;
  enemySpeed: number;
  enemyStamina: number;
  enemyPrecision: number;
  preferredStrategy: CombatStrategy;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'weapon' | 'armor' | 'training' | 'mount';
  cost: number;
  bonusType: 'attack' | 'defense' | 'speed';
  bonusValue: number;
  description: string;
}

export interface HistoryCard {
  id: string;
  title: string;
  type: 'História' | 'Cavalaria' | 'Território' | 'Património' | 'Natureza';
  text: string;
  locationId: string;
}

export interface JoustPassResult {
  round: number;
  playerScore: number;
  enemyScore: number;
  playerRoll: number;
  enemyRoll: number;
  outcome: 'victory' | 'defeat' | 'draw';
  commentary: string;
  playerStrategy: CombatStrategy;
  enemyStrategy: CombatStrategy;
  advantage: 'advantage' | 'disadvantage' | 'neutral';
  staminaSpentPlayer: number;
  staminaSpentEnemy: number;
  playerStaminaAfter: number;
  enemyStaminaAfter: number;
}

export interface JoustBattleState {
  location: Location;
  currentRound: number; // 1, 2, 3
  playerRoundsWon: number;
  enemyRoundsWon: number;
  passResults: JoustPassResult[];
  status: 'idle' | 'charging' | 'impact' | 'showingResult' | 'finished';
}
