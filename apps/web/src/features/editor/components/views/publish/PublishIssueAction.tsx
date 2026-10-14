import { Button } from "@/components/ui/button";
import type { PublishIssueRow } from "@/features/editor/types/publish-issue-row";

type PublishIssueActionProps = {
    row: PublishIssueRow;
    onFocus: (row: PublishIssueRow) => void;
};

// Takes the camera to the place of an error. An error without a place has no
// button.
export const PublishIssueAction = ({
    row,
    onFocus,
}: PublishIssueActionProps) => {
    if (!row.cell) return null;

    return (
        <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => onFocus(row)}
        >
            Ir até lá
        </Button>
    );
};
