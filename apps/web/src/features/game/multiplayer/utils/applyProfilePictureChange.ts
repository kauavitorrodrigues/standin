import type { ProfilePictureChangedPayload } from "@standin/contracts";

type Params = {
    change: ProfilePictureChangedPayload;
    selfUserId: string;
    // The picture of the signed in person in the app's copy of who they are.
    ownPictureUrl: string | null;
    // The running scene, or null while there is none.
    scene: {
        setUserProfilePicture: (
            userId: string,
            profilePictureUrl: string | null
        ) => void;
    } | null;
    // Puts the new picture of the signed in person where the app reads it
    // from. The tag over the local avatar follows that (see
    // useLocalUserProfile).
    updateOwnPicture: (profilePictureUrl: string | null) => void;
    // Loads again what draws the pictures of the others (members, chat).
    refreshPictures: () => void;
};

// Someone in the room changed or removed their profile picture. The tag over
// their avatar changes in the running scene. The tag over the local avatar
// follows the signed in person, so a change made in another tab reaches it
// through the app's own copy of who they are. The tab that saved the picture
// already holds it (the mutation stored the saved person), so it has nothing
// to apply. Every other case loads the lists that draw pictures again.
export const applyProfilePictureChange = ({
    change,
    selfUserId,
    ownPictureUrl,
    scene,
    updateOwnPicture,
    refreshPictures,
}: Params): void => {
    if (change.userId === selfUserId) {
        if (change.profilePictureUrl === ownPictureUrl) return;

        updateOwnPicture(change.profilePictureUrl);
        refreshPictures();
        return;
    }

    refreshPictures();
    scene?.setUserProfilePicture(change.userId, change.profilePictureUrl);
};
