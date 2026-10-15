type Props = { show: boolean };

// A soft circle around the seat that is picked up.
export const SeatSelectionHalo = ({ show }: Props) => {
    if (!show) return null;
    return <circle r={11} fill="currentColor" fillOpacity={0.25} />;
};
