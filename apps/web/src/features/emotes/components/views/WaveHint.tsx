type WaveHintProps = {
    text: string | null;
};

// One quiet line under the wave button: why it is off, or what happened.
export const WaveHint = ({ text }: WaveHintProps) => {
    if (text === null) return null;

    return <p className="text-sm leading-4 text-muted-foreground">{text}</p>;
};
