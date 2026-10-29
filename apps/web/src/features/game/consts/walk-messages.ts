export const WALK_MESSAGES = {
    blocked: "O caminho até lá está bloqueado.",
    toTile: "Indo para o destino",
    toDesk: "Indo para a sua mesa",
    // Used while the name of the person is not known.
    toSomeone: "Indo até a pessoa",
    toPerson: (name: string) => `Indo até ${name}`,
    walkToPerson: (name: string) => `Ir até ${name}`,
} as const;
