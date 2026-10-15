import { assignDesk } from "./assign";
import { claimDesk } from "./claim";
import { listDesks } from "./list";
import { releaseDesk } from "./release";

export const DeskController = {
    list: listDesks,
    claim: claimDesk,
    release: releaseDesk,
    assign: assignDesk,
};
