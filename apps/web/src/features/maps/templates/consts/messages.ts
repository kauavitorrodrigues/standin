// What the user is told after something happens to a map template.
export const TEMPLATE_MESSAGES = {
    CREATED: "Template criado.",
    CREATE_FAILED: "Não foi possível criar o template.",
    LIST_FAILED: "Não foi possível carregar os templates.",
    RENAMED: "Template renomeado.",
    RENAME_FAILED: "Não foi possível renomear o template.",
    DELETED: "Template apagado.",
    DELETE_FAILED: "Não foi possível apagar o template.",
    DELETE_PUBLISHED: "Aposente o template antes de apagar.",
    DELETE_LOCKED:
        "O mapa está em edição por outra pessoa. Tente de novo mais tarde.",
    PUBLISHED: "Template publicado.",
    PUBLISH_FAILED: "Não foi possível publicar o template.",
    PUBLISH_NOT_DRAFT: "Só um template em rascunho pode ser publicado.",
    PUBLISH_THUMBNAIL_REQUIRED:
        "Salve uma miniatura no editor antes de publicar.",
    PUBLISH_PRIVATE_ASSETS:
        "O template usa recursos privados de uma organização e não pode ser publicado.",
    PUBLISH_INVALID_LAYOUT:
        "O mapa tem problemas que impedem a publicação. Abra o editor e corrija.",
    RETIRED: "Template aposentado.",
    RETIRE_FAILED: "Não foi possível aposentar o template.",
} as const;
