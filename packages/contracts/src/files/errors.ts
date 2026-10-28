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

export class FileDownloadError extends BaseError {
    constructor() {
        super("Falha ao baixar o arquivo.", "FILE_DOWNLOAD_ERROR", 500);
    }
}

export class FileNotFoundError extends BaseError {
    constructor() {
        super("File not found.", "FILE_NOT_FOUND", 404);
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
            "File format is not allowed for this upload type.",
            "FILE_UNSUPPORTED_TYPE",
            400
        );
    }
}

export class FileTooLargeError extends BaseError {
    constructor() {
        super(
            "The file exceeds the maximum allowed size.",
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

export class InvalidEnvironmentVariableError extends BaseError {
    constructor(name: string, reason: string) {
        super(
            `The environment variable "${name}" ${reason}.`,
            "INVALID_ENVIRONMENT_VARIABLE",
            500
        );
    }
}

export class MissingEnvironmentVariableError extends BaseError {
    constructor(name: string) {
        super(
            `The environment variable "${name}" is required.`,
            "MISSING_ENVIRONMENT_VARIABLE",
            500
        );
    }
}
