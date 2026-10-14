import { OrganizationsQueries } from "@/features/organizations/queries";
import { DeskRemovalDialog } from "@/features/maps/__shared__/components/dialogs/DeskRemovalDialog";
import { useDraftSelector } from "@/features/maps/__shared__/hooks/useDraftSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { getDeskRemovalPrompt } from "@/features/maps/__shared__/utils/getDeskRemovalPrompt";

type DeskRemovalPromptProps = {
    pending: readonly string[];
};

// Reads the owners of the desks that wait for confirmation. It only mounts
// when there is one, so a template never asks for the members.
export const DeskRemovalPrompt = ({ pending }: DeskRemovalPromptProps) => {
    const store = useEditorStore();
    const desks = useDraftSelector((state) => state.draft.desks);
    const { members } = OrganizationsQueries.useMembers();

    const prompt = getDeskRemovalPrompt({ pending, desks, members });
    if (!prompt) return null;

    return (
        <DeskRemovalDialog
            prompt={prompt}
            onConfirm={store.confirmDeskRemoval}
            onCancel={store.cancelDeskRemoval}
        />
    );
};
