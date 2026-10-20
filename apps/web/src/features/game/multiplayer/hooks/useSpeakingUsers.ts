import { useCallback, useState } from "react";
import { toggleSpeakingUser } from "../utils/speakingUsers";

// Who is speaking right now, by user id, for the interface around the game.
// The detectors (`SpeakingDetector`) feed it through `setUserSpeaking`, and a
// later bar of users with a ring reads `speakingUserIds`. The avatar in the
// game does not show it.
export const useSpeakingUsers = () => {
    const [speakingUserIds, setSpeakingUserIds] = useState<ReadonlySet<string>>(
        () => new Set()
    );

    const setUserSpeaking = useCallback(
        (userId: string, isSpeaking: boolean) =>
            setSpeakingUserIds((previous) =>
                toggleSpeakingUser(previous, userId, isSpeaking)
            ),
        []
    );

    const clearSpeakingUsers = useCallback(
        () =>
            setSpeakingUserIds((previous) =>
                previous.size === 0 ? previous : new Set()
            ),
        []
    );

    return { speakingUserIds, setUserSpeaking, clearSpeakingUsers };
};
