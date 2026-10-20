import { Skeleton } from "@/components/ui/skeleton";
import { AvatarEditorLayout } from "../layout/AvatarEditorLayout";

const SLOT_PLACEHOLDERS = 11;

// Shown while the categories and the current avatar load. Each column is
// filled edge to edge, like the editor that replaces it.
export const AvatarEditorSkeleton = () => (
    <AvatarEditorLayout.Body>
        <AvatarEditorLayout.Slots>
            {Array.from({ length: SLOT_PLACEHOLDERS }, (_, index) => (
                <Skeleton key={index} className="min-h-0 flex-1" />
            ))}
        </AvatarEditorLayout.Slots>
        <AvatarEditorLayout.Center>
            <Skeleton className="min-h-0 flex-1" />
        </AvatarEditorLayout.Center>
        <AvatarEditorLayout.Preview>
            <Skeleton className="min-h-0 flex-1" />
        </AvatarEditorLayout.Preview>
    </AvatarEditorLayout.Body>
);
