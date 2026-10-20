// Keys of the avatar textures in a Phaser scene. A sheet is keyed by the id
// of its file, and the ghost has a key of its own.
export const AVATAR_TEXTURE_KEY_PREFIX = "avatar-sheet";
export const AVATAR_TEXTURE_KEY_SEPARATOR = ":";
export const AVATAR_GHOST_TEXTURE_ID = "ghost";

// The texture shown while a sheet loads, when it fails and for who has no
// avatar. It is loaded with the scene.
export const AVATAR_GHOST_TEXTURE_KEY = [
    AVATAR_TEXTURE_KEY_PREFIX,
    AVATAR_GHOST_TEXTURE_ID,
].join(AVATAR_TEXTURE_KEY_SEPARATOR);

// What Phaser calls the events of the loader that the avatar code listens to.
export const AVATAR_LOADER_EVENTS = {
    FILE_COMPLETE_PREFIX: "filecomplete-spritesheet-",
    FILE_ERROR: "loaderror",
} as const;
