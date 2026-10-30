import { SERVICE_TOKEN_NAME_MAX_LENGTH } from "@standin/contracts";
import type { ServiceTokenStatus } from "../types";

export const SERVICE_TOKEN_PAGE_TEXT = {
    TITLE: "Tokens de serviço",
    DESCRIPTION:
        "Chaves para que outros serviços usem a API sem uma sessão de pessoa. Cada token tem só as permissões marcadas ao criar.",
    NEW_TOKEN: "Novo token",
} as const;

export const SERVICE_TOKEN_STATES_TEXT = {
    ERROR_TITLE: "Erro ao buscar os tokens",
    ERROR_MESSAGE:
        "Não foi possível carregar os tokens de serviço. Tente novamente.",
    RETRY: "Tentar de novo",
    EMPTY_TITLE: "Nenhum token ainda",
    EMPTY_MESSAGE: "Crie um token para que um serviço acesse a API.",
    LOADING_LABEL: "Carregando os tokens",
} as const;

export const SERVICE_TOKEN_TABLE_TEXT = {
    NAME: "Nome",
    TOKEN: "Token",
    SCOPES: "Permissões",
    LAST_USED: "Último uso",
    EXPIRES: "Expira",
    STATUS: "Status",
    ACTIONS: "Ações",
    NEVER_USED: "Nunca usado",
    NEVER_EXPIRES: "Não expira",
    REVOKE: "Revogar",
    REGENERATE: "Gerar novo token",
    DELETE: "Apagar",
} as const;

export const SERVICE_TOKEN_STATUS_LABELS: Record<ServiceTokenStatus, string> = {
    active: "Ativo",
    expired: "Expirado",
    revoked: "Revogado",
};

export const SERVICE_TOKEN_CREATE_TEXT = {
    TITLE: "Novo token de serviço",
    DESCRIPTION:
        "Escolha um nome para reconhecer o token e o que ele pode fazer.",
    NAME_LABEL: "Nome",
    NAME_PLACEHOLDER: "Ex.: serviço de importação",
    EXPIRY_LABEL: "Expiração",
    EXPIRY_DATE_LABEL: "Data de expiração",
    SUBMIT: "Criar token",
} as const;

export const SERVICE_TOKEN_SCOPES_TEXT = {
    LEGEND: "Permissões",
    RESOURCE: "Recurso",
    PERMISSION: "Escrita",
    CLEAR: "Limpar",
    presetsLabel: "Atalhos de permissões",
    count: (selected: number, total: number) =>
        `${selected} de ${total} permissões`,
    rowLabel: (label: string) => `Permitir escrita em ${label}`,
} as const;

export const SERVICE_TOKEN_EXPIRY_TEXT = {
    preview: (day: string) => `Expira em ${day}`,
} as const;

export const SERVICE_TOKEN_CREATED_TEXT = {
    TITLE: "Token criado com sucesso!",
    REGENERATED_TITLE: "Novo token gerado!",
    USAGE: "Envie este token no cabeçalho Authorization, no formato Bearer.",
    WARNING_TITLE: "Guarde o token agora",
    WARNING:
        "Ele não será mostrado de novo. Se for perdido, será preciso criar outro.",
    COPY: "Copiar token",
    COPIED: "Copiado!",
    CLOSE: "Já copiei, fechar",
} as const;

export const SERVICE_TOKEN_REVOKE_TEXT = {
    TITLE: "Revogar o token?",
    CANCEL: "Cancelar",
    CONFIRM: "Revogar",
    describe: (name: string) =>
        `"${name}" deixa de funcionar na hora e não pode ser reativado.`,
} as const;

export const SERVICE_TOKEN_REGENERATE_TEXT = {
    TITLE: "Gerar um novo token?",
    CANCEL: "Cancelar",
    CONFIRM: "Gerar novo token",
    describe: (name: string) =>
        `O token atual de "${name}" para de funcionar imediatamente, e tudo o que o usa vai parar até receber o novo token. O nome, as permissões e a expiração continuam os mesmos.`,
} as const;

export const SERVICE_TOKEN_DELETE_TEXT = {
    TITLE: "Apagar o token?",
    CANCEL: "Cancelar",
    CONFIRM: "Apagar",
    describe: (name: string) =>
        `"${name}" é removido para sempre e não é possível desfazer.`,
    ACTIVE_WARNING: "Ele ainda está ativo e vai parar de funcionar agora.",
} as const;

export const SERVICE_TOKEN_VALIDATION_MESSAGES = {
    NAME_REQUIRED: "Informe o nome do token.",
    NAME_TOO_LONG: `O nome tem no máximo ${SERVICE_TOKEN_NAME_MAX_LENGTH} caracteres.`,
    SCOPES_REQUIRED: "Marque pelo menos uma permissão.",
    EXPIRY_INVALID: "Escolha uma data válida.",
    EXPIRY_PAST: "A data de expiração precisa ser no futuro.",
} as const;

// What the user is told when an action fails. The success of an action is
// not announced, the list just changes.
export const SERVICE_TOKEN_ERROR_MESSAGES = {
    CREATE_FAILED: "Não foi possível criar o token.",
    REVOKE_FAILED: "Não foi possível revogar o token.",
    REGENERATE_FAILED: "Não foi possível gerar um novo token.",
    DELETE_FAILED: "Não foi possível apagar o token.",
    NOT_ACTIVE: "Só um token ativo pode gerar um novo token.",
    NOT_FOUND: "O token não existe mais.",
} as const;
