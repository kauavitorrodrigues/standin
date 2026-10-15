import { Button } from "@/components/ui/button";

type ResumeActionProps = {
    stale: boolean;
    onResume: () => void;
};

// A draft from another version of the map cannot be resumed.
export const ResumeAction = ({ stale, onResume }: ResumeActionProps) => {
    if (stale) return null;

    return (
        <Button type="button" onClick={onResume}>
            Retomar rascunho
        </Button>
    );
};
