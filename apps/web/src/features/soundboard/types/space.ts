import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import type { SoundboardStopped } from "@standin/contracts";
import type { ClipPlayback, LocalClipPlayer } from "./playback";

// The soundboard of the space plays clips into the call.
export type SpaceSoundboard = ClipPlayback;

export type SpaceSoundboardOptions = DisabledReasonInput & {
    player: LocalClipPlayer;
};

// The listeners a test captures from the socket helpers.
export type SocketHandlers = {
    stopped: ((event: SoundboardStopped) => void) | null;
    reset: (() => void) | null;
};

export type DisabledReasonInput = {
    micError: LocalAudioStreamError | null;
    hasMicStream: boolean;
    isHeadphonesOn: boolean;
};
