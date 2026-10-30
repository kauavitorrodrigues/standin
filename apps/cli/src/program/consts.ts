export const PROGRAM_DESCRIPTION =
    "Operate a Standin instance from the shell. These commands run where the instance is hosted and read its .env.";

export const PROGRAM_HELP = `
Exit codes:
  0 success   1 unexpected error   2 usage   3 invalid input
  4 authentication or permission   5 unreachable   6 conflict

With --json the only thing on stdout is one JSON document:
  {"ok":true,"command":"...","result":{...}}
  {"ok":false,"error":{"code":"...","message":"...","fix":"..."}}

Values missing from the flags are read from the environment. Only a terminal
on both stdin and stdout is ever asked for a missing value.

The examples use -s so that pnpm adds nothing to the output; without it pnpm
prints an ELIFECYCLE line on stdout when a command exits with an error.

Examples:
  pnpm -s standin bootstrap --email admin@example.com
  pnpm -s standin seed library
  pnpm -s standin health --json
  pnpm -s standin bootstrap --help`;
