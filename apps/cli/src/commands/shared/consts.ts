export const REMOTE_OPTIONS_HELP: string = `
The instance and the token come from, in this order: the flags --url and
--token, the variables STANDIN_URL and STANDIN_TOKEN, the file written by
\`standin login\`. The file is a pair: its token is used only for its own
URL, and its URL only with its own token, so a token from the flags or the
environment is never sent to a saved URL. The token is never printed. The URL
must be https; plain http is accepted for localhost, 127.0.0.1 and ::1 only.`;
