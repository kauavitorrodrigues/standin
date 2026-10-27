const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const hostOf = (url: string | undefined): string | null => {
    if (!url) return null;
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
};

type Environment = {
    NODE_ENV?: string;
    DATABASE_URL?: string;
};

// The load test creates users in the database and signs their tokens itself,
// with no password and no login. Against anything but a local development
// database that would put 50 fake members into a real organization, so it
// refuses unless both the mode and the database are local.
export const assertDevelopment = (
    apiUrl: string,
    env: Environment = process.env
): void => {
    if (env.NODE_ENV === "production") {
        throw new Error(
            "The load test only runs in development, NODE_ENV is production."
        );
    }

    const databaseHost = hostOf(env.DATABASE_URL);
    if (!databaseHost || !LOCAL_HOSTS.has(databaseHost)) {
        throw new Error(
            `The load test only runs against a local database, DATABASE_URL points at "${databaseHost ?? "nothing"}".`
        );
    }

    const apiHost = hostOf(apiUrl);
    if (!apiHost || !LOCAL_HOSTS.has(apiHost)) {
        throw new Error(
            `The load test only runs against a local API, the url is "${apiHost ?? apiUrl}".`
        );
    }
};
