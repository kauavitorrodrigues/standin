import { useState } from "react";
import { ArmchairIcon } from "lucide-react";
import type { Space } from "@standin/contracts";
import { InviteQueries } from "../../queries";
import type { DeskChoice } from "../../types";
import { DeskField } from "../fields/DeskField";
import { DeskSpaceField } from "../fields/DeskSpaceField";

type Props = {
    organizationId: string;
    spaces: Space[];
    // The space the dialog was opened in, picked first.
    initialSpaceId: string | null;
    value: DeskChoice;
    onChange: (choice: DeskChoice) => void;
};

// Keeps a free desk for the invited people: the space first, then one of its
// desks nobody holds. The desk is given when the person joins.
export const DeskPicker = ({
    organizationId,
    spaces,
    initialSpaceId,
    value,
    onChange,
}: Props) => {
    const [spaceId, setSpaceId] = useState<string | null>(
        initialSpaceId ?? spaces[0]?.id ?? null
    );
    const { desks, isLoading } = InviteQueries.useFreeDesks(
        organizationId,
        spaceId
    );

    const pickSpace = (next: string | null) => {
        setSpaceId(next);
        onChange(null);
    };

    const pickDesk = (mapAssetId: string) => {
        if (spaceId) onChange({ spaceId, mapAssetId });
    };

    return (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
                <ArmchairIcon className="size-4" />
                Mesa reservada
            </p>
            <DeskSpaceField
                spaces={spaces}
                value={spaceId}
                onChange={pickSpace}
            />
            <DeskField
                desks={desks}
                value={value?.mapAssetId ?? null}
                isLoading={isLoading}
                isDisabled={!spaceId}
                onChange={pickDesk}
            />
            <p className="text-xs text-muted-foreground">
                A mesa é entregue quando a pessoa entra. Se alguém pegar antes,
                ela entra sem mesa.
            </p>
        </div>
    );
};
