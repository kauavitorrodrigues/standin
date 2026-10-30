export const HEALTH_COMMAND = "health";

export const HEALTH_DESCRIPTION =
    "Run the health check of the instance and fail when it is down.";

export const HEALTH_HELP = `
Exit 0 when the status is ok or degraded (degraded is reported but the
instance still works). Exit 5 when the status is down.

Examples:
  pnpm -s standin health
  pnpm -s standin health --json`;
