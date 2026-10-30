import type {
    SoundboardClip,
    SoundboardClipScope,
    SoundboardUpdateBody,
} from "@standin/contracts";

export type ClipRef = { scope: SoundboardClipScope; clipId: string };

// The editable fields of a clip as the code holds them: no icon is null.
export type ClipDraft = {
    name: string;
    icon: string | null;
    volume: number;
};

export type ClipSearchFormValues = { search: string };

export type ClipListFilters = {
    scope: SoundboardClipScope;
    search: string;
    enabled?: boolean;
};

// What playing or previewing a clip needs of it.
export type PlayableClip = Pick<SoundboardClip, "id" | "fileUrl" | "volume">;

export type UpdateClipInput = ClipRef & { body: SoundboardUpdateBody };
