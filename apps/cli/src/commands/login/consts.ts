export const LOGIN_COMMAND: string = "login";

export const LOGIN_DESCRIPTION: string =
    "Save the URL and the service token of an instance for the next commands.";

export const LOGIN_HELP: string = `
Writes $XDG_CONFIG_HOME/standin/config.json (~/.config/standin/config.json
when the variable is not set). The file is readable by you only (mode 0600,
folder 0700). Nothing is sent to the instance: the token is used by the
remote commands, which tell you when it is wrong.
The URL must be https; plain http is accepted for localhost, 127.0.0.1 and ::1
only, so the token never travels in clear text over a network.

The values come from the flags, or from STANDIN_URL and STANDIN_TOKEN when the
flag is not given. Prefer the variable for the token, a flag stays in the
shell history. Create a token on the server with \`standin token create\`.
--dry-run checks the values and writes nothing.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  STANDIN_TOKEN='<token>' pnpm -s standin login --url https://standin.example.com
  pnpm -s standin login --url https://standin.example.com --token '<token>' --json
  pnpm -s standin login --url http://localhost:3001 --dry-run`;

export const LOGIN_MESSAGES = {
    valid: (url: string): string => `✓ input is valid for ${url}`,
    dryRun: (configPath: string): string =>
        `  dry run: ${configPath} was not written`,
    saved: (url: string, configPath: string): string =>
        `✓ logged in to ${url} (saved in ${configPath})`,
} as const;
