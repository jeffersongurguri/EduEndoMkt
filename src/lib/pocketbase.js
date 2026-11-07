import PocketBase from 'pocketbase'

// URL do PocketBase (apontando por padrão para o PocketBase Cloud ou variável de ambiente)
export const PB_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POCKETBASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_POCKETBASE_URL) ||
  'https://8rn4k785l3pd7ed.pwz5.pocketbasecloud.com'

export const pb = new PocketBase(PB_URL)
pb.autoCancellation(false)

// Chaves do LocalStorage para contingência offline
const STORAGE_DUPLAS_KEY = 'eduendomkt_duplas'
const STORAGE_SUBMISSOES_KEY = 'eduendomkt_submissoes'
const STORAGE_CURRENT_DUPLA_KEY = 'eduendomkt_current_dupla_id'

// Armazenamento em memória para ambientes sem window.localStorage (ex: Node/testes)
const memoryStorage = new Map()

function getStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }
  return {
    getItem: (key) => memoryStorage.get(key) || null,
    setItem: (key, val) => memoryStorage.set(key, String(val)),
    removeItem: (key) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
  }
}

// Verifica se o PocketBase está online
export async function checkPocketBaseHealth() {
  try {
    const res = await pb.health.check()
    return res.code === 200
  } catch (err) {
    return false
  }
}

// Helpers de Armazenamento
function getLocalDuplas() {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_DUPLAS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalDuplas(duplas) {
  getStorage().setItem(STORAGE_DUPLAS_KEY, JSON.stringify(duplas))
}

function getLocalSubmissoes() {
  try {
    return JSON.parse(getStorage().getItem(STORAGE_SUBMISSOES_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalSubmissoes(submissoes) {
  getStorage().setItem(STORAGE_SUBMISSOES_KEY, JSON.stringify(submissoes))
}

// ==========================================
// OPERAÇÕES: DUPLAS
// ==========================================

export async function createDupla({ nome_dupla, aluno1, aluno2, dor_escolhida }) {
  const chosenPain = dor_escolhida || 'A'
  const payload = {
    nome_dupla: nome_dupla.trim(),
    aluno1: aluno1.trim(),
    aluno2: aluno2.trim(),
    select: chosenPain,        // Campo do novo esquema PocketBase
    dor_escolhida: chosenPain, // Compatibilidade com código e schemas legados
    created: new Date().toISOString()
  }

  let record = null
  let source = 'pocketbase'

  try {
    // Tenta salvar no PocketBase
    const pbRecord = await pb.collection('duplas').create(payload)
    record = {
      ...payload,
      ...pbRecord,
      id: pbRecord.id,
      dor_escolhida: pbRecord.select || pbRecord.dor_escolhida || chosenPain
    }
  } catch (err) {
    console.warn('PocketBase não disponível ou erro no cadastro. Salvando localmente:', err.message)
    source = 'local'
    record = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...payload,
      dor_escolhida: chosenPain,
      _is_local: true
    }
  }

  // Sempre sincroniza com o cache local da sessão
  const localList = getLocalDuplas()
  localList.unshift(record)
  saveLocalDuplas(localList)
  setCurrentDuplaId(record.id)

  return { record, source }
}

export async function getDuplaById(id) {
  if (!id) return null

  const localList = getLocalDuplas()
  const localMatch = localList.find(d => d.id === id) || null

  // Se for ID local, busca direto no cache local
  if (id.startsWith('local_')) {
    if (localMatch) {
      localMatch.dor_escolhida = localMatch.select || localMatch.dor_escolhida || 'A'
    }
    return localMatch
  }

  try {
    const remote = await pb.collection('duplas').getOne(id)
    const merged = {
      ...(localMatch || {}),
      ...remote
    }
    merged.dor_escolhida = remote.select || remote.dor_escolhida || merged.dor_escolhida || 'A'
    return merged
  } catch (err) {
    // Fallback para cache local se offline ou erro
    if (localMatch) {
      localMatch.dor_escolhida = localMatch.select || localMatch.dor_escolhida || 'A'
    }
    return localMatch
  }
}

export function getCurrentDuplaId() {
  return getStorage().getItem(STORAGE_CURRENT_DUPLA_KEY) || null
}

export function setCurrentDuplaId(id) {
  if (id) {
    getStorage().setItem(STORAGE_CURRENT_DUPLA_KEY, id)
  } else {
    getStorage().removeItem(STORAGE_CURRENT_DUPLA_KEY)
  }
}

// ==========================================
// OPERAÇÕES: SUBMISSÕES
// ==========================================

export async function getSubmissaoByDupla(duplaId) {
  if (!duplaId) return null

  const localSubs = getLocalSubmissoes()
  const localMatch = localSubs.find(s => s.dupla === duplaId || s.dupla_id === duplaId) || null

  try {
    if (localMatch && localMatch.id && !localMatch.id.startsWith('local_')) {
      const remote = await pb.collection('submissoes').getOne(localMatch.id)
      return {
        ...localMatch,
        ...remote,
        id: remote.id
      }
    }
  } catch (err) {
    // Mantém fallback seguro no cache local
  }

  return localMatch
}

export async function saveSubmissao({ id, duplaId, plano_texto, links_recursos, checklist_status, status = 'rascunho' }) {
  const payload = {
    dupla: duplaId,
    plano_texto: plano_texto || '',
    links_recursos: links_recursos || [],
    checklist_status: checklist_status || {},
    status: status, // 'rascunho' ou 'submetido'
    updated: new Date().toISOString()
  }

  let record = null
  let source = 'pocketbase'

  try {
    if (id && !id.startsWith('local_')) {
      record = await pb.collection('submissoes').update(id, payload)
    } else if (!duplaId.startsWith('local_')) {
      // Verifica se já temos o ID da submissão gravado para esta dupla
      const localSubs = getLocalSubmissoes()
      const existingLocal = localSubs.find(s => (s.dupla === duplaId || s.dupla_id === duplaId) && s.id && !s.id.startsWith('local_'))

      if (existingLocal && existingLocal.id) {
        record = await pb.collection('submissoes').update(existingLocal.id, payload)
      } else {
        // Cria novo registro diretamente no PocketBase
        record = await pb.collection('submissoes').create(payload)
      }
    } else {
      throw new Error('Dupla em modo local')
    }

    record = {
      ...payload,
      ...record,
      id: record.id
    }
  } catch (err) {
    source = 'local'
    record = {
      id: id || ('local_sub_' + Date.now()),
      ...payload,
      _is_local: true
    }
  }

  // Atualiza cache local
  const localSubs = getLocalSubmissoes()
  const idx = localSubs.findIndex(s => s.dupla === duplaId || s.id === record.id)
  if (idx >= 0) {
    localSubs[idx] = { ...localSubs[idx], ...record }
  } else {
    localSubs.unshift(record)
  }
  saveLocalSubmissoes(localSubs)

  return { record, source }
}
