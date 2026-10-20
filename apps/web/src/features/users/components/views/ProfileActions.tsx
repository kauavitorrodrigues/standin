import type { ReactNode } from "react";
import type { ProfileDecorate } from "../../types/profileDecorate";
import { DecorateButton } from "./DecorateButton";
import { EditProfileButton } from "./EditProfileButton";

type ProfileActionsProps = {
    // The actions button, which belongs to whatever opened the card.
    actions: ReactNode;
    // The Decorar button. A card with no way to decorate leaves it out.
    decorate?: ProfileDecorate;
};

const DecorateSlot = ({ decorate }: { decorate?: ProfileDecorate }) => {
    if (!decorate) return null;

    return <DecorateButton {...decorate} />;
};

export const ProfileActions = ({ actions, decorate }: ProfileActionsProps) => (
    <div className="mt-3 flex items-center gap-1.5">
        <EditProfileButton />
        <DecorateSlot decorate={decorate} />
        {actions}
    </div>
);
