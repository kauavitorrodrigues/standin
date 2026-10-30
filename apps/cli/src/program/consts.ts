export const PROGRAM_DESCRIPTION =
    "Operate a Standin instance from the shell. bootstrap, seed, health and token run where the instance is hosted and read its .env. login, logout, map, library, template and content apply work through the API with a service token. content validate and schema print need no network.";

export const PROGRAM_HELP = `
Exit codes:
  0 success   1 unexpected error   2 usage   3 invalid input
  4 authentication or permission   5 unreachable   6 conflict
  (409 stale layout and 423 locked map are both 6)

With --json the only thing on stdout is one JSON document:
  {"ok":true,"command":"...","result":{...}}
  {"ok":false,"error":{"code":"...","message":"...","fix":"..."}}

Remote commands (map, library, template, content apply) find the instance with --url/--token, then
STANDIN_URL/STANDIN_TOKEN, then the file written by \`standin login\`.

Values missing from the flags are read from the environment. Only a terminal
on both stdin and stdout is ever asked for a missing value.

The examples use -s so that pnpm adds nothing to the output; without it pnpm
prints an ELIFECYCLE line on stdout when a command exits with an error.

Examples:
  pnpm -s standin bootstrap --email admin@example.com
  pnpm -s standin seed library
  pnpm -s standin health --json
  pnpm -s standin token create --name agent --scope maps:read maps:write library:read
  pnpm -s standin login --url https://standin.example.com --token '<token>'
  pnpm -s standin map validate ./office.yaml --map <map-id>
  pnpm -s standin map apply ./office.yaml --map <map-id> --dry-run
  pnpm -s standin library list
  pnpm -s standin template create "Open office" --spec ./open-office.yaml --thumbnail ./open-office.png --dry-run
  pnpm -s standin template list --size-tier S
  pnpm -s standin content validate ./content
  pnpm -s standin content apply ./content --dry-run
  pnpm -s standin schema print spec
  pnpm -s standin bootstrap --help`;
