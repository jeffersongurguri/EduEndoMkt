# 🎒 EndoMkt Edu — Plataforma de Endomarketing Educacional

Aplicação web interativa para a atividade prática de **Endomarketing Educacional**, desenvolvida com **Preact.js**, **Tailwind CSS** e **PocketBase**, com identidade visual esqueomórfica e traços *bob cute* inspirada em materiais de sala de aula (lousa verde de giz, caderno de espiral pautado, post-its com washi tape e botões 3D táteis).

---

## 🏗️ Arquitetura do Sistema

* **Frontend:** [Preact.js](https://preactjs.com/) (reatividade veloz e leve com hooks de estado) + [Tailwind CSS v4](https://tailwindcss.com/) com fontes Google (*Fredoka*, *Patrick Hand* e *Nunito*).
* **Backend/BaaS:** [PocketBase](https://pocketbase.io/) para persistência em tempo real das duplas, escolha das dores e submissões dos entregáveis.
* **Resiliência Offline:** Camada com *fallback* automático em `localStorage` para permitir o uso em sala de aula mesmo antes do PocketBase ser iniciado.
* **Decisões Arquiteturais (ADRs):** Registro detalhado das decisões de design, tipografia e infraestrutura em [`docs/decisoes-de-projeto.md`](./docs/decisoes-de-projeto.md).

---

## 🌐 Backend no PocketBase Cloud

A aplicação está configurada para conectar-se automaticamente à base online:
* **URL do PocketBase:** `https://8rn4k785l3pd7ed.pwz5.pocketbasecloud.com`
* **Painel de Administração:** `https://8rn4k785l3pd7ed.pwz5.pocketbasecloud.com/_/`

Caso deseje alternar para o desenvolvimento com a base local, consulte o guia detalhado em:
👉 [`docs/pocketbase-local.md`](./docs/pocketbase-local.md)

---

## 🗄️ Estrutura das Coleções no PocketBase

| Coleção | Campos Principais | Relacionamentos & Regras |
| --- | --- | --- |
| `duplas` | `id`, `nome_dupla`, `aluno1`, `aluno2`, `dor_escolhida` | `dor_escolhida` restrito a (`A`, `B`, `C`) |
| `submissoes` | `id`, `dupla`, `plano_texto`, `links_recursos`, `checklist_status`, `status` | Relacionado a `duplas.id` (`rascunho` ou `submetido`) |

O arquivo de esquema para importação direta no PocketBase está disponível em:
👉 [`pocketbase/pb_schema.json`](./pocketbase/pb_schema.json)

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Frontend

```bash
# Instalar dependências (caso ainda não tenha instalado)
npm install

# Iniciar servidor de desenvolvimento do Vite
npm run dev
```

Acesse no navegador: `http://localhost:5173/`

### 2. Iniciar o PocketBase (Opcional / Backend)

Você pode rodar o script PowerShell preparado para Windows:

```powershell
.\scripts\start-pocketbase.ps1
```

Esse script baixa automaticamente o binário do PocketBase para a pasta `pocketbase_bin/` e inicia o servidor em `http://127.0.0.1:8090`.

* **Painel Admin do PocketBase:** `http://127.0.0.1:8090/_/`
* Para importar as coleções: Acesse *Settings* -> *Import collections* no admin do PocketBase e cole o conteúdo de `pocketbase/pb_schema.json`.

---

## 🗺️ Fluxo das Telas

1. **` / ` — Landing Page (Lousa de Giz):**
   * Contextualização dos desafios de sala de aula e da perda de engajamento no ambiente escolar.
   * Apresentação das 3 etapas da missão.
   * Botão CTA tátil 3D "Iniciar Missão" que direciona para `/setup`.

2. **` /setup ` — Setup Estratégico:**
   * Formulário para Nome da Dupla e Nome dos dois integrantes.
   * 3 Cards grandes e interativos para seleção da dor central:
     * 🟡 **Dor A: Falta de Engajamento** (*Apatia, desinteresse e desânimo generalizado*).
     * 🟠 **Dor B: Absenteísmo Escolar** (*Faltas frequentes, atrasos e evasão silenciosa*).
     * 🟣 **Dor C: Postura Passiva** (*Espectadores silenciosos e receio de errar*).
   * A seleção de um card destaca-o com carimbo e desabilita os outros.

3. **` /workspace ` — Caderno da Missão:**
   * **Painel Esquerdo (Metodologia):** Checklist interativo das 3 ações exigidas de Endomarketing com barra de progresso.
   * **Painel Central (Caderno Pautado):** Área de redação com espiral esqueomórfico, linhas pautadas e ferramentas de marca-texto.
   * **Área de Entregáveis:** Inserção de links de protótipos (Canva, Slides, Figma, Drive, YouTube, áudios).
   * **Ações:** Botão "Salvar Rascunho" e "Submeter Missão Oficial" com comemoração em confetes e modal de conclusão.
