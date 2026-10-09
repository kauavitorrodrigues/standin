import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import {
    useTheme,
    type Theme,
} from "@/components/providers/ThemeProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getThemeOrigin } from "../../utils/getThemeOrigin";

export const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();

    return (
        <ToggleGroup
            value={[theme]}
            // Pressing the selected item would unselect it: a theme is
            // always chosen, so that empty value is ignored.
            onValueChange={([next], { event }) => {
                if (next) setTheme(next as Theme, getThemeOrigin(event));
            }}
            aria-label="Modo de cor"
            className="rounded-lg bg-foreground/5 p-0.5 ring-1 ring-foreground/10"
        >
            {[
                { value: "light", label: "Claro", icon: SunIcon },
                { value: "dark", label: "Escuro", icon: MoonIcon },
                { value: "system", label: "Sistema", icon: MonitorIcon },
            ].map(({ value, label, icon: Icon }) => (
                <Tooltip key={value}>
                    <TooltipTrigger
                        render={
                            <ToggleGroupItem
                                value={value}
                                aria-label={label}
                                className="size-8 rounded-md text-muted-foreground hover:text-foreground data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm [&_svg:not([class*='size-'])]:size-4"
                            />
                        }
                    >
                        <Icon />
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                </Tooltip>
            ))}
        </ToggleGroup>
    );
};
