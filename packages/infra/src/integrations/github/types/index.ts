export type GithubConfig = {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
};

export type GithubProfile = {
    // The numeric id as text, which is what the identity stores.
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string | null;
};
