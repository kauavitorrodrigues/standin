import { InviteMessages } from "../../consts/messages";

// The guests tab opened outside a space: guests belong to a space.
export const NoSpaceNotice = () => (
    <p className="text-sm text-muted-foreground">{InviteMessages.noSpace}</p>
);
