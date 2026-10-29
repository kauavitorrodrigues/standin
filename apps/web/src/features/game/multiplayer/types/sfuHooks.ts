import type { RefObject } from "react";
import type { MediaPauseReason } from "@standin/contracts";
import type { RemoteAudioManager } from "../lib/RemoteAudioManager";
import type { SfuSupervisor } from "../lib/SfuSupervisor";

/** The privacy modes of a person, as the others see them. */
export type RemotePrivacy = { headphones: boolean; focus: boolean };

/** What the person sends right now, from their devices. */
export type LocalMedia = {
    localAudioTrack: MediaStreamTrack | null;
    localCameraTrack: MediaStreamTrack | null;
    localScreenTrack: MediaStreamTrack | null;
    // The sound shared with the screen, null when the share has none.
    localScreenAudioTrack: MediaStreamTrack | null;
    isMicEnabled: boolean;
    isHeadphonesOn: boolean;
    isFocusModeOn: boolean;
};

export type UseSfuMediaOptions = LocalMedia & {
    userId: string;
    remoteAudioManager: RemoteAudioManager;
    getSocketIdOfUser: (userId: string) => string | undefined;
    setUserSpeaking: (userId: string, isSpeaking: boolean) => void;
    setRemoteMicMuted: (userId: string, isMuted: boolean) => void;
    setRemotePrivacy: (userId: string, privacy: RemotePrivacy) => void;
};

export type UseSfuRemoteMediaOptions = {
    userId: string;
    remoteAudioManager: RemoteAudioManager;
    getSocketIdOfUser: (userId: string) => string | undefined;
    setUserSpeaking: (userId: string, isSpeaking: boolean) => void;
};

export type UseSfuSocketEventsOptions = {
    supervisorRef: RefObject<SfuSupervisor | null>;
    // A video is held back for a reason, or plays again with a null reason.
    setRemotePauseReason: (
        consumerId: string,
        reason: MediaPauseReason | null
    ) => void;
    // The server ended the hiding of some people, and these are still hidden.
    setHiddenVideoUserIds: (userIds: readonly string[]) => void;
    applySpeakers: (userIds: readonly string[]) => void;
    setRemoteMicMuted: (userId: string, isMuted: boolean) => void;
    setRemotePrivacy: (userId: string, privacy: RemotePrivacy) => void;
};
