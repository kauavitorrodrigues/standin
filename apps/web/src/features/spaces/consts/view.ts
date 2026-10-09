export const SPACE_VIEWS = {
    SPACE: "space",
    CHAT: "chat",
} as const;

export type SpaceView = (typeof SPACE_VIEWS)[keyof typeof SPACE_VIEWS];
