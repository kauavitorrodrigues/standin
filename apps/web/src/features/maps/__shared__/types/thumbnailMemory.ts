// What the editor remembers about the photos it sent, for as long as it is
// open. One per editor, shared by the first photo and the ones after each
// publish.
//
// It only knows the uploads of this editor. If another session replaces the
// photo meanwhile (the creation form's capture landing late, say), a publish
// here that looks like this editor's last upload is not sent, and the card
// keeps the other photo until the map changes visibly. Only the owner edits a
// map and the lock keeps it to one editor, so this is accepted.
export type ThumbnailMemory = {
    // The fingerprint of the last photo the server took from this editor.
    hash: string | null;
    // The saves in line, one at a time. Two publishes in a row can have their
    // uploads answered out of order, which would leave the memory with the
    // photo the server no longer holds, so the next is saved only after the
    // one before it ended.
    queue: Promise<void>;
};
