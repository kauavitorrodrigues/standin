type Selectable = {
    setNameTagDetailed: (isDetailed: boolean) => void;
};

// The remote avatar the mouse clicked, whose tag shows the photo. One at a time:
// selecting another lets the first one go, and so does a click on anything else.
export class RemoteSelection {
    private selectedId: string | null = null;

    get id(): string | null {
        return this.selectedId;
    }

    // Moves the selection to the avatar with this id, or to none. The avatars
    // are looked up by id at the moment, since they come and go.
    select(id: string | null, find: (id: string) => Selectable | undefined) {
        if (id === this.selectedId) return;

        if (this.selectedId !== null) {
            find(this.selectedId)?.setNameTagDetailed(false);
        }
        this.selectedId = id;
        if (id !== null) find(id)?.setNameTagDetailed(true);
    }

    // The avatar is gone, so there is nothing to let go of.
    remove(id: string): void {
        if (id === this.selectedId) this.selectedId = null;
    }

    clear(): void {
        this.selectedId = null;
    }
}
