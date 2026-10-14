// Where the last change of the draft came from. Only a gesture is the user
// dropping something on the map, so only it gets the drop effect: undo, redo,
// a discard, a restore and a rebase just bring the map to a state.
export type DraftChange = "gesture" | "history" | "reset";
