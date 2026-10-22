import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GuestAccessSwitch } from "./GuestAccessSwitch";
import { GuestLinks } from "./GuestLinks";
import { GuestList } from "./GuestList";
import { OwnerOnly } from "./OwnerOnly";

type Props = {
    spaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Where the hosts run the guests of the space. The links and the switch inside
// are the owner's.
export const GuestsDialog = ({ spaceId, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Convidados</DialogTitle>
                <DialogDescription>
                    Pessoas de fora da organização que entram só neste espaço.
                </DialogDescription>
            </DialogHeader>
            <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto">
                <OwnerOnly>
                    <GuestAccessSwitch spaceId={spaceId} />
                    <GuestLinks spaceId={spaceId} />
                </OwnerOnly>
                <GuestList spaceId={spaceId} />
            </div>
        </DialogContent>
    </Dialog>
);
