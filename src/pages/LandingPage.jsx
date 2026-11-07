import { WashiTape } from '../components/WashiTape.jsx'

export function LandingPage({ onNavigate }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 overflow-hidden">
      {/* LOUSA ESQUEOMÓRFICA DE SALA DE AULA */}
      <div className="chalkboard-board p-4 sm:p-8 md:p-10 mb-8 sm:mb-10 relative overflow-hidden">
        {/* Washi Tape no topo da lousa (responsivo) */}
        <div className="absolute top-2 left-2 sm:left-6 -rotate-6 scale-90 sm:scale-100 origin-left">
          <WashiTape color="yellow" label="DESAFIO DO DIA" />
        </div>

        <div className="absolute top-2 right-2 sm:right-6 rotate-6 scale-90 sm:scale-100 origin-right">
          <WashiTape color="pink" label="ENDOMKT 101" />
        </div>

        {/* Cabeçalho da Lousa com Estilo Giz - Fonte mínima de 2rem nos títulos */}
        <div className="text-center pt-8 pb-5 border-b border-white/15">
          <span className="text-4xl sm:text-5xl select-none inline-block animate-bounce mb-2">
            🎒✨
          </span>
          <h1 className="title-bob-hero font-bold font-heading chalk-text tracking-tight">
            Missão: <span className="chalk-yellow">Endomarketing Educacional</span>
          </h1>
          <p className="text-base sm:text-xl font-hand chalk-cyan mt-2 text-emerald-200">
            Como transformar a sala de aula em uma comunidade engajada e participativa?
          </p>
        </div>

        {/* Texto Introdutório / Contextualização do Problema */}
        <div className="mt-6 sm:mt-8 space-y-6 text-sm sm:text-base leading-relaxed text-slate-100">
          <div className="bg-black/25 p-4 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-xs">
            <h2 className="title-bob-section font-bold chalk-yellow font-heading flex items-center gap-2 mb-3">
              <span>⚠️</span> O Grande Desafio Escolar
            </h2>
            <p className="font-sans text-slate-200 text-base sm:text-lg leading-relaxed">
              Diariamente, escolas e faculdades investem alto em captar novos alunos. No entanto, do outro lado da catraca, <strong className="text-amber-300">portas e oportunidades são perdidas todos os dias dentro da sala de aula</strong>.
            </p>
            <p className="font-sans text-slate-200 text-base sm:text-lg leading-relaxed mt-3">
              Alunos desmotivados, cadeiras vazias por absenteísmo e uma postura passiva de meros "espectadores" minam o aprendizado. O verdadeiro endomarketing escolar começa criando valor e voz ativa para quem já está dentro da turma.
            </p>
          </div>

          {/* O que é o Endomarketing Educacional - 3 Pilares */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/15">
              <span className="text-3xl block mb-2">📢</span>
              <h3 className="text-[1.5rem] sm:text-[1.75rem] font-bold chalk-yellow font-heading leading-tight">
                Comunicação Interna
              </h3>
              <p className="text-sm sm:text-base text-slate-200 mt-2 font-sans leading-normal">
                Conectar os alunos ao propósito das aulas e às oportunidades do curso antes da campainha tocar.
              </p>
            </div>

            <div className="bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/15">
              <span className="text-3xl block mb-2">⚡</span>
              <h3 className="text-[1.5rem] sm:text-[1.75rem] font-bold chalk-cyan font-heading leading-tight">
                Engajamento em Aula
              </h3>
              <p className="text-sm sm:text-base text-slate-200 mt-2 font-sans leading-normal">
                Criar rituais pedagógicos que façam a aula ser viva, colaborativa, prática e estimulante.
              </p>
            </div>

            <div className="bg-white/10 p-4 sm:p-5 rounded-2xl border border-white/15">
              <span className="text-3xl block mb-2">🤝</span>
              <h3 className="text-[1.5rem] sm:text-[1.75rem] font-bold chalk-yellow font-heading leading-tight">
                Pertencimento
              </h3>
              <p className="text-sm sm:text-base text-slate-200 mt-2 font-sans leading-normal">
                Fazer o aluno sentir que é protagonista da sua turma e que sua presença faz falta de verdade.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé da Lousa com Bandeja de Giz e Apagador */}
        <div className="mt-8 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300 font-hand text-lg flex-wrap justify-center">
            <span className="bg-white/10 px-2.5 py-1 rounded-md text-white font-mono text-xs">Giz:</span>
            <span>🤍 Branco</span>
            <span>💛 Amarelo</span>
            <span>💙 Azul</span>
          </div>

          <div className="text-xs sm:text-sm text-amber-300 font-bold font-hand text-lg">
            Atividade Prática em Sala de Aula
          </div>
        </div>
      </div>

      {/* BLOCO DE POST-IT E CTA BOB CUTE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Post-it com as 3 Etapas da Missão */}
        <div className="md:col-span-7 bg-[#FEF08A] postit-note p-5 sm:p-7 border-2 border-amber-300 rotate-[-0.5deg] relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <WashiTape color="orange" label="ROTEIRO DA ATIVIDADE" />
          </div>

          <h3 className="title-bob-section font-bold text-amber-950 mb-3 mt-1 flex items-center gap-2">
            <span>📌</span> O Plano da Dupla
          </h3>

          <ol className="space-y-3 text-sm sm:text-base font-semibold text-amber-900 leading-snug">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-2xs">
                1
              </span>
              <span><strong>Setup Estratégico:</strong> Registre a dupla e escolha uma das 3 Dores Crônicas da sala de aula.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-2xs">
                2
              </span>
              <span><strong>Metodologia em 3 Ações:</strong> Redija o plano tático (Comunicação, Dinâmica em Aula e Pertencimento).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-2xs">
                3
              </span>
              <span><strong>Submissão de Protótipos:</strong> Cole os links das suas campanhas (Canva, Slides, Figma, Vídeos ou Áudios).</span>
            </li>
          </ol>
        </div>

        {/* CTA Principal Bob Cute com Mínimo de 2rem nos títulos e toque responsivo */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-2 sm:p-4">
          <div className="w-full">
            <button
              onClick={() => onNavigate('/setup')}
              className="btn-bob btn-bob-cta w-full py-4 sm:py-6 px-4 sm:px-6 rounded-3xl text-[clamp(1.6rem,5vw,2.15rem)] font-bold flex items-center justify-center gap-2 sm:gap-3 shadow-xl group hover:scale-[1.02] cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl group-hover:rotate-12 transition-transform">🚀</span>
              <span className="leading-tight">Iniciar Missão!</span>
              <span className="text-xl sm:text-2xl">👉</span>
            </button>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-3 font-hand text-base">
              Tempo recomendado da dinâmica: 45 a 60 minutos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
