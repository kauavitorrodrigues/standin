// What it takes to start a clip: which play it is, the sound, how loud, and
// what to do at its end.
export type ClipStart = {
    // One id per play, given by the server, so the same clip can overlap itself.
    playId: string;
    buffer: AudioBuffer;
    // 0 to 1, the volume stored with the clip.
    volume: number;
    onEnded?: () => void;
};
