export type BootstrapStep = {
    target: "admin" | "organization";
    status: "created" | "exists";
    // A line a CLI can print as it is.
    label: string;
};

export type BootstrapInstanceResult = {
    steps: BootstrapStep[];
    adminId: string;
    organizationId: string;
    // Only set when the admin was created without a password in the input.
    generatedPassword?: string;
};

export type ResolvedAdmin = {
    admin: { id: string; email: string };
    // Only set when the admin was created along with it.
    organization: { id: string; name: string } | null;
    generatedPassword?: string;
    step: BootstrapStep;
};
