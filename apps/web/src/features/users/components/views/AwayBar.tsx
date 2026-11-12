import { useState } from "react";
import type { CustomStatus } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { USER_STATUSES } from "../../consts/user-status";
import { UserAvatar } from "../UserAvatar";
import { CustomStatusLine } from "./CustomStatusLine";
import { UserStatusLabel } from "./UserStatusLabel";
import { UserStatusPanel } from "./UserStatusPanel";

type Props = {
    id: string;
    name: string;
    profilePictureUrl?: string | null;
    customStatus: CustomStatus | null;
    onReturn: () => void;
};

/**
 * What the bar shows while the person is away. It is the card of the control
 * bar, with the same padding: the avatar, the name with "Ausente" and a small
 * button to return. The avatar opens the card of the own status, where active
 * or busy also bring the person back. The other controls are not drawn.
 */
export const AwayBar = ({
    id,
    name,
    profilePictureUrl,
    customStatus,
    onReturn,
}: Props) => {
    const [isCardOpen, setIsCardOpen] = useState(false);

    return (
        <LayoutPrimitive.ControlGroup className="flex-col items-stretch gap-0">
            {isCardOpen && <UserStatusPanel />}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-expanded={isCardOpen}
                    aria-label={name}
                    className="shrink-0 rounded-full"
                    onClick={() => setIsCardOpen((isOpen) => !isOpen)}
                >
                    <UserAvatar
                        id={id}
                        name={name}
                        avatar={profilePictureUrl}
                    />
                </button>
                <div className="min-w-0 pr-1">
                    <p className="truncate text-sm leading-4 font-medium">
                        {name}
                    </p>
                    <UserStatusLabel status={USER_STATUSES.AWAY} />
                    <CustomStatusLine customStatus={customStatus} />
                </div>
                <Button
                    type="button"
                    size="sm"
                    className="ml-1 h-8 rounded-lg"
                    onClick={onReturn}
                >
                    Voltar
                </Button>
            </div>
        </LayoutPrimitive.ControlGroup>
    );
};
