type Props = { visible: boolean };

// Said in the delete confirmation of the editor when the draft has changes.
export const UnpublishedChangesWarning = ({ visible }: Props) => {
    if (!visible) return null;

    return (
        <span className="mt-2 block font-medium text-destructive">
            As alterações não publicadas serão perdidas
        </span>
    );
};
