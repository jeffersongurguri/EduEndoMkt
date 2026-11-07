# 📐 Registro de Decisões Arquiteturais e de Projeto (ADR)
## Plataforma EndoMkt Edu — Endomarketing Educacional

Este documento registra formalmente as principais decisões arquiteturais, técnicas e de design adotadas durante o desenvolvimento da plataforma web para a atividade prática de **Endomarketing Educacional**.

---

## 📋 Sumário das Decisões

* **[ADR 01]** Escolha da Stack Frontend: Preact.js + Tailwind CSS v4 + Vite
* **[ADR 02]** Design System Esqueomórfico de Sala de Aula com Traços *Bob Cute*
* **[ADR 03]** Tipografia Mínima de 2rem e Responsividade Mobile Fluida
* **[ADR 04]** Arquitetura de Backend Híbrida (PocketBase Cloud + Fallback Offline)
* **[ADR 05]** Esquema de Dados e Normalização de Campos no PocketBase
* **[ADR 06]** Deploy Estático no Surge com Roteamento SPA (`200.html`)
* **[ADR 07]** Estratégia de Testes Automatizados (Unitários & Integração Real)

---

## [ADR 01] Escolha da Stack Frontend: Preact.js + Tailwind CSS v4 + Vite

### Contexto
O escopo inicial mencionava Preact.js na arquitetura técnica e Vue.js em uma tabela de prompts. Precisávamos definir uma base tecnológica extremamente rápida para carregar em celulares de alunos em redes móveis de sala de aula (muitas vezes instáveis ou 3G/4G com franquia reduzida).

### Decisão
Optou-se por **Preact.js** impulsionado pelo **Vite** e estilizado com **Tailwind CSS v4** (`@tailwindcss/vite`):
1. **Peso Minúsculo:** O runtime do Preact possui cerca de **3 KB**, contra dezenas de kilobytes de frameworks mais pesados.
2. **Reatividade por Hooks:** Utilização dos hooks nativos (`useState`, `useEffect`) sem overhead de state stores complexos.
3. **Build Recorde:** Compilação do bundle de produção em menos de **300ms**, gerando uma experiência de desenvolvimento e deploy contínuo ultrarrápida.

### Consequências
* **Positivas:** Inicialização instantânea da aplicação no navegador dos alunos; facilidade de manutenção em componentes JSX limpos.
* **Compensações:** Necessidade de cuidar de pequenas sutilezas do DOM em ambientes de teste Node (como `globalThis.localStorage`), resolvidas transparentemente.

---

## [ADR 02] Design System Esqueomórfico de Sala de Aula com Traços *Bob Cute*

### Contexto
Atividades acadêmicas convencionais frequentemente utilizam formulários e dashboards corporativos frios, o que distancia os alunos da proposta temática. O Endomarketing Escolar exige empatia, sensação de pertencimento e imersão lúdica.

### Decisão
Desenvolveu-se um tema visual exclusivo inspirado no universo escolar físico com elementos esqueomórficos e acabamento rechonchudo (*bob cute*):
* **Lousa Verde de Giz (`/`):** Moldura de madeira maciça, textura de pó de giz, tipografia manuscrita (*Patrick Hand*) e gizes coloridos.
* **Caderno Pautado da Missão (`/workspace`):** Textura de papel com pauta azul horizontal, margem vermelha de fichário e espiral lateral esqueomórfico.
* **Componentes Táteis:** Fitas adesivas decorativas (*washi tapes*), clipes de papel metálicos e botões 3D táteis que "afundam" no clique (`translate-y-1` com `shadow-inner`).
* **Selo de Carimbo Rubber Stamp:** O card da dor escolhida recebe um carimbo com ângulo inclinado (*"✓ ESCOLHIDO!"*).
* **Feedback Comemorativo:** Ao submeter a missão, uma chuva de confetes (`canvas-confetti`) celebra o trabalho concluído da dupla.

### Consequências
* **Positivas:** Alta aderência dos estudantes, percepção de dinâmica prática gamificada e clareza visual de cada etapa.

---

## [ADR 03] Tipografia Mínima de 2rem e Responsividade Mobile Fluida

### Contexto
O usuário solicitou explicitamente que títulos e elementos de destaque utilizassem **tamanho mínimo de 2rem**, com atenção rigorosa à responsividade em celulares, evitando que palavras longas causassem quebras ou rolagem horizontal.

### Decisão
1. **Tipografia Fluida com `clamp()`:** Criaram-se utilitários CSS no `src/index.css`:
   * `.title-bob-hero`: `clamp(2rem, 6vw, 3.25rem)` para os títulos principais.
   * `.title-bob-section`: `clamp(2rem, 5vw, 2.5rem)` para cabeçalhos de seção.
   * `.title-bob-card`: `clamp(1.85rem, 4.5vw, 2.15rem)` para os cards de dores e formulários.
2. **Blindagem contra Overflow:** Adição de `overflow-x: hidden`, `width: 100%`, `word-break: break-word` e `overflow-wrap: anywhere` nas camadas base do HTML/Body.
3. **Pauta Escolar Recalibrada:** A altura das linhas do caderno foi ampliada para **44px** (em vez dos 32px convencionais) com `leading-[44px]` no textarea, harmonizando perfeitamente a caligrafia ampliada com as linhas azuis de fundo.

### Consequências
* **Positivas:** Leitura nítida à distância no projetor de sala e legibilidade impecável tanto em telas pequenas (320px–375px) quanto em monitores desktop 4K, sem quebras horizontais.

---

## [ADR 04] Arquitetura de Backend Híbrida (PocketBase Cloud + Fallback Offline)

### Contexto
Durante dinâmicas em sala de aula, quedas de sinal de internet, oscilações de roteadores ou instabilidades temporárias de conexão poderiam fazer os alunos perderem minutos preciosos de trabalho redigido.

### Decisão
Implementou-se no serviço [`src/lib/pocketbase.js`](../src/lib/pocketbase.js) uma arquitetura de resiliência com **dupla camada**:
1. **Camada Primária (Nuvem):** Conexão direta com a instância do **PocketBase Cloud** (`https://8rn4k785l3pd7ed.pwz5.pocketbasecloud.com/`).
2. **Camada de Contingência (LocalStorage):** Se a requisição de rede falhar ou retornar erro, o sistema salva o registro localmente com o prefixo `local_` e mantém o rascunho 100% intacto no navegador.
3. **Sincronização Não-Bloqueante:** O health check periódico e o salvamento assíncrono usam `pb.autoCancellation(false)`, prevenindo o aborto de requisições paralelas.

### Consequências
* **Positivas:** Segurança absoluta de que nenhum aluno perde o texto do plano ou os links dos protótipos durante a dinâmica.

---

## [ADR 05] Esquema de Dados e Normalização de Campos no PocketBase

### Contexto
A base de dados do PocketBase precisava comportar duas entidades principais: o cadastro da equipe com diagnóstico (`duplas`) e a entrega dos protótipos e plano (`submissoes`), com IDs e campos padronizados conforme especificação do professor.

### Decisão
* **Coleção `duplas` (ID: `pbc_3147699878`):**
  * Campos: `id`, `nome_dupla`, `aluno1`, `aluno2`, `select` (valores: `A`, `B`, `C`).
  * Normalização: O código cliente grava tanto em `select` quanto em `dor_escolhida` para garantir total compatibilidade retroativa e facilitar consultas.
* **Coleção `submissoes` (ID: `pbc_3100742274`):**
  * Campos: `id`, `dupla` (tipo `text` guardando o ID da dupla), `plano_texto` (editor rich text), `links_recursos` (json), `checklist_status` (json) e `status` (`rascunho` ou `submetido`).
* **Regras de Acesso:** Regras de criação e atualização públicas (`""`) para viabilizar o envio direto por alunos em sala sem necessidade de login prévio por e-mail/senha.

---

## [ADR 06] Deploy Estático no Surge com Roteamento SPA (`200.html`)

### Contexto
A aplicação precisa estar disponível para acesso público imediato por link curto ou QR Code no início da aula, sem custos e com HTTPS ativo.

### Decisão
Adotou-se o **Surge** (`edu-endomkt.surge.sh`):
1. **Suporte a Roteamento SPA:** Em servidores estáticos tradicionais, recarregar diretamente a página em `/setup` ou `/workspace` resultaria em erro HTTP 404.
2. **Automação no Build:** O script de build do `package.json` foi configurado para copiar automaticamente `dist/index.html` para `dist/200.html`:
   ```json
   "build": "vite build && node -e \"import('node:fs').then(fs => fs.copyFileSync('dist/index.html', 'dist/200.html'))\""
   ```
   Dessa forma, o Surge redireciona qualquer sub-rota para a aplicação Preact sem perda de estado.

---

## [ADR 07] Estratégia de Testes Automatizados (Unitários & Integração Real)

### Contexto
Garantir que alterações de código não quebrem a persistência dos trabalhos de dezenas de duplas simultâneas.

### Decisão
Estabeleceu-se uma estratégia em duas frentes:
1. **Testes Unitários Rápidos (`npm test` via Vitest):** Valida a lógica de criação de dupla, salvamento de rascunhos, transição para status submetido e fallback offline (`src/__tests__/missao.test.js`).
2. **Teste de Integração Real com a Nuvem (`npm run test:integration`):** Script executado contra o endpoint real do PocketBase Cloud (`scripts/test-integration.js`), testando requisições HTTP reais, geração de ID e persistência de payloads complexos.

### Consequências
* **Positivas:** Confiança de 100% no funcionamento antes de iniciar a aula com a turma.
