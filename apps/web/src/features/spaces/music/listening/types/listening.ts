import type { ListeningEntry, ListeningTrack } from "@standin/contracts";

// What the people of the space play, by user id. The server decides who is
// shown, the client only keeps what it was sent.
export type ListeningState = Readonly<Record<string, ListeningTrack>>;

export type ListeningAction =
    | { type: "snapshot-received"; entries: ListeningEntry[] }
    | { type: "track-received"; userId: string; track: ListeningTrack | null }
    | { type: "reset" };
