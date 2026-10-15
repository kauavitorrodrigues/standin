import { TemplateSkeletonCard } from "../card/SkeletonCard";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export const TemplatesLoadingState = () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
        {SKELETON_KEYS.map((key) => (
            <TemplateSkeletonCard key={key} />
        ))}
    </div>
);
