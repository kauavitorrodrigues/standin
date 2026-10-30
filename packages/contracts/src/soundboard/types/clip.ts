import type { SoundboardClipScope } from "../enums/clip-scope";

// One clip as the list shows it. No file bytes: the client fetches `fileUrl`
// when it plays or previews the clip.
export type SoundboardClip = {
    id: string;
    name: string;
    // One icon, or null when the clip has none.
    icon: string | null;
    // Gain from 0 to 1 applied when the clip plays.
    volume: number;
    durationMs: number;
    scope: SoundboardClipScope;
    // Relative, like every file url. The client puts its API address in front.
    fileUrl: string;
    createdByName: string;
    // Whether the person who asked may rename and delete this clip.
    canManage: boolean;
    updatedAt: number;
};

export type SoundboardClipPage = {
    clips: SoundboardClip[];
    total: number;
    page: number;
    pageSize: number;
};
