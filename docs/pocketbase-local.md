# 🎒 Instruções de Acesso: PocketBase Local

Este documento contém todas as instruções para iniciar, acessar e gerenciar a base de dados local do **PocketBase** para a aplicação **EndoMkt Edu**.

---

## 🔑 Credenciais de Acesso ao Painel Admin

* **URL do Painel Administrativo:** [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)
* **E-mail de Login:** `admin@eduendomkt.local`
* **Senha:** `AdminEduMkt2026!`

> [!NOTE]
> Essa conta de administrador possui privilégios totais para criar, editar, exportar e excluir registros das coleções.

---

## 🚀 Como Iniciar o Servidor Local

Você pode iniciar o PocketBase local através de qualquer uma das opções abaixo:

### Opção 1: Via comando NPM (Recomendado)
No terminal da raiz do projeto:
```bash
npm run start:pb
```

### Opção 2: Via PowerShell
```powershell
.\scripts\start-pocketbase.ps1
```

O servidor iniciará automaticamente na porta `8090`.

---

## 🗄️ Coleções Pré-configuradas na Base

A base SQLite local já foi inicializada com as migrações automáticas contendo as seguintes coleções:

### 1. Coleção `duplas` (ID: `pbc_3147699878`)
Armazena o registro de cada equipe de alunos e o diagnóstico inicial da campanha:

| Campo | Tipo | Descrição / Regra |
| :--- | :--- | :--- |
| `id` | `TEXT` (15 chars) | Identificador único primário gerado pelo PocketBase |
| `nome_dupla` | `TEXT` | Nome da dupla ou agência fictícia |
| `aluno1` | `TEXT` | Nome completo do primeiro integrante |
| `aluno2` | `TEXT` | Nome completo do segundo integrante |
| `select` | `SELECT` | Restrito aos valores: `A` (Engajamento), `B` (Absenteísmo), `C` (Passividade) |
| `created` | `AUTODATE` | Data e hora da criação automática |
| `updated` | `AUTODATE` | Data e hora da última modificação |

### 2. Coleção `submissoes` (ID: `pbc_3100742274`)
Armazena o plano estratégico de 3 etapas e os protótipos anexados:

| Campo | Tipo | Descrição / Regra |
| :--- | :--- | :--- |
| `id` | `TEXT` (15 chars) | Identificador único da submissão |
| `dupla` | `TEXT` | ID da dupla vinculada |
| `plano_texto` | `EDITOR` | Texto completo do plano estratégico (suporta rich text / Markdown) |
| `links_recursos` | `JSON` | Lista de protótipos anexados (URLs de Canva, Slides, Figma, Drive, Vídeos e Áudios) |
| `checklist_status`| `JSON` | Objeto com o status das 3 ações metodológicas (`acao1`, `acao2`, `acao3`) |
| `status` | `SELECT` | Estado da submissão: `rascunho` ou `submetido` |
| `created` / `updated` | `AUTODATE` | Timestamps automáticos de auditoria |

---

## 📁 Localização Física dos Dados

* **Diretório do executável:** `pocketbase_bin/pocketbase.exe`
* **Banco de dados SQLite:** `pocketbase_bin/pb_data/data.db`
* **Migrações automáticas:** `pocketbase_bin/pb_migrations/1700000000_init_eduendomkt.js`

> [!TIP]
> Para fazer backup da base local com todas as duplas e submissões, basta copiar o arquivo `pocketbase_bin/pb_data/data.db`.

---

## 🔄 Como Conectar o Frontend à Base Local

Caso queira que o frontend envie os dados para a sua máquina local (em vez do PocketBase Cloud), edite o arquivo `.env` na raiz do projeto:

```ini
# Para usar a base local:
VITE_POCKETBASE_URL=http://127.0.0.1:8090

# Para voltar a usar a nuvem:
# VITE_POCKETBASE_URL=https://8rn4k785l3pd7ed.pwz5.pocketbasecloud.com
```

Após alterar o `.env`, reinicie o frontend com `npm run dev`.
