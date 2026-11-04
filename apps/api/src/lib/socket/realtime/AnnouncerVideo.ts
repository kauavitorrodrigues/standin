import { mediaDirty, MediaRuntime } from "@/lib/media/MediaRuntime";
import { PresenceStore } from "../presence/PresenceStore";

// Hands what the presence says about announcing and about showing the camera
// to the media of the space, so the planner can hold back or give the camera.
// Does nothing for a person with no media session: they get the state when
// they join the media (see requireMediaContext).
const apply = (spaceId: string, socketId: string): void => {
    const entry = PresenceStore.get(spaceId, socketId);
    const room = MediaRuntime.getRoom(spaceId);
    if (!entry || !room?.hasPeer(socketId)) return;

    room.setAnnouncerVideo(socketId, {
        announcing: entry.announcingSince !== null,
        sharingVideoWithAnnouncer:
            entry.sharingVideoWithAnnouncerSince !== null,
    });
    // The person is planned again, and so are the ones around, who may be the
    // announcer that now gets or loses this camera.
    mediaDirty.markMoved(spaceId, socketId);
};

// The camera is shown only while someone announces near the person, so it
// goes back to private as soon as nobody does.
const stopSharing = (spaceId: string, socketId: string): void => {
    const changed = PresenceStore.setSharingVideoWithAnnouncer(
        spaceId,
        socketId,
        null
    );
    if (changed) apply(spaceId, socketId);
};

export const AnnouncerVideo = { apply, stopSharing };
