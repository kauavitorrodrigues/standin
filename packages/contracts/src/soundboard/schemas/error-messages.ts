import { SOUNDBOARD_NAME_MAX } from "../consts/limits";

export const SoundboardErrorMessages = {
    name: {
        invalid: `The clip name must have 1 to ${SOUNDBOARD_NAME_MAX} characters.`,
    },
    icon: {
        invalid: "The icon must be a single emoji.",
    },
    volume: {
        invalid: "The volume must be between 0 and 1.",
    },
    clipId: {
        invalid: "The clip id is required.",
    },
};
