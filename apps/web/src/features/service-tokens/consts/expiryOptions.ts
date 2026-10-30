import type { ExpiryOption } from "../types";

export const DEFAULT_EXPIRY_OPTION = "30d";

export const SERVICE_TOKEN_EXPIRY_OPTIONS: readonly ExpiryOption[] = [
    { id: "never", label: "Sem expiração", days: null },
    { id: "30d", label: "30 dias", days: 30 },
    { id: "90d", label: "90 dias", days: 90 },
    { id: "1y", label: "1 ano", days: 365 },
    { id: "custom", label: "Data específica", days: null },
];
