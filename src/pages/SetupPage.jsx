import { useState } from 'preact/hooks'
import { WashiTape } from '../components/WashiTape.jsx'
import { createDupla } from '../lib/pocketbase.js'

export const DORES = [
  {
    id: 'A',
    titulo: 'Falta de Engajamento',
    subtitulo: 'Apatia, desinteresse e desânimo generalizado',
    emoji: '🥱',
    badgeCor: 'bg-amber-100 text-amber-900 border-amber-300',
    cardCor: 'border-amber-400 bg-amber-50/70',
    hoverCor: 'hover:border-amber-500',
    descricao: 'Os alunos até comparecem, mas não participam. Ficam dispersos no celular, desatentos e sem brilho nos olhos durante as explicações.',
    desafioChave: 'Como desenhar uma campanha interna que reacenda a curiosidade e o entusiasmo em sala de aula?'
  },
  {
    id: 'B',
    titulo: 'Absenteísmo Escolar',
    subtitulo: 'Faltas frequentes, atrasos e evasão nas aulas',
    emoji: '🚪',
    badgeCor: 'bg-orange-100 text-orange-900 border-orange-300',
    cardCor: 'border-orange-400 bg-orange-50/70',
    hoverCor: 'hover:border-orange-500',
    descricao: 'Cadeiras vazias recorrentes, atrasos contínuos nas primeiras aulas e alunos sumindo logo após o intervalo da instituição.',
    desafioChave: 'Como fazer o aluno sentir que sua presença física faz falta real e gera valor insubstituível para a turma?'
  },
  {
    id: 'C',
    titulo: 'Postura Passiva',
    subtitulo: 'Espectadores silenciosos e medo de errar',
    emoji: '🤐',
    badgeCor: 'bg-purple-100 text-purple-900 border-purple-300',
    cardCor: 'border-purple-400 bg-purple-50/70',
    hoverCor: 'hover:border-purple-500',
    descricao: 'A turma mantém um silêncio constrangedor nos debates. Os alunos têm receio do julgamento e evitam opinar ou se arriscar.',
    desafioChave: 'Como gerar segurança psicológica e rituais lúdicos onde a voz de todo aluno seja ouvida sem medo?'
  }
]

export function SetupPage({ onNavigate }) {
  const [nomeDupla, setNomeDupla] = useState('')
  const [aluno1, setAluno1] = useState('')
  const [aluno2, setAluno2] = useState('')
  const [dorEscolhida, setDorEscolhida] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (!nomeDupla.trim()) {
      setErro('Por favor, dê um nome criativo para a sua Dupla/Agência!')
      return
    }
    if (!aluno1.trim() || !aluno2.trim()) {
      setErro('Preencha o nome dos dois integrantes da dupla.')
      return
    }
    if (!dorEscolhida) {
      setErro('Selecione uma das 3 dores abaixo para ser o alvo da campanha.')
      return
    }

    try {
      setLoading(true)
      await createDupla({
        nome_dupla: nomeDupla,
        aluno1,
        aluno2,
        dor_escolhida: dorEscolhida
      })

      // Redireciona para o Workspace
      onNavigate('/workspace')
    } catch (err) {
      console.error('Erro ao cadastrar dupla:', err)
      setErro('Não foi possível salvar os dados. Tente novamente!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 overflow-hidden">
      {/* FICHA DE INSCRIÇÃO ESQUEOMÓRFICA */}
      <div className="bg-white rounded-3xl p-4 sm:p-8 md:p-10 shadow-xl border-3 sm:border-4 border-amber-200 relative mb-8">
        {/* Washi tape decorativa no topo */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 scale-90 sm:scale-100">
          <WashiTape color="mint" label="ETAPA 1: REGISTRO DA DUPLA" />
        </div>

        {/* Clipe de Papel Esqueomórfico */}
        <div className="absolute -top-5 right-4 sm:right-8 text-3xl sm:text-4xl select-none pointer-events-none drop-shadow-md">
          📎
        </div>

        <div className="text-center pt-2 pb-5 border-b-2 border-dashed border-amber-200">
          <span className="text-3xl sm:text-4xl select-none inline-block mb-1">📋✍️</span>
          <h1 className="title-bob-hero font-bold font-heading text-slate-800 leading-tight">
            Ficha de Setup da Missão
          </h1>
          <p className="text-base sm:text-lg font-hand text-slate-600 mt-1">
            Identifique os componentes da dupla e eleja o problema central que vocês irão solucionar.
          </p>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {erro && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm sm:text-base font-bold flex items-center gap-2">
            <span>🚨</span>
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Seção 1: Dados da Dupla */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[clamp(1.4rem,4vw,2rem)] font-bold text-slate-800 mb-1 font-heading leading-tight">
                🏷️ Nome da Dupla / Agência:
              </label>
              <input
                type="text"
                value={nomeDupla}
                onInput={(e) => setNomeDupla(e.target.value)}
                placeholder="Ex: Agência Sala Viva, Dupla Raio-X, Criativa Edu..."
                className="w-full px-4 py-3 sm:py-3.5 rounded-2xl bg-amber-50/50 border-2 border-amber-200 focus:border-amber-500 focus:bg-white focus:outline-hidden font-heading text-base sm:text-lg text-slate-800 transition-colors shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[clamp(1.2rem,3.5vw,1.75rem)] font-bold text-slate-800 mb-1 font-heading leading-tight">
                👤 Aluno 1:
              </label>
              <input
                type="text"
                value={aluno1}
                onInput={(e) => setAluno1(e.target.value)}
                placeholder="Nome do integrante 1"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-hidden text-base text-slate-800 transition-colors shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[clamp(1.2rem,3.5vw,1.75rem)] font-bold text-slate-800 mb-1 font-heading leading-tight">
                👤 Aluno 2:
              </label>
              <input
                type="text"
                value={aluno2}
                onInput={(e) => setAluno2(e.target.value)}
                placeholder="Nome do integrante 2"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-blue-400 focus:bg-white focus:outline-hidden text-base text-slate-800 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Dica da Dupla */}
          <div className="px-4 py-3 bg-amber-100/70 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 font-medium">
            💡 <strong>Dica de Sala de Aula:</strong> Uma boa dupla colabora ativamente: um pode focar na redação das ações e o outro na prototipagem visual das peças!
          </div>

          {/* Seção 2: Seleção da Dor (Radio Cards Grandes Interativos com Fonte Mínima de 2rem nos Títulos) */}
          <div className="pt-5 border-t-2 border-dashed border-amber-200">
            <div className="mb-4">
              <h2 className="title-bob-section font-bold text-slate-900 font-heading">
                🎯 Escolha o Alvo da Campanha
              </h2>
              <p className="text-sm sm:text-base font-hand text-slate-500 font-bold mt-0.5">
                * Selecione 1 das 3 dores (a seleção desabilita as demais):
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DORES.map((dor) => {
                const isSelected = dorEscolhida === dor.id
                return (
                  <div
                    key={dor.id}
                    onClick={() => setDorEscolhida(dor.id)}
                    className={`relative rounded-3xl p-5 border-3 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                      isSelected
                        ? `${dor.cardCor} shadow-[0_8px_0_rgba(0,0,0,0.12)] scale-[1.02] ring-2 ring-offset-2 ring-amber-400`
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100 shadow-xs'
                    }`}
                  >
                    {/* Selo Carimbado quando selecionado */}
                    {isSelected && (
                      <div className="absolute -top-3.5 -right-2 rubber-stamp text-emerald-600 border-emerald-500 bg-emerald-50 shadow-sm text-xs">
                        ✓ ESCOLHIDO!
                      </div>
                    )}

                    <div>
                      {/* Topo do Card com Ícone e Letra */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl">{dor.emoji}</span>
                        <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-full border ${dor.badgeCor}`}>
                          Dor {dor.id}
                        </span>
                      </div>

                      {/* Título do Card com tamanho mínimo de 2rem (adaptado com fluid clamp para mobile) */}
                      <h3 className="title-bob-card font-bold font-heading text-slate-900 mt-2">
                        {dor.titulo}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 font-hand text-base">
                        {dor.subtitulo}
                      </p>

                      <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                        {dor.descricao}
                      </p>
                    </div>

                    {/* Desafio chave na base do card */}
                    <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs sm:text-sm font-medium text-slate-700 bg-white/70 p-3 rounded-2xl">
                      <strong className="text-slate-900 block font-heading text-sm sm:text-base">Desafio da Dupla:</strong>
                      {dor.desafioChave}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Botão de Confirmação Bob Cute com tamanho mínimo de 2rem adaptado */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-sm sm:text-base font-bold text-slate-500 hover:text-slate-800 transition-colors order-2 sm:order-1"
            >
              ← Voltar para a Introdução
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-bob btn-bob-primary w-full sm:w-auto px-6 sm:px-8 py-4 rounded-2xl text-[clamp(1.4rem,4.5vw,2rem)] font-bold flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50 leading-tight"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-2xl">⏳</span>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span>Abrir Workspace</span>
                  <span className="text-2xl">🎒👉</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
