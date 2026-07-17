/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Location, Player, ShopItem, JoustPassResult, CombatStrategy, ChallengeMode } from '../types';
import { shopItems } from '../data/shopItems';

// Symmetrical strategy comparison matrix (Rock-Paper-Scissors Advantage System)
export const matchupMatrix: Record<CombatStrategy, Record<CombatStrategy, 'advantage' | 'disadvantage' | 'neutral'>> = {
  ataque_frontal: {
    ataque_frontal: 'neutral',
    defesa_firme: 'disadvantage',
    investida_rapida: 'advantage',
    mira_precisa: 'neutral',
    finta_contra_ataque: 'disadvantage'
  },
  defesa_firme: {
    ataque_frontal: 'advantage',
    defesa_firme: 'neutral',
    investida_rapida: 'advantage',
    mira_precisa: 'disadvantage',
    finta_contra_ataque: 'neutral'
  },
  investida_rapida: {
    ataque_frontal: 'disadvantage',
    defesa_firme: 'disadvantage',
    investida_rapida: 'neutral',
    mira_precisa: 'advantage',
    finta_contra_ataque: 'neutral'
  },
  mira_precisa: {
    ataque_frontal: 'neutral',
    defesa_firme: 'advantage',
    investida_rapida: 'disadvantage',
    mira_precisa: 'neutral',
    finta_contra_ataque: 'advantage'
  },
  finta_contra_ataque: {
    ataque_frontal: 'advantage',
    defesa_firme: 'neutral',
    investida_rapida: 'neutral',
    mira_precisa: 'disadvantage',
    finta_contra_ataque: 'neutral'
  }
};

// Stamina cost for each strategy
export function getStrategyStaminaCost(strategy: CombatStrategy): number {
  switch (strategy) {
    case 'defesa_firme': return -15; // Recupera +15 de Energia em vez de consumir!
    case 'mira_precisa': return 15;
    case 'investida_rapida': return 18;
    case 'ataque_frontal': return 20;
    case 'finta_contra_ataque': return 22;
    default: return 15;
  }
}

// Get the matchup state
export function getStrategyMatchup(player: CombatStrategy, enemy: CombatStrategy): 'advantage' | 'disadvantage' | 'neutral' {
  return matchupMatrix[player]?.[enemy] || 'neutral';
}

// Get modifiers for the selected challenge mode
export function getChallengeModifiers(mode: ChallengeMode) {
  switch (mode) {
    case 'prudente':
      return { enemyPower: 0.85, rewardCoins: 0.75, rewardHonor: 0.75 };
    case 'glorioso':
      return { enemyPower: 1.25, rewardCoins: 1.4, rewardHonor: 1.5 };
    case 'honrado':
    default:
      return { enemyPower: 1.0, rewardCoins: 1.0, rewardHonor: 1.0 };
  }
}

// Get dynamic scaling multiplier based on location difficulty level
export function getDifficultyPowerMultiplier(difficulty: number): number {
  switch (difficulty) {
    case 1: return 1.00;
    case 2: return 1.30; // +30% stats
    case 3: return 1.65; // +65% stats
    case 4: return 2.05; // +105% stats (double!)
    case 5: return 2.50; // +150% stats (2.5x!)
    default: return 1.00;
  }
}

// Compute player effective stats including weapon, armor, and training
export function getPlayerTotalStats(player: Player, items: ShopItem[]) {
  const weapon = items.find(i => i.id === player.weapon);
  const armor = items.find(i => i.id === player.armor);
  const mount = items.find(i => i.id === player.mount);

  const weaponBonus = weapon && weapon.bonusType === 'attack' ? weapon.bonusValue : 0;
  const armorBonus = armor && armor.bonusType === 'defense' ? armor.bonusValue : 0;
  const mountBonus = mount && mount.bonusType === 'speed' ? mount.bonusValue : 0;

  let trainingAttackBonus = 0;
  let trainingDefenseBonus = 0;
  let trainingSpeedBonus = 0;

  player.purchasedItems.forEach(itemId => {
    const item = items.find(i => i.id === itemId);
    if (item && item.category === 'training') {
      if (item.bonusType === 'attack') trainingAttackBonus += item.bonusValue;
      if (item.bonusType === 'defense') trainingDefenseBonus += item.bonusValue;
      if (item.bonusType === 'speed') trainingSpeedBonus += item.bonusValue;
    }
  });

  return {
    attack: player.attack + weaponBonus + trainingAttackBonus,
    defense: player.defense + armorBonus + trainingDefenseBonus,
    speed: player.speed + mountBonus + trainingSpeedBonus,
    precision: player.precision || 5,
    stamina: player.stamina || 100
  };
}

// Apply strategy stat multipliers
export function applyStrategyModifiers(
  stats: { attack: number, defense: number, speed: number, precision: number },
  strategy: CombatStrategy
) {
  const modified = { ...stats };
  switch (strategy) {
    case 'ataque_frontal':
      modified.attack *= 1.25;
      modified.defense *= 0.90;
      modified.speed *= 0.95;
      break;
    case 'defesa_firme':
      modified.attack *= 0.90;
      modified.defense *= 1.30;
      modified.speed *= 0.90;
      modified.precision *= 1.05;
      break;
    case 'investida_rapida':
      modified.attack *= 1.10;
      modified.defense *= 0.95;
      modified.speed *= 1.30;
      modified.precision *= 0.85;
      break;
    case 'mira_precisa':
      modified.defense *= 0.95;
      modified.speed *= 0.90;
      modified.precision *= 1.35;
      break;
    case 'finta_contra_ataque':
      modified.attack *= 1.05;
      modified.defense *= 1.10;
      modified.speed *= 1.10;
      modified.precision *= 1.10;
      break;
  }
  return modified;
}

// Apply stamina penalties
export function applyStaminaPenalties(
  stats: { attack: number, defense: number, speed: number, precision: number },
  staminaValue: number,
  maxStamina: number = 100
) {
  const modified = { ...stats };
  const ratio = staminaValue / maxStamina;

  if (ratio < 0.20) {
    // Exaustão severa
    modified.attack *= 0.50;
    modified.defense *= 0.50;
    modified.speed *= 0.50;
    modified.precision *= 0.50;
  } else if (ratio < 0.40) {
    // Exaustão pesada
    modified.attack *= 0.70;
    modified.defense *= 0.80;
    modified.speed *= 0.65;
    modified.precision *= 0.75;
  } else if (ratio < 0.60) {
    // Cansaço moderado
    modified.attack *= 0.85;
    modified.speed *= 0.80;
  }
  return modified;
}

// Generate strategic combat commentaries
export function getStrategyCommentary(
  playerStrategy: CombatStrategy,
  enemyStrategy: CombatStrategy,
  advantage: 'advantage' | 'disadvantage' | 'neutral',
  outcome: 'victory' | 'defeat' | 'draw',
  playerName: string,
  enemyName: string
): string {
  let text = "";

  if (outcome === 'victory') {
    switch (playerStrategy) {
      case 'ataque_frontal':
        text = `A vossa lança entrou firme! A força avassaladora da investida frontal quebrou a sela e a postura de ${enemyName}.`;
        break;
      case 'defesa_firme':
        text = `Resististes incólume ao impacto sob o escudo firme e aproveitastes a grande abertura deixada por ${enemyName}.`;
        break;
      case 'investida_rapida':
        text = `Usando a velocidade extrema do vosso cavalo, surpreendestes ${enemyName} antes que ele estabilizasse a defesa!`;
        break;
      case 'mira_precisa':
        text = `Concentrastes a força na fenda da viseira. A vossa lança atingiu com precisão cirúrgica o peito de ${enemyName}!`;
        break;
      case 'finta_contra_ataque':
        text = `Simulastes uma investida para a esquerda, desequilibrando ${enemyName}, e contra-atacastes de forma magistral!`;
        break;
    }
    if (advantage === 'advantage') {
      text += ` A vossa brilhante escolha tática deu-vos plena vantagem nesta passagem.`;
    }
  } else if (outcome === 'defeat') {
    switch (enemyStrategy) {
      case 'ataque_frontal':
        text = `O ataque frontal implacável de ${enemyName} atingiu o centro do vosso peitoral, sacudindo-vos da sela!`;
        break;
      case 'defesa_firme':
        text = `${enemyName} ergueu uma parede inviolável com o escudo. A vossa lança ricocheteou e fostes punido no contra-golpe.`;
        break;
      case 'investida_rapida':
        text = `A investida veloz e impetuosa de ${enemyName} atingiu vosso flanco antes de preparardes a resposta.`;
        break;
      case 'mira_precisa':
        text = `A pontaria milimétrica de ${enemyName} encontrou um ponto vulnerável no vosso arnês, pontuando certeiramente.`;
        break;
      case 'finta_contra_ataque':
        text = `Fostes ludibriado pela finta ágil de ${enemyName}, que vos atingiu duramente na retaguarda.`;
        break;
    }
    if (advantage === 'disadvantage') {
      text += ` A vossa escolha deixou-vos exposto. O oponente leu bem os vossos movimentos.`;
    }
  } else {
    text = `As lanças chocaram-se com estrondo e estilhaçaram-se em dezenas de pedaços. Ambos os cavaleiros resistiram firmes!`;
    if (advantage === 'advantage') {
      text += ` Tínheis vantagem tática, mas a pura resistência e sela do oponente evitou a derrota.`;
    } else if (advantage === 'disadvantage') {
      text += ` Apesar do oponente ter uma melhor estratégia, a vossa sela e escudo firme evitaram o pior.`;
    }
  }

  return text;
}

// Main Playability / Advantage Index calculator
export function calculatePlayabilityIndex(
  player: Player,
  location: Location,
  strategy: CombatStrategy,
  challengeMode: ChallengeMode
) {
  // Player stats
  const pStats = getPlayerTotalStats(player, shopItems);
  const pStatsStrat = applyStrategyModifiers(pStats, strategy);
  const pBaseline = pStatsStrat.attack * 1.1 + pStatsStrat.defense * 0.7 + pStatsStrat.speed * 0.8 + pStatsStrat.precision * 1.0;

  // Enemy stats with difficulty power multiplier
  const enemyMods = getChallengeModifiers(challengeMode);
  const diffPower = getDifficultyPowerMultiplier(location.difficulty);
  const eStats = {
    attack: location.enemyAttack * enemyMods.enemyPower * diffPower,
    defense: location.enemyDefense * enemyMods.enemyPower * diffPower,
    speed: location.enemySpeed * enemyMods.enemyPower * diffPower,
    precision: location.enemyPrecision * enemyMods.enemyPower * diffPower,
  };
  const eStatsStrat = applyStrategyModifiers(eStats, location.preferredStrategy);
  const eBaseline = eStatsStrat.attack * 1.1 + eStatsStrat.defense * 0.7 + eStatsStrat.speed * 0.8 + eStatsStrat.precision * 1.0;

  // Strategic advantage modifier
  const advantage = getStrategyMatchup(strategy, location.preferredStrategy);
  let finalPlayerBaseline = pBaseline;
  if (advantage === 'advantage') {
    finalPlayerBaseline *= 1.15;
  } else if (advantage === 'disadvantage') {
    finalPlayerBaseline *= 0.90;
  }

  // Calculate victory probability ratio (capped between 10% and 95%)
  const sum = finalPlayerBaseline + eBaseline;
  let percentage = sum > 0 ? Math.round((finalPlayerBaseline / sum) * 100) : 50;
  percentage = Math.max(10, Math.min(95, percentage));

  // Determine label, risk level, and historical description
  let label = "Equilibrado";
  let riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Heroico' | 'Crítico' = 'Médio';
  let description = "As forças equiparam-se nas margens do Vez. A vossa leitura estratégica decidirá a justa.";

  if (percentage >= 80) {
    label = "Muito Favorável";
    riskLevel = "Baixo";
    description = "Vossa linhagem, equipamentos e tática dão-vos domínio absoluto. A vitória está ao vosso alcance.";
  } else if (percentage >= 62) {
    label = "Favorável";
    riskLevel = "Baixo";
    description = "Tendes vantagem física e técnica, mas uma escolha de sela ou tática descuidada poderá virar o combate.";
  } else if (percentage >= 45) {
    label = "Equilibrado";
    riskLevel = "Médio";
    description = "Os cavaleiros medem forças com perícia equivalente. Um embate tático espetacular onde a estratégia dita a glória.";
  } else if (percentage >= 28) {
    label = "Arriscado";
    riskLevel = "Alto";
    description = "O adversário apresenta atributos temíveis nesta modalidade. Exige foco extremo e contra-ataques cirúrgicos.";
  } else {
    label = "Heroico";
    riskLevel = "Heroico";
    description = "Desafio lendário! Estais em nítida desvantagem física. Apenas a estratégia perfeita vos salvará de morder o pó.";
  }

  return {
    label,
    percentage,
    description,
    riskLevel
  };
}

// Calculate results for a single pass
export function calculateJoustPassage(
  round: number,
  player: Player,
  location: Location,
  playerStrategy: CombatStrategy,
  enemyStrategy: CombatStrategy,
  challengeMode: ChallengeMode,
  currentPlayerStamina: number,
  currentEnemyStamina: number,
  isPlayerDesequilibrado: boolean = false,
  isEnemyDesequilibrado: boolean = false
): JoustPassResult {
  // 1. Get player stats
  const pStatsBase = getPlayerTotalStats(player, shopItems);
  
  // 2. Get enemy stats based on location, challenge mode modifier, and difficulty scaling
  const enemyMods = getChallengeModifiers(challengeMode);
  const diffPower = getDifficultyPowerMultiplier(location.difficulty);
  const eStatsBase = {
    attack: location.enemyAttack * enemyMods.enemyPower * diffPower,
    defense: location.enemyDefense * enemyMods.enemyPower * diffPower,
    speed: location.enemySpeed * enemyMods.enemyPower * diffPower,
    precision: location.enemyPrecision * enemyMods.enemyPower * diffPower,
    stamina: location.enemyStamina
  };

  // 3. Consume stamina
  const staminaSpentPlayer = getStrategyStaminaCost(playerStrategy);
  const staminaSpentEnemy = getStrategyStaminaCost(enemyStrategy);

  const playerMaxStamina = player.stamina || 100;
  const enemyMaxStamina = location.enemyStamina;

  const playerStaminaAfter = Math.max(0, Math.min(playerMaxStamina, currentPlayerStamina - staminaSpentPlayer));
  const enemyStaminaAfter = Math.max(0, Math.min(enemyMaxStamina, currentEnemyStamina - staminaSpentEnemy));

  // 4. Apply stamina penalties on stats BEFORE strategy modifications
  const pStatsAfterStamina = applyStaminaPenalties(pStatsBase, playerStaminaAfter, playerMaxStamina);
  const eStatsAfterStamina = applyStaminaPenalties(eStatsBase, enemyStaminaAfter, enemyMaxStamina);

  // 5. Apply strategy modifiers
  const pStatsFinal = applyStrategyModifiers(pStatsAfterStamina, playerStrategy);
  const eStatsFinal = applyStrategyModifiers(eStatsAfterStamina, enemyStrategy);

  // Apply stance break / desequilíbrio penalties
  if (isPlayerDesequilibrado) {
    pStatsFinal.defense *= 0.75;
    pStatsFinal.speed *= 0.75;
  }
  if (isEnemyDesequilibrado) {
    eStatsFinal.defense *= 0.75;
    eStatsFinal.speed *= 0.75;
  }

  // 6. Get strategy matchup
  const advantage = getStrategyMatchup(playerStrategy, enemyStrategy);

  // 7. Calculate scores
  const playerRoll = Math.floor(Math.random() * 8) + 1; // 1 to 8
  const enemyRoll = Math.floor(Math.random() * 8) + 1;  // 1 to 8

  let playerScore = Math.round(
    pStatsFinal.attack * 1.1 +
    pStatsFinal.defense * 0.7 +
    pStatsFinal.speed * 0.8 +
    pStatsFinal.precision * 1.0 +
    playerRoll
  );

  let enemyScore = Math.round(
    eStatsFinal.attack * 1.1 +
    eStatsFinal.defense * 0.7 +
    eStatsFinal.speed * 0.8 +
    eStatsFinal.precision * 1.0 +
    enemyRoll
  );

  // Apply decisive advantage modifiers
  if (advantage === 'advantage') {
    playerScore = Math.round(playerScore * 1.25);
    enemyScore = Math.round(enemyScore * 0.85);
  } else if (advantage === 'disadvantage') {
    playerScore = Math.round(playerScore * 0.80);
    enemyScore = Math.round(enemyScore * 1.20);
  }

  // 8. Outcome
  let outcome: 'victory' | 'defeat' | 'draw';
  if (playerScore > enemyScore + 2) {
    outcome = 'victory';
  } else if (enemyScore > playerScore + 2) {
    outcome = 'defeat';
  } else {
    outcome = 'draw';
  }

  // 9. Generate commentary
  let commentary = getStrategyCommentary(playerStrategy, enemyStrategy, advantage, outcome, player.name, location.enemyName);

  if (isPlayerDesequilibrado && outcome === 'defeat') {
    commentary = `[DESEQUILIBRADO] Ainda cambaleando do golpe devastador anterior, não conseguistes suster o embate! ` + commentary;
  } else if (isEnemyDesequilibrado && outcome === 'victory') {
    commentary = `[OPONENTE DESEQUILIBRADO] Aproveitando o desequilíbrio nítido de ${location.enemyName}, desferistes uma investida fulminante! ` + commentary;
  }

  return {
    round,
    playerScore,
    enemyScore,
    playerRoll,
    enemyRoll,
    outcome,
    commentary,
    playerStrategy,
    enemyStrategy,
    advantage,
    staminaSpentPlayer,
    staminaSpentEnemy,
    playerStaminaAfter,
    enemyStaminaAfter
  };
}

// Deprecated placeholder to prevent compilation breaks in unchanged areas
export function calculateJoustPass(
  round: number,
  player: Player,
  location: Location
): JoustPassResult {
  return calculateJoustPassage(
    round,
    player,
    location,
    'defesa_firme',
    'defesa_firme',
    'honrado',
    100,
    100
  );
}
