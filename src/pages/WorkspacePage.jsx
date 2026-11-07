import { useState, useEffect } from 'preact/hooks'
import confetti from 'canvas-confetti'
import { WashiTape } from '../components/WashiTape.jsx'
import { MarkdownWysiwygEditor } from '../components/MarkdownWysiwygEditor.jsx'
import { DORES } from './SetupPage.jsx'
import { 
  getCurrentDuplaId, 
  getDuplaById, 
  getSubmissaoByDupla, 
  saveSubmissao 
} from '../lib/pocketbase.js'

// Template inicial para guiar a dupla
const TEMPLATE_PLANO = `### 1. DIAGNÓSTICO E OBJETIVO DA CAMPANHA
• Nome da Ação: 
• Público-alvo direto: Alunos da turma / curso
• Objetivo principal: 

### 2. AS 3 AÇÕES OBRIGATÓRIAS DE ENDOMARKETING

📍 AÇÃO 1: COMUNICAÇÃO INTERNA & ATRAÇÃO (Teaser / Despertar da Curiosidade)
- Formato do material (ex: cartaz provocativo, figurinhas de WhatsApp, reels):
- Mensagem-chave / Slogan da campanha:
- Como faremos os alunos falarem sobre o tema antes da aula começar:

📍 AÇÃO 2: DINÂMICA PEDAGÓGICA ATIVA (Intervenção em Sala de Aula)
- Ritual de início de aula ou dinâmica colaborativa:
- Mecânica de engajamento (como o professor e a turma participam juntos):
- Como superamos a dor escolhida no calor da aula:

📍 AÇÃO 3: RECONHECIMENTO & PERTENCIMENTO (Celebração e Continuidade)
- Como os esforços e presenças dos alunos serão celebrados:
- Selo, mural de mérito ou recompensa moral de pertencimento:
- Como manter a chama acesa ao longo do semestre:

### 3. CRONOGRAMA & RECURSOS NECESSÁRIOS
• Materiais necessários:
• Responsáveis por cada etapa:
`

export function WorkspacePage({ onNavigate }) {
  const [dupla, setDupla] = useState(null)
  const [dorInfo, setDorInfo] = useState(null)
  const [submissaoId, setSubmissaoId] = useState(null)
  const [planoTexto, setPlanoTexto] = useState(TEMPLATE_PLANO)
  const [checklist, setChecklist] = useState({
    acao1: false,
    acao2: false,
    acao3: false,
  })
  
  // Entregáveis / Links de suporte
  const [links, setLinks] = useState([])
  const [novoLinkUrl, setNovoLinkUrl] = useState('')
  const [novoLinkTitulo, setNovoLinkTitulo] = useState('')
  const [novoLinkTipo, setNovoLinkTipo] = useState('canva')

  // Status de salvamento e submissão
  const [salvando, setSalvando] = useState(false)
  const [statusSubmissao, setStatusSubmissao] = useState('rascunho')
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [modalConcluido, setModalConcluido] = useState(false)

  // Carrega dados da dupla ativa e submissão existente
  useEffect(() => {
    async function loadData() {
      const currentId = getCurrentDuplaId()
      if (!currentId) {
        onNavigate('/setup')
        return
      }

      const d = await getDuplaById(currentId)
      if (!d) {
        onNavigate('/setup')
        return
      }

      setDupla(d)
      const dor = DORES.find(item => item.id === d.dor_escolhida)
      setDorInfo(dor || DORES[0])

      // Carrega submissão anterior se houver
      const sub = await getSubmissaoByDupla(currentId)
      if (sub) {
        setSubmissaoId(sub.id)
        if (sub.plano_texto) setPlanoTexto(sub.plano_texto)
        if (sub.links_recursos && Array.isArray(sub.links_recursos)) {
          setLinks(sub.links_recursos)
        }
        if (sub.checklist_status) {
          setChecklist(sub.checklist_status)
        }
        if (sub.status) {
          setStatusSubmissao(sub.status)
        }
      }
    }

    loadData()
  }, [])

  // Alterna item do checklist
  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Adicionar Link de Entregável
  const handleAddLink = (e) => {
    e.preventDefault()
    if (!novoLinkUrl.trim()) return

    let formattedUrl = novoLinkUrl.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl
    }

    const newLinkItem = {
      id: Date.now().toString(),
      titulo: novoLinkTitulo.trim() || `Protótipo (${novoLinkTipo.toUpperCase()})`,
      url: formattedUrl,
      tipo: novoLinkTipo
    }

    setLinks(prev => [...prev, newLinkItem])
    setNovoLinkUrl('')
    setNovoLinkTitulo('')
  }

  const handleRemoveLink = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  // Salvar Rascunho ou Submeter Oficialmente
  const handleSalvar = async (isFinal = false) => {
    if (!dupla) return
    setSalvando(true)
    setMensagemSucesso('')

    try {
      const finalStatus = isFinal ? 'submetido' : statusSubmissao
      const res = await saveSubmissao({
        id: submissaoId,
        duplaId: dupla.id,
        plano_texto: planoTexto,
        links_recursos: links,
        checklist_status: checklist,
        status: finalStatus
      })

      if (res.record && res.record.id) {
        setSubmissaoId(res.record.id)
      }
      setStatusSubmissao(finalStatus)

      if (isFinal) {
        setModalConcluido(true)
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        })
      } else {
        setMensagemSucesso('✓ Rascunho salvo com sucesso!')
        setTimeout(() => setMensagemSucesso(''), 4000)
      }
    } catch (err) {
      console.error('Erro ao salvar submissão:', err)
      alert('Houve um problema ao salvar no servidor. Seus dados continuam no navegador!')
    } finally {
      setSalvando(false)
    }
  }

  const checklistCount = Object.values(checklist).filter(Boolean).length

  if (!dupla || !dorInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl animate-bounce mb-3">⏳🎒</div>
        <p className="title-bob-section font-bold text-slate-700">Carregando a sala de aula...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 overflow-hidden">
      {/* CABEÇALHO DO WORKSPACE COM DADOS DA DUPLA */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border-3 border-amber-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl shadow-[0_3px_0_#B45309] border-2 border-amber-600 shrink-0">
            {dorInfo.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="title-bob-hero font-bold font-heading text-slate-800 truncate">
                {dupla.nome_dupla}
              </h1>
              {statusSubmissao === 'submetido' ? (
                <span className="rubber-stamp text-emerald-600 border-emerald-500 bg-emerald-50 text-xs py-0.5 px-2.5">
                  ✓ SUBMETIDO OFICIALMENTE
                </span>
              ) : (
                <span className="text-xs sm:text-sm font-bold px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Em Andamento
                </span>
              )}
            </div>
            <p className="text-xs sm:text-base text-slate-500 font-medium">
              Integrantes: <strong className="text-slate-800">{dupla.aluno1}</strong> e <strong className="text-slate-800">{dupla.aluno2}</strong>
            </p>
          </div>
        </div>

        {/* Badge da Dor Escolhida */}
        <div className="w-full sm:w-auto">
          <div className={`px-4 py-2.5 rounded-2xl border-2 ${dorInfo.badgeCor} shadow-xs text-xs sm:text-sm font-bold flex items-center justify-between sm:justify-start gap-2`}>
            <span>Alvo da Missão:</span>
            <span className="font-heading text-base sm:text-lg font-extrabold">{dorInfo.titulo}</span>
          </div>
        </div>
      </div>

      {/* GRID DE TRABALHO: PAINEL ESQUERDO (METODOLOGIA) + PAINEL CENTRAL (EDITOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PAINEL ESQUERDO (METODOLOGIA & CHECKLIST) - Coluna 4/12 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF0E6] rounded-3xl p-4 sm:p-6 shadow-lg border-4 border-[#C8AD8D] relative">
            <div className="absolute -top-3 left-6 scale-90 sm:scale-100">
              <WashiTape color="yellow" label="METODOLOGIA 3 AÇÕES" />
            </div>

            <div className="flex items-center justify-between pt-2 mb-4 border-b border-[#D8C2A7] pb-3">
              <h2 className="title-bob-card font-bold text-slate-800 flex items-center gap-2">
                <span>📌</span> Checklist
              </h2>
              <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                {checklistCount} de 3 Prontos
              </span>
            </div>

            {/* Barra de Progresso Cute */}
            <div className="w-full bg-amber-200/60 rounded-full h-3.5 mb-5 overflow-hidden border border-amber-300">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-inner"
                style={{ width: `${(checklistCount / 3) * 100}%` }}
              />
            </div>

            {/* Lista dos 3 Itens Obrigatórios */}
            <div className="space-y-3.5">
              {/* Ação 1 */}
              <div 
                onClick={() => toggleChecklist('acao1')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  checklist.acao1 
                    ? 'bg-emerald-50 border-emerald-400 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checklist.acao1}
                    onChange={() => {}}
                    className="w-6 h-6 rounded-md accent-emerald-600 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div>
                    <h3 className="text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold font-heading text-slate-900 leading-snug">
                      1. Comunicação & Atração
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Como chamar a atenção dos colegas antes da aula? (Teasers, cartazes provocativos, figurinhas de WhatsApp).
                    </p>
                  </div>
                </div>
              </div>

              {/* Ação 2 */}
              <div 
                onClick={() => toggleChecklist('acao2')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  checklist.acao2 
                    ? 'bg-emerald-50 border-emerald-400 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checklist.acao2}
                    onChange={() => {}}
                    className="w-6 h-6 rounded-md accent-emerald-600 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div>
                    <h3 className="text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold font-heading text-slate-900 leading-snug">
                      2. Dinâmica Pedagógica Ativa
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Qual intervenção prática ou ritual ocorrerá em sala para transformar a postura da turma no calor da aula?
                    </p>
                  </div>
                </div>
              </div>

              {/* Ação 3 */}
              <div 
                onClick={() => toggleChecklist('acao3')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  checklist.acao3 
                    ? 'bg-emerald-50 border-emerald-400 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checklist.acao3}
                    onChange={() => {}}
                    className="w-6 h-6 rounded-md accent-emerald-600 mt-0.5 cursor-pointer shrink-0"
                  />
                  <div>
                    <h3 className="text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold font-heading text-slate-900 leading-snug">
                      3. Pertencimento & Reconhecimento
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Como valorizar os alunos e manter a chama do engajamento acesa ao longo de todo o semestre?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica da Dor Selecionada */}
            <div className="mt-5 p-4 bg-amber-100/90 rounded-2xl border border-amber-300 text-xs sm:text-sm text-amber-900">
              <span className="font-bold block mb-1 text-sm sm:text-base font-heading">🎯 Foco na Dor {dorInfo.id}:</span>
              <p className="leading-relaxed">
                {dorInfo.desafioChave}
              </p>
            </div>
          </div>
        </div>

        {/* PAINEL CENTRAL (EDITOR CADERNO DE NOTAS WYSIWYG) - Coluna 8/12 */}
        <div className="lg:col-span-8">
          <div className="lined-paper rounded-3xl p-4 sm:p-8 border-3 sm:border-4 border-slate-300 relative">
            {/* Espiral Esqueomórfico no lado esquerdo */}
            <div className="absolute top-8 bottom-8 left-2 w-4 notebook-spiral opacity-50 pointer-events-none hidden sm:block" />

            {/* Washi Tape no topo do caderno */}
            <div className="absolute -top-3.5 right-6 sm:right-12 scale-90 sm:scale-100">
              <WashiTape color="pink" label="PLANO ESTRATÉGICO" />
            </div>

            {/* Editor Markdown WYSIWYG */}
            <MarkdownWysiwygEditor
              value={planoTexto}
              onChange={setPlanoTexto}
              onRestoreTemplate={() => setPlanoTexto(TEMPLATE_PLANO)}
              placeholder="Comece a redigir o plano de Endomarketing da sua dupla aqui..."
            />
          </div>
        </div>
      </div>

      {/* ÁREA DE ENTREGÁVEIS & PROTÓTIPOS (LINKS DE RECURSOS) */}
      <div className="mt-8 bg-white rounded-3xl p-4 sm:p-8 shadow-md border-3 border-amber-200 relative">
        <div className="absolute -top-3.5 left-6 sm:left-10 scale-90 sm:scale-100">
          <WashiTape color="blue" label="PROTÓTIPOS & ARQUIVOS" />
        </div>

        <div className="pt-2 pb-4 border-b border-dashed border-amber-200 mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="title-bob-section font-bold font-heading text-slate-800 flex items-center gap-2">
              <span>🎨📁</span> Protótipos da Campanha
            </h2>
            <p className="text-sm sm:text-base font-hand text-slate-600 mt-1">
              Cole os links dos seus protótipos visuais (Canva, Google Slides, Figma, Google Drive, YouTube, áudios/podcasts).
            </p>
          </div>
          <span className="text-xs sm:text-sm font-bold px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full">
            {links.length} arquivo(s)
          </span>
        </div>

        {/* Formulário para Inserir Novo Link */}
        <form onSubmit={handleAddLink} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 bg-slate-50/80 p-3 sm:p-5 rounded-2xl border-2 border-slate-200">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-heading">
              Tipo de Mídia:
            </label>
            <select
              value={novoLinkTipo}
              onChange={(e) => setNovoLinkTipo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="canva">🎨 Canva (Peças Gráficas / Cartazes)</option>
              <option value="slides">📊 Apresentação (Slides / Pitch)</option>
              <option value="figma">✨ Figma (Interface / Protótipo)</option>
              <option value="drive">📁 Google Drive (Pasta de Arquivos)</option>
              <option value="video">🎥 Vídeo / Reels / YouTube</option>
              <option value="audio">🎙️ Áudio / Podcast / Vinheta</option>
              <option value="outro">🔗 Outro Link Externo</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-heading">
              Título do Entregável:
            </label>
            <input
              type="text"
              value={novoLinkTitulo}
              onInput={(e) => setNovoLinkTitulo(e.target.value)}
              placeholder="Ex: Cartaz Teaser de Entrada, Reel da Turma..."
              className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1 font-heading">
              URL / Link do Arquivo:
            </label>
            <input
              type="url"
              value={novoLinkUrl}
              onInput={(e) => setNovoLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="btn-bob btn-bob-primary w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center cursor-pointer shadow-xs"
            >
              + Adicionar Link
            </button>
          </div>
        </form>

        {/* Listagem dos Links Adicionados */}
        {links.length === 0 ? (
          <div className="text-center py-6 text-slate-400 font-hand text-lg border-2 border-dashed border-slate-200 rounded-2xl">
            Nenhum link adicionado ainda. Insira acima as URLs dos seus protótipos de campanha!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {links.map((item) => (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-colors relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                      {item.tipo}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(item.id)}
                      className="text-slate-400 hover:text-rose-600 text-sm font-bold transition-colors p-1"
                      title="Remover link"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate font-heading">
                    {item.titulo}
                  </h4>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-semibold truncate block underline"
                >
                  🔗 {item.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BARRA DE AÇÃO INFERIOR: SALVAR RASCUNHO E SUBMISSÃO FINAL */}
      <div className="mt-8 bg-[#FAF7EE] p-4 sm:p-6 rounded-3xl border-3 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSalvar(false)}
            disabled={salvando}
            className="btn-bob bg-white text-slate-800 border-2 border-slate-300 hover:border-amber-400 shadow-[0_4px_0_#CBD5E1] px-5 sm:px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
          >
            <span>💾</span>
            <span>{salvando ? 'Salvando...' : 'Salvar Rascunho'}</span>
          </button>

          {mensagemSucesso && (
            <span className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 animate-fade-in shrink-0">
              {mensagemSucesso}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Deseja submeter oficialmente a entrega da Missão da sua dupla?')) {
              handleSalvar(true)
            }
          }}
          disabled={salvando}
          className="btn-bob btn-bob-success w-full sm:w-auto px-6 sm:px-8 py-4 rounded-2xl text-[clamp(1.4rem,4vw,1.85rem)] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 leading-tight"
        >
          <span>🏆</span>
          <span>Submeter Missão Oficial</span>
          <span className="text-xl">✨</span>
        </button>
      </div>

      {/* MODAL COMEMORATIVO DE CONCLUSÃO (BOB CUTE) */}
      {modalConcluido && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border-4 border-emerald-300 relative text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-3 border-2 border-emerald-400 shadow-md">
              ⭐
            </div>

            <div className="rubber-stamp text-emerald-600 border-emerald-500 bg-emerald-50 mb-3 text-xs">
              MISSÃO ENTREGUE COM SUCESSO!
            </div>

            <h3 className="title-bob-hero font-bold font-heading text-slate-800 mb-2">
              Parabéns, {dupla.nome_dupla}!
            </h3>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans mb-4">
              O plano estratégico para combater a <strong className="text-slate-900">{dorInfo.titulo}</strong> foi registrado e persistido com sucesso!
            </p>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 mb-6 text-left space-y-1.5">
              <div><strong>Integrantes:</strong> {dupla.aluno1} & {dupla.aluno2}</div>
              <div><strong>Alvo:</strong> Dor {dorInfo.id} - {dorInfo.titulo}</div>
              <div><strong>Ações Metodológicas:</strong> {checklistCount} de 3 validadas</div>
              <div><strong>Protótipos Entregues:</strong> {links.length} arquivo(s)</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => setModalConcluido(false)}
                className="btn-bob btn-bob-primary px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer"
              >
                Continuar Editando
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn-bob bg-slate-100 text-slate-800 border-2 border-slate-300 hover:bg-slate-200 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer"
              >
                🖨️ Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
