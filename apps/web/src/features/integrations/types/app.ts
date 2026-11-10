// How an app is doing for the person looking at it.
export type AppStatus = {
    label: string;
    isConnected: boolean;
};

// A link to the documentation of an app, opened in a new tab.
export type AppLink = {
    label: string;
    href: string;
};
