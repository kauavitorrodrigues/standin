const MAC_PLATFORM = /mac|iphone|ipad/i;

export const isMacPlatform = (platform: string): boolean =>
    MAC_PLATFORM.test(platform);

// The keys to show for a "mod + key" shortcut: Cmd on Apple platforms and
// Ctrl everywhere else.
export const getModShortcutKeys = (
    key: string,
    platform: string = navigator.platform
): [string, string] => [isMacPlatform(platform) ? "⌘" : "Ctrl", key];
