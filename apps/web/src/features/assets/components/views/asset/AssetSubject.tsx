type Props = { isFamily: boolean };

// What is being removed: the whole family, or the asset alone.
export const AssetSubject = ({ isFamily }: Props) => {
    if (isFamily) return <>a família</>;
    return <>o asset</>;
};
