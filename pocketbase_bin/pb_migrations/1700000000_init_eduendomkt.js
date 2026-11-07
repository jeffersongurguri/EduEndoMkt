/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);

  // 1. Coleção 'duplas' (ID: pbc_3147699878)
  const duplas = new Collection({
    id: "pbc_3147699878",
    name: "duplas",
    type: "base",
    system: false,
    schema: [
      {
        name: "nome_dupla",
        type: "text",
        required: false,
        presentable: false,
        options: { min: null, max: null }
      },
      {
        name: "aluno1",
        type: "text",
        required: false,
        presentable: false,
        options: { min: null, max: null }
      },
      {
        name: "aluno2",
        type: "text",
        required: false,
        presentable: false,
        options: { min: null, max: null }
      },
      {
        name: "select",
        type: "select",
        required: false,
        presentable: false,
        options: { maxSelect: 1, values: ["A", "B", "C"] }
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null
  });
  dao.saveCollection(duplas);

  // 2. Coleção 'submissoes' (ID: pbc_3100742274)
  const submissoes = new Collection({
    id: "pbc_3100742274",
    name: "submissoes",
    type: "base",
    system: false,
    schema: [
      {
        name: "dupla",
        type: "text",
        required: false,
        presentable: false,
        options: { min: null, max: null }
      },
      {
        name: "plano_texto",
        type: "editor",
        required: false,
        presentable: false,
        options: { maxSize: 0 }
      },
      {
        name: "links_recursos",
        type: "json",
        required: false,
        presentable: false,
        options: { maxSize: 0 }
      },
      {
        name: "checklist_status",
        type: "json",
        required: false,
        presentable: false,
        options: { maxSize: 0 }
      },
      {
        name: "status",
        type: "select",
        required: false,
        presentable: false,
        options: { maxSelect: 1, values: ["rascunho", "submetido"] }
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null
  });
  dao.saveCollection(submissoes);
}, (db) => {
  const dao = new Dao(db);
  try {
    const sub = dao.findCollectionByNameOrId("pbc_3100742274");
    if (sub) dao.deleteCollection(sub);
  } catch (e) {}

  try {
    const d = dao.findCollectionByNameOrId("pbc_3147699878");
    if (d) dao.deleteCollection(d);
  } catch (e) {}
});
