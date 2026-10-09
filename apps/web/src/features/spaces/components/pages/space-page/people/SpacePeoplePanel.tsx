import { PeoplePanel } from "@/features/spaces/components/pages/space-page/people/PeoplePanel";

type Props = {
    isMounted: boolean;
    isClosing: boolean;
    spaceName: string;
    onlineUserIds: readonly string[];
    onClose: () => void;
};

// Renders nothing until the panel is mounted, and keeps it mounted while it
// slides out.
export const SpacePeoplePanel = ({
    isMounted,
    isClosing,
    spaceName,
    onlineUserIds,
    onClose,
}: Props) => {
    if (!isMounted) return null;
    return (
        <PeoplePanel
            isClosing={isClosing}
            spaceName={spaceName}
            onlineUserIds={onlineUserIds}
            onClose={onClose}
        />
    );
};
