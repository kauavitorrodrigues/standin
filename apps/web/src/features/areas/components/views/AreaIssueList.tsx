import { XIcon } from "lucide-react";
import type { LayoutIssue } from "@standin/contracts";
import { FloatingPanel } from "@/features/editor/components/layout/FloatingPanel";
import { ToolbarButton } from "@/features/editor/components/views/ToolbarButton";
import { describeAreaIssue } from "../../utils/describeAreaIssue";

type Props = {
    issues: readonly LayoutIssue[];
    onClose: () => void;
};

// The problems the capture found, over the canvas, which stays editable. The
// objects the edge cuts are also red on the canvas.
export const AreaIssueList = ({ issues, onClose }: Props) => {
    if (issues.length === 0) return null;

    return (
        <FloatingPanel className="top-3 right-3 flex w-80 flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                    Não foi possível salvar
                </h3>
                <ToolbarButton
                    label="Fechar"
                    icon={XIcon}
                    side="bottom"
                    onClick={onClose}
                />
            </div>
            <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-4 text-xs">
                {issues.map((issue, index) => (
                    <li key={`${issue.code}-${issue.path}-${index}`}>
                        {describeAreaIssue(issue)}
                    </li>
                ))}
            </ul>
        </FloatingPanel>
    );
};
