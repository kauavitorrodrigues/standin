import type { NearbyMessage } from "@/features/game/types/nearby";

export type NearbyLine = {
    id: string;
    senderId: string;
    name: string;
    text: string;
};

// The messages as lines with the name of whoever wrote them. A sender that does
// not resolve to a name is left out.
export const buildNearbyLines = (
    messages: readonly NearbyMessage[],
    names: ReadonlyMap<string, string>
): NearbyLine[] =>
    messages.flatMap((message) => {
        const name = names.get(message.senderId);
        if (!name) return [];

        return [
            {
                id: message.id,
                senderId: message.senderId,
                name,
                text: message.text,
            },
        ];
    });
