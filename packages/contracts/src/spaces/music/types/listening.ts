// What a person is playing, as the others see it. It carries only what the
// widget and the notes draw, never a token or the account id.
export type ListeningTrack = {
    trackId: string;
    title: string;
    artists: string[];
    // The cover of the album, when Spotify sends one.
    coverUrl: string | null;
    // The address that opens the track in Spotify.
    url: string;
    // False while the music is paused: the widget stays, the notes stop.
    isPlaying: boolean;
};

export type ListeningEntry = {
    userId: string;
    track: ListeningTrack;
};
