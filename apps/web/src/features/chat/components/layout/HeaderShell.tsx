import type { ReactNode } from "react";
import { BackButton } from "@/features/chat/components/layout/BackButton";
import type { ThreadParticipant } from "@/features/chat/types/chatPage";
import { ParticipantAvatarStack } from "@/features/chat/components/layout/ParticipantAvatarStack";

type Props = {
    title: string;
    avatars?: ThreadParticipant[];
    isNotes?: boolean;
    onBack?: () => void;
    children?: ReactNode;
};

// Pulled out to the sidebar padding edge so the divider spans the full panel
// width instead of stopping at the content inset.
export const HeaderShell = ({
    title,
    avatars = [],
    isNotes = false,
    onBack,
    children,
}: Props) => {
    return (
        <div className="-mx-2 -mt-2 flex h-11 shrink-0 items-center gap-2 border-b border-border px-4">
            <BackButton onClick={onBack} />
            <ParticipantAvatarStack participants={avatars} isNotes={isNotes} />
            <span className="flex-1 truncate text-base font-semibold">
                {title}
            </span>
            <div className="flex items-center">{children}</div>
        </div>
    );
};
