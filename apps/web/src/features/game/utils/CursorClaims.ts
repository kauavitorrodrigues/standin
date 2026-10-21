// Who wants the pointer cursor right now. Several controllers watch the same
// canvas, and each one used to set the cursor itself: the one that lost its
// target in a frame set the arrow even if another one had just claimed the
// pointer in that same frame. With the claims kept together the cursor is the
// pointer while anyone claims it, and the arrow otherwise.
export class CursorClaims {
    private readonly claimants = new Set<unknown>();

    // Records what one claimant wants and gives back whether the cursor should
    // be the pointer.
    claim(claimant: unknown, wantsPointer: boolean): boolean {
        if (wantsPointer) this.claimants.add(claimant);
        else this.claimants.delete(claimant);

        return this.claimants.size > 0;
    }
}

const claimsByCanvas = new WeakMap<object, CursorClaims>();

// The claims of a canvas, made on the first ask.
export const getCursorClaims = (canvas: object): CursorClaims => {
    const found = claimsByCanvas.get(canvas);
    if (found) return found;

    const claims = new CursorClaims();
    claimsByCanvas.set(canvas, claims);
    return claims;
};
