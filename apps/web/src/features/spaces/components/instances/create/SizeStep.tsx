import type { UseFormReturn } from "react-hook-form";
import type { SizeTier } from "@standin/contracts";
import type { CreateSpaceFormValues } from "../../../schemas/createSpaceForm";
import { SpaceFormFields } from "../../fields/FormFields";
import { TierFields } from "../../fields/TierFields";
import { SourceSkeleton } from "../../views/create/SourceSkeleton";

type Props = {
    form: UseFormReturn<CreateSpaceFormValues>;
    tier: SizeTier;
    isLoading: boolean;
    disabled: boolean;
    onSelectTier: (tier: SizeTier) => void;
};

const SizeOptions = ({
    tier,
    isLoading,
    disabled,
    onSelectTier,
}: Omit<Props, "form">) => {
    if (isLoading) return <SourceSkeleton />;

    return (
        <TierFields tier={tier} disabled={disabled} onSelect={onSelectTier} />
    );
};

// The name and the size of the space.
export const SizeStep = ({ form, ...options }: Props) => (
    <>
        <SpaceFormFields form={form} disabled={options.disabled} />
        <SizeOptions {...options} />
    </>
);
