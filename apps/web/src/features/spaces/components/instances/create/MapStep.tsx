import type { MapTemplate } from "@standin/contracts";
import { SourceFields } from "../../fields/SourceFields";

type Props = {
    templates: MapTemplate[];
    templateId: string | undefined;
    isBlank: boolean;
    disabled: boolean;
    onSelectTemplate: (id: string) => void;
    onSelectBlank: () => void;
};

// The maps of the chosen size, which the preview on the right follows.
export const MapStep = (props: Props) => <SourceFields {...props} />;
