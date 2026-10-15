type Props = {
    // The key of the color of the row, none for the row of no color.
    colorKey: string | undefined;
};

export const ColorRowName = ({ colorKey }: Props) => {
    if (!colorKey) return <>Sem cor</>;
    return <>{colorKey}</>;
};
