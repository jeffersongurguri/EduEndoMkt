import { setCurrentDuplaId } from '../lib/pocketbase.js'

export function Footer({ onNavigate }) {
  const handleResetSession = () => {
    if (confirm('Deseja iniciar uma nova dupla ou limpar a sessão atual?')) {
      setCurrentDuplaId(null)
      onNavigate('/setup')
    }
  }

  return (
    <footer className="mt-16 bg-[#2B1B10] text-amber-100/90 border-t-8 border-[#4A2E18] shadow-inner relative w-full overflow-hidden">
      {/* Detalhe esqueomórfico da bancada de madeira */}
      <div className="h-2 w-full bg-linear-to-r from-amber-900/60 via-amber-700/40 to-amber-900/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Lado Esquerdo: Mensagem Pedagógica */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✏️</span>
              <span className="font-heading font-bold text-amber-300 text-[clamp(1.4rem,4vw,1.85rem)] leading-tight">
                Mural do Professor
              </span>
            </div>
            <p className="text-sm sm:text-base text-amber-200/85 font-medium leading-relaxed font-hand">
              "Endomarketing escolar não é apenas criar cartazes bonitos: é construir rituais, escuta ativa e senso real de comunidade onde cada aluno se sente protagonista."
            </p>
          </div>

          {/* Centro: Doodles de Material Escolar */}
          <div className="flex justify-center items-center gap-4 text-3xl select-none opacity-85 py-2">
            <span title="Lápis 2B" className="hover:scale-125 transition-transform cursor-pointer">✏️</span>
            <span title="Borracha macia" className="hover:scale-125 transition-transform cursor-pointer">🧼</span>
            <span title="Livros didáticos" className="hover:scale-125 transition-transform cursor-pointer">📚</span>
            <span title="Café do professor" className="hover:scale-125 transition-transform cursor-pointer">☕</span>
            <span title="Estrela de mérito" className="hover:scale-125 transition-transform cursor-pointer">⭐</span>
          </div>

          {/* Lado Direito: Ações e Informações da Atividade */}
          <div className="flex flex-col md:items-end gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-amber-400 font-bold">Atividade Prática:</span>
              <span className="bg-amber-900/80 px-2.5 py-1 rounded-md border border-amber-700/50 font-bold">
                Endomarketing Educacional
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <button
                onClick={handleResetSession}
                className="text-amber-300 hover:text-amber-100 hover:underline transition-colors flex items-center gap-1 font-semibold"
              >
                <span>🔄</span> Nova Inscrição / Trocar Dupla
              </button>
              <span>•</span>
              <span className="text-amber-400/60 font-mono">Preact + Tailwind</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
