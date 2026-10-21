// What the tag over an avatar shows of a person: the name, and the photo it
// shows when the tag is clicked.
export type UserTagProfile = {
    name: string;
    // Null means the person has no photo, and the tag shows the initial.
    profilePictureUrl: string | null;
};

// A tag with no name stays hidden until a profile arrives.
export const NO_USER_TAG_PROFILE: UserTagProfile = {
    name: "",
    profilePictureUrl: null,
};
