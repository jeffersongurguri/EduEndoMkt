import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createDupla,
  getCurrentDuplaId,
  setCurrentDuplaId,
  getDuplaById,
  saveSubmissao,
  getSubmissaoByDupla,
  pb
} from '../lib/pocketbase.js'

describe('Suíte de Testes Unitários: Salvamento e Ciclo de Vida da Missão', { timeout: 15000 }, () => {
  beforeEach(() => {
    // Limpa a dupla ativa da sessão antes de cada teste
    setCurrentDuplaId(null)
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------
  // 1. TESTES DE CRIAÇÃO DA DUPLA
  // -------------------------------------------------------------
  it('deve cadastrar uma nova dupla e definir como sessão ativa', async () => {
    const payloadDupla = {
      nome_dupla: 'Agência Criativa Edu',
      aluno1: 'Mariana Silva',
      aluno2: 'Lucas Oliveira',
      dor_escolhida: 'A'
    }

    const { record, source } = await createDupla(payloadDupla)

    expect(record).toBeDefined()
    expect(record.id).toBeDefined()
    expect(record.nome_dupla).toBe('Agência Criativa Edu')
    expect(record.aluno1).toBe('Mariana Silva')
    expect(record.aluno2).toBe('Lucas Oliveira')
    expect(record.dor_escolhida).toBe('A')

    // Deve atualizar a sessão ativa
    const currentId = getCurrentDuplaId()
    expect(currentId).toBe(record.id)

    // Deve ser recuperável por ID
    const duplaRecuperada = await getDuplaById(record.id)
    expect(duplaRecuperada).not.toBeNull()
    expect(duplaRecuperada.nome_dupla).toBe('Agência Criativa Edu')
  })

  // -------------------------------------------------------------
  // 2. TESTES DE SALVAMENTO DE RASCUNHO DA MISSÃO
  // -------------------------------------------------------------
  it('deve salvar o rascunho de uma missão com plano textual, checklist e links de suporte', async () => {
    // 1. Cria a dupla
    const { record: dupla } = await createDupla({
      nome_dupla: 'Dupla Engaja+',
      aluno1: 'Carlos Mendes',
      aluno2: 'Beatriz Costa',
      dor_escolhida: 'B'
    })

    // 2. Prepara dados da missão
    const planoTexto = '### Plano de Ação\n1. Campanha Teaser no Mural\n2. Dinâmica de Gamificação em Aula'
    const checklistStatus = { acao1: true, acao2: true, acao3: false }
    const linksRecursos = [
      { id: '1', titulo: 'Cartaz Canva Teaser', url: 'https://canva.com/design/exemplo', tipo: 'canva' },
      { id: '2', titulo: 'Pitch da Apresentação', url: 'https://docs.google.com/presentation/d/exemplo', tipo: 'slides' }
    ]

    // 3. Salva como rascunho
    const { record: submissao, source } = await saveSubmissao({
      duplaId: dupla.id,
      plano_texto: planoTexto,
      links_recursos: linksRecursos,
      checklist_status: checklistStatus,
      status: 'rascunho'
    })

    expect(submissao).toBeDefined()
    expect(submissao.id).toBeDefined()
    expect(submissao.dupla).toBe(dupla.id)
    expect(submissao.plano_texto).toBe(planoTexto)
    expect(submissao.status).toBe('rascunho')
    expect(submissao.checklist_status.acao1).toBe(true)
    expect(submissao.checklist_status.acao3).toBe(false)
    expect(submissao.links_recursos).toHaveLength(2)

    // 4. Verifica recuperação da submissão vinculada à dupla
    const submissaoRecuperada = await getSubmissaoByDupla(dupla.id)
    expect(submissaoRecuperada).not.toBeNull()
    expect(submissaoRecuperada.id).toBe(submissao.id)
    expect(submissaoRecuperada.plano_texto).toContain('Campanha Teaser')
  })

  // -------------------------------------------------------------
  // 3. TESTES DE SUBMISSÃO OFICIAL DA MISSÃO
  // -------------------------------------------------------------
  it('deve concluir a missão com status "submetido" e persistir todos os entregáveis', async () => {
    const { record: dupla } = await createDupla({
      nome_dupla: 'Esquadrão Protagonista',
      aluno1: 'Fernanda Lima',
      aluno2: 'Gabriel Souza',
      dor_escolhida: 'C'
    })

    const linksCompletos = [
      { id: '101', titulo: 'Vídeo da Campanha', url: 'https://youtube.com/watch?v=123', tipo: 'video' },
      { id: '102', titulo: 'Podcast Vinheta', url: 'https://spotify.com/episode/abc', tipo: 'audio' },
      { id: '103', titulo: 'Mural no Figma', url: 'https://figma.com/file/xyz', tipo: 'figma' }
    ]

    const { record: submissaoFinal } = await saveSubmissao({
      duplaId: dupla.id,
      plano_texto: 'Plano 100% finalizado com as 3 ações validadas.',
      links_recursos: linksCompletos,
      checklist_status: { acao1: true, acao2: true, acao3: true },
      status: 'submetido'
    })

    expect(submissaoFinal.status).toBe('submetido')
    expect(submissaoFinal.links_recursos).toHaveLength(3)
    expect(submissaoFinal.checklist_status.acao1).toBe(true)
    expect(submissaoFinal.checklist_status.acao2).toBe(true)
    expect(submissaoFinal.checklist_status.acao3).toBe(true)
  })

  // -------------------------------------------------------------
  // 4. TESTES DE ATUALIZAÇÃO INCREMENTAL DO PLANO
  // -------------------------------------------------------------
  it('deve atualizar o plano existente da dupla sem duplicar submissões', async () => {
    const { record: dupla } = await createDupla({
      nome_dupla: 'Dupla Iterativa',
      aluno1: 'João Silva',
      aluno2: 'Ana Pereira',
      dor_escolhida: 'A'
    })

    // Primeiro salvamento: rascunho inicial
    const { record: subV1 } = await saveSubmissao({
      duplaId: dupla.id,
      plano_texto: 'Versão Inicial do Plano',
      links_recursos: [],
      checklist_status: { acao1: true, acao2: false, acao3: false },
      status: 'rascunho'
    })

    // Segundo salvamento: adicionando mais texto e links
    const { record: subV2 } = await saveSubmissao({
      id: subV1.id,
      duplaId: dupla.id,
      plano_texto: 'Versão 2 do Plano com melhorias detalhadas',
      links_recursos: [{ id: '99', titulo: 'Slide Pitch', url: 'https://slides.com', tipo: 'slides' }],
      checklist_status: { acao1: true, acao2: true, acao3: false },
      status: 'rascunho'
    })

    expect(subV2.id).toBe(subV1.id)
    expect(subV2.plano_texto).toBe('Versão 2 do Plano com melhorias detalhadas')
    expect(subV2.links_recursos).toHaveLength(1)

    // Busca novamente para garantir que apenas 1 submissão existe
    const subCarregada = await getSubmissaoByDupla(dupla.id)
    expect(subCarregada.id).toBe(subV1.id)
    expect(subCarregada.plano_texto).toBe('Versão 2 do Plano com melhorias detalhadas')
  })

  // -------------------------------------------------------------
  // 5. TESTES DE CONTINGÊNCIA / FALLBACK RESILIENTE
  // -------------------------------------------------------------
  it('deve ativar contingência local com elegância se o PocketBase retornar erro de rede', async () => {
    // Simula falha na coleção do PocketBase
    vi.spyOn(pb.collection('duplas'), 'create').mockRejectedValueOnce(new Error('Network error / 503 Service Unavailable'))

    const { record: duplaLocal, source } = await createDupla({
      nome_dupla: 'Dupla Offline Resiliente',
      aluno1: 'Aluno Local 1',
      aluno2: 'Aluno Local 2',
      dor_escolhida: 'B'
    })

    expect(source).toBe('local')
    expect(duplaLocal._is_local).toBe(true)
    expect(duplaLocal.id).toMatch(/^local_/)

    // Salva a submissão para essa dupla local
    const { record: submissaoLocal, source: subSource } = await saveSubmissao({
      duplaId: duplaLocal.id,
      plano_texto: 'Plano salvo com sucesso mesmo sem conexão de rede.',
      links_recursos: [],
      checklist_status: { acao1: true, acao2: true, acao3: true },
      status: 'submetido'
    })

    expect(subSource).toBe('local')
    expect(submissaoLocal._is_local).toBe(true)

    // Recupera do cache
    const recuperada = await getSubmissaoByDupla(duplaLocal.id)
    expect(recuperada).not.toBeNull()
    expect(recuperada.plano_texto).toContain('mesmo sem conexão de rede')
  })
})
