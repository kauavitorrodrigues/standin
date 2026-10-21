// Profile pictures that arrived for a person whose avatar is not in the scene
// yet. A change is sent to the whole room as soon as the socket is in it, which
// can be before `space:joined` makes the avatar, and the profile that comes
// with `space:joined` may have been read before the change. The last picture
// that arrived wins, and it is used once, when the avatar is made. Null is a
// picture too: it means the person removed theirs.
export class PendingProfilePictures {
    private readonly pictures = new Map<string, string | null>();

    set(userId: string, profilePictureUrl: string | null): void {
        this.pictures.set(userId, profilePictureUrl);
    }

    // The pending picture of the person, or the fallback. The pending picture
    // is used up.
    take(userId: string, fallback: string | null): string | null {
        if (!this.pictures.has(userId)) return fallback;

        const pending = this.pictures.get(userId) ?? null;
        this.pictures.delete(userId);
        return pending;
    }

    // The person left before their avatar was made, so a picture kept for
    // them would be older than the one the server reads when they come back.
    forget(userId: string): void {
        this.pictures.delete(userId);
    }
}
