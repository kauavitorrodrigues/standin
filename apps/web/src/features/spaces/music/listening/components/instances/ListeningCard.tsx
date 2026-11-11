import { useListeningTrack } from "../../contexts/ListeningContext";
import { TrackCard } from "../views/track";

type Props = {
    userId: string;
};

// What the person is listening to, or nothing when they share no music.
export const ListeningCard = ({ userId }: Props) => {
    const track = useListeningTrack(userId);
    if (!track) return null;

    return (
        <TrackCard.Section heading="Ouvindo">
            <TrackCard.Link
                href={track.url}
                label={`"Abrir no Spotify": ${track.title}`}
            >
                <TrackCard.Cover url={track.coverUrl} />
                <TrackCard.Details
                    title={track.title}
                    artists={track.artists}
                />
                <TrackCard.Logo />
            </TrackCard.Link>
        </TrackCard.Section>
    );
};
