import { EMOTE_DURATION_MS } from "@/features/game/consts/emote";

/**
 * Whether an avatar is making its emote gesture. Shared by the local and the
 * remote avatar, like AvatarBlink. The gesture lasts for the duration of the
 * animation and stops at once when the avatar can not do it, which is when
 * it walks or sits.
 */
export class EmoteState {
    private endsAt = 0;

    // `now` is the scene time in ms.
    play(now: number): void {
        this.endsAt = now + EMOTE_DURATION_MS;
    }

    // Returns true while the gesture goes on.
    update(now: number, canEmote: boolean): boolean {
        if (!canEmote) {
            this.endsAt = 0;
            return false;
        }

        return now < this.endsAt;
    }
}
