import { PLANNER_KIND_OF_SOURCE } from "../../consts/spaceMedia";
import type {
    CurrentConsumer,
    PersonState,
    SimulcastLayer,
} from "../../planner/types";
import type { Peer } from "../spaceTypes";
import { isSilenced } from "./isSilenced";

// Who each person is, for the planner. A person with no position is left out
// by the planner itself.
export const buildPeople = (peers: Iterable<Peer>): PersonState[] =>
    [...peers].map((peer) => {
        const producers: PersonState["producers"] = {};
        peer.producers.forEach(({ producer, source }) => {
            producers[PLANNER_KIND_OF_SOURCE[source]] = producer.id;
        });
        return {
            id: peer.id,
            roomKey: peer.roomKey,
            muted: isSilenced(peer),
            headphones: peer.headphones,
            focusMode: peer.focusMode,
            producers,
        };
    });

export const buildCurrentConsumers = (
    peers: Iterable<Peer>
): Map<string, CurrentConsumer[]> => {
    const current = new Map<string, CurrentConsumer[]>();
    for (const peer of peers) {
        current.set(
            peer.id,
            [...peer.consumers.values()].map((entry) => ({
                personId: entry.ownerId,
                producerId: entry.producerId,
                kind: entry.kind,
                layer: entry.layer,
                paused: entry.paused,
                pauseReason: entry.pauseReason,
            }))
        );
    }
    return current;
};

export const buildLastChangeAt = (
    peers: Iterable<Peer>
): Map<string, number> => {
    const lastChangeAt = new Map<string, number>();
    for (const peer of peers) {
        if (peer.lastChangeAt === undefined) continue;
        lastChangeAt.set(peer.id, peer.lastChangeAt);
    }
    return lastChangeAt;
};

// The people each receiver pinned, in pin order.
export const buildPinsMap = (
    peers: Iterable<Peer>
): Map<string, readonly string[]> => {
    const pins = new Map<string, readonly string[]>();
    for (const peer of peers) {
        if (peer.pins.length === 0) continue;
        pins.set(peer.id, peer.pins);
    }
    return pins;
};

// The people each receiver hid.
export const buildHiddenVideoMap = (
    peers: Iterable<Peer>
): Map<string, ReadonlySet<string>> => {
    const hidden = new Map<string, ReadonlySet<string>>();
    for (const peer of peers) {
        if (peer.hiddenVideo.size === 0) continue;
        hidden.set(peer.id, peer.hiddenVideo);
    }
    return hidden;
};

// The layer each receiver asks for per person. A weak machine always gets the
// low layer.
export const buildFocusMap = (
    peers: Iterable<Peer>
): Map<string, ReadonlyMap<string, SimulcastLayer>> => {
    const focus = new Map<string, ReadonlyMap<string, SimulcastLayer>>();
    for (const peer of peers) {
        if (peer.focus.size === 0 || peer.lowQuality) continue;
        focus.set(peer.id, new Map(peer.focus));
    }
    return focus;
};
