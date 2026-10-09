import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { flushSync } from "react-dom";

export type Theme = "dark" | "light" | "system";

// Where the reveal circle grows from, in viewport pixels.
export type ThemeOrigin = { x: number; y: number };

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme, origin?: ThemeOrigin) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const apply = () => {
            root.classList.remove("light", "dark");
            root.classList.add(
                theme === "system" ? (media.matches ? "dark" : "light") : theme
            );
        };

        apply();
        if (theme !== "system") return;

        // Follows the operating system while "system" is selected.
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
    }, [theme]);

    const setTheme = useCallback(
        (next: Theme, origin?: ThemeOrigin) => {
            localStorage.setItem(storageKey, next);

            const supportsViewTransition =
                "startViewTransition" in document &&
                !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            if (!supportsViewTransition) {
                setThemeState(next);
                return;
            }

            const { x, y } = origin ?? {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            };
            const radius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const root = document.documentElement;
            root.style.setProperty("--theme-toggle-x", `${x}px`);
            root.style.setProperty("--theme-toggle-y", `${y}px`);
            root.style.setProperty("--theme-toggle-r", `${radius}px`);
            // Scopes the reveal styles to this transition: the page also uses
            // view transitions for other things (see index.css).
            root.dataset.themeTransition = "";

            const transition = document.startViewTransition(() => {
                flushSync(() => setThemeState(next));
            });
            void transition.finished.finally(() => {
                delete root.dataset.themeTransition;
            });
        },
        [storageKey]
    );

    const value = { theme, setTheme };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
