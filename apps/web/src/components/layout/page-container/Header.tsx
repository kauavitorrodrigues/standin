import { cn } from "@/lib/utils";

type BaseProps = {
    controls?: React.ReactNode;
    className?: string;
};

type TitleProps = BaseProps & {
    left?: undefined;
    title: string;
    description?: string;
    titleClassName?: string;
    descriptionClassName?: string;
};

type LeftProps = BaseProps & {
    left: React.ReactNode;
    title?: undefined;
    description?: undefined;
    icon?: undefined;
    titleClassName?: undefined;
    descriptionClassName?: undefined;
};

type Props = TitleProps | LeftProps;

export const Header = ({
    title,
    description,
    left,
    controls,
    className,
    titleClassName,
    descriptionClassName,
}: Props) => {
    return (
        <div
            className={cn(
                "flex justify-between flex-col items-start lg:items-end lg:flex-row gap-6 px-6 pt-6",
                className
            )}
        >
            {left !== undefined ? (
                <div className="min-w-0 w-full flex-1">{left}</div>
            ) : (
                <div className="flex items-center justify-center gap-4">
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center">
                            <h3
                                className={cn(
                                    "text-lg xl:text-[22px] font-semibold leading-normal",
                                    titleClassName
                                )}
                            >
                                {title}
                            </h3>
                        </div>
                        {description && (
                            <span
                                className={cn(
                                    "text-muted-foreground text-sm leading-tight",
                                    descriptionClassName
                                )}
                            >
                                {description}
                            </span>
                        )}
                    </div>
                </div>
            )}
            {controls && (
                <div className="flex items-center lg:mx-0 gap-2">
                    {controls}
                </div>
            )}
        </div>
    );
};
