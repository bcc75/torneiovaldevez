/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShopItem } from '../types';

export const shopItems: ShopItem[] = [
  // ARMAS
  {
    id: "lança_simples",
    name: "Lança Simples",
    category: "weapon",
    cost: 0,
    bonusType: "attack",
    bonusValue: 0,
    description: "Uma lança básica de treino, leve mas flexível.",
  },
  {
    id: "lança_reforçada",
    name: "Lança Reforçada",
    category: "weapon",
    cost: 120,
    bonusType: "attack",
    bonusValue: 2,
    description: "Ponta de aço temperado e madeira de pinho selecionada.",
  },
  {
    id: "lança_freixo",
    name: "Lança de Freixo",
    category: "weapon",
    cost: 220,
    bonusType: "attack",
    bonusValue: 4,
    description: "Madeira de freixo extremamente resistente, excelente absorção de impacto.",
  },
  {
    id: "lança_valdevez",
    name: "Lança de Valdevez",
    category: "weapon",
    cost: 25,
    costCurrency: "honor",
    bonusType: "attack",
    bonusValue: 7,
    description: "Lança de torneio lendária, forjada com honra pelos mestres ferreiros do Vez.",
  },

  // ARMADURAS
  {
    id: "cota_leve",
    name: "Cota Leve",
    category: "armor",
    cost: 0,
    bonusType: "defense",
    bonusValue: 0,
    description: "Uma veste simples acolchoada com anéis de ferro soltos.",
  },
  {
    id: "cota_reforçada",
    name: "Cota Reforçada",
    category: "armor",
    cost: 150,
    bonusType: "defense",
    bonusValue: 2,
    description: "Malha de ferro densa revestida com couro curtido nas costas e peito.",
  },
  {
    id: "arnes_torneio",
    name: "Arnês de Torneio",
    category: "armor",
    cost: 300,
    bonusType: "defense",
    bonusValue: 5,
    description: "Placas de aço polido cobrindo os pontos vitais, pesada mas impenetrável.",
  },
  {
    id: "armadura_giela",
    name: "Arnês Real de Giela",
    category: "armor",
    cost: 30,
    costCurrency: "honor",
    bonusType: "defense",
    bonusValue: 8,
    description: "Armadura lendária ornamentada com o brasão do Paço de Giela, símbolo de glória e honra militar.",
  },

  // MONTADAS
  {
    id: "cavalo_campo",
    name: "Cavalo de Campo",
    category: "mount",
    cost: 0,
    bonusType: "speed",
    bonusValue: 0,
    description: "Um corcel dócil mas lento, acostumado ao trabalho de campo.",
  },
  {
    id: "cavalo_justa",
    name: "Cavalo de Justa",
    category: "mount",
    cost: 250,
    bonusType: "speed",
    bonusValue: 3,
    description: "Cavalo de guerra robusto, treinado para não recuar perante a carga inimiga.",
  },
  {
    id: "cavalo_honra",
    name: "Cavalo de Honra",
    category: "mount",
    cost: 35,
    costCurrency: "honor",
    bonusType: "speed",
    bonusValue: 6,
    description: "Um garanhão lendário puro-sangue lusitano, ágil, veloz e coroado com manto de honra.",
  },

  // TREINO (Podem ser melhorias permanentes)
  {
    id: "treino_mira",
    name: "Treino de Mira",
    category: "training",
    cost: 10,
    costCurrency: "influence",
    bonusType: "attack",
    bonusValue: 1,
    description: "Exercícios intensivos de pontaria contra o estafermo na liça de treino.",
  },
  {
    id: "treino_sela",
    name: "Treino de Sela",
    category: "training",
    cost: 10,
    costCurrency: "influence",
    bonusType: "speed",
    bonusValue: 1,
    description: "Instrução técnica de equitação para melhorar o arranque e a estabilidade.",
  },
  {
    id: "treino_escudo",
    name: "Treino de Escudo",
    category: "training",
    cost: 10,
    costCurrency: "influence",
    bonusType: "defense",
    bonusValue: 1,
    description: "Prática de encaixe do impacto com o escudo oblíquo para desviar a lança inimiga.",
  }
];
