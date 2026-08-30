import { BaseError } from "../errors/base";

export class FileUploadError extends BaseError {
    constructor() {
        super("Falha ao enviar o arquivo.", "FILE_UPLOAD_ERROR", 500);
    }
}

export class FileDeleteError extends BaseError {
    constructor() {
        super("Falha ao excluir o arquivo.", "FILE_DELETE_ERROR", 500);
    }
}

export class FileNotFoundError extends BaseError {
    constructor() {
        super("Arquivo não encontrado.", "FILE_NOT_FOUND", 404);
    }
}

export class MissingFileError extends BaseError {
    constructor() {
        super("Nenhum arquivo foi enviado.", "FILE_MISSING", 400);
    }
}

export class UnsupportedFileTypeError extends BaseError {
    constructor() {
        super(
            "Formato de arquivo não permitido para este tipo de upload.",
            "FILE_UNSUPPORTED_TYPE",
            400
        );
    }
}

export class FileTooLargeError extends BaseError {
    constructor() {
        super(
            "O arquivo excede o tamanho máximo permitido.",
            "FILE_TOO_LARGE",
            400
        );
    }
}

export class UnknownStorageDriverError extends BaseError {
    constructor() {
        super("Driver de storage desconhecido.", "STORAGE_DRIVER_UNKNOWN", 500);
    }
}

export class StorageDriverNotImplementedError extends BaseError {
    constructor() {
        super(
            "Este driver de storage ainda não foi implementado.",
            "STORAGE_DRIVER_NOT_IMPLEMENTED",
            501
        );
    }
}

export class MissingEnvironmentVariableError extends BaseError {
    constructor(name: string) {
        super(
            `A variável de ambiente "${name}" é obrigatória.`,
            "MISSING_ENVIRONMENT_VARIABLE",
            500
        );
    }
}
