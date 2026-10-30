// The folder under the config home and the file `standin login` writes. They
// hold the token, so only their owner may read them.
export const CONFIG_DIR_NAME: string = "standin";
export const CONFIG_FILE_NAME: string = "config.json";
export const CONFIG_HOME_FALLBACK: string = ".config";
export const CONFIG_DIR_MODE: number = 0o700;
export const CONFIG_FILE_MODE: number = 0o600;
export const CONFIG_INDENT: number = 4;
