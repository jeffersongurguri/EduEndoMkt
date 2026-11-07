import { describe, it, expect } from 'vitest'
import { markdownToHtml, htmlToMarkdown, getMarkdownStats } from '../lib/markdown.js'

describe('Suíte de Testes: Conversor & Editor Markdown WYSIWYG', () => {
  it('deve converter Markdown com títulos e destaques para HTML formatado', () => {
    const md = '### 1. Diagnóstico\nTexto com **negrito**, *itálico* e ==marca-texto=='
    const html = markdownToHtml(md)

    expect(html).toContain('<h3>1. Diagnóstico</h3>')
    expect(html).toContain('<strong>negrito</strong>')
    expect(html).toContain('<em>itálico</em>')
    expect(html).toContain('<mark class="hl-yellow">marca-texto</mark>')
  })

  it('deve suportar múltiplas cores de canetas marca-texto no Markdown', () => {
    const md = '==yellow|Amarelo== ==green|Verde== ==pink|Rosa== ==blue|Azul=='
    const html = markdownToHtml(md)

    expect(html).toContain('<mark class="hl-yellow">Amarelo</mark>')
    expect(html).toContain('<mark class="hl-green">Verde</mark>')
    expect(html).toContain('<mark class="hl-pink">Rosa</mark>')
    expect(html).toContain('<mark class="hl-blue">Azul</mark>')
  })

  it('deve normalizar marcadores especiais de sala de aula (•) para listas HTML', () => {
    const md = '• Nome da Ação\n• Público-alvo direto\n• Objetivo principal'
    const html = markdownToHtml(md)

    expect(html).toContain('<ul>')
    expect(html).toContain('<li>Nome da Ação</li>')
    expect(html).toContain('<li>Público-alvo direto</li>')
    expect(html).toContain('<li>Objetivo principal</li>')
  })

  it('deve converter HTML de volta para Markdown limpo (Turndown bidirecional)', () => {
    const html = '<h2>Ação 1</h2><p>Trecho com <mark class="hl-pink">destaque rosa</mark> e <strong>importante</strong>.</p>'
    const md = htmlToMarkdown(html)

    expect(md).toContain('## Ação 1')
    expect(md).toContain('==pink|destaque rosa==')
    expect(md).toContain('**importante**')
  })

  it('deve calcular estatísticas precisas de palavras, caracteres e leitura estimada', () => {
    const text = 'Esta é uma proposta completa de Endomarketing escolar com objetivos claros e ações definidas.'
    const stats = getMarkdownStats(text)

    expect(stats.words).toBe(14)
    expect(stats.chars).toBe(text.length)
    expect(stats.readingTime).toBe('1 min de leitura')
  })
})

