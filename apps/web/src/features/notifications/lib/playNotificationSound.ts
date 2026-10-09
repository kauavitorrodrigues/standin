import { NOTIFICATION_SOUND } from "@/features/notifications/consts/notificationSettings";

let context: AudioContext | null = null;

// A short beep made on the spot, so there is no sound file to ship.
export const playNotificationSound = (): void => {
    context ??= new AudioContext();
    void context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = NOTIFICATION_SOUND.frequencyHz;
    gain.gain.value = NOTIFICATION_SOUND.volume;
    oscillator.connect(gain).connect(context.destination);

    const now = context.currentTime;
    gain.gain.setValueAtTime(NOTIFICATION_SOUND.volume, now);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + NOTIFICATION_SOUND.durationSeconds
    );
    oscillator.start(now);
    oscillator.stop(now + NOTIFICATION_SOUND.durationSeconds);
};
