import type { AppLink } from "@/features/integrations/types/app";

export const SPOTIFY_DASHBOARD_URL = "https://developer.spotify.com/dashboard";

const DASHBOARD_LINK: AppLink = {
    label: "Painel de desenvolvedores do Spotify",
    href: SPOTIFY_DASHBOARD_URL,
};

const GETTING_STARTED_LINK: AppLink = {
    label: "Criar um app e pegar o Client ID e o Secret",
    href: "https://developer.spotify.com/documentation/web-api/tutorials/getting-started",
};

const APPS_LINK: AppLink = {
    label: "Como um app do Spotify funciona",
    href: "https://developer.spotify.com/documentation/web-api/concepts/apps",
};

const REDIRECT_URI_LINK: AppLink = {
    label: "Regras da Redirect URI",
    href: "https://developer.spotify.com/documentation/web-api/concepts/redirect_uri",
};

const QUOTA_LINK: AppLink = {
    label: "Limite de 5 pessoas e Premium do dono",
    href: "https://developer.spotify.com/documentation/web-api/concepts/quota-modes",
};

// Every page of Spotify that explains how to set the app up.
export const SPOTIFY_SETUP_LINKS: AppLink[] = [
    DASHBOARD_LINK,
    GETTING_STARTED_LINK,
    APPS_LINK,
    REDIRECT_URI_LINK,
    QUOTA_LINK,
];

// The two that matter to someone who only wants to know how it works.
export const SPOTIFY_ABOUT_LINKS: AppLink[] = [APPS_LINK, QUOTA_LINK];
