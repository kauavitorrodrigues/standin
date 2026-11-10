import { z } from "zod/v4";
import { SpotifyErrorMessages } from "./consts/error-messages";

// A person who holds one of the places, for the owner's list.
export const SpotifyConnectionEntrySchema = z.object({
    userId: z.string({ error: SpotifyErrorMessages.connection.userId }),
    name: z.string({ error: SpotifyErrorMessages.connection.name }),
    // The Spotify photo of the person, when there is one.
    imageUrl: z
        .string({ error: SpotifyErrorMessages.connection.imageUrl })
        .nullable(),
    connectedAt: z.coerce.date({
        error: SpotifyErrorMessages.connection.connectedAt,
    }),
});

// What the owner sees. The secret never comes back, only that it is set.
export const SpotifyOwnerStatusSchema = z.object({
    isConfigured: z.boolean({
        error: SpotifyErrorMessages.ownerStatus.isConfigured,
    }),
    clientId: z
        .string({ error: SpotifyErrorMessages.ownerStatus.clientId })
        .nullable(),
    // The address to register in the Spotify app.
    redirectUri: z.string({
        error: SpotifyErrorMessages.ownerStatus.redirectUri,
    }),
    maxConnections: z
        .number({ error: SpotifyErrorMessages.ownerStatus.maxConnections })
        .int({ error: SpotifyErrorMessages.ownerStatus.maxConnections }),
    connections: z.array(SpotifyConnectionEntrySchema, {
        error: SpotifyErrorMessages.ownerStatus.connections,
    }),
});

// What a member sees: whether the organization has an app, and their own state.
export const SpotifyMemberStatusSchema = z.object({
    isAvailable: z.boolean({
        error: SpotifyErrorMessages.memberStatus.isAvailable,
    }),
    isConnected: z.boolean({
        error: SpotifyErrorMessages.memberStatus.isConnected,
    }),
    // True when every place is taken and this person holds none.
    isFull: z.boolean({ error: SpotifyErrorMessages.memberStatus.isFull }),
});
