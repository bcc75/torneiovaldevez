/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Swords, Shield, Award, Compass, HelpCircle, Scroll, ShieldAlert, Sparkles, BookOpenCheck } from 'lucide-react';

export default function AboutView() {
  return (
    <div id="about-view-container" className="h-full w-full bg-medieval-panel text-medieval-text rounded-2xl border-4 border-medieval-border p-4 md:p-6 shadow-2xl relative flex flex-col overflow-hidden medieval-border">
      {/* Decorative metal corner rivets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-medieval-dark border border-medieval-border/80" />

      {/* Header */}
      <div className="border-b border-medieval-border/50 pb-3 mb-4 shrink-0">
        <span className="text-[10px] font-mono tracking-wider text-medieval-gold uppercase font-bold">Crónicas do Reino</span>
        <h2 className="text-2xl font-serif font-bold text-medieval-gold leading-none mt-1">Sobre o Jogo</h2>
        <p className="text-xs text-medieval-text/80 font-serif italic mt-1">
          "Conhecei as origens, as regras de cavalaria e as crónicas que inspiram o Torneio de Valdevez."
        </p>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-6 scrollbar-thin">
        
        {/* Main description section */}
        <div className="bg-medieval-dark/40 border border-medieval-border/30 rounded-xl p-4 md:p-5 relative overflow-hidden">
          <div className="absolute top-3 right-4 opacity-5 text-6xl">📜</div>
          <h3 className="text-lg font-serif font-bold text-medieval-gold-light mb-3 flex items-center gap-2">
            <Scroll className="w-5 h-5 text-medieval-gold" />
            O Recontro de Valdevez (1141)
          </h3>
          <div className="space-y-3 font-serif text-xs md:text-sm text-medieval-text/90 leading-relaxed text-justify">
            <p>
              O <strong>Torneio de Valdevez</strong> é um jogo de estratégia medieval inspirado no histórico <strong>Recontro de Valdevez</strong>, ocorrido em <strong>1141</strong> (tradicionalmente referido como 1140), um dos momentos mais marcantes e determinantes da formação do Reino de Portugal.
            </p>
            <p>
              No papel de um valoroso cavaleiro ao serviço de <strong>D. Afonso Henriques</strong>, competirás em liças nobres, desafiarás temíveis adversários, conquistarás territórios e aumentarás o teu prestígio. Cada vitória permitir-te-á obter moedas de ouro, melhorar o teu equipamento militar, recrutar aliados influentes e conquistar freguesias, monumentos e locais emblemáticos do histórico concelho de <strong>Arcos de Valdevez</strong>.
            </p>
            <p>
              Embora fielmente inspirado em factos e localizações geográficas e históricas reais, o jogo privilegia a jogabilidade e a diversão, recriando um ambiente onde a estratégia tática, a honra de combate e a gestão minuciosa de recursos são tão importantes como a pura força da vossa espada nas arenas. O objetivo supremo não é apenas vencer duelos individuais, mas sim erguer um domínio territorial incontestável.
            </p>
            <p>
              Ao longo da vossa aventura, podereis descobrir imponentes personagens históricas, visitar monumentos locais emblemáticos, desbloquear crónicas culturais do códice e explorar de forma profunda o vasto património histórico e natural de Arcos de Valdevez.
            </p>
          </div>
        </div>

        {/* Bento Grid layout for Features and How to Play */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Features card */}
          <div className="bg-medieval-dark/50 border border-medieval-border/40 rounded-xl p-4 flex flex-col">
            <h3 className="text-base font-serif font-bold text-medieval-gold flex items-center gap-2 mb-3 border-b border-medieval-border/20 pb-2">
              <Sparkles className="w-4 h-4 text-medieval-gold-light" />
              Características Principais
            </h3>
            <ul className="space-y-3 text-xs text-medieval-text/90 font-serif leading-relaxed flex-1">
              <li className="flex items-start gap-2">
                <span className="text-medieval-gold shrink-0 mt-0.5">⚔️</span>
                <span><strong>Combates Estratégicos:</strong> Enfrentai valorosos cavaleiros gerindo sabiamente a vossa energia e escolhendo as melhores táticas de combate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medieval-gold shrink-0 mt-0.5">🏰</span>
                <span><strong>Conquista de Territórios:</strong> Dominai freguesias históricas, monumentos e locais emblemáticos do concelho de Arcos de Valdevez.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medieval-gold shrink-0 mt-0.5">💰</span>
                <span><strong>Evolução e Economia:</strong> Geris o vosso tesouro de ouro, melhorai equipamentos e aumentai o nível do vosso herói.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medieval-gold shrink-0 mt-0.5">🛡️</span>
                <span><strong>Arsenal de Guerra:</strong> Comprai espadas lendárias, escudos de carvalho, montadas velozes e armaduras imperiais.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medieval-gold shrink-0 mt-0.5">🗺️</span>
                <span><strong>Exploração Cultural:</strong> Viajai pelo património local através de um mapa interativo fiel de Arcos de Valdevez.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-medieval-gold shrink-0 mt-0.5">📜</span>
                <span><strong>Códice Histórico:</strong> Desbloqueai crónicas de memória inspiradas nos acontecimentos e nas nobres personagens reais do século XII.</span>
              </li>
            </ul>
          </div>

          {/* How to Play card */}
          <div className="bg-medieval-dark/50 border border-medieval-border/40 rounded-xl p-4 flex flex-col">
            <h3 className="text-base font-serif font-bold text-medieval-gold flex items-center gap-2 mb-3 border-b border-medieval-border/20 pb-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              Como Jogar nas Liças
            </h3>
            <ol className="space-y-3.5 text-xs text-medieval-text/90 font-serif leading-relaxed flex-1">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medieval-dark border border-medieval-border text-medieval-gold flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">1</span>
                <span><strong>Iniciai a Campanha:</strong> Escolhei a vossa identidade de cavaleiro e começai a explorar o mapa regional dividido por níveis de dificuldade.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medieval-dark border border-medieval-border text-medieval-gold flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">2</span>
                <span><strong>Preparai o Guerreiro:</strong> No <strong>Arsenal Real</strong>, comprai equipamentos poderosos e recrutai aliados para ganhar bónus em combate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medieval-dark border border-medieval-border text-medieval-gold flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">3</span>
                <span><strong>Atribuí Atributos:</strong> No vosso <strong>Painel do Cavaleiro</strong>, distribui os pontos conquistados por subir de nível em Ataque, Defesa, Velocidade, Energia ou Precisão.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medieval-dark border border-medieval-border text-medieval-gold flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">4</span>
                <span><strong>Combatei com Tática:</strong> Nas liças, cada ação custa <strong>Energia (Enrg)</strong>. Preveja as estratégias inimigas (ex: usar <em>Finta</em> contra <em>Ataque Frontal</em>) para desferir golpes fulminantes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medieval-dark border border-medieval-border text-medieval-gold flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">5</span>
                <span><strong>Alcançai a Glória:</strong> Desbloqueai todas as <strong>Cartas da Memória</strong> e preparai-vos para o confronto épico final contra o Imperador nas <strong>Veigas da Matança</strong>!</span>
              </li>
            </ol>
          </div>

        </div>

        {/* Note / Disclaimer box */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
          <BookOpenCheck className="w-5 h-5 text-medieval-gold shrink-0 mt-0.5" />
          <div className="text-[11px] font-serif text-medieval-text/70 leading-relaxed space-y-1.5">
            <h4 className="font-bold text-medieval-gold uppercase tracking-wider text-[9px] mb-0.5">Nota Cultural: Recontro de Valdevez</h4>
            <p>
              Em meados do século XII, quando Portugal dava os primeiros passos como reino independente, o vale de Arcos de Valdevez tornou-se palco de um dos episódios mais marcantes da nossa História.
            </p>
            <p>
              O Recontro de Valdevez, ocorrido muito provavelmente na primavera de 1141 (tradicionalmente referido como 1140), colocou frente a frente os exércitos de D. Afonso Henriques e de Afonso VII de Leão e Castela. Ao contrário do que muitas vezes se imagina, não se tratou de uma grande batalha campal, mas de uma série de escaramuças e desafios entre cavaleiros, onde a coragem, a estratégia e a honra decidiram o desfecho do confronto.
            </p>
            <p>
              A vantagem alcançada pelos portugueses conduziu a uma paz negociada, abrindo caminho para o Tratado de Zamora (1143), considerado um dos momentos fundamentais para o reconhecimento da independência de Portugal.
            </p>
            <p>
              O Recontro permanece hoje como um símbolo da coragem, da diplomacia e da afirmação do primeiro rei de Portugal, estando profundamente ligado à identidade histórica de Arcos de Valdevez.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
