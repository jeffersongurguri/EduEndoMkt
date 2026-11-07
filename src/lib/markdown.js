import { marked } from 'marked'
import TurndownService from 'turndown'

// Configurações padrão do Marked
marked.setOptions({
  breaks: true,
  gfm: true
})

// Inicializa o conversor Turndown para Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
})

// Regra para marca-texto colorido <mark class="hl-cor">
turndownService.addRule('highlightMark', {
  filter: ['mark'],
  replacement: (content, node) => {
    const className = node.getAttribute('class') || ''
    if (className.includes('hl-green')) return `==green|${content}==`
    if (className.includes('hl-pink')) return `==pink|${content}==`
    if (className.includes('hl-blue')) return `==blue|${content}==`
    return `==${content}==`
  }
})

// Regra para spans com background de marca-texto (caso inseridos pelo browser)
turndownService.addRule('spanHighlight', {
  filter: (node) => {
    return node.nodeName === 'SPAN' && (
      node.classList.contains('hl-yellow') ||
      node.classList.contains('hl-green') ||
      node.classList.contains('hl-pink') ||
      node.classList.contains('hl-blue')
    )
  },
  replacement: (content, node) => {
    const className = node.getAttribute('class') || ''
    if (className.includes('hl-green')) return `==green|${content}==`
    if (className.includes('hl-pink')) return `==pink|${content}==`
    if (className.includes('hl-blue')) return `==blue|${content}==`
    return `==${content}==`
  }
})

/**
 * Converte texto Markdown para HTML com suporte a marca-texto e checklists
 */
export function markdownToHtml(markdown = '') {
  if (!markdown) return ''

  // Pré-processa tags de marca-texto: ==cor|texto== ou ==texto==
  const withHighlights = markdown.replace(
    /==(?:(yellow|green|pink|blue)\|)?([^=\n]+)==/g,
    (_, color, text) => {
      const c = color || 'yellow'
      return `<mark class="hl-${c}">${text}</mark>`
    }
  )

  // Pré-processa tópicos com marcadores especiais (bullet points '•') para listas padrão
  const normalizedBullets = withHighlights.replace(/^•\s+/gm, '- ')

  return marked.parse(normalizedBullets)
}

/**
 * Converte HTML gerado pelo editor WYSIWYG de volta para Markdown limpo
 */
export function htmlToMarkdown(html = '') {
  if (!html) return ''
  return turndownService.turndown(html)
}

/**
 * Estatísticas do texto (palavras, caracteres e tempo de leitura)
 */
export function getMarkdownStats(text = '') {
  const clean = text.trim()
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0
  const chars = clean.length
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 180))

  return {
    words,
    chars,
    readingTime: `${readingTimeMinutes} min de leitura`
  }
}

