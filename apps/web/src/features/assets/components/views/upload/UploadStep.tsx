import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ImagePlusIcon } from "lucide-react";

type Step = { icon: LucideIcon; label: string };

type Props = {
    title: string;
    description: string;
    steps: Step[];
    // What the image has to be, small, under the steps.
    note: string;
    children: ReactNode;
};

// The first step of a new asset or tileset, centered on the page: what is
// about to happen, the dropzone and what the image has to be.
export const UploadStep = ({
    title,
    description,
    steps,
    note,
    children,
}: Props) => (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
            <span className="bg-muted flex size-12 items-center justify-center rounded-xl">
                <ImagePlusIcon className="size-6" />
            </span>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground max-w-md text-sm">
                {description}
            </p>
        </div>

        <div className="w-full">{children}</div>

        <ol className="grid w-full grid-cols-2 gap-3">
            {steps.map(({ icon: Icon, label }, index) => (
                <li
                    key={label}
                    className="flex flex-col items-center gap-2 text-center"
                >
                    <span className="text-muted-foreground flex size-9 items-center justify-center rounded-full border">
                        <Icon className="size-4" />
                    </span>
                    <span className="text-muted-foreground text-xs">
                        {index + 1}. {label}
                    </span>
                </li>
            ))}
        </ol>

        <p className="text-muted-foreground text-center text-xs">{note}</p>
    </div>
);
