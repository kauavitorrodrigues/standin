import type { ReactNode } from "react";
import { SproutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProfileActionsProps = {
    // The actions button, which belongs to whatever opened the card.
    actions: ReactNode;
};

export const ProfileActions = ({ actions }: ProfileActionsProps) => (
    <div className="mt-3 flex items-center gap-1.5">
        <Button
            type="button"
            icon={UserIcon}
            className="flex-1"
            size="lg"
            disabled
        >
            Editar perfil
        </Button>
        <Button
            type="button"
            icon={SproutIcon}
            size="icon-lg"
            variant="secondary"
        />
        {actions}
    </div>
);
