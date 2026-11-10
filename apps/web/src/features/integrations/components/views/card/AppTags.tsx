import { Badge } from "@/components/ui/badge";

type Props = {
    tags: string[];
};

export const AppTags = ({ tags }: Props) => (
    <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
            <Badge
                key={tag}
                variant="secondary"
                className="rounded-md text-[10px] tracking-wide uppercase"
            >
                {tag}
            </Badge>
        ))}
    </div>
);
