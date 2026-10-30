export type BootstrapArgs = {
    email?: string;
    password?: string;
    name?: string;
    organization?: string;
};

export type DryRunInput = {
    email: string;
    name: string;
    organizationName: string;
    passwordProvided: boolean;
};

export type BootstrapDryRunResult = {
    dryRun: true;
    databaseChecked: false;
    input: DryRunInput;
};

export type DryRunNoteParams = {
    email: string;
    organizationName: string;
    passwordProvided: boolean;
};
