import type {
    UpsertAppConnectionInput,
    UpsertOrganizationIntegrationInput,
} from "../../../types";

// The generic inputs without the provider and service: Spotify's repository
// adds them.
export type UpsertSpotifyAppInput = Omit<
    UpsertOrganizationIntegrationInput,
    "provider"
>;

export type UpsertSpotifyConnectionInput = Omit<
    UpsertAppConnectionInput,
    "provider" | "service"
>;
