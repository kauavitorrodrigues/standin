import { ShirtIcon } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

type EmptySlotNoticeProps = { isEmpty: boolean };

export const EmptySlotNotice = ({ isEmpty }: EmptySlotNoticeProps) => {
    if (!isEmpty) return null;

    return (
        <ListResponseState
            variant="empty"
            icon={ShirtIcon}
            message="Nenhuma peça disponível nesta categoria."
        />
    );
};
