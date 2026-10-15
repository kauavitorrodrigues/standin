type Props = { count: number };

// The number of seats next to the title of the list, once there are any.
export const SeatsCount = ({ count }: Props) => {
    if (count === 0) return null;
    return <> ({count})</>;
};
