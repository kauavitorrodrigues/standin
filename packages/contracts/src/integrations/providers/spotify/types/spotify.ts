import type { z } from "zod/v4";
import type { SpotifyAppSaveSchema } from "../schemas/spotify-app.data.schema";
import type {
    SpotifyConnectionEntrySchema,
    SpotifyMemberStatusSchema,
    SpotifyOwnerStatusSchema,
} from "../schemas/spotify-status.schema";

export type SpotifyAppSave = z.infer<typeof SpotifyAppSaveSchema>;
export type SpotifyConnectionEntry = z.infer<
    typeof SpotifyConnectionEntrySchema
>;
export type SpotifyOwnerStatus = z.infer<typeof SpotifyOwnerStatusSchema>;
export type SpotifyMemberStatus = z.infer<typeof SpotifyMemberStatusSchema>;
