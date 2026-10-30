import type { ClipStart } from "@/features/media-devices/types/clipStart";
import type { SoundboardPlayAck } from "@standin/contracts";
import type { PlayableClip } from "./clip";

// What a tile needs to play its clip: into the call from the panel, to the
// person's own speakers from the manager. A clip plays to its end, and plays
// of the same clip or of different ones can overlap.
export type ClipPlayback = {
    // Why the clips cannot be played right now, null when they can.
    disabledReason: string | null;
    // Four plays of this person are running, which is the most there may be:
    // no more can start until one ends. It has no reason shown, it only
    // disables.
    isAtLimit: boolean;
    // The clips this person has playing now. A clip playing twice is in once.
    playingClipIds: ReadonlySet<string>;
    play: (clip: PlayableClip) => Promise<void>;
};

// The local listening: a playback that can also be stopped. The call has no
// stop, a clip plays there to its end; listening alone can be cut short.
export type ClipPreview = ClipPlayback & { stop: () => void };

export type PlayRefusal = Extract<SoundboardPlayAck, { ok: false }>;

// The plays this person has running, by the id of the play, and the clip each
// one is of.
export type PlaysByPlayId = ReadonlyMap<string, string>;

// The clip functions of useLocalAudioStream that the soundboard drives.
export type LocalClipPlayer = {
    playClip: (start: ClipStart) => boolean;
    stopClip: (playId: string) => void;
    stopAllClips: () => void;
};

// What it takes to play a buffer to the speakers. It has no play id: nothing
// here is told to a server.
export type LocalPlayback = Omit<ClipStart, "playId">;
