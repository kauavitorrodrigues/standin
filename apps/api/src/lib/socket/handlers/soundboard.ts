import type { Server, Socket } from "socket.io";
import {
    SoundboardClipNotFoundError,
    SoundboardEvents,
    SoundboardNotInSpaceError,
    SoundboardPlaySchema,
    SoundboardStopSchema,
} from "@standin/contracts";
import type {
    SoundboardPlayAck,
    SoundboardStarted,
    SoundboardStopAck,
    SoundboardStopped,
} from "@standin/contracts";
import { SoundboardService } from "@standin/core";
import { failureOf } from "@/lib/soundboard/failureOf";
import { setSoundboardActive } from "@/lib/soundboard/setSoundboardActive";
import { SoundboardPlayback } from "@/lib/soundboard/SoundboardPlayback";
import type { ActivePlay } from "@/lib/soundboard/types";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { replyAck } from "../utils/replyAck";
import { resolveSpaceOrganizationId } from "../services/resolveSpaceOrganizationId";

// One playback state per server, shared by every socket of it.
const playbacks = new WeakMap<Server, SoundboardPlayback>();

const toStopped = ({
    playId,
    userId,
    clipId,
}: ActivePlay): SoundboardStopped => ({
    playId,
    userId,
    clipId,
});

// The media flag stays on while another clip of the socket is still playing.
const announceStopped = (
    io: Server,
    playback: SoundboardPlayback,
    socketId: string,
    play: ActivePlay
) => {
    if (playback.countOf(socketId) === 0) {
        setSoundboardActive(play.spaceId, socketId, false);
    }
    io.to(buildSpaceRoom(play.spaceId)).emit(
        SoundboardEvents.STOPPED,
        toStopped(play)
    );
};

const playbackOf = (io: Server): SoundboardPlayback => {
    const existing = playbacks.get(io);
    if (existing) return existing;

    const created: SoundboardPlayback = new SoundboardPlayback(
        (socketId, play) => announceStopped(io, created, socketId, play)
    );
    playbacks.set(io, created);
    return created;
};

/**
 * Plays a clip into the call. The audio rides the microphone track of the
 * person; these events carry only the state: who plays what, the most clips
 * at once and the cooldown. Guests are not members, so they have no clips.
 */
export function registerSoundboard(io: Server, socket: Socket) {
    const playback = playbackOf(io);

    socket.on(SoundboardEvents.PLAY, async (payload, ack) => {
        try {
            const { spaceId, userId, isGuest } = socket.data;
            if (!spaceId || isGuest) throw new SoundboardNotInSpaceError();

            const parsed = SoundboardPlaySchema.safeParse(payload);
            if (!parsed.success) throw new SoundboardClipNotFoundError();

            const organizationId = await resolveSpaceOrganizationId(spaceId);
            const clip = await SoundboardService.findPlayable(
                parsed.data.clipId,
                organizationId
            );

            // The socket may have left while the clip was looked up.
            if (!socket.connected || socket.data.spaceId !== spaceId) {
                throw new SoundboardNotInSpaceError();
            }

            const play = playback.start({
                spaceId,
                socketId: socket.id,
                userId,
                clipId: clip.id,
                durationMs: clip.durationMs,
            });
            setSoundboardActive(spaceId, socket.id, true);

            const started: SoundboardStarted = {
                playId: play.playId,
                userId,
                clipId: clip.id,
                name: clip.name,
                durationMs: clip.durationMs,
            };
            io.to(buildSpaceRoom(spaceId)).emit(
                SoundboardEvents.STARTED,
                started
            );
            replyAck<SoundboardPlayAck>(ack, { ok: true, clip: started });
        } catch (error) {
            replyAck<SoundboardPlayAck>(ack, failureOf(error));
        }
    });

    socket.on(SoundboardEvents.STOP, (payload, ack) => {
        const parsed = SoundboardStopSchema.safeParse(payload);
        if (!parsed.success) {
            return replyAck<SoundboardStopAck>(ack, {
                ok: false,
                code: new SoundboardClipNotFoundError().code,
            });
        }
        const play = playback.stop(socket.id, parsed.data.playId);
        if (play) announceStopped(io, playback, socket.id, play);
        replyAck<SoundboardStopAck>(ack, { ok: true });
    });

    // The room and the media session close with the socket, so only the
    // others need to hear that the clip ended.
    socket.on("disconnect", () => {
        playback.stopAll(socket.id).forEach((play) => {
            io.to(buildSpaceRoom(play.spaceId)).emit(
                SoundboardEvents.STOPPED,
                toStopped(play)
            );
        });
    });
}
