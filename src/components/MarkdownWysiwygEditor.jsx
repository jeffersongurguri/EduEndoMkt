import { useState, useEffect, useRef } from 'preact/hooks'
import {
  Eye,
  Columns2,
  Code2,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table,
  Minus,
  Undo2,
  Redo2,
  Sparkles,
  Highlighter
} from 'lucide-preact'
import { markdownToHtml, htmlToMarkdown, getMarkdownStats } from '../lib/markdown.js'

// Cores do estojo de canetas marca-texto
const HIGHLIGHT_COLORS = [
  { id: 'yellow', label: 'Amarelo Sol', bg: '#FEF08A', border: '#EAB308', text: '#713F12' },
  { id: 'green', label: 'Verde Neon', bg: '#BBF7D0', border: '#22C55E', text: '#14532D' },
  { id: 'pink', label: 'Rosa Chiclete', bg: '#FBCFE8', border: '#EC4899', text: '#831843' },
  { id: 'blue', label: 'Azul Céu', bg: '#BAE6FD', border: '#0EA5E9', text: '#0C4A6E' },
]

export function MarkdownWysiwygEditor({
  value = '',
  onChange,
  onRestoreTemplate,
  placeholder = 'Comece a redigir o plano de Endomarketing da sua dupla aqui...'
}) {
  // Modos de edição: 'visual' (WYSIWYG), 'split' (Lado a Lado), 'source' (Markdown Puro)
  const [mode, setMode] = useState('visual')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const visualEditorRef = useRef(null)
  const textareaRef = useRef(null)
  const isInternalUpdate = useRef(false)

  // Estatísticas do documento
  const stats = getMarkdownStats(value)

  // Sincroniza o HTML do editor visual quando o valor muda externamente
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    if (visualEditorRef.current) {
      const generatedHtml = markdownToHtml(value)
      if (visualEditorRef.current.innerHTML !== generatedHtml) {
        visualEditorRef.current.innerHTML = generatedHtml
      }
    }
  }, [value, mode])

  // Trata digitação no modo Visual (WYSIWYG)
  const handleVisualInput = () => {
    if (!visualEditorRef.current) return
    isInternalUpdate.current = true
    const currentHtml = visualEditorRef.current.innerHTML
    const md = htmlToMarkdown(currentHtml)
    if (onChange) {
      onChange(md)
    }
  }

  // Executa formatação no modo Visual (WYSIWYG)
  const execVisualFormat = (command, val = null) => {
    if (!visualEditorRef.current) return
    visualEditorRef.current.focus()
    document.execCommand(command, false, val)
    handleVisualInput()
  }

  // Aplica marca-texto colorido na seleção do modo Visual
  const applyVisualHighlight = (colorId = selectedColor) => {
    if (!visualEditorRef.current) return
    visualEditorRef.current.focus()

    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || selection.isCollapsed) {
      // Se não houver seleção, insere um trecho modelo destacado
      document.execCommand('insertHTML', false, `<mark class="hl-${colorId}">destaque</mark>&nbsp;`)
      handleVisualInput()
      return
    }

    const range = selection.getRangeAt(0)
    const selectedContent = range.extractContents()
    const mark = document.createElement('mark')
    mark.className = `hl-${colorId}`
    mark.appendChild(selectedContent)
    range.insertNode(mark)

    // Ajusta o cursor logo após o destaque
    selection.removeAllRanges()
    const newRange = document.createRange()
    newRange.setStartAfter(mark)
    newRange.collapse(true)
    selection.addRange(newRange)

    handleVisualInput()
  }

  // Aplica formatação quando estiver em modo Source ou Split (Textarea)
  const applySourceFormatting = (prefix, suffix = '', defaultText = 'texto') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = textarea.value
    const selected = current.substring(start, end)
    const replacement = `${prefix}${selected || defaultText}${suffix}`

    const newText = current.substring(0, start) + replacement + current.substring(end)
    if (onChange) onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursor = start + prefix.length + (selected ? selected.length : defaultText.length)
      textarea.setSelectionRange(newCursor, newCursor)
    }, 20)
  }

  // Ações da Toolbar de acordo com o modo ativo
  const handleFormat = (type) => {
    if (mode === 'visual') {
      switch (type) {
        case 'bold':
          execVisualFormat('bold')
          break
        case 'italic':
          execVisualFormat('italic')
          break
        case 'strikethrough':
          execVisualFormat('strikeThrough')
          break
        case 'h1':
          execVisualFormat('formatBlock', '<h1>')
          break
        case 'h2':
          execVisualFormat('formatBlock', '<h2>')
          break
        case 'h3':
          execVisualFormat('formatBlock', '<h3>')
          break
        case 'p':
          execVisualFormat('formatBlock', '<p>')
          break
        case 'ul':
          execVisualFormat('insertUnorderedList')
          break
        case 'ol':
          execVisualFormat('insertOrderedList')
          break
        case 'todo':
          document.execCommand('insertHTML', false, '<p>☑ [ ] Nova Tarefa</p>')
          handleVisualInput()
          break
        case 'quote':
          execVisualFormat('formatBlock', '<blockquote>')
          break
        case 'hr':
          execVisualFormat('insertHorizontalRule')
          break
        case 'table':
          document.execCommand(
            'insertHTML',
            false,
            '<table><thead><tr><th>Etapa</th><th>Responsável</th><th>Prazo</th></tr></thead><tbody><tr><td>Ação 1</td><td>Dupla</td><td>Semana 1</td></tr></tbody></table><p></p>'
          )
          handleVisualInput()
          break
        case 'undo':
          execVisualFormat('undo')
          break
        case 'redo':
          execVisualFormat('redo')
          break
        case 'highlight':
          applyVisualHighlight(selectedColor)
          break
        default:
          break
      }
    } else {
      // Modo Source ou Split
      switch (type) {
        case 'bold':
          applySourceFormatting('**', '**', 'negrito')
          break
        case 'italic':
          applySourceFormatting('*', '*', 'itálico')
          break
        case 'strikethrough':
          applySourceFormatting('~~', '~~', 'riscado')
          break
        case 'h1':
          applySourceFormatting('\n# ', '\n', 'Título 1')
          break
        case 'h2':
          applySourceFormatting('\n## ', '\n', 'Título 2')
          break
        case 'h3':
          applySourceFormatting('\n### ', '\n', 'Título 3')
          break
        case 'ul':
          applySourceFormatting('\n- ', '', 'Item da lista')
          break
        case 'ol':
          applySourceFormatting('\n1. ', '', 'Primeiro passo')
          break
        case 'todo':
          applySourceFormatting('\n- [ ] ', '', 'Tarefa pendente')
          break
        case 'quote':
          applySourceFormatting('\n> ', '\n', 'Citação ou destaque da campanha')
          break
        case 'hr':
          applySourceFormatting('\n\n---\n\n', '')
          break
        case 'table':
          applySourceFormatting(
            '\n\n| Etapa | Responsável | Prazo |\n| --- | --- | --- |\n| Ação 1 | Dupla | Semana 1 |\n\n',
            ''
          )
          break
        case 'highlight':
          applySourceFormatting(
            selectedColor === 'yellow' ? '==' : `==${selectedColor}|`,
            '==',
            'texto destacado'
          )
          break
        default:
          break
      }
    }
  }

  // Atalhos de Teclado Globais no Editor
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        handleFormat('bold')
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        handleFormat('italic')
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        handleFormat('highlight')
      }
    }
  }

  return (
    <div className="w-full">
      {/* BARRA DE FERRAMENTAS SUPERIOR (ESTOJO DE SALA DE AULA) */}
      <div className="bg-[#FAF7EE] p-2.5 sm:p-3 rounded-2xl border-2 border-amber-300 shadow-sm mb-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          
          {/* GRUPO 1: SELETOR DE MODOS (ABAS TÁTEIS) */}
          <div className="flex items-center bg-amber-200/70 p-1 rounded-xl border border-amber-300 shadow-2xs">
            <button
              type="button"
              onClick={() => setMode('visual')}
              title="Editor Visual WYSIWYG (Caderno formatado)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'visual'
                  ? 'bg-white text-amber-950 shadow-xs border border-amber-400 font-extrabold'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-700" />
              <span>Visual (WYSIWYG)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('split')}
              title="Modo Dividido: Markdown + Live Preview simultâneo"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'split'
                  ? 'bg-white text-amber-950 shadow-xs border border-amber-400 font-extrabold'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <Columns2 className="w-4 h-4 text-amber-700" />
              <span className="hidden md:inline">Lado a Lado</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('source')}
              title="Código Markdown Puro"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'source'
                  ? 'bg-white text-amber-950 shadow-xs border border-amber-400 font-extrabold'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Markdown</span>
            </button>
          </div>

          {/* GRUPO 2: FORMATAÇÃO BÁSICA & TÍTULOS */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Títulos */}
            <button
              type="button"
              title="Título Principal (H1)"
              onClick={() => handleFormat('h1')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 font-heading font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Subtítulo (H2)"
              onClick={() => handleFormat('h2')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 font-heading font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Seção (H3)"
              onClick={() => handleFormat('h3')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 font-heading font-bold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-amber-300 mx-1 hidden sm:block" />

            {/* Negrito, Itálico, Riscado */}
            <button
              type="button"
              title="Negrito (Ctrl+B)"
              onClick={() => handleFormat('bold')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer shadow-2xs font-extrabold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Itálico (Ctrl+I)"
              onClick={() => handleFormat('italic')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Tachado / Riscado"
              onClick={() => handleFormat('strikethrough')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-amber-300 mx-1 hidden sm:block" />

            {/* ESTOJO DE CANETAS MARCA-TEXTO */}
            <div className="relative inline-flex items-center">
              <button
                type="button"
                title={`Aplicar Marca-Texto (${selectedColor.toUpperCase()}) - Ctrl+Shift+H`}
                onClick={() => handleFormat('highlight')}
                className="flex items-center gap-1 px-2 py-1 rounded-l-lg border border-r-0 border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: HIGHLIGHT_COLORS.find(c => c.id === selectedColor)?.bg,
                  color: HIGHLIGHT_COLORS.find(c => c.id === selectedColor)?.text
                }}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marca-Texto</span>
              </button>

              <button
                type="button"
                title="Escolher Cor do Marca-Texto"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="px-1.5 py-1 rounded-r-lg bg-white hover:bg-amber-100 border border-amber-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                ▼
              </button>

              {/* Menu Flutuante de Cores do Marca-Texto */}
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white p-2 rounded-xl shadow-lg border-2 border-amber-200 flex items-center gap-1.5 animate-fade-in">
                  {HIGHLIGHT_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => {
                        setSelectedColor(c.id)
                        setShowColorPicker(false)
                        handleFormat('highlight')
                      }}
                      className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                        selectedColor === c.id ? 'ring-2 ring-amber-500 scale-105' : ''
                      }`}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-amber-300 mx-1 hidden sm:block" />

            {/* Listas, Checkboxes e Blocos */}
            <button
              type="button"
              title="Lista com Marcadores"
              onClick={() => handleFormat('ul')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Lista Numerada"
              onClick={() => handleFormat('ol')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Lista de Tarefas / Checklist"
              onClick={() => handleFormat('todo')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Post-it / Bloco de Destaque"
              onClick={() => handleFormat('quote')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Inserir Tabela de Planejamento"
              onClick={() => handleFormat('table')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Linha Divisória"
              onClick={() => handleFormat('hr')}
              className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* GRUPO 3: AÇÕES E ESTRUTURA GUIA */}
          <div className="flex items-center gap-1.5">
            {onRestoreTemplate && (
              <button
                type="button"
                title="Restaurar o modelo padrão de sala de aula da missão"
                onClick={() => {
                  if (confirm('Deseja restaurar o roteiro padrão da atividade? O conteúdo atual será substituído pelo template guia.')) {
                    onRestoreTemplate()
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">Roteiro Guia</span>
              </button>
            )}

            {mode === 'visual' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Desfazer (Ctrl+Z)"
                  onClick={() => handleFormat('undo')}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Refazer (Ctrl+Y)"
                  onClick={() => handleFormat('redo')}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BARRA DE METADADOS (PALAVRAS, CARACTERES E LEITURA) */}
        <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs font-mono text-slate-500 pt-2 mt-2 border-t border-amber-200/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{stats.words} palavras</span>
            <span>•</span>
            <span>{stats.chars} caracteres</span>
            <span>•</span>
            <span className="text-amber-800 font-semibold">{stats.readingTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-800 font-bold">Modo: {mode.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* ÁREA DE EDIÇÃO DO CADERNO (LINED PAPER) */}
      <div className="relative">
        
        {/* MODO 1: VISUAL (WYSIWYG) */}
        {mode === 'visual' && (
          <div className="sm:ml-8">
            <div
              ref={visualEditorRef}
              contentEditable
              onInput={handleVisualInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="editor-visual-area markdown-content w-full min-h-[440px] text-base sm:text-lg text-slate-800 selection:bg-amber-200 tracking-wide focus:outline-hidden"
              style={{ minHeight: '440px' }}
            />
          </div>
        )}

        {/* MODO 2: SPLIT SCREEN (LADO A LADO) */}
        {mode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:ml-8">
            {/* Editor Markdown (Esquerda) */}
            <div className="bg-slate-50/70 p-3 rounded-2xl border-2 border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-heading flex items-center justify-between">
                <span>Código Markdown:</span>
                <span className="text-[10px] text-slate-400">Edição direta</span>
              </div>
              <textarea
                ref={textareaRef}
                value={value}
                onInput={(e) => onChange && onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={16}
                className="w-full bg-transparent resize-y font-mono text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-hidden p-0 border-none"
                style={{ minHeight: '420px' }}
              />
            </div>

            {/* Pré-visualização Renderizada (Direita) */}
            <div className="bg-white/80 p-3 rounded-2xl border-2 border-amber-200 overflow-y-auto" style={{ maxHeight: '520px' }}>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 font-heading flex items-center justify-between">
                <span>Resultado no Caderno:</span>
                <span className="text-[10px] text-amber-600">Tempo real</span>
              </div>
              <div
                className="markdown-content text-sm sm:text-base leading-normal"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
              />
            </div>
          </div>
        )}

        {/* MODO 3: CÓDIGO MARKDOWN PURO */}
        {mode === 'source' && (
          <div className="sm:ml-8">
            <textarea
              ref={textareaRef}
              rows={16}
              value={value}
              onInput={(e) => onChange && onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent resize-y font-mono text-sm sm:text-base text-slate-800 leading-[44px] focus:outline-hidden selection:bg-amber-200 border-none p-0 tracking-wide"
              style={{ minHeight: '440px' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

