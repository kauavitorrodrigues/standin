import { InviteMessages } from "../../consts/messages";

export const LinkLoadError = () => (
    <p className="text-xs text-destructive">{InviteMessages.loadFailed}</p>
);
