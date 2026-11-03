// A section of the space was rendered in a settings dialog opened outside one.
export class SettingsSpaceMissingError extends Error {
    constructor() {
        super(
            "This settings section needs the space the dialog was opened in."
        );
        this.name = "SettingsSpaceMissingError";
    }
}
