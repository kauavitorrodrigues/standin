// Names that arrived for a person whose avatar is not in the scene yet. A
// rename is sent to the whole room as soon as the socket is in it, which can be
// before `space:joined` makes the avatar, and the profile that comes with
// `space:joined` may have been read before the rename. The last name that
// arrived wins, and it is used once, when the avatar is made.
export class PendingUserNames {
    private readonly names = new Map<string, string>();

    set(userId: string, name: string): void {
        this.names.set(userId, name);
    }

    // The pending name of the person, or the fallback. The pending name is
    // used up.
    take(userId: string, fallback: string): string {
        const pending = this.names.get(userId);
        if (pending === undefined) return fallback;

        this.names.delete(userId);
        return pending;
    }

    // The person left before their avatar was made, so a name kept for them
    // would be older than the one the server reads when they come back.
    forget(userId: string): void {
        this.names.delete(userId);
    }
}
