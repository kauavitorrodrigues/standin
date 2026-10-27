import { ENABLED_SIZE_TIERS, type SizeTier } from "@standin/contracts";
import { getTierPeopleLabel } from "../../utils/getTierPeopleLabel";
import { OptionButton } from "../views/create/OptionButton";

type Props = {
    tier: SizeTier;
    disabled: boolean;
    onSelect: (tier: SizeTier) => void;
};

// The size of the space, in people.
export const TierFields = ({ tier, disabled, onSelect }: Props) => (
    <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Tamanho do espaço</p>
        {ENABLED_SIZE_TIERS.map((option) => (
            <OptionButton
                key={option}
                selected={tier === option}
                disabled={disabled}
                onSelect={() => onSelect(option)}
            >
                {getTierPeopleLabel(option)}
            </OptionButton>
        ))}
    </div>
);
