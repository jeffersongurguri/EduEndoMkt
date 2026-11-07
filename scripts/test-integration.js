// Script de Teste de Integração Real Frontend <-> PocketBase Cloud
import {
  PB_URL,
  checkPocketBaseHealth,
  createDupla,
  getDuplaById,
  saveSubmissao,
  getSubmissaoByDupla,
  getCurrentDuplaId
} from '../src/lib/pocketbase.js'

async function runIntegrationTest() {
  console.log('\n============================================================')
  console.log('🧪 TESTE DE INTEGRAÇÃO: FRONTEND <-> POCKETBASE CLOUD')
  console.log('============================================================')
  console.log(`📡 URL do Backend: ${PB_URL}\n`)

  let passedSteps = 0
  const totalSteps = 5

  // -------------------------------------------------------------
  // PASSO 1: HEALTH CHECK
  // -------------------------------------------------------------
  try {
    process.stdout.write('1. Testando conectividade com o PocketBase (Health Check)... ')
    const t0 = Date.now()
    const isOnline = await checkPocketBaseHealth()
    const elapsed = Date.now() - t0

    if (!isOnline) {
      throw new Error(`O servidor em ${PB_URL} não respondeu com status 200 OK.`)
    }
    console.log(`✅ ONLINE (${elapsed}ms)`)
    passedSteps++
  } catch (err) {
    console.log(`❌ FALHOU: ${err.message}`)
    process.exit(1)
  }

  // -------------------------------------------------------------
  // PASSO 2: CADASTRO DE DUPLA NO POCKETBASE
  // -------------------------------------------------------------
  let duplaCriada = null
  try {
    process.stdout.write('2. Enviando cadastro de Dupla para a coleção "duplas"... ')
    const payload = {
      nome_dupla: `Agência Alfa Integração [${Date.now().toString().slice(-4)}]`,
      aluno1: 'Mariana Fernandes',
      aluno2: 'Rafael Nogueira',
      dor_escolhida: 'A'
    }

    const t0 = Date.now()
    const res = await createDupla(payload)
    const elapsed = Date.now() - t0
    duplaCriada = res.record

    if (!duplaCriada || !duplaCriada.id) {
      throw new Error('Nenhum registro retornado pelo backend.')
    }

    if (res.source !== 'pocketbase') {
      throw new Error(`Esperado source='pocketbase', mas retornou '${res.source}'`)
    }

    console.log(`✅ SUCESSO (${elapsed}ms)`)
    console.log(`   └─ ID Gerado: ${duplaCriada.id}`)
    console.log(`   └─ Dupla: "${duplaCriada.nome_dupla}" | Alvo: Dor ${duplaCriada.dor_escolhida}`)
    passedSteps++
  } catch (err) {
    console.log(`❌ FALHOU: ${err.message}`)
    process.exit(1)
  }

  // -------------------------------------------------------------
  // PASSO 3: BUSCA E RECUPERAÇÃO DA DUPLA POR ID
  // -------------------------------------------------------------
  try {
    process.stdout.write('3. Buscando a dupla persistida diretamente pelo ID... ')
    const t0 = Date.now()
    const duplaRecuperada = await getDuplaById(duplaCriada.id)
    const elapsed = Date.now() - t0

    if (!duplaRecuperada) {
      throw new Error('Dupla não encontrada no PocketBase.')
    }

    if (duplaRecuperada.nome_dupla !== duplaCriada.nome_dupla) {
      throw new Error(`Inconsistência no nome retornado: ${duplaRecuperada.nome_dupla}`)
    }

    console.log(`✅ SUCESSO (${elapsed}ms)`)
    console.log(`   └─ Integrantes confirmados: ${duplaRecuperada.aluno1} & ${duplaRecuperada.aluno2}`)
    passedSteps++
  } catch (err) {
    console.log(`❌ FALHOU: ${err.message}`)
    process.exit(1)
  }

  // -------------------------------------------------------------
  // PASSO 4: SALVAMENTO DE RASCUNHO DA MISSÃO
  // -------------------------------------------------------------
  let submissaoCriada = null
  try {
    process.stdout.write('4. Gravando rascunho da missão na coleção "submissoes"... ')
    const t0 = Date.now()
    const res = await saveSubmissao({
      duplaId: duplaCriada.id,
      plano_texto: '### Diagnóstico de Endomarketing\nProposta de intervenção contra o desengajamento escolar.',
      links_recursos: [
        { id: 'lnk_1', titulo: 'Cartaz Teaser no Canva', url: 'https://canva.com/design/exemplo-integracao', tipo: 'canva' }
      ],
      checklist_status: { acao1: true, acao2: false, acao3: false },
      status: 'rascunho'
    })
    const elapsed = Date.now() - t0
    submissaoCriada = res.record

    if (!submissaoCriada || !submissaoCriada.id) {
      throw new Error('Falha ao persistir submissão.')
    }

    console.log(`✅ SUCESSO (${elapsed}ms)`)
    console.log(`   └─ ID da Submissão: ${submissaoCriada.id}`)
    console.log(`   └─ Status: "${submissaoCriada.status}" | Vínculo Dupla: ${submissaoCriada.dupla}`)
    passedSteps++
  } catch (err) {
    console.log(`❌ FALHOU: ${err.message}`)
    process.exit(1)
  }

  // -------------------------------------------------------------
  // PASSO 5: ATUALIZAÇÃO PARA SUBMISSÃO FINAL E VINCULAÇÃO
  // -------------------------------------------------------------
  try {
    process.stdout.write('5. Atualizando a missão para "submetido" com todos os entregáveis... ')
    const t0 = Date.now()
    const resFinal = await saveSubmissao({
      id: submissaoCriada.id,
      duplaId: duplaCriada.id,
      plano_texto: '### Plano Estratégico Completo\n1. Teaser\n2. Dinâmica Pedagógica\n3. Pertencimento.',
      links_recursos: [
        { id: 'lnk_1', titulo: 'Cartaz Canva', url: 'https://canva.com/design/exemplo-integracao', tipo: 'canva' },
        { id: 'lnk_2', titulo: 'Apresentação Slides', url: 'https://docs.google.com/presentation/d/exemplo', tipo: 'slides' }
      ],
      checklist_status: { acao1: true, acao2: true, acao3: true },
      status: 'submetido'
    })

    const submissaoFinal = await getSubmissaoByDupla(duplaCriada.id)
    const elapsed = Date.now() - t0

    if (!submissaoFinal || submissaoFinal.status !== 'submetido') {
      throw new Error(`Status esperado 'submetido', obtido '${submissaoFinal?.status}'`)
    }

    if (!submissaoFinal.links_recursos || submissaoFinal.links_recursos.length !== 2) {
      throw new Error('Quantidade de links divergente da esperada.')
    }

    console.log(`✅ SUCESSO (${elapsed}ms)`)
    console.log(`   └─ Status Final: "${submissaoFinal.status}" (Ações 3/3 validadas)`)
    console.log(`   └─ Entregáveis: ${submissaoFinal.links_recursos.length} arquivo(s) anexado(s)`)
    passedSteps++
  } catch (err) {
    console.log(`❌ FALHOU: ${err.message}`)
    process.exit(1)
  }

  console.log('\n============================================================')
  console.log(`🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO COM 100% DE SUCESSO!`)
  console.log(`   Passos aprovados: ${passedSteps}/${totalSteps}`)
  console.log(`   O Frontend está perfeitamente integrado ao PocketBase Cloud!`)
  console.log('============================================================\n')
}

runIntegrationTest().catch(err => {
  console.error('\nErro fatal no teste de integração:', err)
  process.exit(1)
})
