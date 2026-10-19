import { AVATAR_PUBLIC_SHEETS } from "../consts/paths";
import { AVATAR_DIAGNOSTIC_MESSAGES } from "../consts/diagnostics";
import { AVATAR_GHOST_TEXTURE_KEY } from "../consts/textures";
import {
    ensureAvatarTexture,
    type AvatarTextureHost,
} from "./ensureAvatarTexture";

// Queues the sheet of the ghost in the loader of a scene. Call it from
// `preload`, where the scene starts the loader itself. The ghost is what every
// avatar draws until its own sheet is ready, so it comes with the scene.
export const loadGhostTexture = (host: AvatarTextureHost): void => {
    ensureAvatarTexture(
        host,
        {
            key: AVATAR_GHOST_TEXTURE_KEY,
            url: AVATAR_PUBLIC_SHEETS.GHOST,
            autoStart: false,
        },
        {
            onReady: () => {},
            onError: () =>
                console.error(
                    AVATAR_DIAGNOSTIC_MESSAGES.ghostLoadFailed(
                        AVATAR_PUBLIC_SHEETS.GHOST
                    )
                ),
        }
    );
};
